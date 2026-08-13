import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

import {
  assertCleanGitTree,
  createCandidateWorktree,
  listFirstParentCommits,
  readCommitMessage,
  readExactRef,
  removeCandidateWorktree,
  runGit,
  SAFE_GIT_OPTIONS,
  sanitizedGitEnvironment,
  updateExactRef,
} from "./index.ts";

async function fixture(): Promise<Readonly<{ root: string; cleanup(): void }>> {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-hub-git-"));
  await runGit({ args: ["init", "-b", "main"], cwd: root, operation: "init" });
  await runGit({ args: ["config", "user.name", "AgentBase Test"], cwd: root, operation: "name" });
  await runGit({ args: ["config", "user.email", "test@agentbase.local"], cwd: root, operation: "email" });
  fs.writeFileSync(path.join(root, "index.md"), "# Hub\n");
  await runGit({ args: ["add", "index.md"], cwd: root, operation: "add" });
  await runGit({
    args: ["commit", "-m", "base\n\nAgentBase-Proposal-ID: 111111111111111111111111"],
    cwd: root,
    operation: "commit",
    commitTimestamp: "2026-08-12T00:00:00Z",
  });
  return { root, cleanup: () => fs.rmSync(root, { recursive: true, force: true }) };
}

test("Git environment is allowlisted and disables ambient configuration", () => {
  const environment = sanitizedGitEnvironment("/private/askpass", "token-canary-123");
  assert.equal(environment.GIT_CONFIG_GLOBAL, "/dev/null");
  assert.equal(environment.GIT_CONFIG_NOSYSTEM, "1");
  assert.equal(environment.GIT_TERMINAL_PROMPT, "0");
  assert.equal(environment.GIT_ASKPASS, "/private/askpass");
  assert.equal(environment.AGENTBASE_HUB_GITHUB_TOKEN, "token-canary-123");
  assert.equal(environment.HOME, undefined);
  assert.ok(SAFE_GIT_OPTIONS.includes("core.hooksPath=/dev/null"));
  assert.ok(SAFE_GIT_OPTIONS.includes("protocol.ext.allow=never"));
  assert.ok(SAFE_GIT_OPTIONS.includes("protocol.file.allow=never"));
  assert.ok(SAFE_GIT_OPTIONS.includes("submodule.recurse=false"));
});

test("bounded Git output and errors never echo a token canary", async () => {
  const token = "token-canary-never-print-this";
  const output = await runGit({ args: ["--version"], cwd: process.cwd(), operation: "version", token });
  assert.match(output.stdout, /^git version/);
  assert.doesNotMatch(JSON.stringify(output), new RegExp(token));
  await assert.rejects(
    runGit({ args: ["definitely-not-a-command"], cwd: process.cwd(), operation: "failure", token }),
    (error: Error) => !error.message.includes(token) && /status/.test(error.message),
  );
});

test("[AB-LOCAL-HUB-005][AB-LOCAL-HUB-008] exact refs, first-parent ancestry and candidate worktrees are bounded", async () => {
  const current = await fixture();
  try {
    const first = await readExactRef(current.root, "refs/heads/main");
    fs.writeFileSync(path.join(current.root, "index.md"), "# Hub\n\nSecond\n");
    await runGit({ args: ["add", "index.md"], cwd: current.root, operation: "add" });
    await runGit({ args: ["commit", "-m", "second"], cwd: current.root, operation: "commit", commitTimestamp: "2026-08-12T00:01:00Z" });
    const second = await readExactRef(current.root, "refs/heads/main");
    assert.deepEqual(await listFirstParentCommits(current.root, first, second), [second]);
    assert.match(await readCommitMessage(current.root, first), /AgentBase-Proposal-ID/);
    await updateExactRef(current.root, "refs/agentbase/original", first, "0".repeat(40));
    assert.equal(await readExactRef(current.root, "refs/agentbase/original"), first);
    const candidate = path.join(path.dirname(current.root), `${path.basename(current.root)}-candidate`);
    await createCandidateWorktree(current.root, candidate, first);
    assert.ok(fs.existsSync(path.join(candidate, "index.md")));
    await removeCandidateWorktree(current.root, candidate);
    assert.equal(fs.existsSync(candidate), false);
  } finally { current.cleanup(); }
});

test("[AB-LOCAL-HUB-009][AB-LOCAL-HUB-011] wrong refs, dirty trees, symlinks, cancellation and output bounds fail closed", async () => {
  const current = await fixture();
  try {
    await assertCleanGitTree(current.root);
    fs.writeFileSync(path.join(current.root, "dirty.md"), "dirty\n");
    await assert.rejects(assertCleanGitTree(current.root), /clean/);
    await assert.rejects(readExactRef(current.root, "refs/heads/../secret"), /namespaces/);
    const link = `${current.root}-link`;
    fs.symlinkSync(current.root, link);
    await assert.rejects(readExactRef(link, "refs/heads/main"), /symlink/);
    fs.unlinkSync(link);
    const controller = new AbortController(); controller.abort();
    await assert.rejects(runGit({ args: ["status"], cwd: current.root, operation: "cancel", signal: controller.signal }), /cancelled/);
    await assert.rejects(runGit({ args: ["status", "--porcelain=v1"], cwd: current.root, operation: "bound", maximumOutputBytes: 1 }), /output limit/);
  } finally { current.cleanup(); }
});
