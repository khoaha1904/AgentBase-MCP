import fs from "node:fs";
import path from "node:path";

import type { LocalHubState } from "../../../core/hub/index.ts";
import { runGit, type GitOutput, type GitRequest } from "../../../providers/github-hub/index.ts";
import {
  acquireHubMutationLock,
  readHubProposalState,
  releaseHubMutationLock,
} from "../review/proposal-state.ts";
import { submitHubProposal, type HubPublicationReceipt, type SubmitHubOptions } from "./submit.ts";
import { HUB_PUBLISHED_REF } from "../workspace/local-hub.ts";

export async function recoverHubSubmission(options: SubmitHubOptions): Promise<HubPublicationReceipt> {
  const proposal = readHubProposalState(options.proposalRoot);
  if (proposal.phase === "prepared") throw new Error("proposal has no interrupted publication to recover");
  return submitHubProposal(options);
}

export type HubSynchronizationRecovery = Readonly<{
  transactionId: string;
  outcome: "restored-original" | "advanced-candidate" | "already-advanced";
  activeHead: string;
}>;

type TransactionState = Readonly<{
  phase: "prepared" | "fetched" | "conflict" | "validated" | "advanced";
  originalHead: string;
  candidateRoot: string;
  candidateHead?: string;
  remoteHead?: string;
  localHubId?: string;
  priorPublished?: string;
}>;

async function resolve(git: (request: GitRequest) => Promise<GitOutput>, root: string): Promise<string> {
  const output = await git({ args: ["rev-parse", "--verify", "refs/heads/main^{commit}"], cwd: root, operation: "resolve recovery main" });
  const commit = output.stdout.trim();
  if (!/^[a-f0-9]{40}$/.test(commit)) throw new Error("recovery main did not resolve exactly");
  return commit;
}

async function resolvePublished(git: (request: GitRequest) => Promise<GitOutput>, root: string): Promise<string> {
  const output = await git({ args: ["rev-parse", "--verify", `${HUB_PUBLISHED_REF}^{commit}`], cwd: root,
    operation: "resolve recovery Published boundary" });
  const commit = output.stdout.trim();
  if (!/^[a-f0-9]{40}$/.test(commit)) throw new Error("recovery Published boundary did not resolve exactly");
  return commit;
}

async function activateMain(git: (request: GitRequest) => Promise<GitOutput>, root: string): Promise<void> {
  await git({ args: ["checkout", "main"], cwd: root, operation: "restore recovery main checkout" });
}

