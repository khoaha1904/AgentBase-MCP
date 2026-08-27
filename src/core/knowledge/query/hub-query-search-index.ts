import MiniSearch from "minisearch";

import { loadHubGraph, type HubGraph, type HubQueryReader } from "./hub-query-graph.ts";

const SEARCH_FIELDS = [
  "identityPathTitle",
  "description",
  "typeTags",
  "heading",
  "body",
  "linkContext",
  "relationContext",
] as const;
const CONTEXT_LIMIT = 8;

type SearchRecord = Readonly<{
  id: string;
  conceptIdentity: string;
  sectionOrdinal: number;
  identityPathTitle: string;
  description: string;
  typeTags: string;
  heading: string;
  body: string;
  linkContext: string;
  relationContext: string;
}>;

export type HubSearchContext =
  | Readonly<{ kind: "link"; source: string; target: string; direction: "outbound" | "inbound" }>
  | Readonly<{
    kind: "relationship";
    predicate: string;
    source: string;
    target: string;
    direction: "outbound" | "inbound";
    evidence: readonly string[];
  }>
  | Readonly<{
    kind: "flow-step";
    flow: string;
    order: number;
    action: string;
    mode: string;
    source: string;
    target: string;
    evidence: readonly string[];
  }>;

export type HubLexicalHit = Readonly<{
  conceptIdentity: string;
  sectionOrdinal: number;
  score: number;
  matchedTerms: readonly string[];
  matchedFields: readonly string[];
}>;

export type HubSearchProjection = Readonly<{
  key: string;
  graph: HubGraph;
  contexts: ReadonlyMap<string, readonly HubSearchContext[]>;
  contextOmissions: ReadonlyMap<string, number>;
  search(query: string, allowed?: ReadonlySet<string>): readonly HubLexicalHit[];
}>;

let cached: HubSearchProjection | undefined;
let building: Readonly<{ key: string; promise: Promise<HubSearchProjection> }> | undefined;

function contextText(graph: HubGraph, context: HubSearchContext): string {
  const label = (identity: string) => graph.concepts.get(identity)?.title ?? identity;
  if (context.kind === "link") {
    return `${context.source} ${label(context.source)} ${context.target} ${label(context.target)}`;
  }
  if (context.kind === "relationship") {
    return `${context.predicate} ${context.source} ${label(context.source)} ${context.target} ${label(context.target)}`;
  }
  return `${context.action} ${context.mode} ${context.flow} ${label(context.flow)} ${context.source} ${label(context.source)} ${context.target} ${label(context.target)}`;
}

function directContexts(graph: HubGraph): Readonly<{
  contexts: ReadonlyMap<string, readonly HubSearchContext[]>;
  omissions: ReadonlyMap<string, number>;
  searchable: ReadonlyMap<string, readonly HubSearchContext[]>;
}> {
  const all = new Map<string, HubSearchContext[]>();
  const add = (identity: string, context: HubSearchContext) => {
    all.set(identity, [...all.get(identity) ?? [], context]);
  };
  for (const link of graph.links) {
    add(link.source, { kind: "link", ...link, direction: "outbound" });
    add(link.target, { kind: "link", ...link, direction: "inbound" });
  }
  for (const edge of graph.edges) {
    const context = { kind: "relationship" as const, predicate: edge.kind,
      source: edge.source, target: edge.target, evidence: edge.evidence };
    add(edge.source, { ...context, direction: "outbound" });
    add(edge.target, { ...context, direction: "inbound" });
  }
  for (const step of graph.flowSteps) {
    const context = { kind: "flow-step" as const, flow: step.flow, order: step.order,
      action: step.action, mode: step.mode, source: step.source, target: step.target,
      evidence: step.evidence };
    for (const identity of new Set([step.flow, step.source, step.target])) add(identity, context);
  }
  const contexts = new Map<string, readonly HubSearchContext[]>(), omissions = new Map<string, number>();
  const searchable = new Map<string, readonly HubSearchContext[]>();
  for (const identity of graph.concepts.keys()) {
    const values = (all.get(identity) ?? []).sort((left, right) =>
      JSON.stringify(left).localeCompare(JSON.stringify(right)));
    searchable.set(identity, values);
    contexts.set(identity, values.slice(0, CONTEXT_LIMIT));
    omissions.set(identity, Math.max(0, values.length - CONTEXT_LIMIT));
  }
  return { contexts, omissions, searchable };
}

function buildProjection(graph: HubGraph, key: string): HubSearchProjection {
  const contextProjection = directContexts(graph);
  const records: SearchRecord[] = [];
  for (const [identity, concept] of graph.concepts) {
    const contexts = contextProjection.searchable.get(identity) ?? [];
    const linkContext = contexts.filter((context) => context.kind === "link")
      .map((context) => contextText(graph, context)).join(" ");
    const relationContext = contexts.filter((context) => context.kind !== "link")
      .map((context) => contextText(graph, context)).join(" ");
    const sections = concept.sections.length ? concept.sections : [undefined];
    for (const section of sections) {
      records.push({
        id: section?.id ?? `${identity}#metadata`,
        conceptIdentity: identity,
        sectionOrdinal: section?.ordinal ?? -1,
        identityPathTitle: `${identity} ${concept.document.path} ${concept.title}`,
        description: concept.description,
        typeTags: `${concept.document.type} ${concept.tags.join(" ")}`,
        heading: section?.headingPath.join(" ") ?? "",
        body: section?.searchText ?? "",
        linkContext,
        relationContext,
      });
    }
  }
  const index = new MiniSearch<SearchRecord>({
    fields: [...SEARCH_FIELDS],
    storeFields: ["conceptIdentity", "sectionOrdinal"],
    searchOptions: {
      boost: {
        identityPathTitle: 4,
        description: 2,
        typeTags: 1.5,
        heading: 2,
        body: 1,
        linkContext: 1,
        relationContext: 1,
      },
      prefix: false,
      fuzzy: false,
      combineWith: "OR",
    },
  });
  index.addAll(records);
  return {
    key,
    graph,
    contexts: contextProjection.contexts,
    contextOmissions: contextProjection.omissions,
    search(query, allowed) {
      return index.search(query, allowed ? {
        filter: (result) => allowed.has(String(result.conceptIdentity)),
      } : {}).map((result): HubLexicalHit => ({
        conceptIdentity: String(result.conceptIdentity),
        sectionOrdinal: Number(result.sectionOrdinal),
        score: result.score,
        matchedTerms: [...new Set(result.queryTerms)].sort(),
        matchedFields: [...new Set(Object.values(result.match).flat())].sort(),
      })).sort((left, right) => right.score - left.score
        || left.conceptIdentity.localeCompare(right.conceptIdentity)
        || left.sectionOrdinal - right.sectionOrdinal);
    },
  };
}

export async function loadHubSearchProjection(
  reader: HubQueryReader,
  maximumDocumentBytes: number,
): Promise<HubSearchProjection> {
  const key = `${reader.commit}\0${maximumDocumentBytes}`;
  if (cached?.key === key) return cached;
  if (building?.key === key) return building.promise;
  const promise = loadHubGraph(reader, maximumDocumentBytes).then((graph) => buildProjection(graph, key));
  building = { key, promise };
  try {
    const projection = await promise;
    cached = projection;
    return projection;
  } finally {
    if (building?.promise === promise) building = undefined;
  }
}

export function resetHubSearchProjectionCache(): void {
  cached = undefined;
  building = undefined;
}
