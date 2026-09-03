import path from "node:path";

import type { ConceptDocument, OkfValue } from "./okf-document.ts";
import { FLOW_STEP_ACTIONS, FLOW_STEP_MODES, isCanonicalRelationshipKind } from "./relationship-vocabulary.ts";
import { getOkfConceptSchema } from "../schemas/catalog.ts";

export type OkfRelationshipConcept = Readonly<{ identity: string; concept: ConceptDocument }>;
export type OkfRelationshipTarget = Readonly<{ identity: string; path: string; type: string }>;
export type ValidatedOkfRelationship = Readonly<{
  source: string;
  kind: string;
  target: string;
  evidence: readonly string[];
}>;
export type ValidatedOkfFlowStep = Readonly<{
  flow: string;
  order: number;
  source: string;
  action: string;
  target: string;
  mode: string;
  evidence: readonly string[];
}>;
export type OkfRelationshipValidation = Readonly<{
  relationships: readonly ValidatedOkfRelationship[];
  flowSteps: readonly ValidatedOkfFlowStep[];
  failures: readonly string[];
  warnings: readonly string[];
}>;
export type OkfRelationshipValidationOptions = Readonly<{
  targets?: readonly OkfRelationshipTarget[];
  sourceIdentities?: ReadonlySet<string>;
  strictSourceIdentities?: ReadonlySet<string>;
}>;

const MAX_IDENTITY_BYTES = 256;

function mapping(value: OkfValue): Readonly<Record<string, OkfValue>> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Readonly<Record<string, OkfValue>> : undefined;
}

