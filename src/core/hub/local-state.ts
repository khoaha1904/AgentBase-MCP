import path from "node:path";

import type { HubIdentity } from "./identity.ts";
import { HubValidationError } from "./identity.ts";

export type LocalHubState = Readonly<{
  kind?: "remote";
  root: string;
  hub: HubIdentity;
  localHubId?: string;
  baseCommit?: string;
  remoteBase: string;
  activeHead: string;
  catalogVersion: string;
}>;

export type LocalOnlyHubState = Readonly<{
  kind: "local-only";
  root: string;
  localHubId: string;
  baseCommit: string;
  remoteBase: string;
  activeHead: string;
  catalogVersion: string;
}>;

export type AdmittedLocalHubState = LocalHubState | LocalOnlyHubState;

export type LocalHubOwnerLock = Readonly<{
  ownerId: string;
  operation: "accept" | "publish" | "synchronize" | "recover";
  acquiredAt: string;
}>;

export type SynchronizationPhase = "prepared" | "fetched" | "rebasing" | "conflict" | "validated" | "advanced";

export type SynchronizationTransaction = Readonly<{
  id: string;
  phase: SynchronizationPhase;
  originalHead: string;
  remoteHead: string;
  recognizedProposalIds: readonly string[];
  remainingCommits: readonly string[];
  candidateHead?: string;
  conflictPaths?: readonly string[];
}>;

function assertCommit(value: string, label: string): void {
  if (!/^[a-f0-9]{40}$/.test(value)) throw new HubValidationError("HUB_COMMIT_INVALID", `${label} must be 40 lowercase hex`);
}

export function createLocalHubState(input: LocalHubState): LocalHubState {
  if (!path.isAbsolute(input.root)) throw new HubValidationError("HUB_ROOT_INVALID", "local Hub root must be absolute");
  if (input.hub.targetBranch !== "main") throw new HubValidationError("HUB_TARGET_INVALID", "AgentBase-Hub target branch must be main");
  assertCommit(input.remoteBase, "remoteBase");
  assertCommit(input.activeHead, "activeHead");
  if (!/^\d+\.\d+\.\d+$/.test(input.catalogVersion)) throw new HubValidationError("HUB_CATALOG_INVALID", "catalogVersion must be semantic version");
  return { ...input, root: path.resolve(input.root) };
}

export function createLocalOnlyHubState(input: LocalOnlyHubState): LocalOnlyHubState {
  if (!path.isAbsolute(input.root)) throw new HubValidationError("HUB_ROOT_INVALID", "local Hub root must be absolute");
  if (!/^[a-f0-9]{24}$/.test(input.localHubId)) throw new HubValidationError("HUB_LOCAL_ID_INVALID", "local Hub ID must be 24 lowercase hex");
  assertCommit(input.baseCommit, "baseCommit");
  assertCommit(input.remoteBase, "remoteBase");
  assertCommit(input.activeHead, "activeHead");
  if (input.remoteBase !== input.baseCommit) throw new HubValidationError("HUB_BASE_INVALID", "local-only pending baseline must equal the Hub base");
  if (!/^\d+\.\d+\.\d+$/.test(input.catalogVersion)) throw new HubValidationError("HUB_CATALOG_INVALID", "catalogVersion must be semantic version");
  return { ...input, root: path.resolve(input.root) };
}

export function createLocalHubOwnerLock(input: LocalHubOwnerLock): LocalHubOwnerLock {
  if (!/^[a-zA-Z0-9._:-]{8,128}$/.test(input.ownerId)) throw new HubValidationError("HUB_LOCK_OWNER_INVALID", "lock owner identity is invalid");
  if (!Number.isFinite(Date.parse(input.acquiredAt))) throw new HubValidationError("HUB_LOCK_TIME_INVALID", "lock acquisition time is invalid");
  return input;
}

export function advanceSynchronization(
  transaction: SynchronizationTransaction,
  phase: SynchronizationPhase,
  values: Partial<SynchronizationTransaction> = {},
): SynchronizationTransaction {
  const allowed: Readonly<Record<SynchronizationPhase, readonly SynchronizationPhase[]>> = {
    prepared: ["fetched"], fetched: ["rebasing"], rebasing: ["conflict", "validated"],
    conflict: ["rebasing"], validated: ["advanced"], advanced: [],
  };
  if (!allowed[transaction.phase].includes(phase)) {
    throw new HubValidationError("HUB_SYNC_PHASE_INVALID", "invalid synchronization transition");
  }
  const result = { ...transaction, ...values, phase };
  assertCommit(result.originalHead, "originalHead");
  assertCommit(result.remoteHead, "remoteHead");
  if ((phase === "validated" || phase === "advanced") && !result.candidateHead) {
    throw new HubValidationError("HUB_SYNC_CANDIDATE_MISSING", "validated synchronization requires candidateHead");
  }
  if (result.candidateHead) assertCommit(result.candidateHead, "candidateHead");
  if (phase === "conflict" && !result.conflictPaths?.length) {
    throw new HubValidationError("HUB_SYNC_CONFLICT_MISSING", "conflict phase requires exact conflict paths");
  }
  return result;
}
