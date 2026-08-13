import fs from "node:fs";
import path from "node:path";

import { advanceHubProposal, assertHubRemote, type HubIdentity, type HubProposal } from "../../core/hub/index.ts";
import { computeOkfTreeDigest, loadOkfBundle, readProposalMetadata } from "../../core/knowledge/index.ts";
import type { GitOutput, GitRequest, GitHubPullRequest, GitHubRef, GitHubRepository } from "../../providers/github-hub/index.ts";
import { readHubProposalState, writeHubProposalState } from "./proposal-state.ts";

export type SubmissionGit = (request: GitRequest) => Promise<GitOutput>;
export type SubmissionGitHub = Readonly<{
  getRepository(): Promise<GitHubRepository>;
  getBranchRef(branch: string): Promise<GitHubRef>;
  findBranchRef(branch: string): Promise<GitHubRef | undefined>;
  listOpenPullRequests(headBranch: string): Promise<readonly GitHubPullRequest[]>;
  createPullRequest(headBranch: string, headCommit: string, title: string, body: string): Promise<GitHubPullRequest>;
}>;
export type SubmitHubOptions = Readonly<{
  configuredHub: HubIdentity;
  proposalRoot: string;
  checkoutRoot: string;
  token: string;
  expectedDiffDigest: string;
  git: SubmissionGit;
  github: SubmissionGitHub;
  signal?: AbortSignal;
}>;
export type HubPublicationReceipt = Readonly<{
  repository: string;
  targetBranch: string;
  branch: string;
  commit: string;
  pullRequest: Readonly<{ number: number; url: string }>;
}>;

function checkpoint(signal?: AbortSignal): void {
  if (signal?.aborted) throw new Error("Hub submission cancelled");
}

function assertNoUrlRewrites(output: string): void {
  const keys = output.split("\0").map((entry) => entry.split("\n")[0]?.toLocaleLowerCase());
  if (keys.some((key) => key?.startsWith("url.") && key.endsWith(".insteadof"))) {
    throw new Error("Hub checkout local Git config contains a forbidden URL rewrite");
  }
}

function sameHub(left: HubIdentity, right: HubIdentity): boolean {
  return left.repository === right.repository
    && left.targetBranch === right.targetBranch
    && left.canonicalHttpsUrl === right.canonicalHttpsUrl;
}

function clearOwnedCheckout(root: string): void {
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (entry.name === ".git") continue;
    fs.rmSync(path.join(root, entry.name), { recursive: true, force: true });
  }
}

function copyReviewedBundle(source: string, checkoutRoot: string): void {
  const bundle = loadOkfBundle(source, { requireAgentBaseRootIndex: true });
  if (bundle.files.some((relative) => relative === ".git" || relative.startsWith(".git/"))) {
    throw new Error("reviewed Hub bundle cannot contain Git control files");
  }
  clearOwnedCheckout(checkoutRoot);
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) throw new Error("reviewed Hub bundle cannot contain symlinks");
    fs.cpSync(path.join(source, entry.name), path.join(checkoutRoot, entry.name), {
      recursive: true,
      errorOnExist: true,
      force: false,
    });
  }
  for (const relative of bundle.files) {
    const copied = fs.readFileSync(path.join(checkoutRoot, ...relative.split("/")));
    if (!copied.equals(fs.readFileSync(path.join(source, ...relative.split("/"))))) {
      throw new Error(`copied proposal bytes mismatch: ${relative}`);
    }
  }
}

async function createExactCommit(
  proposal: HubProposal,
  options: SubmitHubOptions,
  bundleRoot: string,
): Promise<string> {
  const commitTimestamp = readProposalMetadata(options.proposalRoot).createdAt;
  if (!commitTimestamp || Number.isNaN(Date.parse(commitTimestamp))) {
    throw new Error("Hub proposal creation timestamp is invalid");
  }
  await options.git({ args: ["checkout", "--detach", "--force", proposal.baseCommit], cwd: options.checkoutRoot, operation: "reset proposal base" });
  copyReviewedBundle(bundleRoot, options.checkoutRoot);
  await options.git({ args: ["add", "--all"], cwd: options.checkoutRoot, operation: "stage reviewed proposal" });
  await options.git({
    args: [
      "-c", "user.name=AgentBase",
      "-c", "user.email=agentbase@localhost",
      "commit", "--no-gpg-sign", "--no-verify", "-m", `AgentBase OKF proposal ${proposal.id}`,
    ],
    cwd: options.checkoutRoot,
    operation: "commit reviewed proposal",
    commitTimestamp,
    ...(options.signal ? { signal: options.signal } : {}),
  });
  const output = await options.git({ args: ["rev-parse", "HEAD"], cwd: options.checkoutRoot, operation: "resolve proposal commit" });
  const commit = output.stdout.trim();
  if (!/^[a-f0-9]{40}$/.test(commit)) throw new Error("proposal commit is invalid");
  return commit;
}

