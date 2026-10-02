import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

export type RepositorySourceState = Readonly<{
  repositoryId: string;
  displayName: string;
  identityHints: Readonly<{ remotes: readonly string[]; rootCommits: readonly string[] }>;
  commit: string | null;
  dirty: boolean;
  dirtyDigest: string | null;
  capturedAt: string;
  limitations: readonly string[];
}>;

const EXCLUDED_DIRECTORIES = new Set([".agentbase", ".codebase-memory", ".git", "node_modules", "dist", "coverage", "okf"]);
const EXCLUDED_NAMES = new Set([".env", ".env.local", ".env.development", ".env.production", "credentials", "credentials.json"]);
const EXCLUDED_SUFFIXES = [".pem", ".key", ".p12", ".pfx", ".secret"];

function git(root: string, args: readonly string[]): Readonly<{ ok: boolean; stdout: string }> {
  const result = spawnSync("git", [...args], { cwd: root, encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  return { ok: result.status === 0, stdout: result.stdout };
}

function safePath(relativePath: string): boolean {
  const parts = relativePath.split("/");
  const name = parts.at(-1)?.toLowerCase() ?? "";
  if (parts.some((part) => EXCLUDED_DIRECTORIES.has(part))) return false;
  if (EXCLUDED_NAMES.has(name) || name.startsWith(".env.")) return false;
  return !EXCLUDED_SUFFIXES.some((suffix) => name.endsWith(suffix));
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "repository";
}

function normalizedRemote(value: string): string {
  return value.trim().replace(/^[a-z]+:\/\/[^/@]+@/i, "https://").replace(/\.git$/, "").replace(/\/$/, "").toLowerCase();
}

function repositoryIdentity(root: string, displayName: string): string {
  const remote = git(root, ["remote", "get-url", "origin"]);
  const roots = git(root, ["rev-list", "--max-parents=0", "HEAD"]);
  const identity = remote.ok && remote.stdout.trim()
    ? normalizedRemote(remote.stdout)
    : roots.ok && roots.stdout.trim()
      ? `root-commit:${roots.stdout.trim().split(/\s+/).sort()[0]}:${displayName}`
      : `local-root:${root}`;
  const digest = createHash("sha256").update(identity).digest("hex").slice(0, 12);
  return `repository-${slug(displayName)}-${digest}`;
}

function dirtyEntries(root: string): readonly string[] {
  const working = git(root, ["ls-files", "--modified", "--deleted", "--others", "--exclude-standard", "-z"]);
  const staged = git(root, ["diff", "--cached", "--name-only", "-z"]);
  if (!working.ok && !staged.ok) return authoredFiles(root);
  const values = `${working.ok ? working.stdout : ""}\0${staged.ok ? staged.stdout : ""}`
    .split("\0").filter(Boolean).map((item) => item.split(path.sep).join("/")).filter(safePath);
  return [...new Set(values)].sort();
}

function authoredFiles(root: string): readonly string[] {
  const files: string[] = [];
  const walk = (directory: string) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))) {
      const absolute = path.join(directory, entry.name);
      const relative = path.relative(root, absolute).split(path.sep).join("/");
      if (!safePath(relative)) continue;
      if (entry.isDirectory()) walk(absolute);
      else if (entry.isFile() || entry.isSymbolicLink()) files.push(relative);
    }
  };
  walk(root);
  return files.sort();
}

function dirtyDigest(root: string, entries: readonly string[]): string {
  const hash = createHash("sha256");
  for (const relativePath of entries) {
    const absolute = path.join(root, ...relativePath.split("/"));
    hash.update(`${relativePath}\0`);
    try {
      const stat = fs.lstatSync(absolute);
      if (stat.isSymbolicLink()) hash.update(`symlink:${fs.readlinkSync(absolute)}`);
      else if (stat.isFile()) hash.update(fs.readFileSync(absolute));
      else hash.update(`kind:${stat.mode & fs.constants.S_IFMT}`);
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "ENOENT") hash.update("deleted");
      else throw error;
    }
    hash.update("\0");
  }
  return `sha256:${hash.digest("hex")}`;
}

