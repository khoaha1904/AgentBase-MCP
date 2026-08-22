import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

import type { LocalHubState } from "../../../core/hub/index.ts";
import {
  createCandidateWorktree,
  removeCandidateWorktree,
  runGit,
  type GitOutput,
  type GitRequest,
  type GitHubPullRequest,
  type GitHubRef,
  type GitHubRepository,
} from "../../../providers/github-hub/index.ts";
import { acquireHubMutationLock, releaseHubMutationLock } from "../review/proposal-state.ts";
import { HUB_CI_FORMAT_VERSION, HUB_CI_WORKFLOW_PATH, hubCiWorkflowDigest, renderHubCiWorkflow } from "./workflow.ts";

export type HubCiUpgradeGitHub = Readonly<{
  getRepository(): Promise<GitHubRepository>;
  getBranchRef(branch: string): Promise<GitHubRef>;
  findBranchRef(branch: string): Promise<GitHubRef | undefined>;
  listPullRequestsForHead(branch: string, state: "open" | "all"): Promise<readonly GitHubPullRequest[]>;
  createPullRequest(headBranch: string, headCommit: string, title: string, body: string, baseBranch: string): Promise<GitHubPullRequest>;
}>;

export type HubCiUpgradeIntent = Readonly<{
  repository: string;
  target_branch: "main";
  base_commit: string;
  state: "missing" | "current" | "outdated";
  workflow_path: typeof HUB_CI_WORKFLOW_PATH;
  workflow_format: typeof HUB_CI_FORMAT_VERSION;
  workflow_digest: string;
  head_branch: string;
}>;

export type HubCiUpgradeResult = Readonly<{
  intent: HubCiUpgradeIntent;
  result: "current" | "created" | "recovered";
  head_commit?: string;
  pull_request?: Readonly<{ number: number; url: string }>;
}>;

export type HubCiUpgradeOptions = Readonly<{
  stateRoot: string;
  localHub: LocalHubState;
  token: string;
  github: HubCiUpgradeGitHub;
  git?: (request: GitRequest) => Promise<GitOutput>;
  createdAt?: string;
}>;

function branch(): string { return `agentbase/hub-ci-${hubCiWorkflowDigest().slice(7, 19)}`; }

function workflowBlob(): string {
  const bytes = Buffer.from(renderHubCiWorkflow());
  return createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex");
}

async function workflowAt(localHub: LocalHubState, commit: string,
  git: (request: GitRequest) => Promise<GitOutput>): Promise<string | undefined> {
  const paths = await git({ args: ["ls-tree", "-r", "--name-only", "-z", commit, "--", HUB_CI_WORKFLOW_PATH],
    cwd: localHub.root, operation: "inspect Hub CI workflow path", maximumOutputBytes: 4096 });
  if (!paths.stdout.split("\0").includes(HUB_CI_WORKFLOW_PATH)) return undefined;
  const blob = (await git({ args: ["rev-parse", `${commit}:${HUB_CI_WORKFLOW_PATH}`], cwd: localHub.root,
    operation: "resolve Hub CI workflow blob", maximumOutputBytes: 256 })).stdout.trim();
  if (!/^[a-f0-9]{40}$/.test(blob)) throw new Error("Hub CI workflow blob is invalid");
  return blob;
}

export async function previewHubCiUpgrade(options: HubCiUpgradeOptions): Promise<HubCiUpgradeIntent> {
  if (!options.token) throw new Error("Hub CI upgrade requires the dedicated Hub token");
  const repository = await options.github.getRepository();
  if (repository.fullName !== options.localHub.hub.repository || repository.defaultBranch !== "main") {
    throw new Error("Hub CI upgrade repository identity or target branch changed");
  }
  const main = await options.github.getBranchRef("main");
  if (main.commit !== options.localHub.remoteBase) {
    throw new Error("Published Hub main changed; synchronize before previewing CI upgrade");
  }
  const current = await workflowAt(options.localHub, main.commit, options.git ?? runGit);
  return {
    repository: repository.fullName,
    target_branch: "main",
    base_commit: main.commit,
    state: current === undefined ? "missing" : current === workflowBlob() ? "current" : "outdated",
    workflow_path: HUB_CI_WORKFLOW_PATH,
    workflow_format: HUB_CI_FORMAT_VERSION,
    workflow_digest: hubCiWorkflowDigest(),
    head_branch: branch(),
  };
}

async function validateRemoteHead(options: HubCiUpgradeOptions, intent: HubCiUpgradeIntent, head: string): Promise<void> {
  const git = options.git ?? runGit, ref = `refs/agentbase/ci/${intent.workflow_digest.slice(7, 19)}`;
  await git({ args: ["fetch", "--no-tags", "origin", `+refs/heads/${intent.head_branch}:${ref}`], cwd: options.localHub.root,
    operation: "fetch existing Hub CI branch", token: options.token });
  const fetched = (await git({ args: ["rev-parse", ref], cwd: options.localHub.root,
    operation: "resolve existing Hub CI branch", maximumOutputBytes: 256 })).stdout.trim();
  if (fetched !== head) throw new Error("Hub CI branch changed during recovery");
  const ancestry = (await git({ args: ["rev-list", "--parents", "-n", "1", head], cwd: options.localHub.root,
    operation: "validate Hub CI branch ancestry", maximumOutputBytes: 512 })).stdout.trim().split(/\s+/);
  if (ancestry.length !== 2 || ancestry[1] !== intent.base_commit) throw new Error("existing Hub CI branch is not based on reviewed main");
  const changed = (await git({ args: ["diff-tree", "--no-commit-id", "--name-only", "-r", "-z", head], cwd: options.localHub.root,
    operation: "validate Hub CI branch scope", maximumOutputBytes: 4096 })).stdout.split("\0").filter(Boolean);
  if (changed.length !== 1 || changed[0] !== HUB_CI_WORKFLOW_PATH) throw new Error("existing Hub CI branch changes files outside the workflow");
  const blob = (await git({ args: ["rev-parse", `${head}:${HUB_CI_WORKFLOW_PATH}`], cwd: options.localHub.root,
    operation: "validate Hub CI branch bytes", maximumOutputBytes: 256 })).stdout.trim();
  if (blob !== workflowBlob()) throw new Error("existing Hub CI branch has unexpected workflow bytes");
}

