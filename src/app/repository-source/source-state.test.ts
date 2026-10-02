import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  discoverRepositorySourceChanges, discoverRepositorySourceState, resolveRepositorySourceRoot,
} from "./index.ts";

function fixture(t: test.TestContext) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-source-git-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const git = (...args: string[]) => execFileSync("git", ["-c", "user.name=AgentBase",
    "-c", "user.email=agentbase@localhost", ...args], { cwd: root, encoding: "utf8" }).trim();
  git("init", "--quiet", "--initial-branch=main");
  fs.writeFileSync(path.join(root, "README.md"), "# Source fixture\n");
  git("add", "."); git("commit", "--quiet", "-m", "Source fixture");
  return { root, git };
}

test("[AB-DISC-006] Git source identity and root resolution work without a graph provider", (t) => {
  const { root, git } = fixture(t), nested = path.join(root, "src");
  fs.mkdirSync(nested);
  git("remote", "add", "origin", "https://github.example.test/acme/source.git");
  const state = discoverRepositorySourceState(root, "2026-10-02T00:00:00.000Z");
  const selected = discoverRepositorySourceState(nested, state.capturedAt);
  assert.equal(resolveRepositorySourceRoot(nested), fs.realpathSync(root));
  assert.equal(selected.repositoryId, state.repositoryId);
  assert.equal(state.commit, git("rev-parse", "HEAD"));
  assert.equal(state.dirty, false);
  assert.equal(state.dirtyDigest, null);
  assert.deepEqual(state.identityHints.remotes, ["https://github.example.test/acme/source"]);
  assert.equal(state.identityHints.rootCommits.length, 1);
});

test("[AB-DISC-006][AB-REFRESH-014] Git deltas retain committed and dirty paths with bounds and exclusions", (t) => {
  const { root, git } = fixture(t), previous = git("rev-parse", "HEAD");
  fs.writeFileSync(path.join(root, "a.ts"), "export const a = 1;\n");
  fs.writeFileSync(path.join(root, "b.ts"), "export const b = 1;\n");
  git("add", "."); git("commit", "--quiet", "-m", "Add source behavior");
  fs.writeFileSync(path.join(root, "c.ts"), "export const c = 1;\n");
  for (const directory of [".agentbase", ".codebase-memory", "node_modules"]) {
    fs.mkdirSync(path.join(root, directory));
    fs.writeFileSync(path.join(root, directory, "state.json"), "{}\n");
  }
  fs.writeFileSync(path.join(root, ".env.local"), "FIXTURE_ONLY=true\n");
  const state = discoverRepositorySourceState(root);
  assert.equal(state.dirty, true);
  assert.match(state.dirtyDigest!, /^sha256:[a-f0-9]{64}$/);
  const digest = state.dirtyDigest;
  fs.writeFileSync(path.join(root, ".env.local"), "FIXTURE_ONLY=false\n");
  assert.equal(discoverRepositorySourceState(root).dirtyDigest, digest);
  const delta = discoverRepositorySourceChanges(root, previous, state, 2);
  assert.deepEqual(delta, { paths: ["a.ts", "b.ts"], omitted: 1, limitations: [] });
  assert.deepEqual(discoverRepositorySourceChanges(root, previous, state).paths, ["a.ts", "b.ts", "c.ts"]);
});

test("[AB-DISC-006] unavailable Git history and invalid change bounds remain visible", (t) => {
  const { root } = fixture(t), state = discoverRepositorySourceState(root);
  assert.match(discoverRepositorySourceChanges(root, null, state).limitations[0]!, /no prior/);
  assert.match(discoverRepositorySourceChanges(root, "invalid", state).limitations[0]!, /revision is invalid/);
  assert.match(discoverRepositorySourceChanges(root, "f".repeat(40), state).limitations[0]!, /unavailable/);
  assert.throws(() => discoverRepositorySourceChanges(root, state.commit, state, 0), /1\.\.512/);
});
