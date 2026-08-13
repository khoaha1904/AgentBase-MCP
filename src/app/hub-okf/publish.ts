import { createHash } from "node:crypto";
import path from "node:path";

import type { LocalHubState } from "../../core/hub/index.ts";
import type {
  GitHubPullRequest,
  GitHubRef,
  GitHubRepository,
  GitOutput,
  GitRequest,
} from "../../providers/github-hub/index.ts";
import { runGit } from "../../providers/github-hub/index.ts";
import { listPendingHubProposals, selectPendingPrefix, type PendingHubProposal } from "./pending.ts";
import { acquireHubMutationLock, releaseHubMutationLock, writeAtomicJson } from "./proposal-state.ts";

export type PublishGitHub = Readonly<{
  getRepository(): Promise<GitHubRepository>;
  getBranchRef(branch: string): Promise<GitHubRef>;
  findBranchRef(branch: string): Promise<GitHubRef | undefined>;
  listOpenPullRequests(headBranch: string): Promise<readonly GitHubPullRequest[]>;
  createPullRequest(
    headBranch: string,
    headCommit: string,
    title: string,
    body: string,
  ): Promise<GitHubPullRequest>;
}>;

export type PublishHubOptions = Readonly<{
  stateRoot: string;
  localHub: LocalHubState;
  selectedProposalIds: readonly string[];
  token: string;
  github: PublishGitHub;
  git?: (request: GitRequest) => Promise<GitOutput>;
  signal?: AbortSignal;
}>;

export type HubBatchPublicationReceipt = Readonly<{
  id: string;
  repository: string;
  remoteBase: string;
  proposalIds: readonly string[];
  commits: readonly string[];
  branch: string;
  headCommit: string;
  pullRequest: Readonly<{ number: number; url: string }>;
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
    const branch = `agentbase/publish-${id}`;
    const headCommit = selected.at(-1)!.commit;
    const existing = await options.github.findBranchRef(branch);
    if (existing && existing.commit !== headCommit) throw new Error("publication branch exists at a conflicting commit");
    if (!existing) {
      checkpoint(options.signal);
      await git({
        args: ["push", "origin", `${headCommit}:refs/heads/${branch}`],
        cwd: options.localHub.root,
        operation: "push selected pending proposals",
        token: options.token,
        ...(options.signal ? { signal: options.signal } : {}),
      });
    }
    const remoteBranch = existing ?? await options.github.getBranchRef(branch);
    if (remoteBranch.commit !== headCommit) throw new Error("publication branch head mismatch");
    const existingPulls = await options.github.listOpenPullRequests(branch);
    if (existingPulls.length > 1) throw new Error("multiple pull requests exist for the publication branch");
    let pull = existingPulls[0];
    checkpoint(options.signal);
    pull ??= await options.github.createPullRequest(
      branch,
      headCommit,
      `AgentBase-Hub publication ${id}`,
      `Publishes ${selected.length} accepted local OKF proposal(s) based on ${options.localHub.remoteBase}.`,
    );
    if (pull.headRepository !== options.localHub.hub.repository
      || pull.headBranch !== branch
      || pull.headCommit !== headCommit
      || pull.baseBranch !== options.localHub.hub.targetBranch) {
      throw new Error("publication pull request identity mismatch");
    }
    const receipt: HubBatchPublicationReceipt = {
      id,
      repository: options.localHub.hub.repository,
      remoteBase: options.localHub.remoteBase,
      proposalIds: selected.map((item) => item.id),
      commits: selected.map((item) => item.commit),
      branch,
      headCommit,
      pullRequest: { number: pull.number, url: pull.url },
    };
    writeAtomicJson(path.join(options.stateRoot, "publications", `${id}.json`), receipt);
    return receipt;
  } finally {
    releaseHubMutationLock(lock);
  }
}
