import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import type { AdmittedLocalHubState } from "../../../core/hub/index.ts";
import {
  createQuestionId, loadOkfBundle, mergeOpenQuestion, parseQuestionDocument,
  parseRepositorySourceResource, readObservedValues, readRepositoryIdentityRecord,
  renderQuestionDocument, renderQuestionIndex,
  type InventoryReceipt,
  type ObservedValue, type ObservedValueRole, type OkfValue,
  type OwnedItemQuestionReference, type QuestionState, type SharedQuestion,
} from "../../../core/knowledge/index.ts";

export type ObservationReference = Readonly<{ role: ObservedValueRole; sourceId: string }>;
export type QuestionDeclaration = Readonly<{
  subject: string; property: string; observationRefs: readonly ObservationReference[];
  missingEvidence: readonly string[];
}>;
export type ResolvedQuestionDeclaration = QuestionDeclaration & Readonly<{ observationIds: readonly string[] }>;
export type GovernedQuestion = SharedQuestion & Readonly<{
  status: QuestionState; sourceRepositoryId?: string; observationIds: readonly string[];
  observations: readonly ObservedValue[];
}>;

const SUBJECT_ROOT = "(?:domains|systems|components|functions|interfaces|flows|resources|infrastructure|deployments|repositories|relationships|capabilities)";
const SUBJECT = new RegExp(`^${SUBJECT_ROOT}/[a-z0-9][a-z0-9./-]*$`);
const PROPERTY = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const SOURCE_ID = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const QUESTION_ID = /^question-[a-f0-9]{24}$/;
const ROLES = new Set<ObservedValueRole>(["documentation", "implementation", "configuration", "provider"]);

function mapping(value: OkfValue | undefined): Readonly<Record<string, OkfValue>> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Readonly<Record<string, OkfValue>> : undefined;
}
function strings(values: readonly string[]): readonly string[] { return [...new Set(values)].sort(); }
function referenceKey(value: ObservationReference): string { return `${value.role}\0${value.sourceId}`; }

export function normalizeQuestionDeclarations(values: readonly QuestionDeclaration[]): readonly QuestionDeclaration[] {
  if (values.length > 64) throw new Error("a proposal may declare at most 64 questions");
  return values.map((value, index) => {
    if (!SUBJECT.test(value.subject) || value.subject.includes("..")) throw new Error(`question ${index + 1} subject is invalid`);
    if (!PROPERTY.test(value.property) || value.property.length > 128) throw new Error(`question ${index + 1} property is invalid`);
    const observationRefs = [...new Map(value.observationRefs.map((item) => [referenceKey(item), item])).values()]
      .sort((left, right) => referenceKey(left).localeCompare(referenceKey(right)));
    if (!observationRefs.length || observationRefs.length > 64 || observationRefs.some((item) =>
      !ROLES.has(item.role) || !SOURCE_ID.test(item.sourceId))) {
      throw new Error(`question ${index + 1} observation_refs are invalid`);
    }
    const missingEvidence = strings(value.missingEvidence.map((item) => item.trim()));
    if (missingEvidence.length > 64 || missingEvidence.some((item) => !item || item.length > 512)) {
      throw new Error(`question ${index + 1} missing_evidence is invalid`);
    }
    return { subject: value.subject, property: value.property, observationRefs, missingEvidence };
  }).sort((left, right) => `${left.subject}\0${left.property}`.localeCompare(`${right.subject}\0${right.property}`));
}

