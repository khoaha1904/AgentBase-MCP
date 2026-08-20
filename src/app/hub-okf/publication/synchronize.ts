import path from "node:path";

import type { LocalHubState } from "../../../core/hub/index.ts";
import { runGit, type GitOutput, type GitRequest } from "../../../providers/github-hub/index.ts";
import { listPendingHubProposals } from "../review/pending.ts";
import { acquireHubMutationLock, releaseHubMutationLock, writeAtomicJson } from "../review/proposal-state.ts";
import {
  computeProposalPatchIdentity,
  recognizePublishedProposals,
} from "./synchronization-recognition.ts";

export type SynchronizeGit = (request: GitRequest) => Promise<GitOutput>;

export type SynchronizeHubOptions = Readonly<{
  stateRoot: string;
  localHub: LocalHubState;
  token: string;
  git?: SynchronizeGit;
  signal?: AbortSignal;
}>;

export type HubSynchronizationReceipt = Readonly<{
  id: string;
  originalHead: string;
  remoteHead: string;
  recognizedProposalIds: readonly string[];
  remainingProposalIds: readonly string[];
  rebasedCommits: readonly string[];
  activeHead: string;
}>;

function checkpoint(signal?: AbortSignal): void {
  if (signal?.aborted) throw new Error("Hub synchronization cancelled");
}

function exactCommit(output: string, label: string): string {
  const commit = output.trim();
  if (!/^[a-f0-9]{40}$/.test(commit)) throw new Error(`${label} did not resolve to an exact commit`);
  return commit;
}

async function resolve(git: SynchronizeGit, root: string, revision: string, operation: string): Promise<string> {
  return exactCommit((await git({
    args: ["rev-parse", "--verify", `${revision}^{commit}`],
    cwd: root,
    operation,
    maximumOutputBytes: 256,
  })).stdout, operation);
}