export async function recoverSynchronizationTransaction(
  stateRoot: string,
  transactionId: string,
  localHub: LocalHubState,
  git: (request: GitRequest) => Promise<GitOutput> = runGit,
): Promise<HubSynchronizationRecovery> {
  if (!/^sync-[a-z0-9]+$/.test(transactionId)) throw new Error("synchronization transaction ID is invalid");
  const lock = acquireHubMutationLock(stateRoot, transactionId, { recoverStaleOwner: true });
  try {
  const transactionRoot = path.join(path.resolve(stateRoot), "transactions", transactionId);
  const state = JSON.parse(fs.readFileSync(path.join(transactionRoot, "transaction.json"), "utf8")) as TransactionState;
  const priorPublished = state.priorPublished ?? localHub.remoteBase;
  if (!/^[a-f0-9]{40}$/.test(state.originalHead)
    || !/^[a-f0-9]{40}$/.test(priorPublished)
    || !path.resolve(state.candidateRoot).startsWith(`${transactionRoot}${path.sep}`)) {
    throw new Error("synchronization recovery state is invalid");
  }
  if (state.localHubId !== undefined && state.localHubId !== localHub.localHubId) {
    throw new Error("synchronization transaction belongs to another Hub profile");
  }
  const current = await resolve(git, localHub.root);
  if (state.phase === "validated") {
    if (!state.candidateHead || !/^[a-f0-9]{40}$/.test(state.candidateHead)) {
      throw new Error("validated synchronization is missing candidate head");
    }
    if (!state.remoteHead || !/^[a-f0-9]{40}$/.test(state.remoteHead)) throw new Error("validated synchronization is missing remote head");
    const published = await resolvePublished(git, localHub.root);
    if (current === state.candidateHead && published === state.remoteHead) {
      await activateMain(git, localHub.root);
      if (fs.existsSync(state.candidateRoot)) {
        await git({ args: ["worktree", "remove", "--force", state.candidateRoot], cwd: localHub.root, operation: "remove admitted recovery candidate" });
      }
      fs.rmSync(transactionRoot, { recursive: true, force: true });
      return { transactionId, outcome: "already-advanced", activeHead: current };
    }
    if (current !== state.originalHead || published !== priorPublished) throw new Error("Hub refs changed after synchronization validation");
    await git({ args: ["checkout", "--detach", current], cwd: localHub.root, operation: "detach recovery original" });
    await git({ args: ["update-ref", "--stdin"], cwd: localHub.root,
      operation: "atomically admit recovery candidate", stdin: [
        "start",
        `update refs/heads/main ${state.candidateHead} ${current}`,
        `update ${HUB_PUBLISHED_REF} ${state.remoteHead} ${priorPublished}`,
        "prepare", "commit", "",
      ].join("\n") });
    await git({ args: ["checkout", "main"], cwd: localHub.root, operation: "activate recovery main" });
    if (fs.existsSync(state.candidateRoot)) {
      await git({ args: ["worktree", "remove", "--force", state.candidateRoot], cwd: localHub.root, operation: "remove recovery candidate" });
    }
    fs.rmSync(transactionRoot, { recursive: true, force: true });
    return { transactionId, outcome: "advanced-candidate", activeHead: state.candidateHead };
  }
  if (state.phase === "advanced") {
    if (!state.candidateHead || !/^[a-f0-9]{40}$/.test(state.candidateHead)) throw new Error("advanced synchronization is missing candidate head");
    if (current !== state.candidateHead) {
      const mergeBase = (await git({ args: ["merge-base", state.candidateHead, current], cwd: localHub.root,
        operation: "validate advanced synchronization ancestry", maximumOutputBytes: 256 })).stdout.trim();
      if (mergeBase !== state.candidateHead) throw new Error("advanced synchronization main no longer contains its admitted candidate");
    }
    if (!state.remoteHead || await resolvePublished(git, localHub.root) !== state.remoteHead) {
      throw new Error("advanced synchronization Published boundary no longer matches receipt");
    }
    await activateMain(git, localHub.root);
    if (fs.existsSync(state.candidateRoot)) {
      await git({ args: ["worktree", "remove", "--force", state.candidateRoot], cwd: localHub.root, operation: "remove advanced candidate" });
    }
    fs.rmSync(transactionRoot, { recursive: true, force: true });
    return { transactionId, outcome: "already-advanced", activeHead: current };
  }
  if (current !== state.originalHead || await resolvePublished(git, localHub.root) !== priorPublished) {
    throw new Error("Hub refs changed during interrupted synchronization");
  }
  if (fs.existsSync(state.candidateRoot)) {
    if (state.phase === "conflict") {
      let cherryPickActive = true;
      try { await git({ args: ["rev-parse", "--verify", "CHERRY_PICK_HEAD"], cwd: state.candidateRoot,
        operation: "inspect conflicted candidate" }); }
      catch { cherryPickActive = false; }
      if (cherryPickActive) {
        await git({ args: ["cherry-pick", "--abort"], cwd: state.candidateRoot, operation: "abort conflicted candidate" });
      }
    }
    await git({ args: ["worktree", "remove", "--force", state.candidateRoot], cwd: localHub.root, operation: "remove interrupted candidate" });
  }
  await activateMain(git, localHub.root);
  fs.rmSync(transactionRoot, { recursive: true, force: true });
  return { transactionId, outcome: "restored-original", activeHead: current };
  } finally {
    releaseHubMutationLock(lock);
  }
}
