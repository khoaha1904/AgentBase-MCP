import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { hubProfileId, type HubIdentity } from "../../core/hub/index.ts";
import { GitHubHubApi, type GitHubRef, type GitHubRepository } from "./github-api.ts";
import { runGit, type GitOutput, type GitRequest } from "./git-process.ts";

export type CanonicalGitHubRemote = Readonly<{
  host: string;
  repository: string;
  canonicalHttpsUrl: string;
}>;

export type SourceSnapshot = Readonly<{
  repositoryId: string;
  remote: CanonicalGitHubRemote;
  defaultBranch: string;
  commit: string;
  requestedRoot: string;
  analysisRoot: string;
  kind: "current-checkout" | "detached-worktree";
  createdAt: string;
  privateRoot: string;
}>;

export type SourceSnapshotApi = Readonly<{
  getRepository(repository: string): Promise<GitHubRepository>;
  getBranchRef(branch: string, repository: string): Promise<GitHubRef>;
}>;

export type SourceSnapshotGit = (request: GitRequest) => Promise<GitOutput>;

const REPOSITORY_ID = /^repository-[a-z0-9-]+-[a-f0-9]{12}$/;
const COMMIT = /^[a-f0-9]{40}$/;
const BRANCH = /^[A-Za-z0-9_][A-Za-z0-9._/-]*$/;
const MARKER = ".agentbase-source-snapshot.json";

function privateDirectory(directory: string): void {
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  fs.chmodSync(directory, 0o700);
  const stat = fs.lstatSync(directory);
  if (stat.isSymbolicLink() || !stat.isDirectory() || (stat.mode & 0o777) !== 0o700
    || typeof process.getuid === "function" && stat.uid !== process.getuid()) {
    throw new Error("AgentBase source snapshot directory is unsafe");
  }
}

function exactBranch(branch: string): void {
  if (!BRANCH.test(branch) || branch.includes("..") || branch.includes("//") || branch.includes("@{")
    || branch.endsWith("/") || branch.split("/").some((part) => !part || part.startsWith(".")
      || part.endsWith(".") || part.endsWith(".lock"))) {
    throw new Error("source default branch is invalid");
  }
}

function parseRepositoryPath(pathname: string): string {
  const parts = pathname.replace(/^\/+|\/+$/g, "").split("/");
  if (parts.length !== 2) throw new Error("source remote must identify exactly one GitHub owner/repository");
  const owner = parts[0]!, repository = parts[1]!.replace(/\.git$/, "");
  if (!/^[A-Za-z0-9_.-]+$/.test(owner) || !/^[A-Za-z0-9_.-]+$/.test(repository)
    || owner.includes("..") || repository.includes("..")) {
    throw new Error("source remote repository identity is invalid");
  }
  return `${owner}/${repository}`;
}

export function normalizeGitHubSourceRemote(value: string): CanonicalGitHubRemote {
  const remote = value.trim();
  let host: string, repository: string;
  const scp = /^(?:git@)([A-Za-z0-9.-]+):(.+)$/.exec(remote);
  if (scp) {
    host = scp[1]!.toLowerCase();
    repository = parseRepositoryPath(scp[2]!);
  } else {
    let url: URL;
    try { url = new URL(remote); }
    catch { throw new Error("source remote must be GitHub HTTPS or SSH syntax"); }
    if (url.protocol !== "https:" && url.protocol !== "ssh:") {
      throw new Error("source remote must be GitHub HTTPS or SSH syntax");
    }
    if (url.port || url.search || url.hash || url.password
      || url.protocol === "https:" && url.username
      || url.protocol === "ssh:" && url.username !== "git") {
      throw new Error("source remote contains unsupported authority or credentials");
    }
    host = url.hostname.toLowerCase();
    repository = parseRepositoryPath(url.pathname);
  }
  return { host, repository, canonicalHttpsUrl: `https://${host}/${repository}.git` };
}

async function sourceRemotes(root: string, git: SourceSnapshotGit): Promise<readonly CanonicalGitHubRemote[]> {
  const names = (await git({ args: ["remote"], cwd: root, operation: "list source remotes", maximumOutputBytes: 64 * 1024 }))
    .stdout.trim().split("\n").filter(Boolean);
  const remotes: CanonicalGitHubRemote[] = [];
  for (const name of names) {
    if (!/^[A-Za-z0-9._-]+$/.test(name)) throw new Error("source repository has an invalid remote name");
    const output = await git({ args: ["remote", "get-url", "--all", name], cwd: root,
      operation: "read source remote", maximumOutputBytes: 64 * 1024 });
    for (const url of output.stdout.trim().split("\n").filter(Boolean)) remotes.push(normalizeGitHubSourceRemote(url));
  }
  return [...new Map(remotes.map((remote) => [remote.canonicalHttpsUrl.toLowerCase(), remote])).values()]
    .sort((left, right) => left.canonicalHttpsUrl.localeCompare(right.canonicalHttpsUrl));
}

