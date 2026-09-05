import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

import type { LocalHubState } from "../../../core/hub/index.ts";
import {
  createCandidateWorktree, removeCandidateWorktree, runGit,
  type GitOutput, type GitRequest, type GitHubPullRequest, type GitHubRef, type GitHubRepository,
} from "../../../providers/github-hub/index.ts";
import { acquireHubMutationLock, hubMutationProfileId, releaseHubMutationLock } from "../review/proposal-state.ts";
import { HUB_README_PATH, renderHubReadme } from "../workspace/readme.ts";
import { renderHubCiBundle, type HubCiBundle } from "./artifact.ts";
import { HUB_CI_FORMAT_VERSION } from "./workflow.ts";

export type HubInitializationGitHub = Readonly<{
  getRepository(): Promise<GitHubRepository>;
  getBranchRef(branch: string): Promise<GitHubRef>;
  findBranchRef(branch: string): Promise<GitHubRef | undefined>;
  listPullRequestsForHead(branch: string, state: "open" | "all"): Promise<readonly GitHubPullRequest[]>;
  createPullRequest(headBranch: string, headCommit: string, title: string, body: string, baseBranch: string): Promise<GitHubPullRequest>;
}>;

export type HubInitializationIntent = Readonly<{
  repository: string;
  target_branch: string;
  base_commit: string;
  state: "current" | "changes-required";
  readme_state: "missing" | "present";
  ci_state: "missing" | "current" | "outdated";
  change_paths: readonly string[];
  ci_format: typeof HUB_CI_FORMAT_VERSION;
  initialization_digest: string;
  head_branch: string;
}>;

export type HubInitializationResult = Readonly<{
  intent: HubInitializationIntent;
  result: "current" | "created" | "recovered";
  head_commit?: string;
  pull_request?: Readonly<{ number: number; url: string }>;
}>;

export type HubInitializationOptions = Readonly<{
  stateRoot: string;
  localHub: LocalHubState;
  token: string;
  github: HubInitializationGitHub;
  git?: (request: GitRequest) => Promise<GitOutput>;
  createdAt?: string;
}>;

function gitBlob(bytes: Buffer): string {
  return createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex");
}

function filesDigest(files: Readonly<Record<string, Buffer>>): string {
  const hash = createHash("sha256");
  for (const [relative, bytes] of Object.entries(files).sort(([left], [right]) => left.localeCompare(right))) {
    hash.update(`${relative}\0${bytes.length}\0`); hash.update(bytes); hash.update("\0");
  }
  return `sha256:${hash.digest("hex")}`;
}

async function fetchRemoteMain(options: HubInitializationOptions, expected: string): Promise<void> {
  const git = options.git ?? runGit, ref = "refs/agentbase/hub-initialization/base";
  await git({ args: ["fetch", "--no-tags", "origin", `+refs/heads/${options.localHub.hub.targetBranch}:${ref}`], cwd: options.localHub.root,
    operation: "fetch Hub initialization base", token: options.token });
  const fetched = (await git({ args: ["rev-parse", `${ref}^{commit}`], cwd: options.localHub.root,
    operation: "resolve Hub initialization base", maximumOutputBytes: 256 })).stdout.trim();
  if (fetched !== expected) throw new Error("Published Hub main changed during initialization preview");
}

async function presentPaths(localHub: LocalHubState, commit: string, expected: readonly string[],
  git: (request: GitRequest) => Promise<GitOutput>): Promise<readonly string[]> {
  return (await git({ args: ["ls-tree", "-r", "--name-only", "-z", commit, "--", ...expected],
    cwd: localHub.root, operation: "inspect Hub initialization paths", maximumOutputBytes: 4096 }))
    .stdout.split("\0").filter(Boolean).sort();
}

async function ciStateAt(localHub: LocalHubState, commit: string, bundle: HubCiBundle,
  git: (request: GitRequest) => Promise<GitOutput>): Promise<"missing" | "current" | "outdated"> {
  const expected = Object.keys(bundle.files).sort(), paths = await presentPaths(localHub, commit, expected, git);
  if (!paths.length) return "missing";
  if (paths.length !== expected.length || paths.some((value, index) => value !== expected[index])) return "outdated";
  for (const relative of expected) {
    const blob = (await git({ args: ["rev-parse", `${commit}:${relative}`], cwd: localHub.root,
      operation: "resolve Hub CI blob", maximumOutputBytes: 256 })).stdout.trim();
    if (blob !== gitBlob(bundle.files[relative]!)) return "outdated";
  }
  return "current";
}

