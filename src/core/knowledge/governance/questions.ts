import { createHash } from "node:crypto";
import { isDeepStrictEqual } from "node:util";

import {
  renderConceptDocument,
  type ConceptDocument,
  type OkfFrontmatter,
  type OkfValue,
} from "../documents/okf-document.ts";

export type QuestionState = "open" | "resolved" | "needs-review";
export type QuestionKind = "conflict" | "missing-evidence" | "relation-candidate"
  | "identity-candidate" | "maintainer-decision";
export type OwnedItemQuestionReference = Readonly<{
  referenceKind: "owned-item";
  owner: string;
  itemKind: string;
  itemKey: string;
  sourceId: string;
  observedRevision?: string;
}>;
export type CandidateEvidenceQuestionReference = Readonly<{
  referenceKind: "candidate-evidence";
  candidateKey: string;
  sourceResource: string;
  observedRevision?: string;
}>;
export type QuestionReference = OwnedItemQuestionReference | CandidateEvidenceQuestionReference;
export type SharedQuestion = Readonly<{
  id: string;
  revision: number;
  state: QuestionState;
  kind: QuestionKind;
  originSubject: string;
  originProperty: string;
  subject: string;
  property: string;
  scopeKey: string;
  references: readonly QuestionReference[];
  missingEvidence: readonly string[];
  limitations: readonly string[];
  guidance: readonly string[];
  title: string;
  createdAt: string;
}>;

const QUESTION_ID = /^question-[a-f0-9]{24}$/;
const SUBJECT = /^(?:domains|systems|components|functions|interfaces|flows|resources|infrastructure|deployments|repositories|relationships|capabilities|guidance)\/[a-z0-9][a-z0-9./-]*$/;
const TOKEN = /^[A-Za-z0-9][A-Za-z0-9._:/-]*$/;
const STATES = new Set<QuestionState>(["open", "resolved", "needs-review"]);
const KINDS = new Set<QuestionKind>(["conflict", "missing-evidence", "relation-candidate", "identity-candidate", "maintainer-decision"]);
const QUESTION_KEYS = ["guidance", "id", "kind", "limitations", "missing_evidence", "origin_property",
  "origin_subject", "property", "references", "revision", "scope_key", "state", "subject"];

function mapping(value: OkfValue | undefined): Readonly<Record<string, OkfValue>> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Readonly<Record<string, OkfValue>> : undefined;
}

function exactKeys(value: Readonly<Record<string, OkfValue>>, expected: readonly string[]): boolean {
  const actual = Object.keys(value).sort(), sorted = [...expected].sort();
  return actual.length === sorted.length && actual.every((key, index) => key === sorted[index]);
}

function bounded(value: unknown, maximum = 256): value is string {
  return typeof value === "string" && Boolean(value.trim()) && !value.includes("\n") && !value.includes("\r")
    && Buffer.byteLength(value) <= maximum;
}

function uniqueSorted(values: readonly string[]): readonly string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

function referenceKey(reference: QuestionReference): string {
  return reference.referenceKind === "owned-item"
    ? [reference.referenceKind, reference.owner, reference.itemKind, reference.itemKey,
      reference.sourceId].join("\0")
    : [reference.referenceKind, reference.candidateKey, reference.sourceResource].join("\0");
}

function parseReference(value: OkfValue, prefix: string): QuestionReference {
  const entry = mapping(value);
  if (!entry || entry.reference_kind !== "owned-item" && entry.reference_kind !== "candidate-evidence") {
    throw new Error(`${prefix} reference kind is invalid`);
  }
  if (entry.reference_kind === "owned-item") {
    const expected = ["reference_kind", "owner", "item_kind", "item_key", "source_id",
      ...(entry.observed_revision === undefined ? [] : ["observed_revision"])];
    if (!exactKeys(entry, expected) || !bounded(entry.owner) || !SUBJECT.test(entry.owner)
      || !bounded(entry.item_kind) || !TOKEN.test(entry.item_kind)
      || !bounded(entry.item_key) || !TOKEN.test(entry.item_key)
      || !bounded(entry.source_id) || !TOKEN.test(entry.source_id)
      || entry.observed_revision !== undefined && !bounded(entry.observed_revision)) {
      throw new Error(`${prefix} owned-item reference is invalid`);
    }
    return { referenceKind: "owned-item", owner: entry.owner, itemKind: entry.item_kind,
      itemKey: entry.item_key, sourceId: entry.source_id,
      ...(typeof entry.observed_revision === "string" ? { observedRevision: entry.observed_revision } : {}) };
  }
  const expected = ["reference_kind", "candidate_key", "source_resource",
    ...(entry.observed_revision === undefined ? [] : ["observed_revision"])];
  if (!exactKeys(entry, expected) || !bounded(entry.candidate_key) || !TOKEN.test(entry.candidate_key)
    || !bounded(entry.source_resource, 512)
    || entry.observed_revision !== undefined && !bounded(entry.observed_revision)) {
    throw new Error(`${prefix} candidate-evidence reference is invalid`);
  }
  return { referenceKind: "candidate-evidence", candidateKey: entry.candidate_key,
    sourceResource: entry.source_resource,
    ...(typeof entry.observed_revision === "string" ? { observedRevision: entry.observed_revision } : {}) };
}

