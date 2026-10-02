import { spawn, type ChildProcessByStdio } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Readable, Writable } from "node:stream";

export type GitRequest = Readonly<{
  args: readonly string[];
  cwd: string;
  operation: string;
  token?: string;
  commitTimestamp?: string;
  signal?: AbortSignal;
  timeoutMs?: number;
  maximumOutputBytes?: number;
  stdin?: string;
}>;
export type GitOutput = Readonly<{ stdout: string; stderr: string }>;
type GitProcess = ChildProcessByStdio<Writable, Readable, Readable>;
export type SpawnGit = (executable: string, args: readonly string[], options: Readonly<{ cwd: string; env: NodeJS.ProcessEnv }>) => GitProcess;

const SAFE_PATH = "/usr/local/bin:/usr/bin:/bin";
const GIT_OPTIONS = [
  "-c", "core.hooksPath=/dev/null",
  "-c", "credential.helper=",
  "-c", "credential.useHttpPath=true",
  "-c", "protocol.ext.allow=never",
  "-c", "protocol.file.allow=never",
  "-c", "submodule.recurse=false",
] as const;

export function sanitizedGitEnvironment(askpass?: string, token?: string, commitTimestamp?: string): NodeJS.ProcessEnv {
  const environment: NodeJS.ProcessEnv = {
    PATH: SAFE_PATH,
    LANG: "C.UTF-8",
    LC_ALL: "C.UTF-8",
    GIT_CONFIG_NOSYSTEM: "1",
    GIT_CONFIG_GLOBAL: "/dev/null",
    GIT_TERMINAL_PROMPT: "0",
    GIT_LFS_SKIP_SMUDGE: "1",
    GIT_OPTIONAL_LOCKS: "0",
  };
  if (askpass && token) { environment.GIT_ASKPASS = askpass; environment.AGENTBASE_HUB_GITHUB_TOKEN = token; }
  if (commitTimestamp) {
    environment.GIT_AUTHOR_DATE = commitTimestamp;
    environment.GIT_COMMITTER_DATE = commitTimestamp;
  }
  return environment;
}

function defaultSpawn(executable: string, args: readonly string[], options: Readonly<{ cwd: string; env: NodeJS.ProcessEnv }>): GitProcess {
  return spawn(executable, [...args], { ...options, shell: false, windowsHide: true, stdio: ["pipe", "pipe", "pipe"] });
}

function createAskpass(): Readonly<{ directory: string; executable: string }> {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-hub-askpass-"));
  fs.chmodSync(directory, 0o700);
  const executable = path.join(directory, "askpass.sh");
  const script = "#!/bin/sh\ncase \"$1\" in\n"
    + "  *Username*) printf '%s\\n' 'x-access-token' ;;\n"
    + "  *) printf '%s\\n' \"$AGENTBASE_HUB_GITHUB_TOKEN\" ;;\n"
    + "esac\n";
  fs.writeFileSync(executable, script, { mode: 0o700 });
  return { directory, executable };
}

export async function runGit(request: GitRequest, spawnGit: SpawnGit = defaultSpawn): Promise<GitOutput> {
  if (!request.operation || request.args.some((value) => value.includes("\0"))) throw new Error("invalid bounded Git request");
  if (request.stdin?.includes("\0") || Buffer.byteLength(request.stdin ?? "") > 64 * 1024) throw new Error("invalid bounded Git input");
  if (request.token !== undefined && request.token.length === 0) throw new Error("Hub token cannot be empty");
  const helper = request.token ? createAskpass() : undefined;
  const maximum = request.maximumOutputBytes ?? 1024 * 1024;
  try {
    return await new Promise((resolve, reject) => {
      const child = spawnGit("/usr/bin/git", [...GIT_OPTIONS, ...request.args], {
        cwd: request.cwd,
        env: sanitizedGitEnvironment(helper?.executable, request.token, request.commitTimestamp),
      });
      child.stdin.on("error", () => undefined);
      child.stdin.end(request.stdin ?? "");
      const stdout: Buffer[] = [], stderr: Buffer[] = [];
      let size = 0, failure: Error | undefined;
      const fail = (message: string) => { if (!failure) { failure = new Error(`${request.operation}: ${message}`); child.kill("SIGKILL"); } };
      const cancel = () => fail("Git operation cancelled");
      if (request.signal?.aborted) cancel();
      else request.signal?.addEventListener("abort", cancel, { once: true });
      const timer = setTimeout(() => fail("Git operation timed out"), request.timeoutMs ?? 30_000);
      child.stdout.on("data", (chunk: Buffer) => { size += chunk.length; size > maximum ? fail("Git output limit exceeded") : stdout.push(chunk); });
      child.stderr.on("data", (chunk: Buffer) => { size += chunk.length; size > maximum ? fail("Git output limit exceeded") : stderr.push(chunk); });
      child.on("error", () => fail("Git process failed to start"));
      child.on("close", (code) => {
        clearTimeout(timer);
        request.signal?.removeEventListener("abort", cancel);
        if (failure) reject(failure);
        else if (code !== 0) {
          const diagnostic = Buffer.concat(stderr).toString("utf8");
          const redacted = request.token ? diagnostic.split(request.token).join("[REDACTED]") : diagnostic;
          const tail = redacted.replace(/\s+/g, " ").trim().slice(-600);
          reject(new Error(`${request.operation}: Git exited with status ${code ?? 1}${tail ? `: ${tail}` : ""}`));
        }
        else resolve({ stdout: Buffer.concat(stdout).toString("utf8"), stderr: Buffer.concat(stderr).toString("utf8") });
      });
    });
  } finally { if (helper) fs.rmSync(helper.directory, { recursive: true, force: true }); }
}