export function validateQuestionDeclarations(
  values: readonly QuestionDeclaration[], observations: readonly ObservedValue[], sourceRepositoryId: string,
): readonly ResolvedQuestionDeclaration[] {
  return normalizeQuestionDeclarations(values).map((declaration, index) => {
    const observationIds = declaration.observationRefs.map((reference) => {
      const matches = observations.filter((value) => value.subject === declaration.subject
        && value.property === declaration.property && value.role === reference.role && value.sourceId === reference.sourceId);
      if (matches.length !== 1) throw new Error(`question ${index + 1} observation reference is unknown or ambiguous`);
      const observed = matches[0]!;
      if (!observed.source.resource.startsWith(`repository://${sourceRepositoryId}/`)) {
        throw new Error(`question ${index + 1} observation ${observed.id} is outside the proposal source`);
      }
      return observed.id;
    });
    if (observationIds.length < 2 && !declaration.missingEvidence.length) {
      throw new Error(`question ${index + 1} requires conflicting observations or missing evidence`);
    }
    return { ...declaration, observationIds: strings(observationIds) };
  });
}

function questionDocuments(root: string): readonly SharedQuestion[] {
  return [...loadOkfBundle(root).concepts.values()].filter((concept) => concept.type === "Question")
    .map(parseQuestionDocument).sort((left, right) => left.id.localeCompare(right.id));
}
function observedRevision(value: ObservedValue): string | undefined {
  return value.observed.evidenceDigest ?? value.observed.dirtyDigest ?? value.observed.commit ?? undefined;
}
function incomingQuestion(declaration: ResolvedQuestionDeclaration, observations: readonly ObservedValue[], createdAt: string): SharedQuestion {
  const linked = declaration.observationIds.map((id) => observations.find((value) => value.id === id)
    ?? (() => { throw new Error(`Question observation is unavailable: ${id}`); })());
  const kind = linked.length > 1 ? "conflict" as const : "missing-evidence" as const;
  const scopeKey = `observed-value-${createHash("sha256").update(JSON.stringify([declaration.subject, declaration.property]))
    .digest("hex").slice(0, 24)}`;
  const references: readonly OwnedItemQuestionReference[] = linked.map((value) => {
    const revision = observedRevision(value);
    return { referenceKind: "owned-item", owner: value.subject, itemKind: "observed-value", itemKey: value.id,
      sourceId: value.sourceId, ...(revision ? { observedRevision: revision } : {}) };
  });
  const identity = { kind, originSubject: declaration.subject, originProperty: declaration.property, scopeKey };
  return { id: createQuestionId(identity), revision: 1, state: "open", ...identity,
    subject: declaration.subject, property: declaration.property, references,
    missingEvidence: declaration.missingEvidence, limitations: [], guidance: [],
    title: `Question: ${declaration.subject} ${declaration.property}`, createdAt };
}
function writePrivateFile(root: string, relative: string, content: string): void {
  const target = path.join(root, ...relative.split("/"));
  fs.mkdirSync(path.dirname(target), { recursive: true, mode: 0o700 });
  fs.writeFileSync(target, content, { mode: 0o600 });
}

export function assertQuestionAuthoringUntouched(baseRoot: string, authoredRoot: string): void {
  const base = loadOkfBundle(baseRoot), authored = loadOkfBundle(authoredRoot);
  const paths = new Set([...base.files, ...authored.files].filter((file) => file.startsWith("questions/")));
  for (const relative of paths) {
    const before = path.join(baseRoot, ...relative.split("/")), after = path.join(authoredRoot, ...relative.split("/"));
    if (!fs.existsSync(before) || !fs.existsSync(after) || !fs.readFileSync(before).equals(fs.readFileSync(after))) {
      throw new Error("Question documents are MCP-owned; generic Ingest/Refresh cannot edit questions/ bytes");
    }
  }
}

export function materializeQuestionDeclarations(
  baseRoot: string, targetRoot: string, declarations: readonly ResolvedQuestionDeclaration[],
  observations: readonly ObservedValue[], createdAt: string,
): readonly SharedQuestion[] {
  const current = new Map(questionDocuments(targetRoot).map((question) => [question.id, question]));
  const affected: SharedQuestion[] = [];
  for (const declaration of declarations) {
    const incoming = incomingQuestion(declaration, observations, createdAt), existing = current.get(incoming.id);
    const next = existing ? mergeOpenQuestion(existing, incoming) : incoming;
    current.set(next.id, next); affected.push(next);
    writePrivateFile(targetRoot, `questions/${next.id}.md`, renderQuestionDocument(next));
  }
  if (declarations.length) writePrivateFile(targetRoot, "questions/index.md", renderQuestionIndex([...current.values()]));
  validateSharedQuestionBundle(targetRoot);
  return affected;
}