function sourceScope(stateRoot: string, profileId: string, remote: CanonicalGitHubRemote): string {
  if (!path.isAbsolute(stateRoot) || !/^[a-f0-9]{24}$/.test(profileId)) throw new Error("source snapshot state authority is invalid");
  const key = createHash("sha256").update(remote.canonicalHttpsUrl.toLowerCase()).digest("hex").slice(0, 24);
  return path.join(path.resolve(stateRoot), "source-snapshots", profileId, key);
}

function admitScope(scope: string, marker: Readonly<{ profileId: string; repositoryId: string; remote: string }>): void {
  privateDirectory(path.dirname(path.dirname(scope)));
  privateDirectory(path.dirname(scope));
  privateDirectory(scope);
  const file = path.join(scope, MARKER), bytes = `${JSON.stringify(marker)}\n`;
  if (!fs.existsSync(file)) fs.writeFileSync(file, bytes, { mode: 0o600, flag: "wx" });
  const stat = fs.lstatSync(file);
  if (stat.isSymbolicLink() || !stat.isFile() || (stat.mode & 0o777) !== 0o600
    || fs.readFileSync(file, "utf8") !== bytes) {
    throw new Error("AgentBase source snapshot ownership marker is invalid");
  }
}

async function exactCommit(root: string, expression: string, operation: string, git: SourceSnapshotGit): Promise<string> {
  const commit = (await git({ args: ["rev-parse", "--verify", expression], cwd: root, operation, maximumOutputBytes: 256 })).stdout.trim();
  if (!COMMIT.test(commit)) throw new Error(`${operation} did not resolve an exact commit`);
  return commit;
}

async function reusableCheckout(root: string, commit: string, git: SourceSnapshotGit): Promise<boolean> {
  const head = await exactCommit(root, "HEAD^{commit}", "resolve source checkout head", git);
  if (head !== commit) return false;
  const status = await git({ args: ["status", "--porcelain=v1", "--untracked-files=all"], cwd: root,
    operation: "inspect source checkout", maximumOutputBytes: 1024 * 1024 });
  return status.stdout.length === 0;
}

async function ensureMirror(
  scope: string,
  remote: CanonicalGitHubRemote,
  branch: string,
  expectedCommit: string,
  token: string,
  git: SourceSnapshotGit,
): Promise<string> {
  const mirror = path.join(scope, "mirror.git");
  if (!fs.existsSync(mirror)) {
    await git({ args: ["init", "--bare", "--initial-branch=main", mirror], cwd: scope,
      operation: "initialize private source mirror", maximumOutputBytes: 64 * 1024 });
    fs.chmodSync(mirror, 0o700);
  }
  const stat = fs.lstatSync(mirror);
  if (stat.isSymbolicLink() || !stat.isDirectory() || (stat.mode & 0o777) !== 0o700) {
    throw new Error("private source mirror is unsafe");
  }
  const targetRef = `refs/agentbase/source/${branch}`;
  await git({
    args: ["fetch", "--force", "--no-tags", "--no-recurse-submodules", remote.canonicalHttpsUrl,
      `+refs/heads/${branch}:${targetRef}`],
    cwd: mirror, operation: "fetch exact source snapshot", token, maximumOutputBytes: 1024 * 1024,
  });
  const fetched = await exactCommit(mirror, `${targetRef}^{commit}`, "resolve fetched source snapshot", git);
  if (fetched !== expectedCommit) throw new Error("source default head changed between API resolution and fetch");
  return mirror;
}