export const SAFE_GIT_OPTIONS: readonly string[] = GIT_OPTIONS;

function assertObjectId(value: string, label: string): void {
  if (!/^[a-f0-9]{40}$/.test(value)) throw new Error(`${label} must be 40 lowercase hex`);
}

function assertOwnedRepositoryRoot(root: string): void {
  if (!path.isAbsolute(root)) throw new Error("Git repository root must be absolute");
  if (fs.lstatSync(root).isSymbolicLink()) throw new Error("Git repository root must not be a symlink");
}

function assertRef(ref: string): void {
  if (!/^refs\/(?:heads|remotes|agentbase)\/[A-Za-z0-9._/-]+$/.test(ref) || ref.includes("..") || ref.includes("//")) {
    throw new Error("Git ref is outside admitted namespaces");
  }
}

export async function readExactRef(root: string, ref: string): Promise<string> {
  assertOwnedRepositoryRoot(root);
  assertRef(ref);
  const result = await runGit({ args: ["show-ref", "--verify", "--hash", ref], cwd: root, operation: "read exact ref", maximumOutputBytes: 256 });
  const commit = result.stdout.trim();
  assertObjectId(commit, "resolved ref");
  return commit;
}

export async function updateExactRef(root: string, ref: string, next: string, expected: string): Promise<void> {
  assertOwnedRepositoryRoot(root);
  assertRef(ref);
  assertObjectId(next, "next commit");
  assertObjectId(expected, "expected commit");
  await runGit({ args: ["update-ref", ref, next, expected], cwd: root, operation: "advance exact ref", maximumOutputBytes: 4096 });
}

export async function assertCleanGitTree(root: string): Promise<void> {
  assertOwnedRepositoryRoot(root);
  const result = await runGit({
    args: ["status", "--porcelain=v1", "--untracked-files=all"],
    cwd: root,
    operation: "inspect Hub tree",
    maximumOutputBytes: 1024 * 1024,
  });
  if (result.stdout.length) throw new Error("AgentBase-Hub working tree must be clean");
}

export async function createCandidateWorktree(root: string, destination: string, commit: string): Promise<void> {
  assertOwnedRepositoryRoot(root);
  assertObjectId(commit, "candidate base");
  if (!path.isAbsolute(destination) || fs.existsSync(destination)) throw new Error("candidate worktree destination must be an absent absolute path");
  await runGit({
    args: ["worktree", "add", "--detach", destination, commit],
    cwd: root,
    operation: "create candidate worktree",
    maximumOutputBytes: 64 * 1024,
  });
}

export async function removeCandidateWorktree(root: string, destination: string): Promise<void> {
  assertOwnedRepositoryRoot(root);
  if (!path.isAbsolute(destination) || !fs.existsSync(destination) || fs.lstatSync(destination).isSymbolicLink()) {
    throw new Error("candidate worktree destination is not an admitted directory");
  }
  await runGit({ args: ["worktree", "remove", "--force", destination], cwd: root, operation: "remove candidate worktree", maximumOutputBytes: 64 * 1024 });
}

export async function listFirstParentCommits(root: string, baseExclusive: string, head: string): Promise<readonly string[]> {
  assertOwnedRepositoryRoot(root);
  assertObjectId(baseExclusive, "base commit");
  assertObjectId(head, "head commit");
  const result = await runGit({
    args: ["rev-list", "--first-parent", "--reverse", `${baseExclusive}..${head}`],
    cwd: root,
    operation: "list pending ancestry",
    maximumOutputBytes: 1024 * 1024,
  });
  return result.stdout.trim().split("\n").filter(Boolean).map((commit) => { assertObjectId(commit, "pending commit"); return commit; });
}

export async function listRemoteRefs(
  repositoryUrl: string,
  cwd: string,
  token: string,
  runner: (request: GitRequest) => Promise<GitOutput> = runGit,
): Promise<readonly Readonly<{ ref: string; commit: string }>[]> {
  if (!/^https:\/\/[A-Za-z0-9.-]+\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\.git$/.test(repositoryUrl)) {
    throw new Error("remote ref discovery requires a canonical GitHub HTTPS URL");
  }
  const result = await runner({
    args: ["ls-remote", "--refs", repositoryUrl], cwd,
    operation: "inspect remote Hub refs", token, maximumOutputBytes: 1024 * 1024,
  });
  if (!result.stdout.trim()) return [];
  return result.stdout.trim().split("\n").map((line) => {
    const [commit, ref, extra] = line.split(/\s+/);
    if (extra || !commit || !/^[a-f0-9]{40}$/.test(commit) || !ref || !/^refs\/(?:heads|tags)\/[A-Za-z0-9._/-]+$/.test(ref)) {
      throw new Error("remote Hub ref inventory is invalid");
    }
    return { ref, commit };
  });
}

export async function readCommitMessage(root: string, commit: string): Promise<string> {
  assertOwnedRepositoryRoot(root);
  assertObjectId(commit, "commit");
  return (await runGit({ args: ["show", "-s", "--format=%B", commit], cwd: root, operation: "read proposal trailers", maximumOutputBytes: 64 * 1024 })).stdout;
}