function reviewBody(intent: HubCiUpgradeIntent): string {
  return ["## Purpose", "", "Install or update AgentBase-Hub CI without changing knowledge.", "",
    "## Scope", "", `- Base: \`${intent.base_commit}\``, `- Workflow: \`${intent.workflow_path}\``,
    `- Template: v${intent.workflow_format} · \`${intent.workflow_digest}\``, "",
    "## Behavior", "", "- Blocks invalid OKF and obvious sensitive content.",
    "- Reports Repository freshness as warning-only context.", "- Uses read-only GitHub Actions permissions and no MCP token.", "",
    "## Reviewer action", "", "Review the workflow and checks. Merge only after the pinned AgentBase release tag exists.", ""].join("\n");
}

export async function submitHubCiUpgrade(
  options: HubCiUpgradeOptions,
  expected: Readonly<{ baseCommit: string; workflowDigest: string }>,
): Promise<HubCiUpgradeResult> {
  const intent = await previewHubCiUpgrade(options);
  if (expected.baseCommit !== intent.base_commit || expected.workflowDigest !== intent.workflow_digest) {
    throw new Error("Hub CI upgrade preview changed");
  }
  if (intent.state === "current") return { intent, result: "current" };
  const lock = acquireHubMutationLock(options.stateRoot, `hub-ci:${intent.workflow_digest.slice(7, 19)}`);
  try {
    const existing = await options.github.findBranchRef(intent.head_branch);
    if (existing) {
      await validateRemoteHead(options, intent, existing.commit);
      const openPulls = await options.github.listPullRequestsForHead(intent.head_branch, "open");
      const allPulls = await options.github.listPullRequestsForHead(intent.head_branch, "all");
      if (openPulls.length > 1 || allPulls.length > 1
        || allPulls.some((pull) => pull.headCommit !== existing.commit || pull.baseBranch !== "main")) {
        throw new Error("Hub CI branch has ambiguous pull request state");
      }
      if (openPulls.length === 1) return { intent, result: "recovered", head_commit: existing.commit,
        pull_request: { number: openPulls[0]!.number, url: openPulls[0]!.url } };
      if (allPulls.length) throw new Error("Hub CI branch belongs to a closed pull request");
      const pull = await options.github.createPullRequest(intent.head_branch, existing.commit,
        "Install AgentBase-Hub CI", reviewBody(intent), "main");
      return { intent, result: "recovered", head_commit: existing.commit,
        pull_request: { number: pull.number, url: pull.url } };
    }
    const git = options.git ?? runGit;
    fs.mkdirSync(path.resolve(options.stateRoot), { recursive: true, mode: 0o700 });
    const parent = fs.mkdtempSync(path.join(path.resolve(options.stateRoot), "hub-ci-"));
    const candidate = path.join(parent, "hub");
    try {
      await createCandidateWorktree(options.localHub.root, candidate, intent.base_commit);
      const workflow = path.join(candidate, ...HUB_CI_WORKFLOW_PATH.split("/"));
      fs.mkdirSync(path.dirname(workflow), { recursive: true });
      fs.writeFileSync(workflow, renderHubCiWorkflow());
      await git({ args: ["add", HUB_CI_WORKFLOW_PATH], cwd: candidate, operation: "stage Hub CI workflow" });
      await git({ args: ["-c", "user.name=AgentBase", "-c", "user.email=agentbase@localhost", "commit", "--no-gpg-sign", "--no-verify",
        "-m", `Install AgentBase-Hub CI v${HUB_CI_FORMAT_VERSION}`], cwd: candidate,
      operation: "commit Hub CI workflow", commitTimestamp: options.createdAt ?? new Date().toISOString() });
      const head = (await git({ args: ["rev-parse", "HEAD"], cwd: candidate,
        operation: "resolve Hub CI commit", maximumOutputBytes: 256 })).stdout.trim();
      if (!/^[a-f0-9]{40}$/.test(head)) throw new Error("Hub CI commit is invalid");
      await git({ args: ["push", "origin", `${head}:refs/heads/${intent.head_branch}`], cwd: candidate,
        operation: "push Hub CI branch", token: options.token });
      const pull = await options.github.createPullRequest(intent.head_branch, head,
        "Install AgentBase-Hub CI", reviewBody(intent), "main");
      return { intent, result: "created", head_commit: head,
        pull_request: { number: pull.number, url: pull.url } };
    } finally {
      if (fs.existsSync(candidate)) await removeCandidateWorktree(options.localHub.root, candidate);
      fs.rmSync(parent, { recursive: true, force: true });
    }
  } finally { releaseHubMutationLock(lock); }
}
