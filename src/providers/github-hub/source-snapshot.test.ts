import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { createHubIdentity } from "../../core/hub/index.ts";
import {
  removeSourceSnapshotWorktree,
  resolveSourceSnapshot,
  runGit,
  type SourceSnapshotApi,
  type SourceSnapshotGit,
} from "./index.ts";

function nativeGit(cwd: string, ...args: string[]): string {
  return execFileSync("git", args, { cwd, encoding: "utf8",
    env: { PATH: "/usr/local/bin:/usr/bin:/bin", LANG: "C.UTF-8", LC_ALL: "C.UTF-8" } }).trim();
}

function contains(root: string, needle: string): boolean {
  const visit = (directory: string): boolean => fs.readdirSync(directory, { withFileTypes: true }).some((entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) return false;
    if (entry.isDirectory()) return visit(target);
    return entry.isFile() && fs.readFileSync(target).includes(needle);
  });
  return visit(root);
}

test("[AB-MCP-019][AB-MCP-024] exact source snapshot isolates dirty worktrees and credentials", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-source-snapshot-"));
  const source = path.join(root, "source"), remote = path.join(root, "source.git"), state = path.join(root, "state");
  const canonical = "https://github.com/acme/source.git", token = "source-token-canary";
  fs.mkdirSync(source);
  nativeGit(root, "init", "--bare", "--initial-branch=main", remote);
  nativeGit(source, "init", "-b", "main");
  nativeGit(source, "config", "user.name", "AgentBase Test");
  nativeGit(source, "config", "user.email", "agentbase@example.invalid");
  fs.writeFileSync(path.join(source, "README.md"), "# Source\n");
  nativeGit(source, "add", "README.md");
  nativeGit(source, "commit", "-m", "initial");
  const commit = nativeGit(source, "rev-parse", "HEAD");
  nativeGit(source, "remote", "add", "origin", canonical);
  nativeGit(source, "push", remote, "main");
  const calls: Array<Readonly<{ args: readonly string[]; token?: string }>> = [];
  const git: SourceSnapshotGit = async (request) => {
    calls.push({ args: request.args, ...(request.token ? { token: request.token } : {}) });
    if (request.args[0] === "fetch") {
      const args = request.args.map((value) => value === canonical ? remote : value);
      return { stdout: nativeGit(request.cwd, ...args), stderr: "" };
    }
    return runGit(request);
  };
  const api: SourceSnapshotApi = {
    async getRepository(repository) {
      assert.equal(repository, "acme/source");
      return { fullName: "acme/source", defaultBranch: "main" };
    },
    async getBranchRef(branch, repository) {
      assert.equal(branch, "main");
      assert.equal(repository, "acme/source");
      return { branch, commit };
    },
  };
  const input = { requestedRoot: source, repositoryId: "repository-source-111111111111",
    hub: createHubIdentity("acme/hub", "main"), token, stateRoot: state, api, git,
    createdAt: "2026-08-25T00:00:00.000Z" } as const;
  try {
    const clean = await resolveSourceSnapshot(input);
    assert.equal(clean.kind, "current-checkout");
    assert.equal(clean.analysisRoot, source);
    assert.equal(clean.commit, commit);
    assert.equal((fs.statSync(clean.privateRoot).mode & 0o777), 0o700);
    fs.writeFileSync(path.join(source, "feature.txt"), "unfinished\n");
    const dirtyHead = nativeGit(source, "rev-parse", "HEAD");
    const dirtyStatus = nativeGit(source, "status", "--porcelain=v1", "--untracked-files=all");
    const isolated = await resolveSourceSnapshot(input);
    assert.equal(isolated.kind, "detached-worktree");
    assert.notEqual(isolated.analysisRoot, source);
    assert.equal(nativeGit(isolated.analysisRoot, "rev-parse", "HEAD"), commit);
    assert.equal(nativeGit(source, "rev-parse", "HEAD"), dirtyHead);
    assert.equal(nativeGit(source, "status", "--porcelain=v1", "--untracked-files=all"), dirtyStatus);
    assert.equal(calls.filter((call) => call.token).every((call) => call.token === token && call.args[0] === "fetch"), true);
    assert.equal(contains(state, token), false);
    await removeSourceSnapshotWorktree(isolated, git);
    assert.equal(fs.existsSync(isolated.analysisRoot), false);
    const advancedApi: SourceSnapshotApi = { ...api, async getBranchRef(branch) {
      return { branch, commit: "b".repeat(40) };
    } };
    await assert.rejects(resolveSourceSnapshot({ ...input, api: advancedApi }), /changed between API resolution and fetch/);
    nativeGit(source, "remote", "add", "upstream", "git@github.com:other/source.git");
    await assert.rejects(resolveSourceSnapshot(input), /remote identity is ambiguous/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