function intendedFiles(readme: HubInitializationIntent["readme_state"], ci: HubInitializationIntent["ci_state"], targetBranch: string): Readonly<Record<string, Buffer>> {
  return {
    ...(readme === "missing" ? { [HUB_README_PATH]: Buffer.from(renderHubReadme()) } : {}),
    ...(ci === "current" ? {} : renderHubCiBundle(targetBranch).files),
  };
}

function branch(digest: string): string { return `agentbase/hub-init-${digest.slice(7, 19)}`; }

export async function previewHubInitialization(options: HubInitializationOptions): Promise<HubInitializationIntent> {
  if (!options.token) throw new Error("Hub initialization requires the dedicated Hub token");
  const repository = await options.github.getRepository();
  if (repository.fullName !== options.localHub.hub.repository) {
    throw new Error("Hub initialization repository identity or target branch changed");
  }
  const main = await options.github.getBranchRef(options.localHub.hub.targetBranch);
  await fetchRemoteMain(options, main.commit);
  const git = options.git ?? runGit, bundle = renderHubCiBundle(options.localHub.hub.targetBranch);
  const readmeState = (await presentPaths(options.localHub, main.commit, [HUB_README_PATH], git)).length ? "present" : "missing";
  const ciState = await ciStateAt(options.localHub, main.commit, bundle, git);
  const files = intendedFiles(readmeState, ciState, options.localHub.hub.targetBranch), digest = filesDigest(files), paths = Object.keys(files).sort();
  return {
    repository: repository.fullName, target_branch: options.localHub.hub.targetBranch, base_commit: main.commit,
    state: paths.length ? "changes-required" : "current", readme_state: readmeState, ci_state: ciState,
    change_paths: paths, ci_format: HUB_CI_FORMAT_VERSION, initialization_digest: digest,
    head_branch: branch(digest),
  };
}

async function validateRemoteHead(options: HubInitializationOptions, intent: HubInitializationIntent, head: string): Promise<void> {
  const git = options.git ?? runGit, ref = `refs/agentbase/hub-initialization/${intent.initialization_digest.slice(7, 19)}`;
  await git({ args: ["fetch", "--no-tags", "origin", `+refs/heads/${intent.head_branch}:${ref}`], cwd: options.localHub.root,
    operation: "fetch existing Hub initialization branch", token: options.token });
  const fetched = (await git({ args: ["rev-parse", ref], cwd: options.localHub.root,
    operation: "resolve existing Hub initialization branch", maximumOutputBytes: 256 })).stdout.trim();
  if (fetched !== head) throw new Error("Hub initialization branch changed during recovery");
  const ancestry = (await git({ args: ["rev-list", "--parents", "-n", "1", head], cwd: options.localHub.root,
    operation: "validate Hub initialization ancestry", maximumOutputBytes: 512 })).stdout.trim().split(/\s+/);
  if (ancestry.length !== 2 || ancestry[1] !== intent.base_commit) throw new Error("existing Hub initialization branch is not based on reviewed main");
  const changed = (await git({ args: ["diff-tree", "--no-commit-id", "--name-only", "-r", "-z", head], cwd: options.localHub.root,
    operation: "validate Hub initialization scope", maximumOutputBytes: 4096 })).stdout.split("\0").filter(Boolean).sort();
  if (changed.length !== intent.change_paths.length || changed.some((value, index) => value !== intent.change_paths[index])) {
    throw new Error("existing Hub initialization branch changes files outside the reviewed baseline");
  }
  const files = intendedFiles(intent.readme_state, intent.ci_state, intent.target_branch);
  for (const relative of intent.change_paths) {
    const blob = (await git({ args: ["rev-parse", `${head}:${relative}`], cwd: options.localHub.root,
      operation: "validate Hub initialization bytes", maximumOutputBytes: 256 })).stdout.trim();
    if (blob !== gitBlob(files[relative]!)) throw new Error("existing Hub initialization branch has unexpected bytes");
  }
}

function reviewBody(intent: HubInitializationIntent): string {
  const changes = [
    ...(intent.readme_state === "missing" ? ["- Add the standard human-readable Hub README."] : ["- Preserve the existing README unchanged."]),
    ...(intent.ci_state === "current" ? ["- Keep the current self-contained Hub CI bundle unchanged."]
      : [`- Install the released self-contained Hub CI bundle (previous state: ${intent.ci_state}).`]),
  ];
  return ["## Purpose", "", "Initialize the AgentBase-Hub support baseline without changing knowledge.", "",
    "## Scope", "", `- Base: \`${intent.base_commit}\``, ...intent.change_paths.map((value) => `- Change: \`${value}\``),
    `- Initialization: \`${intent.initialization_digest}\``, "", "## Behavior", "", ...changes, "",
    "## Safety", "", "- Contains no OKF knowledge change.", "- Uses no registry or MCP token at Hub CI runtime.",
    "- MCP never merges this pull request.", "", "## Reviewer action", "", "Review the support-file diff and checks before merge.", ""].join("\n");
}

