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

export type HubListOptions = Readonly<{
  types?: readonly string[];
  limit?: number;
  maximumDocumentBytes?: number;
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

export async function listHubConcepts(reader: HubQueryReader, options: HubListOptions = {}): Promise<readonly HubConceptSummary[]> {
  const limit = options.limit ?? 100;
  if (!Number.isInteger(limit) || limit < 1 || limit > 512) throw new Error("Hub concept list limit must be 1..512");
  const types = validateList(options.types, "types");
  const graph = await loadHubGraph(reader, options.maximumDocumentBytes ?? 256 * 1024);
  return [...graph.concepts.keys()]
    .filter((identity) => !types || types.has(graph.concepts.get(identity)!.document.type))
    .sort()
    .slice(0, limit)
    .map((identity) => summarizeHubConcept(graph, identity));
}