export function resolveOkfMarkdownLinkPaths(concept: ConceptDocument): ReadonlySet<string> {
  const links = new Set<string>();
  for (const match of concept.body.matchAll(/(?<!!)\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
    const raw = match[1]?.split("#")[0]?.split("?")[0];
    if (!raw || !raw.endsWith(".md") || /^[a-z][a-z0-9+.-]*:/i.test(raw)) continue;
    const resolved = raw.startsWith("/")
      ? path.posix.normalize(raw.slice(1))
      : path.posix.normalize(path.posix.join(path.posix.dirname(concept.path), raw));
    if (resolved !== ".." && !resolved.startsWith("../")) links.add(resolved);
  }
  return links;
}

function sourceIds(concept: ConceptDocument): ReadonlySet<string> {
  if (!Array.isArray(concept.frontmatter.sources)) return new Set();
  return new Set(concept.frontmatter.sources.flatMap((value) => {
    const id = mapping(value)?.id;
    return typeof id === "string" ? [id] : [];
  }));
}

function evidenceIds(
  ownerPath: string,
  value: OkfValue | undefined,
  knownSources: ReadonlySet<string>,
  required: boolean,
  failures: string[],
): readonly string[] {
  if (value === undefined && !required) return [];
  if (!Array.isArray(value) || !value.length || !value.every((item) => typeof item === "string" && item.length > 0)) {
    failures.push(`${ownerPath}: evidence must be a non-empty source ID list`);
    return [];
  }
  const ids = value as string[];
  if (new Set(ids).size !== ids.length) failures.push(`${ownerPath}: evidence source IDs must be unique`);
  for (const id of ids) if (!knownSources.has(id)) failures.push(`${ownerPath}: evidence ${id} does not resolve to sources[].id`);
  return ids;
}

function validateFlowSteps(
  identity: string,
  concept: ConceptDocument,
  targets: ReadonlyMap<string, OkfRelationshipTarget>,
  strict: boolean,
  failures: string[],
): readonly ValidatedOkfFlowStep[] {
  const value = concept.frontmatter.flow_steps;
  if (value === undefined) return [];
  if (!Array.isArray(value) || !value.length) {
    failures.push(`${concept.path}: flow_steps must be a non-empty list`);
    return [];
  }
  const links = resolveOkfMarkdownLinkPaths(concept);
  const sources = sourceIds(concept);
  const steps: ValidatedOkfFlowStep[] = [];
  const orders = new Set<number>();
  for (const raw of value) {
    const step = mapping(raw);
    const order = step?.order;
    const source = step?.source;
    const action = step?.action;
    const target = step?.target;
    const mode = step?.mode;
    if (!step || typeof order !== "number" || !Number.isSafeInteger(order) || order < 1
      || typeof source !== "string" || typeof action !== "string"
      || typeof target !== "string" || typeof mode !== "string") {
      failures.push(`${concept.path}: flow_steps entry requires order (positive integer), source, action, target and mode`);
      continue;
    }
    if (orders.has(order)) failures.push(`${concept.path}: flow_steps order ${order} is duplicated`);
    orders.add(order);
    if (!(FLOW_STEP_ACTIONS as readonly string[]).includes(action)) failures.push(`${concept.path}: flow step action ${action} is not canonical`);
    if (!(FLOW_STEP_MODES as readonly string[]).includes(mode)) failures.push(`${concept.path}: flow step mode ${mode} is invalid`);
    for (const endpoint of [source, target]) {
      const resolved = targets.get(endpoint);
      if (!resolved) failures.push(`${concept.path}: flow step targets missing concept ${endpoint}`);
      else if (!links.has(resolved.path)) failures.push(`${concept.path}: flow step endpoint ${endpoint} has no resolving Markdown link`);
    }
    const evidence = evidenceIds(`${concept.path}: flow step ${order}`, step.evidence, sources, strict, failures);
    steps.push({ flow: identity, order, source, action, target, mode, evidence });
  }
  const expected = [...orders].sort((left, right) => left - right);
  if (expected.some((order, index) => order !== index + 1)) failures.push(`${concept.path}: flow_steps order must be contiguous from 1`);
  return steps.sort((left, right) => left.order - right.order);
}

export function validateOkfRelationships(
  concepts: readonly OkfRelationshipConcept[],
  options: OkfRelationshipValidationOptions = {},
): OkfRelationshipValidation {
  const failures: string[] = [];
  const warnings: string[] = [];
  const relationships: ValidatedOkfRelationship[] = [];
  const flowSteps: ValidatedOkfFlowStep[] = [];
  if (!concepts.length) return { relationships, flowSteps, failures: ["relationship validation requires at least one concept"], warnings };
  const identities = new Map<string, ConceptDocument>();
  const targets = new Map<string, OkfRelationshipTarget>();
  const paths = new Set<string>();
  for (const target of options.targets ?? []) {
    if (!target.identity || Buffer.byteLength(target.identity) > MAX_IDENTITY_BYTES || targets.has(target.identity)) {
      failures.push(`${target.path}: target identity must be unique and 1-${MAX_IDENTITY_BYTES} bytes`);
      continue;
    }
    if (paths.has(target.path)) failures.push(`${target.path}: duplicate concept path`);
    else paths.add(target.path);
    targets.set(target.identity, target);
  }
  for (const { identity, concept } of concepts) {
    if (!identity || Buffer.byteLength(identity) > MAX_IDENTITY_BYTES) {
      failures.push(`${concept.path}: relationship identity must be 1-${MAX_IDENTITY_BYTES} bytes`);
    } else if (identities.has(identity) || targets.has(identity)) failures.push(`${concept.path}: duplicate relationship identity ${identity}`);
    else {
      identities.set(identity, concept);
      targets.set(identity, { identity, path: concept.path, type: concept.type });
    }
    if (paths.has(concept.path)) failures.push(`${concept.path}: duplicate concept path`);
    else paths.add(concept.path);
  }
  for (const { identity, concept } of concepts) {
    if (options.sourceIdentities && !options.sourceIdentities.has(identity)) continue;
    const strict = options.strictSourceIdentities?.has(identity) ?? false;
    const declared = concept.frontmatter.relationships;
    if (declared !== undefined && declared !== null && !Array.isArray(declared)) {
      failures.push(`${concept.path}: relationships must be a list`);
    } else if (Array.isArray(declared)) {
      const links = resolveOkfMarkdownLinkPaths(concept);
      const sources = sourceIds(concept);
      for (const value of declared) {
        const relationship = mapping(value);
        if (!relationship || typeof relationship.kind !== "string" || typeof relationship.target !== "string") {
          failures.push(`${concept.path}: relationship declaration is malformed`);
          continue;
        }
        const target = targets.get(relationship.target);
        if (!target) {
          failures.push(`${concept.path}: relationship ${relationship.kind} targets missing concept ${relationship.target}`);
          continue;
        }
        if (!links.has(target.path)) {
          failures.push(`${concept.path}: relationship ${relationship.kind} -> ${relationship.target} has no resolving Markdown link`);
          continue;
        }
        const schema = getOkfConceptSchema(concept.type);
        const evidence = evidenceIds(`${concept.path}: relationship ${relationship.kind} -> ${relationship.target}`,
          relationship.evidence, sources, strict && Boolean(schema), failures);
        const supported = schema?.relationshipGuidance.some((guidance) =>
          guidance.kind === relationship.kind && guidance.targetTypes.includes(target.type));
        if (strict && schema && !isCanonicalRelationshipKind(relationship.kind)) {
          failures.push(`${concept.path}: relationship ${relationship.kind} is not a canonical AgentBase predicate`);
        } else if (schema && !supported) {
          const message = `${concept.path}: relationship ${relationship.kind} -> ${relationship.target} is unjudged by ${concept.type} schema guidance`;
          if (strict) failures.push(message);
          else warnings.push(message);
        }
        relationships.push({ source: identity, kind: relationship.kind, target: relationship.target, evidence });
      }
    }
    flowSteps.push(...validateFlowSteps(identity, concept, targets, strict, failures));
  }
  return { relationships, flowSteps, failures, warnings };
}