function stringList(value: OkfValue | undefined, prefix: string, maximum: number): readonly string[] {
  if (!Array.isArray(value) || value.length > maximum || value.some((item) => !bounded(item, 512))) {
    throw new Error(`${prefix} is invalid`);
  }
  const strings = value as string[];
  if (new Set(strings).size !== strings.length) throw new Error(`${prefix} contains duplicates`);
  return [...strings];
}

export function createQuestionId(input: Readonly<{
  kind: QuestionKind; originSubject: string; originProperty: string; scopeKey: string;
}>): string {
  const tuple = [1, input.kind, input.originSubject, input.originProperty, input.scopeKey];
  return `question-${createHash("sha256").update(JSON.stringify(tuple)).digest("hex").slice(0, 24)}`;
}

export function renderQuestionBody(question: Pick<SharedQuestion, "kind" | "subject" | "property">): string {
  const reason = question.kind === "conflict" ? "Evidence currently disagrees."
    : question.kind === "missing-evidence" ? "Useful knowledge is missing supporting evidence."
      : "A maintainer decision is still required.";
  return `# Question\n\n${reason}\n\n# Scope\n\n\`${question.subject}\` · \`${question.property}\`.\n`;
}

function referenceValue(reference: QuestionReference): OkfValue {
  return reference.referenceKind === "owned-item" ? {
    reference_kind: reference.referenceKind, owner: reference.owner, item_kind: reference.itemKind,
    item_key: reference.itemKey, source_id: reference.sourceId,
    ...(reference.observedRevision ? { observed_revision: reference.observedRevision } : {}),
  } : {
    reference_kind: reference.referenceKind, candidate_key: reference.candidateKey,
    source_resource: reference.sourceResource,
    ...(reference.observedRevision ? { observed_revision: reference.observedRevision } : {}),
  };
}

export function renderQuestionDocument(question: SharedQuestion): string {
  const frontmatter: OkfFrontmatter = {
    type: "Question", title: question.title,
    description: `Governed ${question.kind} question for ${question.subject} ${question.property}`,
    status: "draft", generated: { by: "agentbase/0.0.0", at: question.createdAt },
    agentbase: { question: {
      id: question.id, revision: question.revision, state: question.state, kind: question.kind,
      origin_subject: question.originSubject, origin_property: question.originProperty,
      subject: question.subject, property: question.property, scope_key: question.scopeKey,
      references: question.references.map(referenceValue), missing_evidence: [...question.missingEvidence],
      limitations: [...question.limitations], guidance: [...question.guidance],
    } },
  };
  return renderConceptDocument({ conceptId: `questions/${question.id}`, path: `questions/${question.id}.md`,
    type: "Question", status: "draft", frontmatter, verified: [], body: renderQuestionBody(question) });
}

