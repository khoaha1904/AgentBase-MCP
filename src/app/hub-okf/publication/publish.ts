import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { HUB_PROPOSAL_TRAILERS, type LocalHubState } from "../../../core/hub/index.ts";
import type {
  GitHubPullRequest,
  GitHubRef,
  GitHubRepository,
  GitOutput,
  GitRequest,
} from "../../../providers/github-hub/index.ts";
import { runGit } from "../../../providers/github-hub/index.ts";
import {
  listPendingHubProposals,
  selectPendingPrefix,
  selectPendingProposals,
  type PendingHubProposal,
} from "../review/pending.ts";
import { acquireHubMutationLock, releaseHubMutationLock, writeAtomicJson } from "../review/proposal-state.ts";
import { renderPublicationReview } from "./review-summary.ts";

export type PublishGitHub = Readonly<{
  getRepository(): Promise<GitHubRepository>;
  getBranchRef(branch: string): Promise<GitHubRef>;
  findBranchRef(branch: string): Promise<GitHubRef | undefined>;
  listPullRequests(
    headBranch: string,
    baseBranch: string,
    state: "open" | "all",
  ): Promise<readonly GitHubPullRequest[]>;
  listPullRequestsForHead(
    headBranch: string,
    state: "open" | "all",
  ): Promise<readonly GitHubPullRequest[]>;
  createPullRequest(
    headBranch: string,
    headCommit: string,
    title: string,
    body: string,
    baseBranch: string,
  ): Promise<GitHubPullRequest>;
  updatePullRequestBase(
    number: number,
    headBranch: string,
    headCommit: string,
    baseBranch: string,
  ): Promise<GitHubPullRequest>;
}>;

export type PublishHubOptions = Readonly<{
  stateRoot: string;
  localHub: LocalHubState;
  selectedProposalIds: readonly string[];
  token: string;
  github: PublishGitHub;
  publicationMode?: "auto" | "batch";
  git?: (request: GitRequest) => Promise<GitOutput>;
  signal?: AbortSignal;
}>;

export type HubPublicationUnitReceipt = Readonly<{
  proposalIds: readonly string[];
  branch: string;
  headCommit: string;
  baseBranch: string;
  pullRequest: Readonly<{ number: number; url: string }>;
}>;

export type HubBatchPublicationReceipt = Readonly<{
  id: string;
  mode: "batch" | "stack" | "independent";
  repository: string;
  remoteBase: string;
  proposalIds: readonly string[];
  commits: readonly string[];
  units: readonly HubPublicationUnitReceipt[];
  branch: string;
  headCommit: string;
  pullRequest: Readonly<{ number: number; url: string }>;
}>;

type PublicationUnit = Readonly<{
  proposals: readonly PendingHubProposal[];
  branch: string;
  baseBranch: string;
  batchHeadCommit?: string;
}>;

function checkpoint(signal?: AbortSignal): void {
  if (signal?.aborted) throw new Error("Hub publication cancelled");
}

function publicationIdentity(localHub: LocalHubState, selected: readonly PendingHubProposal[]): string {
  return createHash("sha256")
    .update([localHub.hub.repository, localHub.remoteBase, ...selected.map((item) => item.commit)].join("\0"))
    .digest("hex")
    .slice(0, 24);
}

function publicationUnits(
  localHub: LocalHubState,
  pending: readonly PendingHubProposal[],
  selected: readonly PendingHubProposal[],
  id: string,
  batch: boolean,
): Readonly<{ mode: "batch" | "stack" | "independent"; units: readonly PublicationUnit[] }> {
  if (batch) {
    return {
      mode: "batch",
      units: [{
        proposals: selected,
        branch: `agentbase/publish-${id}`,
        baseBranch: localHub.hub.targetBranch,
        batchHeadCommit: selected.at(-1)!.commit,
      }],
    };
  }
  const positions = new Map(pending.map((proposal, index) => [proposal.id, index]));
  const repositories = new Set(selected.map((proposal) => proposal.sourceRepositoryId));
  return {
    mode: repositories.size === 1 && selected.length > 1 ? "stack" : "independent",
    units: selected.map((proposal) => {
      if (!proposal.mode) throw new Error("legacy pending proposals require explicit batch publication");
      const position = positions.get(proposal.id)!;
      const prior = pending.slice(0, position).filter((item) => item.sourceRepositoryId === proposal.sourceRepositoryId).at(-1);
      if (proposal.mode === "new" && prior) throw new Error("a Repository cannot contain a second pending Init proposal");
      return {
        proposals: [proposal],
        branch: `agentbase/okf-${proposal.id}`,
        baseBranch: prior ? `agentbase/okf-${prior.id}` : localHub.hub.targetBranch,
      };
    }),
  };
}

