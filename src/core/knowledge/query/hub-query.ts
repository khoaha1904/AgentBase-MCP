import {
  loadHubGraph,
  normalizeHubConceptPath,
  resolveHubDomainIdentity,
  summarizeHubConcept,
  type HubConceptSummary,
  type HubDomainScopeRole,
  type HubGraph,
  type HubGraphConcept,
  type HubGraphOmission,
  type HubProfileDomainRole,
  type HubQueryReader,
} from "./hub-query-graph.ts";
import {
  loadHubSearchProjection,
  type HubLexicalHit,
  type HubSearchContext,
} from "./hub-query-search-index.ts";
import { parseConceptDocument } from "../documents/okf-document.ts";
import {
  buildExactConceptFreshness,
  buildHubContextFreshness,
  type ContextFreshnessEnvelope,
} from "./context-freshness.ts";

export { normalizeHubConceptPath, type HubConceptSummary, type HubQueryReader } from "./hub-query-graph.ts";

export type HubQueryMatch = Readonly<{
  commit: string;
  path: string;
  excerpt: string;
}>;

export type FreshHubQueryMatch = HubQueryMatch & Readonly<{ freshness: ContextFreshnessEnvelope }>;

export type HubSearchMatch = HubConceptSummary & Readonly<{
  rank: number;
  matchedBy: "identity" | "path" | "title" | "type" | "description" | "tags" | "heading" | "body" | "relationship";
  excerpt?: string;
  relevance?: Readonly<{
    method: "bm25+";
    score: number;
    matchedFields: readonly string[];
    matchedTerms: readonly string[];
  }>;
  section?: Readonly<{
    headingPath: readonly string[];
    ordinal: number;
    omittedMatches: number;
  }>;
  scope?: Readonly<{
    domain: string;
    selector?: string;
    role: HubDomainScopeRole;
    roles?: readonly HubProfileDomainRole[];
  }>;
  context?: readonly HubSearchContext[];
  contextOmitted?: number;
}>;

export type HubSearchResult = Readonly<{
  status: "ok";
  commit: string;
  profile: HubGraph["profile"];
  matches: readonly HubSearchMatch[];
  omissions?: readonly HubGraphOmission[];
}> | Readonly<{
  status: "scope_required";
  commit: string;
  profile: HubGraph["profile"];
  candidateDomains: readonly HubConceptSummary[];
}>;

export type FreshHubSearchResult = HubSearchResult & Readonly<{ freshness: ContextFreshnessEnvelope }>;

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

async function readHubConceptProjection(reader: HubQueryReader, relativePath: string, maximumBytes = 256 * 1024): Promise<Readonly<{
  result: HubQueryMatch;
  document: ReturnType<typeof parseConceptDocument>;
}>> {
  const admittedPath = normalizeHubConceptPath(relativePath);
  const content = await reader.readMarkdown(admittedPath);
  if (Buffer.byteLength(content) > maximumBytes) throw new Error("Hub concept exceeds read limit");
  let document: ReturnType<typeof parseConceptDocument>;
  try { document = parseConceptDocument(admittedPath, content); }
  catch { throw new Error(`Published Hub concept is invalid: ${admittedPath}`); }
  return { result: { commit: reader.commit, path: admittedPath, excerpt: content }, document };
}

export async function readHubConcept(reader: HubQueryReader, relativePath: string, maximumBytes = 256 * 1024): Promise<HubQueryMatch> {
  return (await readHubConceptProjection(reader, relativePath, maximumBytes)).result;
}

export async function readHubConceptWithFreshness(
  reader: HubQueryReader,
  relativePath: string,
  maximumBytes = 256 * 1024,
): Promise<FreshHubQueryMatch> {
  const projection = await readHubConceptProjection(reader, relativePath, maximumBytes);
  return {
    ...projection.result,
    freshness: buildExactConceptFreshness(reader.commit, projection.document),
  };
}

function exactKind(concept: HubGraphConcept, needle: string): Readonly<{
  rank: number;
  matchedBy: "identity" | "path" | "title";
}> | undefined {
  const identity = concept.document.conceptId.toLowerCase();
  const documentPath = concept.document.path.toLowerCase();
  const title = concept.title.toLowerCase();
  if (identity === needle) return { rank: 0, matchedBy: "identity" };
  if (documentPath === needle) return { rank: 0, matchedBy: "path" };
  if (title === needle) return { rank: 1, matchedBy: "title" };
  if (identity.includes(needle)) return { rank: 2, matchedBy: "identity" };
  if (documentPath.includes(needle)) return { rank: 2, matchedBy: "path" };
  if (title.includes(needle)) return { rank: 3, matchedBy: "title" };
  return undefined;
}

