import path from "node:path";

import { parseConceptDocument, type ConceptDocument, type OkfValue } from "../documents/okf-document.ts";
import { isCanonicalRelationshipKind } from "../documents/relationship-vocabulary.ts";

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
export type HubGraphConcept = Readonly<{ document: ConceptDocument; title: string; description: string }>;
export type HubGraph = Readonly<{
  commit: string;
  concepts: ReadonlyMap<string, HubGraphConcept>;
  paths: ReadonlyMap<string, string>;
  markdownPaths: readonly string[];
  edges: readonly HubGraphEdge[];
  domains: ReadonlyMap<string, readonly string[]>;
}>;

function mapping(value: OkfValue | undefined): Readonly<Record<string, OkfValue>> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Readonly<Record<string, OkfValue>> : undefined;
}

function text(value: OkfValue | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

function relationships(concept: ConceptDocument): readonly HubGraphEdge[] {
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

export function normalizeHubConceptPath(value: string): string {
  if (value.includes("\0") || value.includes("\\") || path.posix.isAbsolute(value)) throw new Error("Hub concept path must be normalized and relative");
  const normalized = path.posix.normalize(value);
  if (normalized === "." || normalized.startsWith("../") || !normalized.endsWith(".md")) throw new Error("Hub concept path must identify one Markdown file");
  return normalized;
}

export async function loadHubGraph(reader: HubQueryReader, maximumDocumentBytes: number): Promise<HubGraph> {
  const concepts = new Map<string, HubGraphConcept>(), paths = new Map<string, string>();
  const edges: HubGraphEdge[] = [];
  const markdownPaths = [...await reader.listMarkdownPaths()].map(normalizeHubConceptPath).sort();
  for (const relativePath of markdownPaths) {
    if (["index.md", "log.md"].includes(path.posix.basename(relativePath))) continue;
    const content = await reader.readMarkdown(relativePath);
    if (Buffer.byteLength(content) > maximumDocumentBytes) continue;
    try {
      const document = parseConceptDocument(relativePath, content);
      concepts.set(document.conceptId, {
        document,
        title: text(document.frontmatter.title) || document.body.match(/^#\s+(.+)$/m)?.[1]?.trim() || document.conceptId,
        description: text(document.frontmatter.description),
      });
      paths.set(document.path, document.conceptId);
      edges.push(...relationships(document));
    } catch {
      // Navigation Markdown is not promoted into a graph concept.
    }
  }
  return { commit: reader.commit, concepts, paths, markdownPaths, edges, domains: deriveDomains(concepts, edges) };
}

export function summarizeHubConcept(graph: HubGraph, identity: string): HubConceptSummary {
  const value = graph.concepts.get(identity);
  if (!value) throw new Error(`Hub concept does not exist: ${identity}`);
  return { identity, path: value.document.path, type: value.document.type, title: value.title,
    description: value.description, domains: graph.domains.get(identity) ?? [] };
}

export function resolveHubIdentity(graph: HubGraph, value: string): string | undefined {
  const normalized = value.endsWith(".md") ? normalizeHubConceptPath(value) : value;
  return graph.concepts.has(normalized) ? normalized : graph.paths.get(normalized);
}
