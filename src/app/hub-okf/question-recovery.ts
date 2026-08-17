import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { createHubProposal, type AdmittedLocalHubState, type AnyHubProposal } from "../../core/hub/index.ts";
import type { LocalProposal } from "../../core/hub/index.ts";
import type { LiveClaim } from "../../core/knowledge/index.ts";
import type { HubProposalInspection } from "./inspect.ts";
import { writeHubProposalState, writeAtomicJson } from "./proposal-state.ts";
import { applyQuestionDeclarations, normalizeQuestionDeclarations, type GovernedQuestion, type QuestionDeclaration } from "./questions.ts";

type QuestionProposalAttachment = Readonly<{
  formatVersion: 1;
  proposalId: string;
  baseDiffDigest: string;
  reviewDigest: string;
  sourceRepositoryId: string;
  createdAt: string;
  declarations: readonly QuestionDeclaration[];
  claims: readonly LiveClaim[];
}>;

export function questionReviewDigest(
  baseDiffDigest: string,
  declarations: readonly QuestionDeclaration[],
  claims: readonly LiveClaim[] = [],
): string {
  return `sha256:${createHash("sha256").update(JSON.stringify({ formatVersion: 1, baseDiffDigest, declarations, claims })).digest("hex")}`;
}

export function bindQuestionDeclarations(
  proposalRoot: string,
  proposal: AnyHubProposal,
  inspection: HubProposalInspection,
  declarations: readonly QuestionDeclaration[],
  createdAt: string,
  claims: readonly LiveClaim[] = [],
): Readonly<{ proposal: AnyHubProposal; inspection: HubProposalInspection }> {
  const normalized = normalizeQuestionDeclarations(declarations);
  if (!normalized.length) return { proposal, inspection };
  const linkedIds = new Set(normalized.flatMap((declaration) => declaration.claimIds));
  const linkedClaims = claims.filter((claim) => linkedIds.has(claim.id)).sort((left, right) => left.id.localeCompare(right.id));
  const diffDigest = questionReviewDigest(proposal.diffDigest, normalized, linkedClaims);
  const common = {
    mode: proposal.mode, subject: proposal.subject, baseCommit: proposal.baseCommit,
    sourceRepositoryId: proposal.sourceRepositoryId, evidenceDigest: proposal.evidenceDigest,
    schemaVersion: proposal.schemaVersion, selectedSchemas: proposal.selectedSchemas,
    treeDigest: proposal.treeDigest, diffDigest,
  };
  const bound = "hub" in proposal && proposal.hub
    ? createHubProposal({ ...common, hub: proposal.hub })
    : createHubProposal({ ...common, localHubId: proposal.localHubId });
  const attachment: QuestionProposalAttachment = {
    formatVersion: 1, proposalId: bound.id, baseDiffDigest: proposal.diffDigest, reviewDigest: diffDigest,
    sourceRepositoryId: proposal.sourceRepositoryId, createdAt, declarations: normalized, claims: linkedClaims,
  };
  writeAtomicJson(path.join(proposalRoot, "questions.json"), attachment);
  writeHubProposalState(proposalRoot, bound);
  return { proposal: bound, inspection: { ...inspection, questions: normalized } };
}

export function readQuestionProposalAttachment(
  proposalRoot: string,
  proposal: AnyHubProposal,
): QuestionProposalAttachment | undefined {
  const target = path.join(proposalRoot, "questions.json");
  if (!fs.existsSync(target)) return undefined;
  if (fs.lstatSync(target).isSymbolicLink()) throw new Error("question proposal attachment cannot be a symlink");
  const value = JSON.parse(fs.readFileSync(target, "utf8")) as QuestionProposalAttachment;
  const declarations = normalizeQuestionDeclarations(value.declarations ?? []);
  const digest = questionReviewDigest(value.baseDiffDigest, declarations, value.claims ?? []);
  if (value.formatVersion !== 1 || value.proposalId !== proposal.id || value.reviewDigest !== digest
    || proposal.diffDigest !== digest || value.sourceRepositoryId !== proposal.sourceRepositoryId
    || Number.isNaN(Date.parse(value.createdAt))) throw new Error("question proposal attachment changed after review");
  if (!Array.isArray(value.claims)) throw new Error("question proposal attachment is missing claim references");
  return { ...value, declarations };
}

export function reconcileAcceptedQuestions(
  stateRoot: string,
  hub: AdmittedLocalHubState,
): readonly GovernedQuestion[] {
  const proposalsRoot = path.join(path.resolve(stateRoot), "proposals");
  if (!fs.existsSync(proposalsRoot)) return [];
  const affected: GovernedQuestion[] = [];
  for (const entry of fs.readdirSync(proposalsRoot, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (!entry.isDirectory() || !/^[a-f0-9]{24}$/.test(entry.name)) continue;
    const root = path.join(proposalsRoot, entry.name), acceptedPath = path.join(root, "accepted.json");
    if (!fs.existsSync(acceptedPath) || !fs.existsSync(path.join(root, "questions.json"))) continue;
    const proposal = JSON.parse(fs.readFileSync(path.join(root, "hub-proposal.json"), "utf8")) as AnyHubProposal;
    const accepted = JSON.parse(fs.readFileSync(acceptedPath, "utf8")) as LocalProposal;
    if (accepted.id !== proposal.id) throw new Error("accepted question proposal identity is invalid");
    const attachment = readQuestionProposalAttachment(root, proposal)!;
    affected.push(...applyQuestionDeclarations(stateRoot, hub, attachment.declarations, proposal.id,
      attachment.createdAt, attachment.sourceRepositoryId, attachment.claims));
  }
  return affected;
}