function receiptQuestion(
  plan: InventoryReceipt["inventory"]["questionPlans"][number],
  subject: string,
  createdAt: string,
): SharedQuestion {
  const identity = { kind: plan.kind, originSubject: subject, originProperty: plan.property, scopeKey: plan.scopeKey };
  return {
    id: createQuestionId(identity), revision: 1, state: "open", ...identity,
    subject, property: plan.property,
    references: plan.candidateEvidence.map((reference) => ({
      referenceKind: "candidate-evidence" as const,
      candidateKey: reference.candidateKey,
      sourceResource: reference.sourceResource,
      observedRevision: reference.observedRevision,
    })),
    missingEvidence: plan.missingEvidence,
    limitations: plan.limitations,
    guidance: [],
    title: `Question: ${subject} ${plan.property}`,
    createdAt,
  };
}

export function materializeReceiptQuestionPlans(
  targetRoot: string,
  receipt: InventoryReceipt,
  skeletons: readonly Readonly<{ candidateId?: string; identity: string }>[],
  createdAt: string,
): readonly SharedQuestion[] {
  const skeletonByCandidate = new Map(skeletons.flatMap((skeleton) => skeleton.candidateId
    ? [[skeleton.candidateId, skeleton] as const] : []));
  const candidates = new Map(receipt.guidanceRequest.candidates.map((candidate) => [candidate.id, candidate]));
  const current = new Map(questionDocuments(targetRoot).map((question) => [question.id, question]));
  const affected: SharedQuestion[] = [];
  for (const plan of receipt.inventory.questionPlans) {
    const candidate = candidates.get(plan.targetCandidateId);
    const ownerCandidateId = candidate?.disposition === "embedded" ? candidate.parentCandidateId : candidate?.id;
    const owner = ownerCandidateId ? skeletonByCandidate.get(ownerCandidateId) : undefined;
    if (!owner) throw new Error(`QuestionPlan ${plan.id} target did not materialize`);
    for (const reference of plan.candidateEvidence) {
      if (reference.observedRevision !== receipt.source.commit
        || !reference.sourceResource.startsWith(`repository://${receipt.source.repositoryId}/`)) {
        throw new Error(`QuestionPlan ${plan.id} evidence is outside the Receipt source`);
      }
    }
    const incoming = receiptQuestion(plan, owner.identity, createdAt);
    const existing = current.get(incoming.id);
    const next = existing ? mergeOpenQuestion(existing, incoming) : incoming;
    current.set(next.id, next);
    affected.push(next);
    writePrivateFile(targetRoot, `questions/${next.id}.md`, renderQuestionDocument(next));
  }
  if (affected.length) writePrivateFile(targetRoot, "questions/index.md", renderQuestionIndex([...current.values()]));
  validateSharedQuestionBundle(targetRoot);
  return affected;
}