function primaryMatch(concept: HubGraphConcept, fields: readonly string[], terms: readonly string[]): HubSearchMatch["matchedBy"] {
  if (fields.includes("identityPathTitle")) return "title";
  if (fields.includes("description")) return "description";
  if (fields.includes("typeTags")) {
    const loweredTags = concept.tags.map((tag) => tag.toLowerCase());
    return terms.some((term) => loweredTags.some((tag) => tag.includes(term))) ? "tags" : "type";
  }
  if (fields.includes("heading")) return "heading";
  if (fields.includes("relationContext") || fields.includes("linkContext")) return "relationship";
  return "body";
}

function legacyRank(matchedBy: HubSearchMatch["matchedBy"]): number {
  if (matchedBy === "identity" || matchedBy === "path") return 0;
  if (matchedBy === "title") return 3;
  if (matchedBy === "type") return 4;
  if (matchedBy === "body") return 6;
  return 5;
}

function excerpt(concept: HubGraphConcept, hit: HubLexicalHit): string | undefined {
  if (hit.sectionOrdinal < 0 || !hit.matchedFields.includes("body")) return undefined;
  const section = concept.sections[hit.sectionOrdinal];
  if (!section) return undefined;
  const text = section.text.replace(/\s+/g, " ").trim(), lower = text.toLowerCase();
  const offset = hit.matchedTerms.map((term) => lower.indexOf(term.toLowerCase()))
    .filter((value) => value >= 0).sort((left, right) => left - right)[0];
  if (offset === undefined) return undefined;
  const start = Math.max(0, offset - 100);
  return text.slice(start, Math.min(text.length, offset + 220)).trim();
}

function scopedDomains(graph: HubGraph, identity: string): readonly string[] {
  return [...graph.domainScopes].flatMap(([domain, roles]) => roles.has(identity) ? [domain] : []).sort();
}

function commonDetail(
  graph: HubGraph,
  identity: string,
  domain: string | undefined,
  contexts: ReadonlyMap<string, readonly HubSearchContext[]>,
  omissions: ReadonlyMap<string, number>,
): Readonly<{
  scope?: NonNullable<HubSearchMatch["scope"]>;
  context?: readonly HubSearchContext[];
  contextOmitted?: number;
}> {
  const context = contexts.get(identity) ?? [], contextOmitted = omissions.get(identity) ?? 0;
  const role = domain ? graph.domainScopes.get(domain)?.get(identity) : undefined;
  const roles = domain && graph.profile === "profile-1.0"
    ? graph.domainRoles.get(domain)?.get(identity) : undefined;
  const selector = domain && graph.profile === "profile-1.0"
    ? summarizeHubConcept(graph, domain).domainSelector : undefined;
  return {
    ...(domain && role ? { scope: {
      domain,
      ...(selector ? { selector } : {}),
      role,
      ...(roles?.length ? { roles } : {}),
    } } : {}),
    ...(context.length ? { context } : {}),
    ...(contextOmitted ? { contextOmitted } : {}),
  };
}