async function admitBase(proposal: HubProposal, options: SubmitHubOptions): Promise<void> {
  assertHubRemote(options.configuredHub, proposal.hub.canonicalHttpsUrl);
  if (!sameHub(proposal.hub, options.configuredHub)) throw new Error("proposal Hub identity no longer matches configuration");
  const remote = await options.git({ args: ["remote", "get-url", "origin"], cwd: options.checkoutRoot, operation: "verify Hub origin" });
  assertHubRemote(options.configuredHub, remote.stdout.trim());
  const config = await options.git({ args: ["config", "--local", "--null", "--list"], cwd: options.checkoutRoot, operation: "inspect Hub Git config" });
  assertNoUrlRewrites(config.stdout);
  const repository = await options.github.getRepository();
  if (repository.fullName !== proposal.hub.repository) throw new Error("GitHub repository identity mismatch");
  const target = await options.github.getBranchRef(proposal.hub.targetBranch);
  if (target.commit !== proposal.baseCommit) throw new Error("Hub target base drifted; prepare and review a new proposal");
}

function receipt(proposal: HubProposal): HubPublicationReceipt {
  if (!proposal.commit || !proposal.pullRequest) throw new Error("published proposal receipt is incomplete");
  return {
    repository: proposal.hub.repository,
    targetBranch: proposal.hub.targetBranch,
    branch: proposal.branch,
    commit: proposal.commit,
    pullRequest: proposal.pullRequest,
  };
}

function admitPullRequest(proposal: HubProposal, pull: GitHubPullRequest, commit: string): void {
  if (pull.headRepository !== proposal.hub.repository || pull.headBranch !== proposal.branch
    || pull.headCommit !== commit || pull.baseBranch !== proposal.hub.targetBranch) {
    throw new Error("pull request identity does not match the exact Hub proposal");
  }
}

export async function submitHubProposal(options: SubmitHubOptions): Promise<HubPublicationReceipt> {
  checkpoint(options.signal);
  let proposal = readHubProposalState(options.proposalRoot);
  if (proposal.diffDigest !== options.expectedDiffDigest) throw new Error("review confirmation does not match proposal diff");
  const bundleRoot = path.join(options.proposalRoot, "bundle");
  if (computeOkfTreeDigest(bundleRoot) !== proposal.treeDigest) throw new Error("reviewed proposal bytes changed after inspection");
  await admitBase(proposal, options);
  if (proposal.phase === "pr-opened") return receipt(proposal);
  if (proposal.phase === "prepared") {
    checkpoint(options.signal);
    const commit = await createExactCommit(proposal, options, bundleRoot);
    proposal = advanceHubProposal(proposal, "committed", { commit });
    writeHubProposalState(options.proposalRoot, proposal);
  }
  if (!proposal.commit) throw new Error("proposal commit is missing");
  const proposalCommit = proposal.commit;
  const existingBranch = await options.github.findBranchRef(proposal.branch);
  if (existingBranch && existingBranch.commit !== proposalCommit) throw new Error("proposal branch exists at a conflicting commit");
  if (proposal.phase === "committed" && !existingBranch) {
    checkpoint(options.signal);
    const refspec = `${proposalCommit}:refs/heads/${proposal.branch}`;
    await options.git({
      args: ["push", "origin", refspec], cwd: options.checkoutRoot,
      operation: "push proposal branch", token: options.token,
      ...(options.signal ? { signal: options.signal } : {}),
    });
  }
  const remoteBranch = existingBranch ?? await options.github.getBranchRef(proposal.branch);
  if (remoteBranch.commit !== proposalCommit) throw new Error("remote proposal branch commit mismatch");
  if (proposal.phase === "committed") {
    proposal = advanceHubProposal(proposal, "pushed");
    writeHubProposalState(options.proposalRoot, proposal);
  }
  const existingPulls = await options.github.listOpenPullRequests(proposal.branch);
  if (existingPulls.length > 1) throw new Error("multiple open pull requests exist for proposal branch");
  let pull = existingPulls[0];
  if (pull && pull.headCommit !== proposalCommit) throw new Error("existing pull request has a conflicting head commit");
  checkpoint(options.signal);
  pull ??= await options.github.createPullRequest(
    proposal.branch,
    proposalCommit,
    `AgentBase OKF proposal ${proposal.id}`,
    `Reviewed ${proposal.mode} proposal based on ${proposal.baseCommit}.`,
  );
  admitPullRequest(proposal, pull, proposalCommit);
  proposal = advanceHubProposal(proposal, "pr-opened", { pullRequest: { number: pull.number, url: pull.url } });
  writeHubProposalState(options.proposalRoot, proposal);
  return receipt(proposal);
}