export function validateSharedQuestionBundle(root: string): void {
  const bundle = loadOkfBundle(root), questions = questionDocuments(root), failures: string[] = [];
  const repositoryIds = new Set([...bundle.concepts.values()].flatMap((concept) => {
    const repository = readRepositoryIdentityRecord(concept);
    return repository ? [repository.id] : [];
  }));
  for (const question of questions) for (const reference of question.references) {
    if (reference.referenceKind === "candidate-evidence") {
      const parsed = parseRepositorySourceResource(reference.sourceResource);
      if (!parsed || !repositoryIds.has(parsed.repositoryId)
        || reference.observedRevision !== undefined && !/^[a-f0-9]{40}$/.test(reference.observedRevision)) {
        failures.push(`${question.id}: candidate evidence does not resolve to a Hub Repository source`);
      }
      continue;
    }
    const owner = bundle.concepts.get(reference.owner);
    if (!owner) { failures.push(`${question.id}: reference owner is missing: ${reference.owner}`); continue; }
    const sources = new Set((Array.isArray(owner.frontmatter.sources) ? owner.frontmatter.sources : [])
      .flatMap((value) => typeof mapping(value)?.id === "string" ? [mapping(value)!.id as string] : []));
    if (!sources.has(reference.sourceId)) failures.push(`${question.id}: reference source_id is unresolved: ${reference.sourceId}`);
    if (reference.itemKind === "observed-value" && !readObservedValues(owner).some((value) => value.id === reference.itemKey)) {
      failures.push(`${question.id}: observed-value item is unresolved: ${reference.itemKey}`);
    }
  }
  const indexPath = path.join(root, "questions", "index.md");
  if (questions.length && (!fs.existsSync(indexPath) || fs.readFileSync(indexPath, "utf8") !== renderQuestionIndex(questions))) {
    failures.push("questions/index.md is missing or stale");
  }
  if (failures.length) throw new Error(`shared Question validation failed: ${failures.join("; ")}`);
}

export function assertNoOrphanQuestionGuidance(root: string): void {
  const bundle = loadOkfBundle(root), questionIds = new Set(questionDocuments(root).map((question) => question.id));
  const orphans = [...bundle.concepts.values()].filter((concept) => concept.type === "Maintainer Guidance").flatMap((concept) => {
    const question = mapping(mapping(concept.frontmatter.agentbase)?.question), id = question?.id;
    return typeof id === "string" && !questionIds.has(id) ? [`${concept.path} -> ${id}`] : [];
  });
  if (orphans.length) throw new Error(`accepted Maintainer Guidance has no shared Question document (${orphans.join(", ")}); regenerate the unpublished Guidance or migrate its Question before continuing`);
}
function questionView(root: string, question: SharedQuestion): GovernedQuestion {
  const bundle = loadOkfBundle(root), observations = question.references.flatMap((reference) => {
    if (reference.referenceKind !== "owned-item" || reference.itemKind !== "observed-value") return [];
    const owner = bundle.concepts.get(reference.owner);
    return owner ? readObservedValues(owner).filter((value) => value.id === reference.itemKey) : [];
  });
  const repositoryIds = new Set([
    ...observations.flatMap((observation) => observation.source.repositoryId ? [observation.source.repositoryId] : []),
    ...question.references.flatMap((reference) => {
      if (reference.referenceKind !== "candidate-evidence") return [];
      const parsed = parseRepositorySourceResource(reference.sourceResource);
      return parsed ? [parsed.repositoryId] : [];
    }),
  ]);
  const repositoryId = repositoryIds.size === 1 ? [...repositoryIds][0] : undefined;
  return { ...question, status: question.state, ...(repositoryId ? { sourceRepositoryId: repositoryId } : {}),
    observationIds: observations.map((value) => value.id), observations };
}
export function listHubQuestions(hub: AdmittedLocalHubState, options: Readonly<{ status?: QuestionState; limit?: number }> = {}): readonly GovernedQuestion[] {
  const limit = options.limit ?? 100;
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) throw new Error("question limit must be from 1 to 100");
  assertNoOrphanQuestionGuidance(hub.root);
  return questionDocuments(hub.root).filter((question) => !options.status || question.state === options.status)
    .map((question) => questionView(hub.root, question)).slice(0, limit);
}
export function readHubQuestion(hub: AdmittedLocalHubState, id: string): GovernedQuestion {
  if (!QUESTION_ID.test(id)) throw new Error("question ID is invalid");
  assertNoOrphanQuestionGuidance(hub.root);
  const question = questionDocuments(hub.root).find((item) => item.id === id);
  if (!question) throw new Error("question was not found");
  return questionView(hub.root, question);
}