async function searchHubConceptProjection(
  reader: HubQueryReader,
  query: string,
  options: HubSearchOptions = {},
): Promise<Readonly<{ result: HubSearchResult; graph: HubGraph }>> {
  const needle = query.trim().toLowerCase();
  if (!needle || needle.length > 256) throw new Error("Hub query must contain 1..256 characters");
  const limit = options.limit ?? 20;
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error("Hub query limit must be 1..100");
  const types = validateList(options.types, "types");
  const projection = await loadHubSearchProjection(reader, options.maximumDocumentBytes ?? 256 * 1024);
  const graph = projection.graph;
  if (graph.profile === "unsupported") {
    throw new Error(`Published Hub Profile is unsupported: ${graph.profileFailures.join("; ")}`);
  }
  const domain = options.domain === undefined ? undefined : resolveHubDomainIdentity(graph, options.domain);
  if (options.domain !== undefined && (!domain || graph.concepts.get(domain)?.document.type !== "Domain")) {
    throw new Error("domain must identify one exact Domain concept identity or path");
  }
  const allowed = new Set([...graph.concepts].flatMap(([identity, concept]) => {
    if (types && !types.has(concept.document.type)) return [];
    if (domain && !graph.domainScopes.get(domain)?.has(identity)) return [];
    return [identity];
  }));

  const matches: HubSearchMatch[] = [];
  const exactIdentities = new Set<string>();
  for (const identity of [...allowed].sort()) {
    const concept = graph.concepts.get(identity)!;
    const exact = exactKind(concept, needle);
    if (!exact) continue;
    exactIdentities.add(identity);
    matches.push({
      ...summarizeHubConcept(graph, identity),
      ...exact,
      ...commonDetail(graph, identity, domain, projection.contexts, projection.contextOmissions),
    });
  }

  const hits = projection.search(query, allowed);
  const hitCounts = new Map<string, number>();
  for (const hit of hits) hitCounts.set(hit.conceptIdentity, (hitCounts.get(hit.conceptIdentity) ?? 0) + 1);
  const seen = new Set(exactIdentities);
  for (const hit of hits) {
    if (seen.has(hit.conceptIdentity)) continue;
    seen.add(hit.conceptIdentity);
    const concept = graph.concepts.get(hit.conceptIdentity);
    if (!concept) continue;
    const matchedBy = primaryMatch(concept, hit.matchedFields, hit.matchedTerms);
    const section = hit.sectionOrdinal < 0 ? undefined : concept.sections[hit.sectionOrdinal];
    const bodyExcerpt = excerpt(concept, hit);
    matches.push({
      ...summarizeHubConcept(graph, hit.conceptIdentity),
      rank: legacyRank(matchedBy),
      matchedBy,
      ...(bodyExcerpt ? { excerpt: bodyExcerpt } : {}),
      relevance: {
        method: "bm25+",
        score: hit.score,
        matchedFields: hit.matchedFields,
        matchedTerms: hit.matchedTerms,
      },
      ...(section ? { section: {
        headingPath: section.headingPath,
        ordinal: section.ordinal,
        omittedMatches: Math.max(0, (hitCounts.get(hit.conceptIdentity) ?? 1) - 1),
      } } : {}),
      ...commonDetail(graph, hit.conceptIdentity, domain, projection.contexts, projection.contextOmissions),
    });
  }
  matches.sort((left, right) => {
    const leftPrepass = !left.relevance, rightPrepass = !right.relevance;
    if (leftPrepass !== rightPrepass) return leftPrepass ? -1 : 1;
    if (leftPrepass && rightPrepass) return left.rank - right.rank || left.path.localeCompare(right.path);
    return (right.relevance?.score ?? 0) - (left.relevance?.score ?? 0) || left.path.localeCompare(right.path);
  });

  const exactIdentity = matches.some((match) => match.rank === 0);
  if (!domain && !options.global && !exactIdentity) {
    const domainIds = [...new Set(matches.flatMap((match) => scopedDomains(graph, match.identity)))].sort();
    if (domainIds.length > 1) {
      return { graph, result: {
        status: "scope_required", commit: reader.commit, profile: graph.profile,
        candidateDomains: domainIds.map((identity) => summarizeHubConcept(graph, identity)),
      } };
    }
  }
  return { graph, result: {
    status: "ok", commit: reader.commit, profile: graph.profile, matches: matches.slice(0, limit),
    ...(graph.omissions.length ? { omissions: graph.omissions } : {}),
  } };
}

export async function searchHubConcepts(reader: HubQueryReader, query: string, options: HubSearchOptions = {}): Promise<HubSearchResult> {
  return (await searchHubConceptProjection(reader, query, options)).result;
}

function contextIdentities(result: HubSearchResult): readonly string[] {
  if (result.status === "scope_required") return result.candidateDomains.map((domain) => domain.identity);
  return result.matches.flatMap((match) => [
    match.identity,
    ...(match.context ?? []).flatMap((context) => context.kind === "flow-step"
      ? [context.flow, context.source, context.target]
      : [context.source, context.target]),
  ]);
}

export async function searchHubConceptsWithFreshness(
  reader: HubQueryReader,
  query: string,
  options: HubSearchOptions = {},
): Promise<FreshHubSearchResult> {
  const projection = await searchHubConceptProjection(reader, query, options);
  return {
    ...projection.result,
    freshness: buildHubContextFreshness(projection.graph, contextIdentities(projection.result)),
  };
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
