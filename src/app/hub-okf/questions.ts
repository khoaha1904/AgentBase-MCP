import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import type { AdmittedLocalHubState } from "../../core/hub/index.ts";
import type { LiveClaim } from "../../core/knowledge/index.ts";
import { writeAtomicJson } from "./proposal-state.ts";

export type QuestionDeclaration = Readonly<{
  subject: string;
  property: string;
  claimIds: readonly string[];
  missingEvidence: readonly string[];
}>;

export type QuestionHistoryEvent = Readonly<{
  kind: "declared";
  at: string;
  proposalId: string;
  claimIds: readonly string[];
  missingEvidence: readonly string[];
}> | Readonly<{
  kind: "answered";
  at: string;
  by: string;
  answer: string;
  guidanceProposalId: string;
}>;

export type GovernedQuestion = Readonly<{
  id: string;
  revision: number;
  status: "pending" | "resolved";
  subject: string;
  property: string;
  sourceRepositoryId?: string;
  claimIds: readonly string[];
  claims: readonly LiveClaim[];
  missingEvidence: readonly string[];
  createdAt: string;
  updatedAt: string;
  history: readonly QuestionHistoryEvent[];
  resolution?: Extract<QuestionHistoryEvent, { kind: "answered" }>;
}>;

type QuestionLedger = Readonly<{ formatVersion: 1; authority: string; questions: readonly GovernedQuestion[] }>;

const SUBJECT_ROOT = "(?:domains|systems|components|interfaces|flows|resources|infrastructure|deployments|repositories|relationships|capabilities)";
const SUBJECT = new RegExp(`^${SUBJECT_ROOT}/[a-z0-9][a-z0-9./-]*$`);
const PROPERTY = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const CLAIM = /^AB-CLAIM-[A-Za-z0-9][A-Za-z0-9._-]*$/;
const PROPOSAL = /^[a-f0-9]{24}$/;
const HUMAN = /^human:[A-Za-z0-9][A-Za-z0-9._@-]{0,127}$/;

function authority(hub: AdmittedLocalHubState): string {
  return hub.localHubId ?? ("hub" in hub ? hub.hub.repository : undefined) ?? (() => { throw new Error("Hub question authority is unavailable"); })();
}

function ledgerPath(stateRoot: string, hub: AdmittedLocalHubState): string {
  const digest = createHash("sha256").update(authority(hub)).digest("hex").slice(0, 24);
  return path.join(path.resolve(stateRoot), "questions", `${digest}.json`);
}

function questionId(hubAuthority: string, declaration: Pick<QuestionDeclaration, "subject" | "property">): string {
  return createHash("sha256").update(`${hubAuthority}\0${declaration.subject}\0${declaration.property}`).digest("hex").slice(0, 24);
}

function strings(values: readonly string[]): readonly string[] {
  return [...new Set(values)].sort();
}

function mergeClaims(previous: readonly LiveClaim[], incoming: readonly LiveClaim[]): readonly LiveClaim[] {
  const byId = new Map(previous.map((claim) => [claim.id, claim]));
  for (const claim of incoming) if (!byId.has(claim.id)) byId.set(claim.id, claim);
  return [...byId.values()].sort((left, right) => left.id.localeCompare(right.id));
}

function validTime(value: string): boolean { return !Number.isNaN(Date.parse(value)); }

export function normalizeQuestionDeclarations(values: readonly QuestionDeclaration[]): readonly QuestionDeclaration[] {
  if (values.length > 64) throw new Error("a proposal may declare at most 64 questions");
  return values.map((value, index) => {
    if (!SUBJECT.test(value.subject) || value.subject.includes("..")) throw new Error(`question ${index + 1} subject is invalid`);
    if (!PROPERTY.test(value.property) || value.property.length > 128) throw new Error(`question ${index + 1} property is invalid`);
    const claimIds = strings(value.claimIds);
    if (!claimIds.length || claimIds.length > 64 || claimIds.some((id) => !CLAIM.test(id))) {
      throw new Error(`question ${index + 1} claim_ids are invalid`);
    }
    const missingEvidence = strings(value.missingEvidence.map((item) => item.trim()));
    if (missingEvidence.length > 64 || missingEvidence.some((item) => !item || item.length > 512)) {
      throw new Error(`question ${index + 1} missing_evidence is invalid`);
    }
    return { subject: value.subject, property: value.property, claimIds, missingEvidence };
  }).sort((left, right) => `${left.subject}\0${left.property}`.localeCompare(`${right.subject}\0${right.property}`));
}

export function validateQuestionDeclarations(
  values: readonly QuestionDeclaration[],
  claims: readonly LiveClaim[],
  sourceRepositoryId: string,
): readonly QuestionDeclaration[] {
  const normalized = normalizeQuestionDeclarations(values), byId = new Map(claims.map((claim) => [claim.id, claim]));
  for (const [index, declaration] of normalized.entries()) {
    if (declaration.claimIds.length < 2 && !declaration.missingEvidence.length) {
      throw new Error(`question ${index + 1} requires conflicting claims or missing evidence`);
    }
    for (const id of declaration.claimIds) {
      const claim = byId.get(id);
      if (!claim) throw new Error(`question ${index + 1} references unknown live claim ${id}`);
      if (claim.subject !== declaration.subject || claim.property !== declaration.property) {
        throw new Error(`question ${index + 1} claim ${id} has a different subject or property`);
      }
      if (!claim.source.resource.startsWith(`repository://${sourceRepositoryId}/`)) {
        throw new Error(`question ${index + 1} claim ${id} is outside the proposal source`);
      }
    }
  }
  return normalized;
}

