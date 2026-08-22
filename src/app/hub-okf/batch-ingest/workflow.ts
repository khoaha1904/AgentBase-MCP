import fs from "node:fs";
import path from "node:path";

import type { AdmittedLocalHubState } from "../../../core/hub/index.ts";
import type { ConfirmedDomain } from "../../../core/knowledge/index.ts";
import { finalizeHubAuthoringSession, readHubAuthoringSession } from "../authoring/authoring-session.ts";
import type { QuestionDeclaration } from "../authoring/questions.ts";
import { writeAtomicJson } from "../review/proposal-state.ts";
import { composeBatchProposal } from "./composition.ts";
import {
  buildBatchManifest, readBatchManifest, writeBatchManifest,
  type BatchIngestManifest, type BatchMember, type BatchSourceState,
} from "./manifest.ts";

export type BatchMemberCheckpoint = Readonly<{
  formatVersion: 1;
  manifestId: string;
  memberId: string;
  attempt: number;
  status: "pending" | "complete" | "failed";
  source: BatchSourceState;
  proposalRoot?: string;
  proposalId?: string;
  error?: string;
}>;

function checkpointPath(stateRoot: string, manifestId: string, memberId: string): string {
  return path.join(path.resolve(stateRoot), "batch-ingests", manifestId, "members", `${memberId}.json`);
}

function readCheckpoint(stateRoot: string, manifestId: string, memberId: string): BatchMemberCheckpoint | undefined {
  const target = checkpointPath(stateRoot, manifestId, memberId);
  if (!fs.existsSync(target)) return undefined;
  const value = JSON.parse(fs.readFileSync(target, "utf8")) as BatchMemberCheckpoint;
  if (value.formatVersion !== 1 || value.manifestId !== manifestId || value.memberId !== memberId
    || !Number.isSafeInteger(value.attempt) || value.attempt < 1
    || !["pending", "complete", "failed"].includes(value.status)) throw new Error("batch member checkpoint is invalid");
  return value;
}

function sameSource(left: BatchSourceState, right: BatchSourceState): boolean {
  return left.commit === right.commit && left.dirty === right.dirty && left.dirtyDigest === right.dirtyDigest;
}

export function prepareBatchIngest(options: Readonly<{
  stateRoot: string;
  baseCommit: string;
  domain: ConfirmedDomain;
  members: readonly BatchMember[];
  createdAt: string;
}>): BatchIngestManifest {
  const manifest = buildBatchManifest(options); writeBatchManifest(options.stateRoot, manifest); return manifest;
}

export function confirmBatchIngest(options: Readonly<{
  stateRoot: string;
  manifestId: string;
  manifestRevision: number;
  assessments: readonly Readonly<{ memberId: string; decision: "match" | "override"; evidencePath: string }>[];
}>): BatchIngestManifest {
  const prior = readBatchManifest(options.stateRoot, options.manifestId, options.manifestRevision);
  if (prior.confirmed) throw new Error("batch manifest is already confirmed");
  const assessments = new Map(options.assessments.map((value) => [value.memberId, value]));
  if (assessments.size !== prior.members.length || options.assessments.length !== prior.members.length) {
    throw new Error("batch confirmation must cover every member exactly once");
  }
  const members = prior.members.map((member) => {
    const assessment = assessments.get(member.id);
    if (!assessment) throw new Error(`batch confirmation is missing member: ${member.id}`);
    return { ...member, domainAssessment: { decision: assessment.decision, evidencePath: assessment.evidencePath } };
  });
  const manifest = buildBatchManifest({ baseCommit: prior.baseCommit, domain: prior.domain, members,
    createdAt: prior.createdAt, confirmed: true, prior });
  writeBatchManifest(options.stateRoot, manifest); return manifest;
}

export function reviseBatchMembership(options: Readonly<{
  stateRoot: string;
  manifestId: string;
  manifestRevision: number;
  memberIds: readonly string[];
}>): Readonly<{ manifest: BatchIngestManifest; reusedMemberIds: readonly string[] }> {
  const prior = readBatchManifest(options.stateRoot, options.manifestId, options.manifestRevision);
  if (!prior.confirmed || new Set(options.memberIds).size !== options.memberIds.length) throw new Error("batch revision membership is invalid");
  const selected = new Set(options.memberIds), members = prior.members.filter((member) => selected.has(member.id));
  if (members.length !== options.memberIds.length) throw new Error("batch revision contains an unknown member");
  const manifest = buildBatchManifest({ baseCommit: prior.baseCommit, domain: prior.domain, members,
    createdAt: prior.createdAt, confirmed: true, prior });
  writeBatchManifest(options.stateRoot, manifest);
  return { manifest, reusedMemberIds: members.filter((member) => {
    const checkpoint = readCheckpoint(options.stateRoot, prior.id, member.id);
    return checkpoint?.status === "complete" && sameSource(checkpoint.source, member.source);
  }).map((member) => member.id) };
}

