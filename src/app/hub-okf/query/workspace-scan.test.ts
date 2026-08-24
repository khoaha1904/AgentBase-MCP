import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

import { scanWorkspaceRepositories } from "./workspace-scan.ts";

function git(root: string, ...args: string[]): void {
  const result = spawnSync("git", args, { cwd: root, encoding: "utf8" });
  if (result.status !== 0) throw new Error(result.stderr);
}

test("[AB-SCAN-001..007] bounded scan inventories Git roots and compares only Published metadata", (context) => {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-scan-"));
  context.after(() => fs.rmSync(workspace, { recursive: true, force: true }));
  const repository = path.join(workspace, "service-a");
  fs.mkdirSync(repository);
  git(repository, "init", "-b", "main");
  git(repository, "config", "user.email", "agentbase@example.invalid");
  git(repository, "config", "user.name", "AgentBase Test");
  fs.writeFileSync(path.join(repository, "README.md"), "# Service A\n");
  git(repository, "add", "README.md");
  git(repository, "commit", "-m", "init");
  fs.symlinkSync(repository, path.join(workspace, "linked-service"), "dir");

  const local = scanWorkspaceRepositories({ workspaceRoot: workspace, capturedAt: "2026-08-24T00:00:00.000Z" });
  assert.equal(local.hub, "unavailable");
  assert.deepEqual(local.repositories.map((item) => item.classification), ["hub-unavailable"]);
  const source = local.repositories[0]!;
  const published = [{
    summary: { identity: source.repositoryId, path: "repositories/service-a.md", type: "Repository",
      title: "Service A", description: "", domains: [] },
    identity: { id: source.repositoryId, displayName: source.displayName,
      remotes: source.identityHints.remotes, rootCommits: source.identityHints.rootCommits },
    observedSource: { commit: source.currentSource.commit, dirty: false, dirtyDigest: null,
      observedAt: "2026-08-23T00:00:00.000Z" },
  }];
  const unchanged = scanWorkspaceRepositories({ workspaceRoot: workspace, published,
    capturedAt: "2026-08-24T00:00:00.000Z" });
  assert.equal(unchanged.repositories[0]?.classification, "published-unchanged");
  assert.equal(unchanged.repositories[0]?.suggestion, "none");

  fs.appendFileSync(path.join(repository, "README.md"), "changed\n");
  const advanced = scanWorkspaceRepositories({ workspaceRoot: workspace, published,
    capturedAt: "2026-08-24T00:00:00.000Z" });
  assert.equal(advanced.repositories[0]?.classification, "published-source-advanced");
  assert.equal(advanced.repositories[0]?.suggestion, "refresh");
});
