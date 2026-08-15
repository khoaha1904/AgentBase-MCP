import path from "node:path";

import { conceptReferencesRepository } from "./okf-document.ts";
import {
  loadHubGraph,
  resolveHubIdentity,
  summarizeHubConcept,
  type HubConceptSummary,
  type HubGraph,
  type HubGraphEdge,
  type HubQueryReader,
} from "./hub-query-graph.ts";

export type HubContinuityManifest = Readonly<{
  commit: string;
  sourceRepositoryId: string;
  subjectDirectory: string;
  subject?: HubConceptSummary;
  currentSource: readonly HubConceptSummary[];
  neighbors: readonly HubConceptSummary[];
  edges: readonly HubGraphEdge[];
  navigationPaths: readonly string[];
  truncated: boolean;
  omitted: Readonly<{ currentSource: number; neighbors: number; edges: number; navigationPaths: number }>;
}>;

export type HubContinuityOptions = Readonly<{
  conceptLimit?: number;
  neighborLimit?: number;
  edgeLimit?: number;
  navigationLimit?: number;
  maximumDocumentBytes?: number;
}>;

function bound(value: number | undefined, fallback: number, maximum: number, name: string): number {
  const admitted = value ?? fallback;
  if (!Number.isInteger(admitted) || admitted < 1 || admitted > maximum) throw new Error(`${name} must be 1..${maximum}`);
  return admitted;
}

function subjectIdentity(graph: HubGraph, subjectDirectory: string): string | undefined {
  const exact = resolveHubIdentity(graph, subjectDirectory)
    ?? resolveHubIdentity(graph, `${subjectDirectory}.md`);
  if (exact) return exact;
  const expectedType = new Map([["domains", "Domain"], ["systems", "System"], ["repositories", "Repository"]])
    .get(subjectDirectory.split("/")[0] ?? "");
  const direct = [...graph.concepts].filter(([identity, concept]) =>
    path.posix.dirname(identity) === subjectDirectory && concept.document.type === expectedType);
  return direct.length === 1 ? direct[0]?.[0] : undefined;
}

function sortedEdges(edges: readonly HubGraphEdge[]): readonly HubGraphEdge[] {
  return [...edges].sort((left, right) => left.source.localeCompare(right.source)
    || left.kind.localeCompare(right.kind) || left.target.localeCompare(right.target));
}

export async function buildHubContinuity(
  reader: HubQueryReader,
  sourceRepositoryId: string,
  subjectDirectory: string,
  options: HubContinuityOptions = {},
): Promise<HubContinuityManifest> {
  const conceptLimit = bound(options.conceptLimit, 128, 512, "conceptLimit");
  const neighborLimit = bound(options.neighborLimit, 128, 512, "neighborLimit");
  const edgeLimit = bound(options.edgeLimit, 256, 1024, "edgeLimit");
  const navigationLimit = bound(options.navigationLimit, 64, 128, "navigationLimit");
  const graph = await loadHubGraph(reader, options.maximumDocumentBytes ?? 256 * 1024);
  const allCurrent = [...graph.concepts].filter(([, concept]) =>
    conceptReferencesRepository(concept.document, sourceRepositoryId)).map(([identity]) => identity).sort();
  const currentIds = allCurrent.slice(0, conceptLimit);
  const subjectId = subjectIdentity(graph, subjectDirectory);
  const seeds = new Set([...currentIds, ...(subjectId ? [subjectId] : [])]);
  const candidateEdges = sortedEdges(graph.edges.filter((edge) =>
    (seeds.has(edge.source) || seeds.has(edge.target))
    && graph.concepts.has(edge.source) && graph.concepts.has(edge.target)));
  const allNeighborIds = [...new Set(candidateEdges.flatMap((edge) => [edge.source, edge.target])
    .filter((identity) => !seeds.has(identity)))].sort();
  const neighborIds = allNeighborIds.slice(0, neighborLimit);
  const admittedIds = new Set([...seeds, ...neighborIds]);
  const admittedEdgeCandidates = candidateEdges.filter((edge) => admittedIds.has(edge.source) && admittedIds.has(edge.target));
  const edges = admittedEdgeCandidates.slice(0, edgeLimit);
  const conceptPaths = [...currentIds, ...neighborIds, ...(subjectId ? [subjectId] : [])]
    .map((identity) => graph.concepts.get(identity)?.document.path).filter((value): value is string => Boolean(value));
  const wantedIndexes = new Set(["index.md", `${subjectDirectory}/index.md`,
    ...conceptPaths.map((value) => `${value.split("/")[0]}/index.md`)]);
  const allNavigation = graph.markdownPaths.filter((value) => wantedIndexes.has(value)).sort();
  const navigationPaths = allNavigation.slice(0, navigationLimit);
  const omitted = {
    currentSource: allCurrent.length - currentIds.length,
    neighbors: allNeighborIds.length - neighborIds.length,
    edges: candidateEdges.length - edges.length,
    navigationPaths: allNavigation.length - navigationPaths.length,
  };
  return {
    commit: reader.commit,
    sourceRepositoryId,
    subjectDirectory,
    ...(subjectId ? { subject: summarizeHubConcept(graph, subjectId) } : {}),
    currentSource: currentIds.map((identity) => summarizeHubConcept(graph, identity)),
    neighbors: neighborIds.map((identity) => summarizeHubConcept(graph, identity)),
    edges,
    navigationPaths,
    truncated: Object.values(omitted).some((count) => count > 0),
    omitted,
  };
}
