import path from "node:path";

import { parseConceptDocument, type ConceptDocument, type OkfValue } from "./okf-document.ts";
import { isCanonicalRelationshipKind } from "./relationship-vocabulary.ts";

export type HubQueryReader = Readonly<{
  commit: string;
  listMarkdownPaths(): Promise<readonly string[]>;
  readMarkdown(relativePath: string): Promise<string>;
}>;

export type HubQueryMatch = Readonly<{
  commit: string;
  path: string;
  excerpt: string;
}>;

export type HubConceptSummary = Readonly<{
  identity: string;
  path: string;
  type: string;
  title: string;
  description: string;
  domains: readonly string[];
}>;

export type HubSearchMatch = HubConceptSummary & Readonly<{
  rank: number;
  matchedBy: "identity" | "path" | "title" | "type" | "description" | "body";
  excerpt?: string;
}>;

export type HubSearchResult = Readonly<{
  status: "ok";
  commit: string;
  matches: readonly HubSearchMatch[];
}> | Readonly<{
  status: "scope_required";
  commit: string;
  candidateDomains: readonly HubConceptSummary[];
}>;

export type HubSearchOptions = Readonly<{
  domain?: string;
  types?: readonly string[];
  global?: boolean;
  limit?: number;
  maximumDocumentBytes?: number;
}>;

export type HubTraversalOptions = Readonly<{
  direction?: "outbound" | "inbound" | "both";
  kinds?: readonly string[];
  maxDepth?: number;
  limit?: number;
  maximumDocumentBytes?: number;
}>;

export type HubTraversalEdge = Readonly<{
  source: string;
  kind: string;
  target: string;
  evidence: readonly string[];
  depth: number;
}>;

export type HubTraversalResult = Readonly<{
  commit: string;
  start: string;
  nodes: readonly HubConceptSummary[];
  edges: readonly HubTraversalEdge[];
  truncated: boolean;
}>;

type GraphEdge = Readonly<{ source: string; kind: string; target: string; evidence: readonly string[] }>;
type GraphConcept = Readonly<{ document: ConceptDocument; title: string; description: string }>;
type HubGraph = Readonly<{
  concepts: ReadonlyMap<string, GraphConcept>;
  paths: ReadonlyMap<string, string>;
  edges: readonly GraphEdge[];
  domains: ReadonlyMap<string, readonly string[]>;
}>;

function mapping(value: OkfValue | undefined): Readonly<Record<string, OkfValue>> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Readonly<Record<string, OkfValue>> : undefined;
}

