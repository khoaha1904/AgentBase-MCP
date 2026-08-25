import { createHash } from "node:crypto";

import type { OkfValue } from "../documents/okf-document.ts";
import { validateOkfRelationships } from "../documents/okf-relationships.ts";
import { isCanonicalRelationshipKind } from "../documents/relationship-vocabulary.ts";
import { parseQuestionDocument, type QuestionKind, type QuestionState } from "../governance/questions.ts";
import type { HubGraph, HubGraphConcept } from "../query/hub-query-graph.ts";
import { displayEndpoints, relationshipDisplayDescriptor, type RelationshipDisplayClass } from "./predicate-descriptors.ts";

const GOVERNANCE_TYPES = new Set(["Question", "Open Question", "Maintainer Guidance"]);
const DEFAULT_MAXIMUM_NODES = 500;
const DEFAULT_MAXIMUM_EDGES = 2_000;

export type VisualizationNode = Readonly<{
  id: string;
  path: string;
  type: string;
  title: string;
  description: string;
  domainIds: readonly string[];
  parentIds: readonly string[];
  sources: readonly string[];
  membership: "primary" | "boundary";
  expandable: boolean;
}>;

export type VisualizationEdge = Readonly<{
  id: string;
  predicate: string;
  declaredSource: string;
  declaredTarget: string;
  displaySource: string;
  displayTarget: string;
  directed: boolean;
  displayClass: RelationshipDisplayClass;
  evidence: readonly string[];
}>;

export type VisualizationFlowStep = Readonly<{
  order: number;
  source: string;
  action: string;
  target: string;
  mode: string;
  evidence: readonly string[];
}>;

export type VisualizationFlow = Readonly<{ id: string; steps: readonly VisualizationFlowStep[] }>;
export type VisualizationQuestion = Readonly<{
  id: string;
  subject: string;
  state: Extract<QuestionState, "open" | "needs-review">;
  kind: QuestionKind;
  property: string;
}>;
export type VisualizationOmission = Readonly<{
  code: "question-subject-outside-projection" | "relationship-warning";
  subject: string;
  detail: string;
}>;

export type PublishedVisualizationProjection = Readonly<{
  schemaVersion: 1;
  hub: string;
  commit: string;
  domain: Readonly<{ id: string; path: string; title: string }>;
  nodes: readonly VisualizationNode[];
  edges: readonly VisualizationEdge[];
  flows: readonly VisualizationFlow[];
  questions: readonly VisualizationQuestion[];
  omissions: readonly VisualizationOmission[];
}>;

export type PublishedVisualizationProjectionOptions = Readonly<{
  hub: string;
  domain: string;
  maximumNodes?: number;
  maximumEdges?: number;
}>;

function mapping(value: OkfValue | undefined): Readonly<Record<string, OkfValue>> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Readonly<Record<string, OkfValue>> : undefined;
}

function sourceResources(concept: HubGraphConcept): readonly string[] {
  const sources = concept.document.frontmatter.sources;
  if (!Array.isArray(sources)) return [];
  return [...new Set(sources.flatMap((source) => {
    const resource = mapping(source)?.resource;
    return typeof resource === "string" && /^(?:agentbase|provider|repository|https):\/\//.test(resource)
      ? [resource] : [];
  }))].sort();
}

function boundedInteger(value: number | undefined, fallback: number, label: string): number {
  const result = value ?? fallback;
  if (!Number.isSafeInteger(result) || result < 1) throw new Error(`${label} must be a positive safe integer`);
  return result;
}

function edgeId(source: string, predicate: string, target: string): string {
  return `edge-${createHash("sha256").update(JSON.stringify([source, predicate, target])).digest("hex").slice(0, 24)}`;
}

function visibleConcepts(graph: HubGraph): ReadonlyMap<string, HubGraphConcept> {
  return new Map([...graph.concepts].filter(([, concept]) => !GOVERNANCE_TYPES.has(concept.document.type)));
}

