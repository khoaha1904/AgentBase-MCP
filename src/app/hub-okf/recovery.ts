import fs from "node:fs";
import path from "node:path";

import type { LocalHubState } from "../../core/hub/index.ts";
import { runGit, type GitOutput, type GitRequest } from "../../providers/github-hub/index.ts";
import {
  acquireHubMutationLock,
  readHubProposalState,
  releaseHubMutationLock,
} from "./proposal-state.ts";
import { submitHubProposal, type HubPublicationReceipt, type SubmitHubOptions } from "./submit.ts";

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
}>;

async function resolve(git: (request: GitRequest) => Promise<GitOutput>, root: string): Promise<string> {
  const output = await git({ args: ["rev-parse", "--verify", "refs/heads/main^{commit}"], cwd: root, operation: "resolve recovery main" });
  const commit = output.stdout.trim();
  if (!/^[a-f0-9]{40}$/.test(commit)) throw new Error("recovery main did not resolve exactly");
  return commit;
}

export async function recoverSynchronizationTransaction(
  stateRoot: string,
  transactionId: string,
  localHub: LocalHubState,
  git: (request: GitRequest) => Promise<GitOutput> = runGit,
): Promise<HubSynchronizationRecovery> {
  if (!/^sync-[a-z0-9]+$/.test(transactionId)) throw new Error("synchronization transaction ID is invalid");
  const lock = acquireHubMutationLock(stateRoot, `recover:${transactionId}`);
  try {
  const transactionRoot = path.join(path.resolve(stateRoot), "transactions", transactionId);
  const state = JSON.parse(fs.readFileSync(path.join(transactionRoot, "transaction.json"), "utf8")) as TransactionState;
  if (!/^[a-f0-9]{40}$/.test(state.originalHead)
    || !path.resolve(state.candidateRoot).startsWith(`${transactionRoot}${path.sep}`)) {
    throw new Error("synchronization recovery state is invalid");
  }
  const current = await resolve(git, localHub.root);
  if (state.phase === "validated") {
    if (!state.candidateHead || !/^[a-f0-9]{40}$/.test(state.candidateHead)) {
      throw new Error("validated synchronization is missing candidate head");
    }
    if (current !== state.originalHead) throw new Error("local main changed after synchronization validation");
    await git({ args: ["checkout", "--detach", current], cwd: localHub.root, operation: "detach recovery original" });
    await git({
      args: ["update-ref", "refs/heads/main", state.candidateHead, current],
      cwd: localHub.root,
      operation: "advance recovery candidate",
    });
    await git({ args: ["checkout", "main"], cwd: localHub.root, operation: "activate recovery main" });
    if (fs.existsSync(state.candidateRoot)) {
      await git({ args: ["worktree", "remove", "--force", state.candidateRoot], cwd: localHub.root, operation: "remove recovery candidate" });
    }
    fs.rmSync(transactionRoot, { recursive: true, force: true });
    return { transactionId, outcome: "advanced-candidate", activeHead: state.candidateHead };
  }
  if (state.phase === "advanced") {
    if (state.candidateHead && current !== state.candidateHead) throw new Error("advanced synchronization main no longer matches receipt");
    if (fs.existsSync(state.candidateRoot)) {
      await git({ args: ["worktree", "remove", "--force", state.candidateRoot], cwd: localHub.root, operation: "remove advanced candidate" });
    }
    fs.rmSync(transactionRoot, { recursive: true, force: true });
    return { transactionId, outcome: "already-advanced", activeHead: current };
  }
  if (current !== state.originalHead) throw new Error("local main changed during interrupted synchronization");
  if (fs.existsSync(state.candidateRoot)) {
    if (state.phase === "conflict") {
      await git({ args: ["cherry-pick", "--abort"], cwd: state.candidateRoot, operation: "abort conflicted candidate" });
    }
    await git({ args: ["worktree", "remove", "--force", state.candidateRoot], cwd: localHub.root, operation: "remove interrupted candidate" });
  }
  fs.rmSync(transactionRoot, { recursive: true, force: true });
  return { transactionId, outcome: "restored-original", activeHead: current };
  } finally {
    releaseHubMutationLock(lock);
  }
}
