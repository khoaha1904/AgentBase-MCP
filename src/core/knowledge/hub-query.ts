import {
  loadHubGraph,
  normalizeHubConceptPath,
  resolveHubIdentity,
  summarizeHubConcept,
  type HubConceptSummary,
  type HubGraphConcept,
  type HubQueryReader,
} from "./hub-query-graph.ts";

export { normalizeHubConceptPath, type HubConceptSummary, type HubQueryReader } from "./hub-query-graph.ts";

export type HubQueryMatch = Readonly<{
  commit: string;
  path: string;
  excerpt: string;
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

function validateList(values: readonly string[] | undefined, name: string): ReadonlySet<string> | undefined {
  if (values === undefined) return undefined;
  if (!values.length || values.length > 32 || values.some((value) => !value.trim() || value.length > 128)) {
    throw new Error(`${name} must contain 1..32 non-empty values`);
  }
  return new Set(values);
}

export async function readHubConcept(reader: HubQueryReader, relativePath: string, maximumBytes = 256 * 1024): Promise<HubQueryMatch> {
  const admittedPath = normalizeHubConceptPath(relativePath);
  const content = await reader.readMarkdown(admittedPath);
  if (Buffer.byteLength(content) > maximumBytes) throw new Error("Hub concept exceeds read limit");
  return { commit: reader.commit, path: admittedPath, excerpt: content };
}

type HubMatchDetail = Readonly<{
  rank: number;
  matchedBy: HubSearchMatch["matchedBy"];
  excerpt?: string;
}>;

function matchConcept(concept: HubGraphConcept, needle: string): HubMatchDetail | undefined {
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
  const graph = await loadHubGraph(reader, options.maximumDocumentBytes ?? 256 * 1024);
  const domain = options.domain === undefined ? undefined : resolveHubIdentity(graph, options.domain);
  if (options.domain !== undefined && (!domain || graph.concepts.get(domain)?.document.type !== "Domain")) {
    throw new Error("domain must identify one exact Domain concept identity or path");
  }
  const found: HubSearchMatch[] = [];
  for (const [identity, concept] of graph.concepts) {
    if (types && !types.has(concept.document.type)) continue;
    if (domain && !(graph.domains.get(identity) ?? []).includes(domain)) continue;
    const matched = matchConcept(concept, needle);
    if (matched) found.push({ ...summarizeHubConcept(graph, identity), ...matched });
  }
  found.sort((left, right) => left.rank - right.rank || left.path.localeCompare(right.path));
  const exactIdentity = found.some((match) => match.rank === 0);
  if (!domain && !options.global && !exactIdentity) {
    const domainIds = [...new Set(found.flatMap((match) => match.domains))].sort();
    if (domainIds.length > 1) {
      return { status: "scope_required", commit: reader.commit,
        candidateDomains: domainIds.map((identity) => summarizeHubConcept(graph, identity)) };
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
  const graph = await loadHubGraph(reader, options.maximumDocumentBytes ?? 256 * 1024);
  const identity = resolveHubIdentity(graph, start);
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
    .map(([node]) => summarizeHubConcept(graph, node));
  const edges = [...emitted.values()].sort((left, right) => left.depth - right.depth
    || left.source.localeCompare(right.source) || left.kind.localeCompare(right.kind) || left.target.localeCompare(right.target));
  return { commit: reader.commit, start: identity, nodes, edges, truncated };
}