export function parseQuestionDocument(concept: ConceptDocument): SharedQuestion {
  if (concept.type !== "Question" || !concept.path.startsWith("questions/") || concept.status !== "draft") {
    throw new Error(`${concept.path}: shared Question document identity is invalid`);
  }
  const generated = mapping(concept.frontmatter.generated), agentbase = mapping(concept.frontmatter.agentbase);
  const question = mapping(agentbase?.question);
  if (!question || !exactKeys(question, QUESTION_KEYS)) throw new Error(`${concept.path}: agentbase.question contains unknown or missing fields`);
  const id = question.id, revision = question.revision, state = question.state, kind = question.kind;
  const originSubject = question.origin_subject, originProperty = question.origin_property;
  const subject = question.subject, property = question.property, scopeKey = question.scope_key;
  const title = concept.frontmatter.title;
  if (!bounded(id) || !QUESTION_ID.test(id) || concept.conceptId !== `questions/${id}`
    || !Number.isSafeInteger(revision) || Number(revision) < 1
    || typeof state !== "string" || !STATES.has(state as QuestionState)
    || typeof kind !== "string" || !KINDS.has(kind as QuestionKind)
    || !bounded(originSubject) || !SUBJECT.test(originSubject)
    || !bounded(subject) || !SUBJECT.test(subject)
    || !bounded(originProperty, 128) || !TOKEN.test(originProperty)
    || !bounded(property, 128) || !TOKEN.test(property)
    || !bounded(scopeKey) || !bounded(title, 512)
    || typeof generated?.at !== "string" || Number.isNaN(Date.parse(generated.at))) {
    throw new Error(`${concept.path}: shared Question fields are invalid`);
  }
  if (createQuestionId({ kind: kind as QuestionKind, originSubject, originProperty, scopeKey }) !== id) {
    throw new Error(`${concept.path}: shared Question stable ID does not match immutable origin`);
  }
  if (!Array.isArray(question.references) || !question.references.length || question.references.length > 64) {
    throw new Error(`${concept.path}: Question references are invalid`);
  }
  const references = question.references.map((entry, index) => parseReference(entry, `${concept.path}: reference ${index + 1}`));
  if (new Set(references.map(referenceKey)).size !== references.length) throw new Error(`${concept.path}: Question references contain duplicates`);
  const result: SharedQuestion = {
    id, revision: Number(revision), state: state as QuestionState, kind: kind as QuestionKind,
    originSubject, originProperty, subject, property, scopeKey, references,
    missingEvidence: stringList(question.missing_evidence, `${concept.path}: missing_evidence`, 64),
    limitations: stringList(question.limitations, `${concept.path}: limitations`, 64),
    guidance: stringList(question.guidance, `${concept.path}: guidance`, 16), title, createdAt: generated.at,
  };
  if (concept.body !== renderQuestionBody(result)) throw new Error(`${concept.path}: Question body is not renderer-owned`);
  return result;
}

export function validateQuestionTransition(previous: SharedQuestion | undefined, next: SharedQuestion): readonly string[] {
  const failures: string[] = [];
  if (!previous) {
    if (next.revision !== 1 || next.state !== "open" || next.guidance.length) failures.push("new Question must start open at revision 1 without Guidance");
    return failures;
  }
  if (previous.id !== next.id || previous.kind !== next.kind || previous.originSubject !== next.originSubject
    || previous.originProperty !== next.originProperty || previous.scopeKey !== next.scopeKey
    || previous.createdAt !== next.createdAt) failures.push("Question immutable origin changed");
  if (isDeepStrictEqual(previous, next)) return failures;
  if (next.revision !== previous.revision + 1) failures.push("Question edit must increment revision exactly once");
  const allowed = previous.state === next.state
    || previous.state === "open" && next.state === "resolved"
    || previous.state === "resolved" && ["open", "needs-review"].includes(next.state)
    || previous.state === "needs-review" && next.state === "resolved";
  if (!allowed) failures.push(`Question state transition ${previous.state} -> ${next.state} is invalid`);
  return failures;
}

export function renderQuestionIndex(questions: readonly SharedQuestion[]): string {
  const rows = [...questions].sort((left, right) => left.id.localeCompare(right.id))
    .map((question) => `* [${question.title}](${question.id}.md)`);
  return ["# Questions", "", ...rows, ""].join("\n");
}

export function mergeOpenQuestion(previous: SharedQuestion, incoming: Pick<SharedQuestion, "references" | "missingEvidence" | "limitations">): SharedQuestion {
  if (previous.state !== "open") return previous;
  const references = [...new Map([...previous.references, ...incoming.references].map((item) => [referenceKey(item), item])).values()]
    .sort((left, right) => referenceKey(left).localeCompare(referenceKey(right)));
  const next = { ...previous, references, missingEvidence: uniqueSorted([...previous.missingEvidence, ...incoming.missingEvidence]),
    limitations: uniqueSorted([...previous.limitations, ...incoming.limitations]) };
  return isDeepStrictEqual(previous, next) ? previous : { ...next, revision: previous.revision + 1 };
}

export function resolveQuestion(previous: SharedQuestion, guidanceId: string): SharedQuestion {
  if (previous.state !== "open" && previous.state !== "needs-review") throw new Error("Question is not awaiting resolution");
  if (!/^guidance\/[a-z0-9][a-z0-9./-]*$/.test(guidanceId)) throw new Error("Question Guidance identity is invalid");
  return { ...previous, revision: previous.revision + 1, state: "resolved",
    guidance: uniqueSorted([...previous.guidance, guidanceId]) };
}
