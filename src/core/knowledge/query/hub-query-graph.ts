import path from "node:path";

import {
  AGENTBASE_OKF_PROFILE_CONCEPT_ID,
  AGENTBASE_OKF_PROFILE_PATH,
  agentBaseDomainConceptIdentity,
  agentBaseDomainSelector,
  classifyAgentBaseHubProfileSnapshot,
  type AgentBaseConceptHome,
} from "../documents/agentbase-profile.ts";
import { isDomainConceptDocument, parseConceptDocument, type ConceptDocument, type OkfValue } from "../documents/okf-document.ts";
import {
  resolveOkfMarkdownLinkPaths,
  validateOkfRelationships,
  type ValidatedOkfFlowStep,
} from "../documents/okf-relationships.ts";
import { isCanonicalRelationshipKind } from "../documents/relationship-vocabulary.ts";
import { splitHubMarkdownSections, type HubMarkdownSection } from "./hub-markdown-sections.ts";

export type HubQueryReader = Readonly<{
  commit: string;
  listMarkdownPaths(): Promise<readonly string[]>;
  readMarkdown(relativePath: string): Promise<string>;
}>;

export type HubConceptSummary = Readonly<{
  identity: string;
  path: string;
  type: string;
  title: string;
  description: string;
  domains: readonly string[];
  domainSelector?: string;
}>;

export type HubGraphEdge = Readonly<{ source: string; kind: string; target: string; evidence: readonly string[] }>;
export type HubGraphLink = Readonly<{ source: string; target: string }>;
export type HubGraphOmission = Readonly<{ path: string; reason: "oversized" }>;
export type HubDomainScopeRole = "member" | "repository-associated" | "home" | "boundary";
export type HubProfileDomainRole = "home" | "participant" | "boundary";
export type HubGraphConcept = Readonly<{
  document: ConceptDocument;
  title: string;
  description: string;
  tags: readonly string[];
  technology: readonly string[];
  sections: readonly HubMarkdownSection[];
}>;
export type HubGraph = Readonly<{
  commit: string;
  concepts: ReadonlyMap<string, HubGraphConcept>;
  paths: ReadonlyMap<string, string>;
  markdownPaths: readonly string[];
  edges: readonly HubGraphEdge[];
  flowSteps: readonly ValidatedOkfFlowStep[];
  links: readonly HubGraphLink[];
  omissions: readonly HubGraphOmission[];
  profile: "profile-1.0" | "legacy-unprofiled" | "unsupported";
  profileFailures: readonly string[];
  homes: ReadonlyMap<string, AgentBaseConceptHome>;
  domains: ReadonlyMap<string, readonly string[]>;
  repositoryScopes: ReadonlyMap<string, readonly string[]>;
  domainScopes: ReadonlyMap<string, ReadonlyMap<string, HubDomainScopeRole>>;
  domainRoles: ReadonlyMap<string, ReadonlyMap<string, readonly HubProfileDomainRole[]>>;
}>;

function text(value: OkfValue | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

function tags(concept: ConceptDocument): readonly string[] {
  const value = concept.frontmatter.tags;
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item): item is string => typeof item === "string")
    .map((item) => item.trim()).filter(Boolean))].sort();
}

function technology(concept: ConceptDocument): readonly string[] {
  const agentbase = concept.frontmatter.agentbase;
  if (agentbase === null || typeof agentbase !== "object" || Array.isArray(agentbase)) return [];
  const metadata = (agentbase as Readonly<Record<string, OkfValue>>).technology;
  if (metadata === null || typeof metadata !== "object" || Array.isArray(metadata)) return [];
  return Object.values(metadata as Readonly<Record<string, OkfValue>>)
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim()).filter(Boolean).sort();
}