export function buildPublishedVisualizationProjection(
  graph: HubGraph,
  options: PublishedVisualizationProjectionOptions,
): PublishedVisualizationProjection {
  if (!options.hub.trim()) throw new Error("visualization Hub identity is required");
  const maximumNodes = boundedInteger(options.maximumNodes, DEFAULT_MAXIMUM_NODES, "maximumNodes");
  const maximumEdges = boundedInteger(options.maximumEdges, DEFAULT_MAXIMUM_EDGES, "maximumEdges");
  const concepts = visibleConcepts(graph);
  const domain = concepts.get(options.domain);
  if (!domain || domain.document.type !== "Domain") throw new Error("visualization requires an exact Published Domain");

  const primary = new Set([...concepts.keys()].filter((id) => graph.domains.get(id)?.includes(options.domain)));
  primary.add(options.domain);
  const validation = validateOkfRelationships([...concepts].map(([identity, concept]) => ({
    identity, concept: concept.document,
  })));
  if (validation.failures.length) {
    throw new Error(`Published visualization relationships are invalid: ${validation.failures.join("; ")}`);
  }

  const boundary = new Set<string>();
  const selectedRelationships = validation.relationships.filter((relationship) => {
    const sourcePrimary = primary.has(relationship.source), targetPrimary = primary.has(relationship.target);
    if (!sourcePrimary && !targetPrimary) return false;
    if (!sourcePrimary) boundary.add(relationship.source);
    if (!targetPrimary) boundary.add(relationship.target);
    return true;
  });
  const selectedFlowSteps = validation.flowSteps.filter((step) => primary.has(step.flow));
  for (const step of selectedFlowSteps) {
    if (!primary.has(step.source)) boundary.add(step.source);
    if (!primary.has(step.target)) boundary.add(step.target);
  }
  const included = new Set([...primary, ...boundary].filter((id) => concepts.has(id)));
  if (included.size > maximumNodes) throw new Error(`Published visualization node limit exceeded: ${included.size} > ${maximumNodes}`);
  if (selectedRelationships.length > maximumEdges) {
    throw new Error(`Published visualization edge limit exceeded: ${selectedRelationships.length} > ${maximumEdges}`);
  }

  const edges: VisualizationEdge[] = selectedRelationships.flatMap((relationship) => {
    if (!isCanonicalRelationshipKind(relationship.kind)) return [];
    const descriptor = relationshipDisplayDescriptor(relationship.kind);
    const display = displayEndpoints(relationship.kind, relationship.source, relationship.target);
    return [{
      id: edgeId(relationship.source, relationship.kind, relationship.target),
      predicate: relationship.kind,
      declaredSource: relationship.source,
      declaredTarget: relationship.target,
      displaySource: display.source,
      displayTarget: display.target,
      directed: display.directed,
      displayClass: descriptor.displayClass,
      evidence: [...relationship.evidence].sort(),
    }];
  }).sort((left, right) => left.id.localeCompare(right.id));

  const parents = new Map<string, Set<string>>();
  for (const edge of edges) {
    if (edge.displayClass !== "structural") continue;
    const values = parents.get(edge.declaredSource) ?? new Set<string>();
    values.add(edge.declaredTarget);
    parents.set(edge.declaredSource, values);
  }
  const nodes = [...included].map((id): VisualizationNode => {
    const concept = concepts.get(id)!;
    const membership = primary.has(id) ? "primary" as const : "boundary" as const;
    return {
      id,
      path: concept.document.path,
      type: concept.document.type,
      title: concept.title,
      description: concept.description,
      domainIds: [...graph.domains.get(id) ?? []].sort(),
      parentIds: [...parents.get(id) ?? []].filter((parent) => included.has(parent)).sort(),
      sources: sourceResources(concept),
      membership,
      expandable: membership === "primary",
    };
  }).sort((left, right) => left.id.localeCompare(right.id));

  const flows = [...new Map(selectedFlowSteps.map((step) => [step.flow, step.flow])).keys()].sort().map((id): VisualizationFlow => ({
    id,
    steps: selectedFlowSteps.filter((step) => step.flow === id).map((step) => ({
      order: step.order,
      source: step.source,
      action: step.action,
      target: step.target,
      mode: step.mode,
      evidence: [...step.evidence].sort(),
    })),
  }));

  const questions: VisualizationQuestion[] = [];
  const omissions: VisualizationOmission[] = validation.warnings.map((warning) => ({
    code: "relationship-warning", subject: options.domain, detail: warning,
  }));
  for (const [, concept] of graph.concepts) {
    if (concept.document.type !== "Question") continue;
    const question = parseQuestionDocument(concept.document);
    if (question.state === "resolved") continue;
    if (!included.has(question.subject)) {
      omissions.push({ code: "question-subject-outside-projection", subject: question.subject,
        detail: `${question.id} targets a concept outside this projection` });
      continue;
    }
    questions.push({ id: question.id, subject: question.subject, state: question.state,
      kind: question.kind, property: question.property });
  }
  questions.sort((left, right) => left.id.localeCompare(right.id));
  omissions.sort((left, right) => `${left.code}\0${left.subject}\0${left.detail}`
    .localeCompare(`${right.code}\0${right.subject}\0${right.detail}`));

  return {
    schemaVersion: 1,
    hub: options.hub,
    commit: graph.commit,
    domain: { id: options.domain, path: domain.document.path, title: domain.title },
    nodes,
    edges,
    flows,
    questions,
    omissions,
  };
}

export function serializePublishedVisualizationProjection(projection: PublishedVisualizationProjection): string {
  return `${JSON.stringify(projection, null, 2)}\n`;
}