function text(value: OkfValue | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

function heading(body: string): string {
  return body.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? "";
}

function relationships(concept: ConceptDocument): readonly GraphEdge[] {
  if (!Array.isArray(concept.frontmatter.relationships)) return [];
  return concept.frontmatter.relationships.flatMap((raw) => {
    const entry = mapping(raw);
    const kind = text(entry?.kind), target = text(entry?.target);
    const evidence = Array.isArray(entry?.evidence)
      ? entry.evidence.filter((item): item is string => typeof item === "string") : [];
    return kind && target && isCanonicalRelationshipKind(kind)
      ? [{ source: concept.conceptId, kind, target, evidence }] : [];
  });
}

function deriveDomains(concepts: ReadonlyMap<string, GraphConcept>, edges: readonly GraphEdge[]): ReadonlyMap<string, readonly string[]> {
  const parents = new Map<string, string[]>();
  for (const edge of edges) {
    if (edge.kind !== "part-of" || !concepts.has(edge.target)) continue;
    parents.set(edge.source, [...parents.get(edge.source) ?? [], edge.target]);
  }
  const result = new Map<string, readonly string[]>();
  const visit = (identity: string, trail = new Set<string>()): readonly string[] => {
    const known = result.get(identity);
    if (known) return known;
    if (trail.has(identity)) return [];
    const concept = concepts.get(identity);
    if (!concept) return [];
    if (concept.document.type === "Domain") {
      result.set(identity, [identity]);
      return [identity];
    }
    const nextTrail = new Set(trail).add(identity);
    const found = [...new Set((parents.get(identity) ?? []).flatMap((parent) => visit(parent, nextTrail)))].sort();
    result.set(identity, found);
    return found;
  };
  for (const identity of concepts.keys()) visit(identity);
  return result;
}

async function loadGraph(reader: HubQueryReader, maximumDocumentBytes: number): Promise<HubGraph> {
  const concepts = new Map<string, GraphConcept>();
  const paths = new Map<string, string>();
  const edges: GraphEdge[] = [];
  for (const relativePath of [...await reader.listMarkdownPaths()].map(normalizeHubConceptPath).sort()) {
    if (["index.md", "log.md"].includes(path.posix.basename(relativePath))) continue;
    const content = await reader.readMarkdown(relativePath);
    if (Buffer.byteLength(content) > maximumDocumentBytes) continue;
    try {
      const document = parseConceptDocument(relativePath, content);
      concepts.set(document.conceptId, {
        document,
        title: text(document.frontmatter.title) || heading(document.body) || document.conceptId,
        description: text(document.frontmatter.description),
      });
      paths.set(document.path, document.conceptId);
      edges.push(...relationships(document));
    } catch {
      // Human navigation Markdown remains readable by exact path, but is not a graph concept.
    }
  }
  return { concepts, paths, edges, domains: deriveDomains(concepts, edges) };
}

function summarize(graph: HubGraph, identity: string): HubConceptSummary {
  const value = graph.concepts.get(identity);
  if (!value) throw new Error(`Hub concept does not exist: ${identity}`);
  return {
    identity,
    path: value.document.path,
    type: value.document.type,
    title: value.title,
    description: value.description,
    domains: graph.domains.get(identity) ?? [],
  };
}

function resolveIdentity(graph: HubGraph, value: string): string | undefined {
  const normalized = value.endsWith(".md") ? normalizeHubConceptPath(value) : value;
  return graph.concepts.has(normalized) ? normalized : graph.paths.get(normalized);
}

function validateList(values: readonly string[] | undefined, name: string): ReadonlySet<string> | undefined {
  if (values === undefined) return undefined;
  if (!values.length || values.length > 32 || values.some((value) => !value.trim() || value.length > 128)) {
    throw new Error(`${name} must contain 1..32 non-empty values`);
  }
  return new Set(values);
}

export function normalizeHubConceptPath(value: string): string {
  if (value.includes("\0") || value.includes("\\") || path.posix.isAbsolute(value)) throw new Error("Hub concept path must be normalized and relative");
  const normalized = path.posix.normalize(value);
  if (normalized === "." || normalized.startsWith("../") || !normalized.endsWith(".md")) throw new Error("Hub concept path must identify one Markdown file");
  return normalized;
}

export async function readHubConcept(reader: HubQueryReader, relativePath: string, maximumBytes = 256 * 1024): Promise<HubQueryMatch> {
  const admittedPath = normalizeHubConceptPath(relativePath);
  const content = await reader.readMarkdown(admittedPath);
  if (Buffer.byteLength(content) > maximumBytes) throw new Error("Hub concept exceeds read limit");
  return { commit: reader.commit, path: admittedPath, excerpt: content };
}

function matchConcept(concept: GraphConcept, needle: string): Readonly<{ rank: number; matchedBy: HubSearchMatch["matchedBy"]; excerpt?: string }> | undefined {
  const identity = concept.document.conceptId.toLowerCase();
  const documentPath = concept.document.path.toLowerCase();
  const title = concept.title.toLowerCase();
  const type = concept.document.type.toLowerCase();
  const description = concept.description.toLowerCase();
  const body = concept.document.body.toLowerCase();
  if (identity === needle) return { rank: 0, matchedBy: "identity" };
  if (documentPath === needle) return { rank: 0, matchedBy: "path" };
  if (title === needle) return { rank: 1, matchedBy: "title" };
  if (identity.includes(needle)) return { rank: 2, matchedBy: "identity" };
  if (documentPath.includes(needle)) return { rank: 2, matchedBy: "path" };
  if (title.includes(needle)) return { rank: 3, matchedBy: "title" };
  if (type.includes(needle)) return { rank: 4, matchedBy: "type" };
  if (description.includes(needle)) return { rank: 5, matchedBy: "description" };
  const offset = body.indexOf(needle);
  if (offset >= 0) return { rank: 6, matchedBy: "body", excerpt: concept.document.body.replace(/\s+/g, " ").slice(offset, offset + 320).trim() };
  return undefined;
}

export async function searchHubConcepts(reader: HubQueryReader, query: string, options: HubSearchOptions = {}): Promise<HubSearchResult> {
  const needle = query.trim().toLowerCase();
  if (!needle || needle.length > 256) throw new Error("Hub query must contain 1..256 characters");
  const limit = options.limit ?? 20;
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error("Hub query limit must be 1..100");
  const types = validateList(options.types, "types");
  const graph = await loadGraph(reader, options.maximumDocumentBytes ?? 256 * 1024);
  const domain = options.domain === undefined ? undefined : resolveIdentity(graph, options.domain);
  if (options.domain !== undefined && (!domain || graph.concepts.get(domain)?.document.type !== "Domain")) {
    throw new Error("domain must identify one exact Domain concept identity or path");
  }
  const found: HubSearchMatch[] = [];
  for (const [identity, concept] of graph.concepts) {
    if (types && !types.has(concept.document.type)) continue;
    if (domain && !(graph.domains.get(identity) ?? []).includes(domain)) continue;
    const matched = matchConcept(concept, needle);
    if (matched) found.push({ ...summarize(graph, identity), ...matched });
  }
  found.sort((left, right) => left.rank - right.rank || left.path.localeCompare(right.path));
  const exactIdentity = found.some((match) => match.rank === 0);
  if (!domain && !options.global && !exactIdentity) {
    const domainIds = [...new Set(found.flatMap((match) => match.domains))].sort();
    if (domainIds.length > 1) {
      return { status: "scope_required", commit: reader.commit, candidateDomains: domainIds.map((identity) => summarize(graph, identity)) };
    }
  }
  return { status: "ok", commit: reader.commit, matches: found.slice(0, limit) };
}

export async function traverseHubConcepts(reader: HubQueryReader, start: string, options: HubTraversalOptions = {}): Promise<HubTraversalResult> {
  const direction = options.direction ?? "both";
  if (!["outbound", "inbound", "both"].includes(direction)) throw new Error("direction must be outbound, inbound or both");
  const maxDepth = options.maxDepth ?? 1, limit = options.limit ?? 20;
  if (!Number.isInteger(maxDepth) || maxDepth < 1 || maxDepth > 3) throw new Error("maxDepth must be 1..3");
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error("traversal limit must be 1..100");
  const kinds = validateList(options.kinds, "kinds");
  const graph = await loadGraph(reader, options.maximumDocumentBytes ?? 256 * 1024);
  const identity = resolveIdentity(graph, start);
  if (!identity) throw new Error("start must identify one exact concept identity or path");
  const admitted = graph.edges.filter((edge) => (!kinds || kinds.has(edge.kind))
    && graph.concepts.has(edge.source) && graph.concepts.has(edge.target));
  const depths = new Map<string, number>([[identity, 0]]), queue = [identity];
  const emitted = new Map<string, HubTraversalEdge>();
  let truncated = false;
  while (queue.length) {
    const current = queue.shift()!, depth = depths.get(current)!;
    const adjacent = admitted.filter((edge) =>
      (direction !== "inbound" && edge.source === current)
      || (direction !== "outbound" && edge.target === current));
    for (const edge of adjacent) {
      const neighbor = edge.source === current ? edge.target : edge.source;
      if (depth >= maxDepth) {
        if (!depths.has(neighbor)) truncated = true;
        continue;
      }
      const edgeDepth = depth + 1;
      if (!depths.has(neighbor)) {
        if (depths.size >= limit) { truncated = true; continue; }
        depths.set(neighbor, edgeDepth);
        queue.push(neighbor);
      }
      emitted.set(`${edge.source}\0${edge.kind}\0${edge.target}`, { ...edge, depth: edgeDepth });
    }
  }
  const nodes = [...depths].sort((left, right) => left[1] - right[1] || left[0].localeCompare(right[0]))
    .map(([node]) => summarize(graph, node));
  const edges = [...emitted.values()].sort((left, right) => left.depth - right.depth
    || left.source.localeCompare(right.source) || left.kind.localeCompare(right.kind) || left.target.localeCompare(right.target));
  return { commit: reader.commit, start: identity, nodes, edges, truncated };
}
