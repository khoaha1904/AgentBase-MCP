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
  representation: "concept" | "embedded";
  resourceKind?: string;
  externalIdentity?: string;
  title: string;
  description: string;
  domainIds: readonly string[];
  parentIds: readonly string[];
  systemIds: readonly string[];
  repositoryIds: readonly string[];
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
  representation: "accepted" | "embedded";
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
  code: "question-subject-outside-projection" | "relationship-warning" | "embedded-resource-warning";
  subject: string;
  detail: string;
}>;

export type PublishedVisualizationProjection = Readonly<{
  schemaVersion: 3;
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

function sourceResourcesById(concept: HubGraphConcept): ReadonlyMap<string, string> {
  const sources = concept.document.frontmatter.sources;
  if (!Array.isArray(sources)) return new Map();
  return new Map(sources.flatMap((source) => {
    const entry = mapping(source), id = entry?.id, resource = entry?.resource;
    return typeof id === "string" && typeof resource === "string"
      && /^(?:agentbase|provider|repository|https):\/\//.test(resource) ? [[id, resource] as const] : [];
  }));
}

type EmbeddedResourceRow = Readonly<{
  ownerId: string;
  title: string;
  description: string;
  resourceKind: string;
  externalIdentity?: string;
  evidence: readonly string[];
  sources: readonly string[];
}>;

type EmbeddedRelationRow = Readonly<{
  ownerId: string;
  source: string;
  predicate: string;
  target: string;
  evidence: readonly string[];
}>;

const EMBEDDED_RUNTIME_RELATIONSHIPS = new Set([
  "provides", "consumes", "depends-on", "triggered-by", "publishes-to",
  "reads-from", "writes-to", "monitors", "redrives-to",
]);

function tableCells(line: string): readonly string[] {
  if (!line.trimStart().startsWith("|")) return [];
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split(/(?<!\\)\|/)
    .map((cell) => cell.trim().replaceAll("\\|", "|"));
}

function cellText(value: string): string {
  return value.replaceAll(/<br\s*\/?\s*>/gi, " ").replace(/^`|`$/g, "").trim();
}

function strongExternalIdentity(value: string | undefined): string | undefined {
  const identity = value ? cellText(value) : "";
  return /^arn:[A-Za-z0-9][A-Za-z0-9:/_.+=,@-]{3,511}$/.test(identity) ? identity : undefined;
}

function embeddedResourceRows(concept: HubGraphConcept): Readonly<{
  rows: readonly EmbeddedResourceRow[];
  warnings: readonly string[];
}> {
  const lines = concept.document.body.split(/\r?\n/);
  const heading = lines.findIndex((line) => line.trim() === "# Embedded Knowledge");
  if (heading < 0) return { rows: [], warnings: [] };
  const end = lines.findIndex((line, index) => index > heading && /^#\s+/.test(line.trim()));
  const section = lines.slice(heading + 1, end < 0 ? undefined : end);
  const headerIndex = section.findIndex((line) => {
    const headers = tableCells(line).map((cell) => cell.toLowerCase());
    return ["name", "role", "kind", "technology", "evidence"].every((name) => headers.includes(name));
  });
  if (headerIndex < 0) return { rows: [], warnings: [] };
  const headers = tableCells(section[headerIndex]!).map((cell) => cell.toLowerCase());
  const sourceById = sourceResourcesById(concept), rows: EmbeddedResourceRow[] = [], warnings: string[] = [];
  for (const line of section.slice(headerIndex + 2)) {
    const cells = tableCells(line);
    if (!cells.length) break;
    const value = (name: string): string => cells[headers.indexOf(name)] ?? "";
    const title = cellText(value("name")), description = cellText(value("role"));
    const resourceKind = cellText(value("kind")).toLowerCase();
    if (!title || !description || !/^[a-z0-9][a-z0-9-]{1,63}$/.test(resourceKind)
      || ["resource", "unknown", "not-identified"].includes(resourceKind)) continue;
    const evidence = [...value("evidence").matchAll(/`([^`]+)`/g)].map((match) => match[1]!.trim())
      .filter(Boolean);
    const sources = [...new Set(evidence.flatMap((id) => sourceById.get(id) ?? []))].sort();
    if (!sources.length) {
      warnings.push(`${title} has no resolved Published evidence`);
      continue;
    }
    const externalIdentity = strongExternalIdentity(value("identity"));
    rows.push({ ownerId: concept.document.conceptId, title, description, resourceKind,
      ...(externalIdentity ? { externalIdentity } : {}),
      evidence: [...new Set(evidence)].sort(), sources });
  }
  return { rows, warnings };
}

function embeddedRelationRows(concept: HubGraphConcept): Readonly<{
  rows: readonly EmbeddedRelationRow[];
  warnings: readonly string[];
}> {
  const lines = concept.document.body.split(/\r?\n/);
  const heading = lines.findIndex((line) => line.trim() === "# Embedded Relations");
  if (heading < 0) return { rows: [], warnings: [] };
  const end = lines.findIndex((line, index) => index > heading && /^#\s+/.test(line.trim()));
  const section = lines.slice(heading + 1, end < 0 ? undefined : end);
  const headerIndex = section.findIndex((line) => {
    const headers = tableCells(line).map((cell) => cell.toLowerCase());
    return ["source", "relation", "target", "evidence"].every((name) => headers.includes(name));
  });
  if (headerIndex < 0) return { rows: [], warnings: ["Embedded Relations has no supported table"] };
  const headers = tableCells(section[headerIndex]!).map((cell) => cell.toLowerCase());
  const sourceById = sourceResourcesById(concept), rows: EmbeddedRelationRow[] = [], warnings: string[] = [];
  for (const line of section.slice(headerIndex + 2)) {
    const cells = tableCells(line);
    if (!cells.length) break;
    const value = (name: string): string => cells[headers.indexOf(name)] ?? "";
    const source = cellText(value("source")), predicate = cellText(value("relation")).toLowerCase();
    const target = cellText(value("target"));
    const evidence = [...value("evidence").matchAll(/`([^`]+)`/g)].map((match) => match[1]!.trim())
      .filter(Boolean);
    if (!source || !target || !EMBEDDED_RUNTIME_RELATIONSHIPS.has(predicate)) {
      warnings.push(`${source || "unknown source"} ${predicate || "unknown relation"} ${target || "unknown target"} is unsupported`);
      continue;
    }
    if (!evidence.length || evidence.some((id) => !sourceById.has(id))) {
      warnings.push(`${source} ${predicate} ${target} has unresolved Published evidence`);
      continue;
    }
    rows.push({ ownerId: concept.document.conceptId, source, predicate, target,
      evidence: [...new Set(evidence)].sort() });
  }
  return { rows, warnings };
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

  const primary = new Set([...concepts.keys()].filter((id) => {
    const role = graph.domainScopes.get(options.domain)?.get(id);
    return role === "member" || role === "repository-associated";
  }));
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
      representation: "accepted" as const,
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
  const groupIds = (identity: string, type: "System" | "Repository", trail = new Set<string>()): readonly string[] => {
    if (trail.has(identity)) return [];
    const nextTrail = new Set(trail).add(identity), found = new Set<string>();
    const self = concepts.get(identity);
    if (self?.document.type === type) found.add(identity);
    for (const parent of parents.get(identity) ?? []) {
      if (!included.has(parent)) continue;
      for (const value of groupIds(parent, type, nextTrail)) found.add(value);
    }
    return [...found].sort();
  };
  const conceptNodes = [...included].map((id): VisualizationNode => {
    const concept = concepts.get(id)!;
    const membership = primary.has(id) ? "primary" as const : "boundary" as const;
    return {
      id,
      path: concept.document.path,
      type: concept.document.type,
      representation: "concept",
      title: concept.title,
      description: concept.description,
      domainIds: [...graph.domains.get(id) ?? []].sort(),
      parentIds: [...parents.get(id) ?? []].filter((parent) => included.has(parent)).sort(),
      systemIds: groupIds(id, "System"),
      repositoryIds: groupIds(id, "Repository"),
      sources: sourceResources(concept),
      membership,
      expandable: membership === "primary",
    };
  }).sort((left, right) => left.id.localeCompare(right.id));

  const embeddedWarnings: VisualizationOmission[] = [];
  const embeddedRows = [...primary].sort().flatMap((ownerId) => {
    const concept = concepts.get(ownerId);
    if (!concept) return [];
    const parsed = embeddedResourceRows(concept);
    embeddedWarnings.push(...parsed.warnings.map((detail) => ({
      code: "embedded-resource-warning" as const, subject: ownerId, detail,
    })));
    return parsed.rows;
  }).sort((left, right) => `${left.externalIdentity ?? ""}\0${left.ownerId}\0${left.title}`
    .localeCompare(`${right.externalIdentity ?? ""}\0${right.ownerId}\0${right.title}`));
  const rowsByKey = new Map<string, EmbeddedResourceRow[]>();
  for (const row of embeddedRows) {
    const key = row.externalIdentity ? `identity\0${row.externalIdentity}`
      : `parent\0${row.ownerId}\0${row.resourceKind}\0${row.title.toLowerCase()}`;
    const values = rowsByKey.get(key) ?? [];
    values.push(row); rowsByKey.set(key, values);
  }
  const conceptNodeById = new Map(conceptNodes.map((node) => [node.id, node]));
  const embeddedNodes: VisualizationNode[] = [];
  const embeddedEdges: VisualizationEdge[] = [];
  const embeddedIdsByOwnerAndTitle = new Map<string, string[]>();
  for (const [key, rows] of [...rowsByKey].sort(([left], [right]) => left.localeCompare(right))) {
    const id = `embedded:${createHash("sha256").update(key).digest("hex").slice(0, 24)}`;
    const owners = [...new Set(rows.map((row) => row.ownerId))].sort();
    const ownerNodes = owners.flatMap((owner) => conceptNodeById.get(owner) ?? []);
    const first = rows[0]!;
    embeddedNodes.push({
      id,
      path: ownerNodes[0]?.path ?? concepts.get(first.ownerId)!.document.path,
      type: "Resource",
      representation: "embedded",
      resourceKind: first.resourceKind,
      ...(first.externalIdentity ? { externalIdentity: first.externalIdentity } : {}),
      title: first.title,
      description: [...new Set(rows.map((row) => row.description))].sort().join(" / "),
      domainIds: [...new Set(ownerNodes.flatMap((node) => node.domainIds))].sort(),
      parentIds: owners,
      systemIds: [...new Set(ownerNodes.flatMap((node) => node.systemIds))].sort(),
      repositoryIds: [...new Set(ownerNodes.flatMap((node) => node.repositoryIds))].sort(),
      sources: [...new Set(rows.flatMap((row) => row.sources))].sort(),
      membership: "primary",
      expandable: false,
    });
    for (const row of rows) {
      const lookup = `${row.ownerId}\0${row.title.toLowerCase()}`;
      const ids = embeddedIdsByOwnerAndTitle.get(lookup) ?? [];
      if (!ids.includes(id)) ids.push(id);
      embeddedIdsByOwnerAndTitle.set(lookup, ids);
    }
    for (const owner of owners) {
      const evidence = [...new Set(rows.filter((row) => row.ownerId === owner).flatMap((row) => row.evidence))].sort();
      embeddedEdges.push({
        id: edgeId(id, "embedded-in", owner),
        predicate: "embedded-in",
        declaredSource: id,
        declaredTarget: owner,
        displaySource: id,
        displayTarget: owner,
        directed: false,
        displayClass: "structural",
        representation: "embedded",
        evidence,
      });
    }
  }
  const embeddedRelationEdges: VisualizationEdge[] = [];
  const resolveEndpoint = (ownerId: string, value: string): string | undefined => {
    if (value.toLowerCase() === "self") return ownerId;
    if (included.has(value)) return value;
    const matches = embeddedIdsByOwnerAndTitle.get(`${ownerId}\0${value.toLowerCase()}`) ?? [];
    return matches.length === 1 ? matches[0] : undefined;
  };
  for (const ownerId of [...primary].sort()) {
    const concept = concepts.get(ownerId);
    if (!concept) continue;
    const parsed = embeddedRelationRows(concept);
    embeddedWarnings.push(...parsed.warnings.map((detail) => ({
      code: "embedded-resource-warning" as const, subject: ownerId, detail,
    })));
    for (const relation of parsed.rows) {
      const source = resolveEndpoint(ownerId, relation.source), target = resolveEndpoint(ownerId, relation.target);
      if (!source || !target) {
        embeddedWarnings.push({ code: "embedded-resource-warning", subject: ownerId,
          detail: `${relation.source} ${relation.predicate} ${relation.target} has an unresolved or ambiguous endpoint` });
        continue;
      }
      const display = isCanonicalRelationshipKind(relation.predicate)
        ? displayEndpoints(relation.predicate, source, target)
        : { source, target, directed: true };
      embeddedRelationEdges.push({
        id: edgeId(source, relation.predicate, target),
        predicate: relation.predicate,
        declaredSource: source,
        declaredTarget: target,
        displaySource: display.source,
        displayTarget: display.target,
        directed: display.directed,
        displayClass: "runtime",
        representation: "embedded",
        evidence: relation.evidence,
      });
    }
  }
  const nodes = [...conceptNodes, ...embeddedNodes].sort((left, right) => left.id.localeCompare(right.id));
  const allEdges = [...new Map([...embeddedEdges, ...embeddedRelationEdges, ...edges]
    .map((edge) => [edge.id, edge])).values()].sort((left, right) => left.id.localeCompare(right.id));
  if (nodes.length > maximumNodes) throw new Error(`Published visualization node limit exceeded: ${nodes.length} > ${maximumNodes}`);
  if (allEdges.length > maximumEdges) {
    throw new Error(`Published visualization edge limit exceeded: ${allEdges.length} > ${maximumEdges}`);
  }

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
  const omissions: VisualizationOmission[] = [...embeddedWarnings, ...validation.warnings.map((warning) => ({
    code: "relationship-warning", subject: options.domain, detail: warning,
  } as const))];
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
    schemaVersion: 3,
    hub: options.hub,
    commit: graph.commit,
    domain: { id: options.domain, path: domain.document.path, title: domain.title },
    nodes,
    edges: allEdges,
    flows,
    questions,
    omissions,
  };
}

export function serializePublishedVisualizationProjection(projection: PublishedVisualizationProjection): string {
  return `${JSON.stringify(projection, null, 2)}\n`;
}