export function discoverRepositorySourceState(repositoryRoot: string, capturedAt = new Date().toISOString()): RepositorySourceState {
  const absoluteRoot = fs.realpathSync(repositoryRoot);
  const topLevel = git(absoluteRoot, ["rev-parse", "--show-toplevel"]);
  const limitations: string[] = ["secret-like files, generated output, dependencies, local AgentBase state and current OKF are excluded from dirty identity"];
  const root = topLevel.ok ? fs.realpathSync(topLevel.stdout.trim()) : absoluteRoot;
  if (root !== absoluteRoot) limitations.push("selected path was normalized to its Git worktree root");
  const displayName = path.basename(root);
  const remote = git(root, ["remote", "get-url", "origin"]);
  const roots = git(root, ["rev-list", "--max-parents=0", "HEAD"]);
  const commitResult = git(root, ["rev-parse", "HEAD"]);
  if (!commitResult.ok) limitations.push("Git commit was unavailable; repository identity is local to this checkout path");
  const entries = dirtyEntries(root);
  return {
    repositoryId: repositoryIdentity(root, displayName),
    displayName,
    identityHints: {
      remotes: remote.ok && remote.stdout.trim() ? [normalizedRemote(remote.stdout)] : [],
      rootCommits: roots.ok ? [...new Set(roots.stdout.trim().split(/\s+/).filter(Boolean))].sort() : [],
    },
    commit: commitResult.ok ? commitResult.stdout.trim() : null,
    dirty: entries.length > 0,
    dirtyDigest: entries.length ? dirtyDigest(root, entries) : null,
    capturedAt,
    limitations: limitations.sort(),
  };
}

export function resolveRepositorySourceRoot(repositoryRoot: string): string {
  const absoluteRoot = fs.realpathSync(repositoryRoot);
  const topLevel = git(absoluteRoot, ["rev-parse", "--show-toplevel"]);
  return topLevel.ok ? fs.realpathSync(topLevel.stdout.trim()) : absoluteRoot;
}

export type RepositorySourceChanges = Readonly<{
  paths: readonly string[];
  omitted: number;
  limitations: readonly string[];
}>;

export function discoverRepositorySourceChanges(
  repositoryRoot: string,
  previousCommit: string | null | undefined,
  current: Pick<RepositorySourceState, "commit" | "dirty">,
  limit = 128,
): RepositorySourceChanges {
  if (!Number.isInteger(limit) || limit < 1 || limit > 512) throw new Error("source change limit must be 1..512");
  const root = resolveRepositorySourceRoot(repositoryRoot), limitations: string[] = [];
  let paths: string[] = [];
  if (previousCommit && current.commit) {
    if (!/^[a-f0-9]{40}$/.test(previousCommit) || !/^[a-f0-9]{40}$/.test(current.commit)) {
      limitations.push("observed or current Git revision is invalid");
    } else if (!git(root, ["cat-file", "-e", `${previousCommit}^{commit}`]).ok) {
      limitations.push("last observed Git revision is unavailable in this checkout");
    } else {
      const changed = git(root, ["diff", "--name-only", "-z", previousCommit, current.commit, "--"]);
      if (changed.ok) paths = changed.stdout.split("\0").filter(Boolean).filter(safePath);
      else limitations.push("changed paths could not be derived from Git history");
    }
  } else if (!previousCommit) limitations.push("no prior observed Git revision is available");
  else limitations.push("current Git revision is unavailable");
  if (current.dirty) paths.push(...dirtyEntries(root));
  const unique = [...new Set(paths)].sort();
  return { paths: unique.slice(0, limit), omitted: Math.max(0, unique.length - limit), limitations };
}
