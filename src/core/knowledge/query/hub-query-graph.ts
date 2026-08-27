import path from "node:path";

import { parseConceptDocument, type ConceptDocument, type OkfValue } from "../documents/okf-document.ts";
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
}>;

export type HubGraphEdge = Readonly<{ source: string; kind: string; target: string; evidence: readonly string[] }>;
export type HubGraphLink = Readonly<{ source: string; target: string }>;
export type HubGraphOmission = Readonly<{ path: string; reason: "oversized" }>;
export type HubDomainScopeRole = "member" | "repository-associated" | "boundary";
export type HubGraphConcept = Readonly<{
  document: ConceptDocument;
  title: string;
  description: string;
  tags: readonly string[];
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
  domains: ReadonlyMap<string, readonly string[]>;
  domainScopes: ReadonlyMap<string, ReadonlyMap<string, HubDomainScopeRole>>;
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

function deriveDomainScopes(
  concepts: ReadonlyMap<string, HubGraphConcept>,
  domains: ReadonlyMap<string, readonly string[]>,
  edges: readonly HubGraphEdge[],
  flowSteps: readonly ValidatedOkfFlowStep[],
): ReadonlyMap<string, ReadonlyMap<string, HubDomainScopeRole>> {
  const structural = new Set(["part-of", "implemented-in", "declared-by"]);
  const parents = new Map<string, string[]>();
  for (const edge of edges) {
    if (!structural.has(edge.kind) || !concepts.has(edge.target)) continue;
    parents.set(edge.source, [...parents.get(edge.source) ?? [], edge.target]);
  }
  const repositories = (identity: string, trail = new Set<string>()): readonly string[] => {
    if (trail.has(identity)) return [];
    const concept = concepts.get(identity);
    if (!concept) return [];
    if (concept.document.type === "Repository") return [identity];
    const next = new Set(trail).add(identity);
    return [...new Set((parents.get(identity) ?? []).flatMap((parent) => repositories(parent, next)))].sort();
  };

  const result = new Map<string, ReadonlyMap<string, HubDomainScopeRole>>();
  const domainIds = [...concepts].filter(([, concept]) => concept.document.type === "Domain")
    .map(([identity]) => identity).sort();
  for (const domain of domainIds) {
    const roles = new Map<string, HubDomainScopeRole>();
    for (const identity of concepts.keys()) {
      if ((domains.get(identity) ?? []).includes(domain)) roles.set(identity, "member");
    }
    for (const identity of concepts.keys()) {
      if (roles.has(identity)) continue;
      if (repositories(identity).some((repository) => (domains.get(repository) ?? []).includes(domain))) {
        roles.set(identity, "repository-associated");
      }
    }
    const primary = new Set(roles.keys());
    for (const edge of edges) {
      if (primary.has(edge.source) && !roles.has(edge.target)) roles.set(edge.target, "boundary");
      if (primary.has(edge.target) && !roles.has(edge.source)) roles.set(edge.source, "boundary");
    }
    for (const step of flowSteps) {
      if (primary.has(step.flow)) {
        if (!roles.has(step.source)) roles.set(step.source, "boundary");
        if (!roles.has(step.target)) roles.set(step.target, "boundary");
      }
      if (primary.has(step.source) && !roles.has(step.target)) roles.set(step.target, "boundary");
      if (primary.has(step.target) && !roles.has(step.source)) roles.set(step.source, "boundary");
    }
    result.set(domain, roles);
  }
  return result;
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
  const markdownPaths = [...await reader.listMarkdownPaths()].map(normalizeHubConceptPath).sort();
  for (const relativePath of markdownPaths) {
    if (["index.md", "log.md", "README.md"].includes(path.posix.basename(relativePath))) continue;
    const content = await reader.readMarkdown(relativePath);
    if (Buffer.byteLength(content) > maximumDocumentBytes) {
      omissions.push({ path: relativePath, reason: "oversized" });
      continue;
    }
    try {
      const document = parseConceptDocument(relativePath, content);
      concepts.set(document.conceptId, {
        document,
        title: text(document.frontmatter.title) || document.body.match(/^#\s+(.+)$/m)?.[1]?.trim() || document.conceptId,
        description: text(document.frontmatter.description),
        tags: tags(document),
        sections: splitHubMarkdownSections(document.conceptId, document.body),
      });
      paths.set(document.path, document.conceptId);
    } catch {
      throw new Error(`Published Hub concept is invalid: ${relativePath}`);
    }
  }
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
  const domains = deriveDomains(concepts, edges);
  return {
    commit: reader.commit,
    concepts,
    paths,
    markdownPaths,
    edges,
    flowSteps: validation.flowSteps,
    links,
    omissions,
    domains,
    domainScopes: deriveDomainScopes(concepts, domains, edges, validation.flowSteps),
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
  };
}

export function resolveHubIdentity(graph: HubGraph, value: string): string | undefined {
  const normalized = value.endsWith(".md") ? normalizeHubConceptPath(value) : value;
  return graph.concepts.has(normalized) ? normalized : graph.paths.get(normalized);
}
