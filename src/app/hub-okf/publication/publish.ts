import { createHash } from "node:crypto";
import path from "node:path";

import type { LocalHubState } from "../../../core/hub/index.ts";
import type {
  GitHubPullRequest,
  GitHubRef,
  GitHubRepository,
  GitOutput,
  GitRequest,
} from "../../../providers/github-hub/index.ts";
import { runGit } from "../../../providers/github-hub/index.ts";
import { listPendingHubProposals, selectPendingPrefix, type PendingHubProposal } from "../review/pending.ts";
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
  createPullRequest(
    headBranch: string,
    headCommit: string,
    title: string,
    body: string,
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
  mode: "batch" | "stack";
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
  headCommit: string;
  baseBranch: string;
  baseCommit: string;
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

function isStack(selected: readonly PendingHubProposal[]): boolean {
  const first = selected[0];
  return selected.length > 1 && first?.mode === "new"
    && selected.every((proposal, index) => index === 0 || proposal.mode === "refresh")
    && selected.every((proposal) => proposal.sourceRepositoryId === first.sourceRepositoryId);
}

function publicationUnits(
  localHub: LocalHubState,
  selected: readonly PendingHubProposal[],
  id: string,
  allowStack: boolean,
): Readonly<{ mode: "batch" | "stack"; units: readonly PublicationUnit[] }> {
  if (!allowStack || !isStack(selected)) {
    return {
      mode: "batch",
      units: [{
        proposals: selected,
        branch: `agentbase/publish-${id}`,
        headCommit: selected.at(-1)!.commit,
        baseBranch: localHub.hub.targetBranch,
        baseCommit: localHub.remoteBase,
      }],
    };
  }
  return {
    mode: "stack",
    units: selected.map((proposal, index) => ({
      proposals: [proposal],
      branch: `agentbase/okf-${proposal.id}`,
      headCommit: proposal.commit,
      baseBranch: index === 0 ? localHub.hub.targetBranch : `agentbase/okf-${selected[index - 1]!.id}`,
      baseCommit: index === 0 ? localHub.remoteBase : selected[index - 1]!.commit,
    })),
  };
}

function admitPull(
  pull: GitHubPullRequest,
  repository: string,
  unit: PublicationUnit,
): HubPublicationUnitReceipt {
  if (pull.headRepository !== repository || pull.headBranch !== unit.branch
    || pull.headCommit !== unit.headCommit || pull.baseBranch !== unit.baseBranch) {
    throw new Error("publication pull request identity mismatch");
  }
  return {
    proposalIds: unit.proposals.map((proposal) => proposal.id),
    branch: unit.branch,
    headCommit: unit.headCommit,
    baseBranch: unit.baseBranch,
    pullRequest: { number: pull.number, url: pull.url },
  };
}

async function publishUnit(
  options: PublishHubOptions,
  git: (request: GitRequest) => Promise<GitOutput>,
  mode: "batch" | "stack",
  unit: PublicationUnit,
): Promise<HubPublicationUnitReceipt> {
  const base = await options.github.getBranchRef(unit.baseBranch);
  if (base.commit !== unit.baseCommit) throw new Error(`publication base branch drifted: ${unit.baseBranch}`);
  const existing = await options.github.findBranchRef(unit.branch);
  if (existing && existing.commit !== unit.headCommit) throw new Error("publication branch exists at a conflicting commit");
  if (!existing) {
    checkpoint(options.signal);
    await git({
      args: ["push", "origin", `${unit.headCommit}:refs/heads/${unit.branch}`],
      cwd: options.localHub.root,
      operation: "push accepted Hub publication unit",
      token: options.token,
      ...(options.signal ? { signal: options.signal } : {}),
    });
  }
  const remoteBranch = existing ?? await options.github.getBranchRef(unit.branch);
  if (remoteBranch.commit !== unit.headCommit) throw new Error("publication branch head mismatch");
  const allPulls = await options.github.listPullRequests(unit.branch, unit.baseBranch, "all");
  const openPulls = await options.github.listPullRequests(unit.branch, unit.baseBranch, "open");
  if (allPulls.length > 1 || openPulls.length > 1) throw new Error("multiple pull requests exist for the publication branch and base");
  if (allPulls.length === 1 && openPulls.length === 0) {
    throw new Error("publication pull request is closed; review the stack before retrying");
  }
  let pull = openPulls[0];
  if (pull && pull.headCommit !== unit.headCommit) throw new Error("existing pull request has a conflicting head commit");
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
      unit.headCommit,
      review.title,
      review.body,
      unit.baseBranch,
    );
  }
  return admitPull(pull, options.localHub.hub.repository, unit);
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
    const selected = selectPendingPrefix(pending, options.selectedProposalIds);
    const repository = await options.github.getRepository();
    if (repository.fullName !== options.localHub.hub.repository) throw new Error("GitHub Hub identity mismatch");
    const target = await options.github.getBranchRef(options.localHub.hub.targetBranch);
    if (target.commit !== options.localHub.remoteBase) {
      throw new Error("remote Hub main drifted; synchronize before publication");
    }
    const id = publicationIdentity(options.localHub, selected);
    const planned = publicationUnits(options.localHub, selected, id, options.publicationMode !== "batch");
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
