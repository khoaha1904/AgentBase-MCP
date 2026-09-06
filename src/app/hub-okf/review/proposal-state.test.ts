import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { acquireHubMutationLock, releaseHubMutationLock } from "./proposal-state.ts";

const PROFILE_A = "a".repeat(24);
const PROFILE_B = "b".repeat(24);
const DEAD_PID = 2_147_483_647;

function stateRoot(t: test.TestContext): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-profile-lock-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}

function writeLock(root: string, profileId: string, value: unknown): string {
  const lock = path.join(root, "mutation-locks", `${profileId}.lock`);
  fs.mkdirSync(lock, { recursive: true, mode: 0o700 });
  fs.chmodSync(lock, 0o700);
  fs.writeFileSync(path.join(lock, "owner.json"), `${JSON.stringify(value)}\n`, { mode: 0o600 });
  return lock;
}

test("[AB-CONCURRENCY-001..003][AB-CONCURRENCY-006][AB-CONCURRENCY-011..012] excludes same-profile writers while distinct Hub profiles remain independent", (t) => {
  const root = stateRoot(t);
  const first = acquireHubMutationLock(root, PROFILE_A, "accept:proposal-a");
  assert.equal(fs.statSync(first.root).mode & 0o777, 0o700);
  assert.equal(fs.statSync(path.join(first.root, "owner.json")).mode & 0o777, 0o600);
  const metadata = JSON.parse(fs.readFileSync(path.join(first.root, "owner.json"), "utf8"));
  assert.deepEqual(Object.keys(metadata).sort(), ["acquiredAt", "nonce", "ownerId", "pid", "profileId", "schemaVersion"]);
  assert.equal(metadata.profileId, PROFILE_A);
  assert.match(metadata.nonce, /^[a-f0-9]{32}$/);
  assert.throws(() => acquireHubMutationLock(root, PROFILE_A, "publish:proposal-b"), /owns the local profile lock/);

  const other = acquireHubMutationLock(root, PROFILE_B, "publish:proposal-b");
  releaseHubMutationLock(other);
  releaseHubMutationLock(first);
  assert.equal(fs.existsSync(first.root), false);
});

test("[AB-CONCURRENCY-003..005][AB-CONCURRENCY-012] reclaims only well-formed dead current and legacy owners", (t) => {
  const root = stateRoot(t);
  writeLock(root, PROFILE_A, {
    schemaVersion: 1,
    profileId: PROFILE_A,
    ownerId: "sync:stale-owner",
    pid: DEAD_PID,
    acquiredAt: "2026-09-04T00:00:00.000Z",
    nonce: "c".repeat(32),
  });
  const recovered = acquireHubMutationLock(root, PROFILE_A, "sync:new-owner");
  assert.notEqual(recovered.nonce, "c".repeat(32));
  releaseHubMutationLock(recovered);

  const legacy = path.join(root, "mutation.lock");
  fs.mkdirSync(legacy, { mode: 0o700 });
  fs.writeFileSync(path.join(legacy, "owner.json"), `${JSON.stringify({ ownerId: "sync:legacy-owner", pid: DEAD_PID })}\n`, { mode: 0o600 });
  const afterLegacy = acquireHubMutationLock(root, PROFILE_B, "sync:after-legacy");
  assert.equal(fs.existsSync(legacy), false);
  releaseHubMutationLock(afterLegacy);

  writeLock(root, PROFILE_A, {});
  assert.throws(() => acquireHubMutationLock(root, PROFILE_A, "sync:blocked-owner"), /requires owner repair/);
  assert.equal(fs.existsSync(path.join(root, "mutation-locks", `${PROFILE_A}.lock`)), true);
});

test("[AB-CONCURRENCY-004..006][AB-CONCURRENCY-012] preserves live and replaced ownership", (t) => {
  const root = stateRoot(t);
  const legacy = path.join(root, "mutation.lock");
  fs.mkdirSync(legacy, { mode: 0o700 });
  fs.writeFileSync(path.join(legacy, "owner.json"), `${JSON.stringify({ ownerId: "sync:live-owner", pid: process.pid })}\n`, { mode: 0o600 });
  assert.throws(() => acquireHubMutationLock(root, PROFILE_A, "sync:new-owner"), /legacy local lock/);
  assert.equal(fs.existsSync(legacy), true);
  fs.rmSync(legacy, { recursive: true });

  const lock = acquireHubMutationLock(root, PROFILE_A, "accept:owned-proposal");
  const ownerFile = path.join(lock.root, "owner.json"), metadata = JSON.parse(fs.readFileSync(ownerFile, "utf8"));
  fs.writeFileSync(ownerFile, `${JSON.stringify({ ...metadata, nonce: "d".repeat(32) })}\n`);
  assert.throws(() => releaseHubMutationLock(lock), /ownership changed/);
  assert.equal(fs.existsSync(lock.root), true);

  const unsafeRoot = stateRoot(t), redirected = path.join(unsafeRoot, "redirected");
  fs.mkdirSync(redirected);
  fs.symlinkSync(redirected, path.join(unsafeRoot, "mutation-locks"), "dir");
  assert.throws(() => acquireHubMutationLock(unsafeRoot, PROFILE_B, "accept:unsafe-parent"), /parent is unsafe/);
});