function deriveDomains(
  concepts: ReadonlyMap<string, HubGraphConcept>,
  edges: readonly HubGraphEdge[],
): ReadonlyMap<string, readonly string[]> {
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

function deriveRepositoryScopes(
  concepts: ReadonlyMap<string, HubGraphConcept>,
  edges: readonly HubGraphEdge[],
): ReadonlyMap<string, readonly string[]> {
  const structural = new Set(["part-of", "implemented-in", "declared-by"]);
  const dependants = new Map<string, string[]>();
  for (const edge of edges) {
    if (!structural.has(edge.kind) || !concepts.has(edge.target)) continue;
    dependants.set(edge.target, [...dependants.get(edge.target) ?? [], edge.source]);
  }
  const scopes = new Map<string, Set<string>>([...concepts.keys()].map((identity) => [identity, new Set()]));
  const pending = [...concepts].filter(([, concept]) => concept.document.type === "Repository")
    .map(([identity]) => identity).sort();
  const queued = new Set(pending);
  for (const identity of pending) scopes.get(identity)!.add(identity);
  while (pending.length) {
    const parent = pending.shift()!;
    queued.delete(parent);
    for (const child of (dependants.get(parent) ?? []).sort()) {
      const childScope = scopes.get(child)!;
      const size = childScope.size;
      for (const repository of scopes.get(parent)!) childScope.add(repository);
      if (childScope.size > size && !queued.has(child)) {
        pending.push(child);
        queued.add(child);
      }
    }
  }
  return new Map([...scopes].map(([identity, repositories]) => [identity, [...repositories].sort()]));
}

function deriveDomainScopes(
  concepts: ReadonlyMap<string, HubGraphConcept>,
  domains: ReadonlyMap<string, readonly string[]>,
  repositories: ReadonlyMap<string, readonly string[]>,
  homes: ReadonlyMap<string, AgentBaseConceptHome>,
  edges: readonly HubGraphEdge[],
  flowSteps: readonly ValidatedOkfFlowStep[],
): Readonly<{
  scopes: ReadonlyMap<string, ReadonlyMap<string, HubDomainScopeRole>>;
  roles: ReadonlyMap<string, ReadonlyMap<string, readonly HubProfileDomainRole[]>>;
}> {

  const scopes = new Map<string, ReadonlyMap<string, HubDomainScopeRole>>();
  const roleDetails = new Map<string, ReadonlyMap<string, readonly HubProfileDomainRole[]>>();
  const domainIds = [...concepts].filter(([, concept]) => concept.document.type === "Domain")
    .map(([identity]) => identity).sort();
  for (const domain of domainIds) {
    const roles = new Map<string, HubDomainScopeRole>();
    const details = new Map<string, Set<HubProfileDomainRole>>();
    const addDetail = (identity: string, role: HubProfileDomainRole) => {
      const values = details.get(identity) ?? new Set<HubProfileDomainRole>();
      values.add(role); details.set(identity, values);
    };
    for (const identity of concepts.keys()) {
      if ((domains.get(identity) ?? []).includes(domain)) {
        roles.set(identity, "member");
        addDetail(identity, "participant");
      }
    }
    for (const identity of concepts.keys()) {
      if ((repositories.get(identity) ?? []).some((repository) => (domains.get(repository) ?? []).includes(domain))) {
        if (!roles.has(identity)) roles.set(identity, "repository-associated");
        addDetail(identity, "participant");
      }
    }
    for (const [identity, home] of homes) {
      if (home.kind === "domain" && agentBaseDomainConceptIdentity(home.selector) === domain) {
        if (!roles.has(identity)) roles.set(identity, "home");
        addDetail(identity, "home");
      }
    }
    const primary = new Set(roles.keys());
    for (const edge of edges) {
      if (primary.has(edge.source) && !roles.has(edge.target)) {
        roles.set(edge.target, "boundary"); addDetail(edge.target, "boundary");
      }
      if (primary.has(edge.target) && !roles.has(edge.source)) {
        roles.set(edge.source, "boundary"); addDetail(edge.source, "boundary");
      }
    }
    for (const step of flowSteps) {
      if (primary.has(step.flow)) {
        if (!roles.has(step.source)) {
          roles.set(step.source, "boundary"); addDetail(step.source, "boundary");
        }
        if (!roles.has(step.target)) {
          roles.set(step.target, "boundary"); addDetail(step.target, "boundary");
        }
      }
      if (primary.has(step.source) && !roles.has(step.target)) {
        roles.set(step.target, "boundary"); addDetail(step.target, "boundary");
      }
      if (primary.has(step.target) && !roles.has(step.source)) {
        roles.set(step.source, "boundary"); addDetail(step.source, "boundary");
      }
    }
    scopes.set(domain, roles);
    const order = new Map<HubProfileDomainRole, number>([["home", 0], ["participant", 1], ["boundary", 2]]);
    roleDetails.set(domain, new Map([...details].map(([identity, values]) => [identity,
      [...values].sort((left, right) => order.get(left)! - order.get(right)!)])));
  }
  return { scopes, roles: roleDetails };
}

export function normalizeHubConceptPath(value: string): string {
  if (value.includes("\0") || value.includes("\\") || path.posix.isAbsolute(value)) {
    throw new Error("Hub concept path must be normalized and relative");
  }
  const normalized = path.posix.normalize(value);
  if (normalized === "." || normalized.startsWith("../") || !normalized.endsWith(".md")) {
    throw new Error("Hub concept path must identify one Markdown file");
  }
  return normalized;
}

export async function loadHubGraph(reader: HubQueryReader, maximumDocumentBytes: number): Promise<HubGraph> {
  const concepts = new Map<string, HubGraphConcept>(), paths = new Map<string, string>(), omissions: HubGraphOmission[] = [];
  const markdown = new Map<string, string>();
  const markdownPaths = [...await reader.listMarkdownPaths()].map(normalizeHubConceptPath).sort();
  for (const relativePath of markdownPaths) {
    const content = await reader.readMarkdown(relativePath);
    if (Buffer.byteLength(content) > maximumDocumentBytes) {
      omissions.push({ path: relativePath, reason: "oversized" });
      continue;
    }
    markdown.set(relativePath, content);
    if (["log.md", "README.md"].includes(path.posix.basename(relativePath))) continue;
    try {
      if (path.posix.basename(relativePath) === "index.md"
        && !isDomainConceptDocument(relativePath, content)) continue;
      const document = parseConceptDocument(relativePath, content);
      const existing = concepts.get(document.conceptId);
      if (existing) {
        throw new Error(`duplicate concept identity ${document.conceptId}; already defined by ${existing.document.path}`);
      }
      concepts.set(document.conceptId, {
        document,
        title: text(document.frontmatter.title) || document.body.match(/^#\s+(.+)$/m)?.[1]?.trim() || document.conceptId,
        description: text(document.frontmatter.description),
        tags: tags(document),
        technology: technology(document),
        sections: splitHubMarkdownSections(document.conceptId, document.body),
      });
      paths.set(document.path, document.conceptId);
    } catch {
      throw new Error(`Published Hub concept is invalid: ${relativePath}`);
    }
  }
  const missingProfile = markdownPaths.includes(AGENTBASE_OKF_PROFILE_PATH)
    && !concepts.has(AGENTBASE_OKF_PROFILE_CONCEPT_ID);
  const profileAdmission = missingProfile
    ? { kind: "unsupported" as const, failures: [`${AGENTBASE_OKF_PROFILE_PATH} is unavailable`], omittedFailureCount: 0 }
    : classifyAgentBaseHubProfileSnapshot({
      concepts: new Map([...concepts].map(([identity, concept]) => [identity, concept.document])),
      files: markdownPaths,
      readMarkdown(relativePath) { return markdown.get(relativePath); },
    });
  const validation = validateOkfRelationships([...concepts].map(([identity, concept]) => ({
    identity,
    concept: concept.document,
  })));
  const edges = validation.relationships.filter((relationship) => isCanonicalRelationshipKind(relationship.kind))
    .map((relationship): HubGraphEdge => ({ ...relationship }));
  const links: HubGraphLink[] = [];
  for (const [source, concept] of concepts) {
    for (const linkedPath of resolveOkfMarkdownLinkPaths(concept.document)) {
      const target = paths.get(linkedPath);
      if (target && target !== source) links.push({ source, target });
    }
  }
  links.sort((left, right) => `${left.source}\0${left.target}`.localeCompare(`${right.source}\0${right.target}`));
  const homes = profileAdmission.kind === "profile-1.0"
    ? new Map(profileAdmission.homes.map((item) => [item.identity, item.home]))
    : new Map<string, AgentBaseConceptHome>();
  const domains = deriveDomains(concepts, edges);
  const repositoryScopes = deriveRepositoryScopes(concepts, edges);
  const domainProjection = deriveDomainScopes(concepts, domains, repositoryScopes, homes, edges, validation.flowSteps);
  return {
    commit: reader.commit,
    concepts,
    paths,
    markdownPaths,
    edges,
    flowSteps: validation.flowSteps,
    links,
    omissions,
    profile: profileAdmission.kind,
    profileFailures: profileAdmission.kind === "unsupported" ? profileAdmission.failures : [],
    homes,
    domains,
    repositoryScopes,
    domainScopes: domainProjection.scopes,
    domainRoles: domainProjection.roles,
  };
}

export function summarizeHubConcept(graph: HubGraph, identity: string): HubConceptSummary {
  const value = graph.concepts.get(identity);
  if (!value) throw new Error(`Hub concept does not exist: ${identity}`);
  return {
    identity,
    path: value.document.path,
    type: value.document.type,
    title: value.title,
    description: value.description,
    domains: graph.domains.get(identity) ?? [],
    ...(graph.profile === "profile-1.0" && value.document.type === "Domain"
      ? { domainSelector: agentBaseDomainSelector(identity) } : {}),
  };
}

export function resolveHubIdentity(graph: HubGraph, value: string): string | undefined {
  const normalized = value.endsWith(".md") ? normalizeHubConceptPath(value) : value;
  return graph.concepts.has(normalized) ? normalized : graph.paths.get(normalized);
}

export function resolveHubDomainIdentity(graph: HubGraph, value: string): string | undefined {
  const direct = resolveHubIdentity(graph, value);
  if (direct && graph.concepts.get(direct)?.document.type === "Domain") return direct;
  if (graph.profile !== "profile-1.0") return undefined;
  try {
    const identity = agentBaseDomainConceptIdentity(value);
    return graph.concepts.get(identity)?.document.type === "Domain" ? identity : undefined;
  } catch {
    return undefined;
  }
}