function readLedger(stateRoot: string, hub: AdmittedLocalHubState): QuestionLedger {
  const expectedAuthority = authority(hub), target = ledgerPath(stateRoot, hub);
  if (!fs.existsSync(target)) return { formatVersion: 1, authority: expectedAuthority, questions: [] };
  if (fs.lstatSync(target).isSymbolicLink()) throw new Error("Hub question ledger cannot be a symlink");
  const value = JSON.parse(fs.readFileSync(target, "utf8")) as QuestionLedger;
  if (value.formatVersion !== 1 || value.authority !== expectedAuthority || !Array.isArray(value.questions)) {
    throw new Error("Hub question ledger is invalid");
  }
  return value;
}

function writeLedger(stateRoot: string, hub: AdmittedLocalHubState, questions: readonly GovernedQuestion[]): void {
  const target = ledgerPath(stateRoot, hub);
  writeAtomicJson(target, { formatVersion: 1, authority: authority(hub), questions: [...questions].sort((a, b) => a.id.localeCompare(b.id)) });
  fs.chmodSync(path.dirname(target), 0o700); fs.chmodSync(target, 0o600);
}

export function applyQuestionDeclarations(
  stateRoot: string,
  hub: AdmittedLocalHubState,
  declarations: readonly QuestionDeclaration[],
  proposalId: string,
  at: string,
  sourceRepositoryId?: string,
  claims: readonly LiveClaim[] = [],
): readonly GovernedQuestion[] {
  if (!PROPOSAL.test(proposalId)) throw new Error("question proposal ID is invalid");
  if (!validTime(at)) throw new Error("question declaration time is invalid");
  const normalized = normalizeQuestionDeclarations(declarations), ledger = readLedger(stateRoot, hub);
  const byId = new Map(ledger.questions.map((question) => [question.id, question]));
  const affected: GovernedQuestion[] = [];
  let changed = false;
  for (const declaration of normalized) {
    const id = questionId(ledger.authority, declaration), previous = byId.get(id);
    const linkedClaims = claims.filter((claim) => declaration.claimIds.includes(claim.id));
    if (previous?.history.some((event) => event.kind === "declared" && event.proposalId === proposalId)) {
      affected.push(previous); continue;
    }
    if ((previous?.history.length ?? 0) >= 64) throw new Error(`question ${id} history limit reached`);
    const event: QuestionHistoryEvent = { kind: "declared", at, proposalId,
      claimIds: declaration.claimIds, missingEvidence: declaration.missingEvidence };
    const question: GovernedQuestion = previous ? {
      ...previous, revision: previous.revision + 1,
      claimIds: strings([...previous.claimIds, ...declaration.claimIds]),
      claims: mergeClaims(previous.claims ?? [], linkedClaims),
      missingEvidence: strings([...previous.missingEvidence, ...declaration.missingEvidence]),
      updatedAt: at, history: [...previous.history, event],
    } : {
      id, revision: 1, status: "pending", subject: declaration.subject, property: declaration.property,
      ...(sourceRepositoryId ? { sourceRepositoryId } : {}), claimIds: declaration.claimIds,
      claims: mergeClaims([], linkedClaims),
      missingEvidence: declaration.missingEvidence, createdAt: at, updatedAt: at, history: [event],
    };
    byId.set(id, question); affected.push(question); changed = true;
  }
  if (changed) writeLedger(stateRoot, hub, [...byId.values()]);
  return affected;
}

export function listHubQuestions(
  stateRoot: string,
  hub: AdmittedLocalHubState,
  options: Readonly<{ status?: "pending" | "resolved"; limit?: number }> = {},
): readonly GovernedQuestion[] {
  const limit = options.limit ?? 100;
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) throw new Error("question limit must be from 1 to 100");
  return readLedger(stateRoot, hub).questions
    .filter((question) => !options.status || question.status === options.status)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt) || left.id.localeCompare(right.id))
    .slice(0, limit);
}

export function readHubQuestion(stateRoot: string, hub: AdmittedLocalHubState, id: string): GovernedQuestion {
  if (!PROPOSAL.test(id)) throw new Error("question ID is invalid");
  const question = readLedger(stateRoot, hub).questions.find((item) => item.id === id);
  if (!question) throw new Error("question was not found");
  return question;
}

export function recordQuestionAnswer(
  stateRoot: string,
  hub: AdmittedLocalHubState,
  id: string,
  revision: number,
  answer: string,
  by: string,
  guidanceProposalId: string,
  at: string,
): GovernedQuestion {
  const normalizedAnswer = answer.trim();
  if (!PROPOSAL.test(id) || !PROPOSAL.test(guidanceProposalId)) throw new Error("question or guidance proposal ID is invalid");
  if (!Number.isSafeInteger(revision) || revision < 1) throw new Error("question revision is invalid");
  if (!normalizedAnswer || normalizedAnswer.length > 4096) throw new Error("question answer is invalid");
  if (!HUMAN.test(by)) throw new Error("maintainer must use an explicit human: identity");
  if (!validTime(at)) throw new Error("question answer time is invalid");
  const ledger = readLedger(stateRoot, hub), index = ledger.questions.findIndex((question) => question.id === id);
  if (index < 0) throw new Error("question was not found");
  const previous = ledger.questions[index]!;
  if (previous.revision !== revision) throw new Error("question revision changed");
  if (previous.history.length >= 64) throw new Error(`question ${id} history limit reached`);
  const event = { kind: "answered" as const, at, by, answer: normalizedAnswer, guidanceProposalId };
  const reopened = previous.resolution !== undefined && previous.resolution.answer !== normalizedAnswer;
  const next: GovernedQuestion = { ...previous, revision: previous.revision + 1,
    status: reopened ? "pending" : "resolved", updatedAt: at, history: [...previous.history, event], resolution: event };
  const questions = [...ledger.questions]; questions[index] = next;
  writeLedger(stateRoot, hub, questions);
  return next;
}
