import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

import { discoverRepositorySourceState } from "./source-state.ts";
import { prepareProviderWorkspace } from "../provider/provider-workspace.ts";

function git(root: string, args: readonly string[]): string {
  const result = spawnSync("git", [...args], { cwd: root, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

function repositoryFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-source-state-"));
  fs.mkdirSync(path.join(root, "src"));
  fs.writeFileSync(path.join(root, "src", "app.ts"), "export const value = 1;\n");
  git(root, ["init", "--quiet"]);
  git(root, ["config", "user.email", "agentbase@example.invalid"]);
  git(root, ["config", "user.name", "AgentBase Test"]);
  git(root, ["remote", "add", "origin", "https://example.invalid/team/repository.git"]);
  git(root, ["add", "src/app.ts"]);
  git(root, ["commit", "--quiet", "-m", "fixture"]);
  return { root, cleanup: () => fs.rmSync(root, { recursive: true, force: true }) };
}

test("[AB-MVP-006] source identity records the commit and a stable repository ID without checkout paths", () => {
  const fixture = repositoryFixture();
  try {
    const state = discoverRepositorySourceState(fixture.root, "2026-08-12T03:00:00.000Z");
    assert.equal(state.commit, git(fixture.root, ["rev-parse", "HEAD"]));
    assert.equal(state.dirty, false);
    assert.equal(state.dirtyDigest, null);
    assert.match(state.repositoryId, /^repository-[a-z0-9-]+-[a-f0-9]{12}$/);
    assert.equal(JSON.stringify(state).includes(fixture.root), false);
  } finally {
    fixture.cleanup();
  }
});

test("[AB-MVP-006] dirty digest follows authored source but excludes secrets and AgentBase local state", () => {
  const fixture = repositoryFixture();
  try {
    fs.writeFileSync(path.join(fixture.root, "src", "app.ts"), "export const value = 2;\n");
    fs.writeFileSync(path.join(fixture.root, ".env"), "TOKEN=first\n");
    fs.mkdirSync(path.join(fixture.root, ".agentbase", "cache"), { recursive: true });
    fs.writeFileSync(path.join(fixture.root, ".agentbase", "cache", "state.db"), "local\n");
    const first = discoverRepositorySourceState(fixture.root, "2026-08-12T03:00:00.000Z");
    assert.equal(first.dirty, true);
    assert.match(first.dirtyDigest ?? "", /^sha256:[a-f0-9]{64}$/);

    fs.writeFileSync(path.join(fixture.root, ".env"), "TOKEN=second\n");
    fs.writeFileSync(path.join(fixture.root, ".agentbase", "cache", "state.db"), "changed\n");
    const ignoredChanged = discoverRepositorySourceState(fixture.root, "2026-08-12T03:01:00.000Z");
    assert.equal(ignoredChanged.dirtyDigest, first.dirtyDigest);

    fs.writeFileSync(path.join(fixture.root, "src", "app.ts"), "export const value = 3;\n");
    const sourceChanged = discoverRepositorySourceState(fixture.root, "2026-08-12T03:02:00.000Z");
    assert.notEqual(sourceChanged.dirtyDigest, first.dirtyDigest);
  } finally {
    fixture.cleanup();
  }
});

test("[AB-MVP-006] staged-only source changes remain part of working-state identity", () => {
  const fixture = repositoryFixture();
  try {
    fs.writeFileSync(path.join(fixture.root, "src", "app.ts"), "export const value = 4;\n");
    git(fixture.root, ["add", "src/app.ts"]);
    const state = discoverRepositorySourceState(fixture.root, "2026-08-12T03:00:00.000Z");
    assert.equal(state.dirty, true);
    assert.match(state.dirtyDigest ?? "", /^sha256:[a-f0-9]{64}$/);
  } finally {
    fixture.cleanup();
  }
});

test("[AB-MVP-006] a non-Git repository hashes safe authored files instead of claiming a clean commit", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-source-no-git-"));
  try {
    fs.mkdirSync(path.join(root, "src"));
    fs.writeFileSync(path.join(root, "src", "app.ts"), "export const value = 1;\n");
    fs.writeFileSync(path.join(root, ".env"), "TOKEN=ignored\n");
    const first = discoverRepositorySourceState(root, "2026-08-12T03:00:00.000Z");
    assert.equal(first.commit, null);
    assert.equal(first.dirty, true);
    assert.match(first.dirtyDigest ?? "", /^sha256:[a-f0-9]{64}$/);

    fs.writeFileSync(path.join(root, ".env"), "TOKEN=changed\n");
    const ignored = discoverRepositorySourceState(root, "2026-08-12T03:01:00.000Z");
    assert.equal(ignored.dirtyDigest, first.dirtyDigest);
    fs.writeFileSync(path.join(root, "src", "app.ts"), "export const value = 2;\n");
    const changed = discoverRepositorySourceState(root, "2026-08-12T03:02:00.000Z");
    assert.notEqual(changed.dirtyDigest, first.dirtyDigest);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("[AB-MVP-003][AB-MVP-006] provider workspace is stable, outside source and owner-private", () => {
  const fixture = repositoryFixture();
  const stateRoot = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-provider-state-"));
  try {
    const state = discoverRepositorySourceState(fixture.root, "2026-08-12T03:00:00.000Z");
    const first = prepareProviderWorkspace(fixture.root, state.repositoryId, stateRoot);
    const second = prepareProviderWorkspace(fixture.root, state.repositoryId, stateRoot);
    assert.deepEqual(second, first);
    assert.equal(path.relative(fixture.root, first.cacheRoot).startsWith(".."), true);
    assert.equal(fs.statSync(first.cacheRoot).mode & 0o777, 0o700);
    assert.match(first.project, /^agentbase-[a-f0-9]{16}$/);
  } finally {
    fixture.cleanup();
    fs.rmSync(stateRoot, { recursive: true, force: true });
  }
});

test("[AB-MVP-003] provider workspace rejects a symlinked local-state boundary", () => {
  const fixture = repositoryFixture();
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-source-state-outside-"));
  const stateRoot = path.join(os.tmpdir(), `agentbase-source-state-link-${process.pid}`);
  try {
    fs.symlinkSync(outside, stateRoot, "dir");
    assert.throws(() => prepareProviderWorkspace(fixture.root, "repository-fixture-0123456789ab", stateRoot), /symlink/);
  } finally {
    fixture.cleanup();
    fs.rmSync(stateRoot, { force: true });
    fs.rmSync(outside, { recursive: true, force: true });
  }
});