async function branchContainsProposal(
  git: (request: GitRequest) => Promise<GitOutput>, root: string, head: string, proposalId: string,
): Promise<boolean> {
  const messages = await git({ args: ["log", "--format=%B%x00", "--max-count=1",
    `--grep=^${HUB_PROPOSAL_TRAILERS.id}: ${proposalId}$`, head], cwd: root,
    operation: "admit publication branch proposal identity", maximumOutputBytes: 64 * 1024 });
  return messages.stdout.includes(`${HUB_PROPOSAL_TRAILERS.id}: ${proposalId}`);
}

async function includesCommit(
  git: (request: GitRequest) => Promise<GitOutput>, root: string, ancestor: string, descendant: string,
): Promise<boolean> {
  try {
    await git({ args: ["merge-base", "--is-ancestor", ancestor, descendant], cwd: root,
      operation: "check publication base ancestry", maximumOutputBytes: 256 });
    return true;
  } catch { return false; }
}

async function reconcilePublicationBranch(
  options: PublishHubOptions,
  git: (request: GitRequest) => Promise<GitOutput>,
  unit: PublicationUnit,
  existingCommit: string,
  baseCommit: string,
): Promise<string> {
  await git({ args: ["fetch", "--no-tags", "origin", unit.branch], cwd: options.localHub.root,
    operation: "fetch existing publication branch", token: options.token,
    ...(options.signal ? { signal: options.signal } : {}) });
  const fetched = await exactCommit(git, options.localHub.root, `refs/remotes/origin/${unit.branch}`,
    "resolve existing publication branch");
  if (fetched !== existingCommit) throw new Error("publication branch changed during reconciliation");
  if (!await branchContainsProposal(git, options.localHub.root, fetched, unit.proposals[0]!.id)) {
    throw new Error("publication branch does not contain the selected proposal identity");
  }
  if (await includesCommit(git, options.localHub.root, baseCommit, fetched)) return fetched;
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-reconcile-"));
  const candidateRoot = path.join(temporaryRoot, "candidate");
  try {
    await git({ args: ["worktree", "add", "--detach", candidateRoot, fetched], cwd: options.localHub.root,
      operation: "create publication reconciliation candidate" });
    const timestamp = (await git({ args: ["show", "-s", "--format=%cI", baseCommit], cwd: options.localHub.root,
      operation: "read reconciliation timestamp", maximumOutputBytes: 256 })).stdout.trim();
    try {
      await git({ args: ["merge", "--no-edit", baseCommit], cwd: candidateRoot,
        operation: `reconcile publication branch ${unit.branch}`, commitTimestamp: timestamp,
        ...(options.signal ? { signal: options.signal } : {}) });
    } catch (error) {
      throw new Error(`publication conflict while reconciling ${unit.branch}`, { cause: error });
    }
    return await exactCommit(git, candidateRoot, "HEAD", "resolve reconciled publication branch");
  } finally {
    if (fs.existsSync(candidateRoot)) {
      try { await git({ args: ["worktree", "remove", "--force", candidateRoot], cwd: options.localHub.root,
        operation: "remove publication reconciliation candidate" }); } catch { /* original error remains authoritative */ }
    }
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
}

async function exactCommit(
  git: (request: GitRequest) => Promise<GitOutput>, root: string, revision: string, operation: string,
): Promise<string> {
  const commit = (await git({ args: ["rev-parse", "--verify", `${revision}^{commit}`], cwd: root, operation,
    maximumOutputBytes: 256 })).stdout.trim();
  if (!/^[a-f0-9]{40}$/.test(commit)) throw new Error(`${operation} did not resolve to an exact commit`);
  return commit;
}

async function replayProposal(
  options: PublishHubOptions,
  git: (request: GitRequest) => Promise<GitOutput>,
  proposal: PendingHubProposal,
  baseCommit: string,
): Promise<string> {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-publication-"));
  const candidateRoot = path.join(temporaryRoot, "candidate");
  try {
    await git({ args: ["worktree", "add", "--detach", candidateRoot, baseCommit], cwd: options.localHub.root,
      operation: "create isolated publication candidate" });
    const timestamp = (await git({ args: ["show", "-s", "--format=%cI", proposal.commit], cwd: options.localHub.root,
      operation: "read accepted proposal timestamp", maximumOutputBytes: 256 })).stdout.trim();
    try {
      await git({ args: ["cherry-pick", proposal.commit], cwd: candidateRoot,
        operation: `replay accepted Hub proposal ${proposal.id}`, commitTimestamp: timestamp,
        ...(options.signal ? { signal: options.signal } : {}) });
    } catch (error) {
      throw new Error(`publication conflict while replaying ${proposal.id}`, { cause: error });
    }
    return await exactCommit(git, candidateRoot, "HEAD", "resolve publication candidate");
  } finally {
    if (fs.existsSync(candidateRoot)) {
      try { await git({ args: ["worktree", "remove", "--force", candidateRoot], cwd: options.localHub.root,
        operation: "remove publication candidate" }); } catch { /* original error remains authoritative */ }
    }
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
}

function admitPull(
  pull: GitHubPullRequest,
  repository: string,
  unit: PublicationUnit,
  headCommit: string,
): HubPublicationUnitReceipt {
  if (pull.headRepository !== repository || pull.headBranch !== unit.branch
    || pull.headCommit !== headCommit || pull.baseBranch !== unit.baseBranch) {
    throw new Error("publication pull request identity mismatch");
  }
  return {
    proposalIds: unit.proposals.map((proposal) => proposal.id),
    branch: unit.branch,
    headCommit,
    baseBranch: unit.baseBranch,
    pullRequest: { number: pull.number, url: pull.url },
  };
}

async function publishUnit(
  options: PublishHubOptions,
  git: (request: GitRequest) => Promise<GitOutput>,
  mode: "batch" | "stack" | "independent",
  unit: PublicationUnit,
): Promise<HubPublicationUnitReceipt> {
  const base = await options.github.getBranchRef(unit.baseBranch);
  const existing = await options.github.findBranchRef(unit.branch);
  let headCommit: string;
  let pull: GitHubPullRequest | undefined;
  if (existing) {
    const allByHead = await options.github.listPullRequestsForHead(unit.branch, "all");
    const openByHead = await options.github.listPullRequestsForHead(unit.branch, "open");
    if (allByHead.length > 1 || openByHead.length > 1) throw new Error("multiple pull requests exist for the publication branch");
    if (allByHead.length === 1 && openByHead.length === 0) {
      throw new Error("publication pull request is closed; review the proposal before retrying");
    }
    pull = openByHead[0];
    if (!pull) {
      headCommit = unit.batchHeadCommit ?? await replayProposal(options, git, unit.proposals[0]!, base.commit);
      if (existing.commit !== headCommit) throw new Error("publication branch exists without a recoverable pull request");
    } else {
      headCommit = await reconcilePublicationBranch(options, git, unit, existing.commit, base.commit);
      if (headCommit !== existing.commit) {
        checkpoint(options.signal);
        await git({ args: ["push", "origin", `${headCommit}:refs/heads/${unit.branch}`], cwd: options.localHub.root,
          operation: "advance reconciled Hub publication branch", token: options.token,
          ...(options.signal ? { signal: options.signal } : {}) });
      }
      const remoteBranch = await options.github.getBranchRef(unit.branch);
      if (remoteBranch.commit !== headCommit) throw new Error("reconciled publication branch head mismatch");
      pull = pull.baseBranch === unit.baseBranch && pull.headCommit === headCommit
        ? pull
        : await options.github.updatePullRequestBase(pull.number, unit.branch, headCommit, unit.baseBranch);
    }
  } else {
    headCommit = unit.batchHeadCommit ?? await replayProposal(options, git, unit.proposals[0]!, base.commit);
  }
  if (!existing) {
    checkpoint(options.signal);
    await git({
      args: ["push", "origin", `${headCommit}:refs/heads/${unit.branch}`],
      cwd: options.localHub.root,
      operation: "push accepted Hub publication unit",
      token: options.token,
      ...(options.signal ? { signal: options.signal } : {}),
    });
  }
  const remoteBranch = await options.github.getBranchRef(unit.branch);
  if (remoteBranch.commit !== headCommit) throw new Error("publication branch head mismatch");
  const allPulls = pull ? [] : await options.github.listPullRequests(unit.branch, unit.baseBranch, "all");
  const openPulls = pull ? [] : await options.github.listPullRequests(unit.branch, unit.baseBranch, "open");
  if (!pull && (allPulls.length > 1 || openPulls.length > 1)) throw new Error("multiple pull requests exist for the publication branch and base");
  if (!pull && allPulls.length === 1 && openPulls.length === 0) {
    throw new Error("publication pull request is closed; review the stack before retrying");
  }
  pull ??= openPulls[0];
  if (pull && pull.headCommit !== headCommit) throw new Error("existing pull request has a conflicting head commit");
  checkpoint(options.signal);
  if (!pull) {
    const review = renderPublicationReview({
      stateRoot: options.stateRoot,
      proposals: unit.proposals,
      publicationMode: mode,
      baseBranch: unit.baseBranch,
    });
    pull = await options.github.createPullRequest(
      unit.branch,
      headCommit,
      review.title,
      review.body,
      unit.baseBranch,
    );
  }
  return admitPull(pull, options.localHub.hub.repository, unit, headCommit);
}

export async function publishPendingHubProposals(
  options: PublishHubOptions,
): Promise<HubBatchPublicationReceipt> {
  if (!options.token) throw new Error("Hub publication requires the dedicated token");
  checkpoint(options.signal);
  const git = options.git ?? runGit;
  const lock = acquireHubMutationLock(options.stateRoot, `publish:${Date.now().toString(36)}`);
  try {
    const pending = await listPendingHubProposals(options.localHub, git);
    const batch = options.publicationMode === "batch";
    const selected = batch
      ? selectPendingPrefix(pending, options.selectedProposalIds)
      : selectPendingProposals(pending, options.selectedProposalIds);
    const repository = await options.github.getRepository();
    if (repository.fullName !== options.localHub.hub.repository) throw new Error("GitHub Hub identity mismatch");
    const target = await options.github.getBranchRef(options.localHub.hub.targetBranch);
    if (target.commit !== options.localHub.remoteBase) {
      throw new Error("remote Hub main drifted; synchronize before publication");
    }
    const id = publicationIdentity(options.localHub, selected);
    const planned = publicationUnits(options.localHub, pending, selected, id, batch);
    const units: HubPublicationUnitReceipt[] = [];
    try {
      for (const unit of planned.units) units.push(await publishUnit(options, git, planned.mode, unit));
    } catch (error) {
      const completed = units.map((unit) => unit.pullRequest.url).join(", ");
      throw new Error(`Hub publication stopped after ${units.length}/${planned.units.length} unit(s)${completed ? ` (${completed})` : ""}; retry the same selection after repair`, { cause: error });
    }
    const finalUnit = units.at(-1)!;
    const receipt: HubBatchPublicationReceipt = {
      id,
      mode: planned.mode,
      repository: options.localHub.hub.repository,
      remoteBase: options.localHub.remoteBase,
      proposalIds: selected.map((item) => item.id),
      commits: selected.map((item) => item.commit),
      units,
      branch: finalUnit.branch,
      headCommit: finalUnit.headCommit,
      pullRequest: finalUnit.pullRequest,
    };
    writeAtomicJson(path.join(options.stateRoot, "publications", `${id}.json`), receipt);
    return receipt;
  } finally {
    releaseHubMutationLock(lock);
  }
}