export function recordBatchMember(options: Readonly<{
  stateRoot: string;
  localHub: AdmittedLocalHubState;
  manifestId: string;
  manifestRevision: number;
  memberId: string;
  sessionId: string;
  currentSource: BatchSourceState;
  questions?: readonly QuestionDeclaration[];
}>): Readonly<{ status: "complete"; checkpoint: BatchMemberCheckpoint }
  | { status: "failed"; checkpoint: BatchMemberCheckpoint }> {
  const manifest = readBatchManifest(options.stateRoot, options.manifestId, options.manifestRevision);
  if (!manifest.confirmed || manifest.baseCommit !== options.localHub.activeHead) throw new Error("batch base changed or manifest is not confirmed");
  const member = manifest.members.find((value) => value.id === options.memberId);
  if (!member) throw new Error("batch member is not in the current manifest");
  const session = readHubAuthoringSession(options.stateRoot, options.sessionId, options.localHub.root);
  if (session.mode !== "new" || session.baseCommit !== manifest.baseCommit
    || session.sourceRepositoryId !== member.repositoryId || path.resolve(session.sourceRepositoryRoot) !== path.resolve(member.root)
    || !sameSource(session.sourceState, member.source) || !sameSource(options.currentSource, member.source)
    || session.confirmedDomain?.identity !== manifest.domain.identity) throw new Error("authoring session does not match exact batch member inputs");
  const previous = readCheckpoint(options.stateRoot, manifest.id, member.id), attempt = (previous?.attempt ?? 0) + 1;
  let generatedProposalRoot: string | undefined;
  try {
    const finalized = finalizeHubAuthoringSession(options.stateRoot, session.id, options.localHub.root,
      options.questions ?? [], [], options.currentSource, options.localHub.activeHead);
    if ("result" in finalized) throw new Error("Initial Ingest batch member cannot finalize as no-change");
    const proposalRoot = path.join(path.resolve(options.stateRoot), "proposals", finalized.proposal.id);
    generatedProposalRoot = proposalRoot;
    const retainedRoot = path.join(path.resolve(options.stateRoot), "batch-ingests", manifest.id,
      "member-proposals", member.id);
    fs.rmSync(retainedRoot, { recursive: true, force: true }); fs.mkdirSync(path.dirname(retainedRoot), { recursive: true, mode: 0o700 });
    fs.renameSync(proposalRoot, retainedRoot);
    generatedProposalRoot = undefined;
    const checkpoint: BatchMemberCheckpoint = { formatVersion: 1, manifestId: manifest.id,
      memberId: member.id, attempt, status: "complete", source: member.source,
      proposalRoot: retainedRoot, proposalId: finalized.proposal.id };
    writeAtomicJson(checkpointPath(options.stateRoot, manifest.id, member.id), checkpoint);
    return { status: "complete", checkpoint };
  } catch (error) {
    if (generatedProposalRoot) fs.rmSync(generatedProposalRoot, { recursive: true, force: true });
    fs.rmSync(session.root, { recursive: true, force: true });
    const checkpoint: BatchMemberCheckpoint = { formatVersion: 1, manifestId: manifest.id,
      memberId: member.id, attempt, status: "failed", source: member.source,
      error: error instanceof Error ? error.message : "batch member Finalize failed" };
    writeAtomicJson(checkpointPath(options.stateRoot, manifest.id, member.id), checkpoint);
    return { status: "failed", checkpoint };
  }
}

export function retryBatchMember(options: Readonly<{
  stateRoot: string; manifestId: string; manifestRevision: number; memberId: string;
}>): Readonly<{ member: BatchMember; attempt: number }> {
  const manifest = readBatchManifest(options.stateRoot, options.manifestId, options.manifestRevision);
  const member = manifest.members.find((value) => value.id === options.memberId);
  const checkpoint = readCheckpoint(options.stateRoot, manifest.id, options.memberId);
  if (!member || checkpoint?.status !== "failed") throw new Error("only a failed current batch member can be retried");
  writeAtomicJson(checkpointPath(options.stateRoot, manifest.id, member.id), { ...checkpoint, status: "pending", error: undefined });
  return { member, attempt: checkpoint.attempt + 1 };
}

export function finalizeBatchIngest(options: Readonly<{
  stateRoot: string;
  localHub: AdmittedLocalHubState;
  manifestId: string;
  manifestRevision: number;
  currentSources: ReadonlyMap<string, BatchSourceState>;
}>) {
  const manifest = readBatchManifest(options.stateRoot, options.manifestId, options.manifestRevision);
  const roots = new Map<string, string>();
  for (const member of manifest.members) {
    const checkpoint = readCheckpoint(options.stateRoot, manifest.id, member.id), current = options.currentSources.get(member.id);
    if (checkpoint?.status !== "complete" || !checkpoint.proposalRoot || !current
      || !sameSource(checkpoint.source, member.source) || !sameSource(current, member.source)) {
      throw new Error(`batch member requires completion or rerun: ${member.id}`);
    }
    roots.set(member.id, checkpoint.proposalRoot);
  }
  return composeBatchProposal({ stateRoot: options.stateRoot, localHub: options.localHub, manifest, memberProposalRoots: roots });
}