async function detachedWorktree(scope: string, mirror: string, commit: string, git: SourceSnapshotGit): Promise<string> {
  const worktrees = path.join(scope, "worktrees");
  privateDirectory(worktrees);
  const destination = path.join(worktrees, commit);
  if (fs.existsSync(destination)) {
    const stat = fs.lstatSync(destination);
    if (!stat.isSymbolicLink() && stat.isDirectory() && (stat.mode & 0o777) === 0o700
      && await reusableCheckout(destination, commit, git)) return destination;
    throw new Error("existing private source worktree is not safely reusable");
  }
  await git({ args: ["worktree", "add", "--detach", destination, commit], cwd: mirror,
    operation: "create exact source worktree", maximumOutputBytes: 64 * 1024 });
  fs.chmodSync(destination, 0o700);
  if (!await reusableCheckout(destination, commit, git)) {
    throw new Error("created source worktree does not match the resolved source snapshot");
  }
  return destination;
}

export async function resolveSourceSnapshot(input: Readonly<{
  requestedRoot: string;
  repositoryId: string;
  hub: HubIdentity;
  token: string;
  stateRoot: string;
  api?: SourceSnapshotApi;
  git?: SourceSnapshotGit;
  createdAt?: string;
}>): Promise<SourceSnapshot> {
  if (!input.token || !REPOSITORY_ID.test(input.repositoryId)) throw new Error("source snapshot authority is incomplete");
  const requestedRoot = fs.realpathSync(input.requestedRoot);
  const rootStat = fs.lstatSync(requestedRoot);
  if (rootStat.isSymbolicLink() || !rootStat.isDirectory()) throw new Error("source repository root is unsafe");
  const git = input.git ?? runGit;
  const topLevel = fs.realpathSync((await git({ args: ["rev-parse", "--show-toplevel"], cwd: requestedRoot,
    operation: "resolve source Git root", maximumOutputBytes: 4096 })).stdout.trim());
  if (topLevel !== requestedRoot) throw new Error("source repository selection must be one exact Git root");
  const matching = (await sourceRemotes(requestedRoot, git)).filter((remote) => remote.host === input.hub.host);
  if (!matching.length) throw new Error("source repository has no remote on the active Hub host");
  if (matching.length !== 1) throw new Error("source repository remote identity is ambiguous on the active Hub host");
  const selected = matching[0]!;
  const api = input.api ?? new GitHubHubApi(input.hub, input.token);
  const repository = await api.getRepository(selected.repository);
  exactBranch(repository.defaultBranch);
  const ref = await api.getBranchRef(repository.defaultBranch, repository.fullName);
  if (ref.branch !== repository.defaultBranch || !COMMIT.test(ref.commit)) throw new Error("source API returned an invalid default head");
  const canonical = { host: selected.host, repository: repository.fullName,
    canonicalHttpsUrl: `https://${selected.host}/${repository.fullName}.git` };
  const profileId = hubProfileId(input.hub), scope = sourceScope(input.stateRoot, profileId, canonical);
  admitScope(scope, { profileId, repositoryId: input.repositoryId, remote: canonical.canonicalHttpsUrl });
  const mirror = await ensureMirror(scope, canonical, repository.defaultBranch, ref.commit, input.token, git);
  const useCurrent = await reusableCheckout(requestedRoot, ref.commit, git);
  const analysisRoot = useCurrent ? requestedRoot : await detachedWorktree(scope, mirror, ref.commit, git);
  return {
    repositoryId: input.repositoryId,
    remote: canonical,
    defaultBranch: repository.defaultBranch,
    commit: ref.commit,
    requestedRoot,
    analysisRoot,
    kind: useCurrent ? "current-checkout" : "detached-worktree",
    createdAt: input.createdAt ?? new Date().toISOString(),
    privateRoot: scope,
  };
}

export async function removeSourceSnapshotWorktree(
  snapshot: SourceSnapshot,
  git: SourceSnapshotGit = runGit,
): Promise<void> {
  if (snapshot.kind === "current-checkout") return;
  const marker = path.join(snapshot.privateRoot, MARKER), mirror = path.join(snapshot.privateRoot, "mirror.git");
  const expectedParent = path.join(snapshot.privateRoot, "worktrees");
  if (!fs.existsSync(marker) || !fs.existsSync(mirror)
    || path.dirname(snapshot.analysisRoot) !== expectedParent
    || path.basename(snapshot.analysisRoot) !== snapshot.commit
    || fs.lstatSync(snapshot.analysisRoot).isSymbolicLink()) {
    throw new Error("source snapshot cleanup target is not marker-owned");
  }
  await git({ args: ["worktree", "remove", "--force", snapshot.analysisRoot], cwd: mirror,
    operation: "remove exact source worktree", maximumOutputBytes: 64 * 1024 });
  if (fs.existsSync(snapshot.analysisRoot)) throw new Error("source snapshot cleanup did not remove the worktree");
}