export async function synchronizeLocalHub(
  options: SynchronizeHubOptions,
): Promise<HubSynchronizationReceipt> {
  if (!options.token) throw new Error("Hub synchronization requires the dedicated token");
  checkpoint(options.signal);
  const git = options.git ?? runGit;
  const id = `sync-${Date.now().toString(36)}`;
  const lock = acquireHubMutationLock(options.stateRoot, id);
  const transactionRoot = path.join(path.resolve(options.stateRoot), "transactions", id);
  const candidateRoot = path.join(transactionRoot, "candidate");
  const transactionPath = path.join(transactionRoot, "transaction.json");
  try {
    const pending = await listPendingHubProposals(options.localHub, git);
    writeAtomicJson(transactionPath, {
      phase: "prepared",
      originalHead: options.localHub.activeHead,
      priorRemoteBase: options.localHub.remoteBase,
      candidateRoot,
    });
    await git({
      args: ["fetch", "--no-tags", "origin", options.localHub.hub.targetBranch],
      cwd: options.localHub.root,
      operation: "fetch AgentBase-Hub main",
      token: options.token,
      ...(options.signal ? { signal: options.signal } : {}),
    });
    const remoteHead = await resolve(
      git,
      options.localHub.root,
      `refs/remotes/origin/${options.localHub.hub.targetBranch}`,
      "resolve fetched Hub main",
    );
    const remoteCommitOutput = await git({
      args: ["rev-list", remoteHead],
      cwd: options.localHub.root,
      operation: "read remote Hub ancestry",
      maximumOutputBytes: 4 * 1024 * 1024,
    });
    const remoteMessages = await git({
      args: ["log", "--format=%B%x00", `${options.localHub.remoteBase}..${remoteHead}`],
      cwd: options.localHub.root,
      operation: "read remote proposal identities",
      maximumOutputBytes: 4 * 1024 * 1024,
    });
    const remoteRange = await git({
      args: ["rev-list", `${options.localHub.remoteBase}..${remoteHead}`],
      cwd: options.localHub.root,
      operation: "list new remote Hub commits",
      maximumOutputBytes: 4 * 1024 * 1024,
    });
    const pendingPatchIdentities = new Map<string, string>();
    for (const proposal of pending) {
      pendingPatchIdentities.set(
        proposal.commit,
        await computeProposalPatchIdentity(git, options.localHub.root, proposal.commit),
      );
    }
    const remotePatchIdentities = new Set<string>();
    for (const commit of remoteRange.stdout.split("\n").filter(Boolean)) {
      remotePatchIdentities.add(await computeProposalPatchIdentity(git, options.localHub.root, commit));
    }
    const recognition = recognizePublishedProposals(
      pending,
      new Set(remoteCommitOutput.stdout.split("\n").filter(Boolean)),
      remoteMessages.stdout,
      pendingPatchIdentities,
      remotePatchIdentities,
    );
    writeAtomicJson(transactionPath, {
      phase: "fetched",
      originalHead: options.localHub.activeHead,
      remoteHead,
      recognizedProposalIds: recognition.recognized.map((item) => item.id),
      remainingCommits: recognition.remaining.map((item) => item.commit),
      candidateRoot,
    });
    checkpoint(options.signal);
    await git({
      args: ["worktree", "add", "--detach", candidateRoot, remoteHead],
      cwd: options.localHub.root,
      operation: "create synchronization candidate",
    });
    const rebasedCommits: string[] = [];
    for (const proposal of recognition.remaining) {
      checkpoint(options.signal);
      try {
        await git({
          args: ["cherry-pick", proposal.commit],
          cwd: candidateRoot,
          operation: "rebase pending Hub proposal",
          ...(options.signal ? { signal: options.signal } : {}),
        });
      } catch (error) {
        const conflicts = await git({
          args: ["diff", "--name-only", "--diff-filter=U"],
          cwd: candidateRoot,
          operation: "inspect synchronization conflict",
          maximumOutputBytes: 64 * 1024,
        });
        writeAtomicJson(transactionPath, {
          phase: "conflict",
          originalHead: options.localHub.activeHead,
          remoteHead,
          candidateRoot,
          failedProposalId: proposal.id,
          conflictPaths: conflicts.stdout.trim().split("\n").filter(Boolean),
        });
        throw new Error(`Hub synchronization conflict while replaying ${proposal.id}`, { cause: error });
      }
      rebasedCommits.push(await resolve(git, candidateRoot, "HEAD", "resolve rebased proposal"));
    }
    const candidateHead = await resolve(git, candidateRoot, "HEAD", "resolve synchronization candidate");
    const candidateStatus = await git({
      args: ["status", "--porcelain=v1", "--untracked-files=all"],
      cwd: candidateRoot,
      operation: "validate synchronization candidate",
    });
    if (candidateStatus.stdout.length) throw new Error("synchronization candidate is not clean");
    writeAtomicJson(transactionPath, {
      phase: "validated", originalHead: options.localHub.activeHead, remoteHead,
      candidateHead, candidateRoot, rebasedCommits,
    });
    const current = await resolve(git, options.localHub.root, "refs/heads/main", "verify original local main");
    if (current !== options.localHub.activeHead) throw new Error("local Hub main changed during synchronization");
    await git({ args: ["checkout", "--detach", current], cwd: options.localHub.root, operation: "detach original local Hub head" });
    await git({
      args: ["update-ref", "refs/heads/main", candidateHead, current],
      cwd: options.localHub.root,
      operation: "advance synchronized local main",
    });
    await git({ args: ["checkout", "main"], cwd: options.localHub.root, operation: "activate synchronized local main" });
    writeAtomicJson(transactionPath, {
      phase: "advanced", originalHead: current, remoteHead, candidateHead, candidateRoot,
    });
    await git({
      args: ["worktree", "remove", "--force", candidateRoot],
      cwd: options.localHub.root,
      operation: "remove synchronization candidate",
    });
    const receipt: HubSynchronizationReceipt = {
      id,
      originalHead: current,
      remoteHead,
      recognizedProposalIds: recognition.recognized.map((item) => item.id),
      remainingProposalIds: recognition.remaining.map((item) => item.id),
      rebasedCommits,
      activeHead: candidateHead,
    };
    writeAtomicJson(path.join(options.stateRoot, "synchronizations", `${id}.json`), receipt);
    return receipt;
  } finally {
    releaseHubMutationLock(lock);
  }
}