export async function initializeHub(
  options: HubInitializationOptions,
  expected: Readonly<{ baseCommit: string; initializationDigest: string }>,
): Promise<HubInitializationResult> {
  const intent = await previewHubInitialization(options);
  if (expected.baseCommit !== intent.base_commit || expected.initializationDigest !== intent.initialization_digest) {
    throw new Error("Hub initialization preview changed");
  }
  if (intent.state === "current") return { intent, result: "current" };
  const lock = acquireHubMutationLock(options.stateRoot, hubMutationProfileId(options.localHub),
    `hub-init:${intent.initialization_digest.slice(7, 19)}`);
  try {
    const existing = await options.github.findBranchRef(intent.head_branch);
    if (existing) {
      await validateRemoteHead(options, intent, existing.commit);
      const openPulls = await options.github.listPullRequestsForHead(intent.head_branch, "open");
      const allPulls = await options.github.listPullRequestsForHead(intent.head_branch, "all");
      if (openPulls.length > 1 || allPulls.length > 1
        || allPulls.some((pull) => pull.headCommit !== existing.commit || pull.baseBranch !== intent.target_branch)) {
        throw new Error("Hub initialization branch has ambiguous pull request state");
      }
      if (openPulls.length === 1) return { intent, result: "recovered", head_commit: existing.commit,
        pull_request: { number: openPulls[0]!.number, url: openPulls[0]!.url } };
      if (allPulls.length) throw new Error("Hub initialization branch belongs to a closed pull request");
      const pull = await options.github.createPullRequest(intent.head_branch, existing.commit,
        "Initialize AgentBase-Hub", reviewBody(intent), intent.target_branch);
      return { intent, result: "recovered", head_commit: existing.commit,
        pull_request: { number: pull.number, url: pull.url } };
    }
    const git = options.git ?? runGit, files = intendedFiles(intent.readme_state, intent.ci_state, intent.target_branch);
    if (filesDigest(files) !== intent.initialization_digest) throw new Error("Hub initialization file set changed");
    fs.mkdirSync(path.resolve(options.stateRoot), { recursive: true, mode: 0o700 });
    const parent = fs.mkdtempSync(path.join(path.resolve(options.stateRoot), "hub-init-")), candidate = path.join(parent, "hub");
    try {
      await createCandidateWorktree(options.localHub.root, candidate, intent.base_commit);
      for (const [relative, bytes] of Object.entries(files)) {
        const target = path.join(candidate, ...relative.split("/"));
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, bytes, { mode: relative.endsWith(".mjs") ? 0o755 : 0o644 });
      }
      await git({ args: ["add", ...intent.change_paths], cwd: candidate, operation: "stage Hub initialization" });
      await git({ args: ["-c", "user.name=AgentBase", "-c", "user.email=agentbase@localhost", "commit", "--no-gpg-sign", "--no-verify",
        "-m", "Initialize AgentBase-Hub"], cwd: candidate, operation: "commit Hub initialization",
      commitTimestamp: options.createdAt ?? new Date().toISOString() });
      const head = (await git({ args: ["rev-parse", "HEAD"], cwd: candidate,
        operation: "resolve Hub initialization commit", maximumOutputBytes: 256 })).stdout.trim();
      if (!/^[a-f0-9]{40}$/.test(head)) throw new Error("Hub initialization commit is invalid");
      await git({ args: ["push", "origin", `${head}:refs/heads/${intent.head_branch}`], cwd: candidate,
        operation: "push Hub initialization branch", token: options.token });
      const pull = await options.github.createPullRequest(intent.head_branch, head,
        "Initialize AgentBase-Hub", reviewBody(intent), intent.target_branch);
      return { intent, result: "created", head_commit: head,
        pull_request: { number: pull.number, url: pull.url } };
    } finally {
      if (fs.existsSync(candidate)) await removeCandidateWorktree(options.localHub.root, candidate);
      fs.rmSync(parent, { recursive: true, force: true });
    }
  } finally { releaseHubMutationLock(lock); }
}
