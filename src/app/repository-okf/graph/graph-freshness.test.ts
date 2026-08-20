import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import type { EngineIdentity, RepositorySourceState } from "../../../core/observations/index.ts";
import {
  commitGraphFreshnessReceipt,
  createGraphFreshnessReceipt,
  decideGraphPreparation,
  readGraphFreshnessReceipt,
} from "./graph-freshness.ts";

const source: RepositorySourceState = {
  repositoryId: "repository-fixture-123456789abc",
  displayName: "Human Display Name",
  identityHints: { remotes: [], rootCommits: [] },
  commit: "a".repeat(40),
  dirty: false,
  dirtyDigest: null,
  capturedAt: "2026-08-12T00:00:00.000Z",
  limitations: [],
};

const engine: EngineIdentity = {
  provider: "codebase-memory-mcp",
  packageName: "codebase-memory-mcp",
  providerVersion: "0.10.1",
  packageIntegrity: "sha512-package",
  executableSha256: "3".repeat(64),
  adapterVersion: 1,
  invocationMode: "scoped-session",
};

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-freshness-"));
  return { root, receiptPath: path.join(root, "freshness.json"), cleanup: () => fs.rmSync(root, { recursive: true, force: true }) };
}

test("[AB-REFRESH-001][AB-REFRESH-002][AB-REFRESH-003] receipt validates bounded identity and exact freshness", () => {
  const receipt = createGraphFreshnessReceipt({
    source,
    engine,
    namespaceId: "b".repeat(64),
    evidenceDigest: `sha256:${"c".repeat(64)}`,
    acceptedAt: "2026-08-12T00:01:00.000Z",
  });
  assert.deepEqual(decideGraphPreparation({ receipt, source, engine, namespaceId: "b".repeat(64), forced: false }), {
    mode: "reused", reason: "exact-match",
  });
  assert.equal(JSON.stringify(receipt).includes(source.displayName), false);
  assert.equal(JSON.stringify(receipt).includes(source.capturedAt), false);
  const changedSource = { ...source, dirty: true, dirtyDigest: `sha256:${"d".repeat(64)}` };
  assert.deepEqual(decideGraphPreparation({
    receipt, source: changedSource, engine, namespaceId: "b".repeat(64), forced: false,
  }), {
    mode: "refreshed", reason: "source-changed",
  });
  assert.deepEqual(decideGraphPreparation({ receipt, source, engine: { ...engine, adapterVersion: 2 }, namespaceId: "b".repeat(64), forced: false }), {
    mode: "refreshed", reason: "provider-changed",
  });
  assert.deepEqual(decideGraphPreparation({ receipt, source, engine, namespaceId: "b".repeat(64), forced: true }), {
    mode: "refreshed", reason: "forced",
  });
});

test("[AB-REFRESH-003] absent, malformed, unsupported and symlink receipts are not reusable", () => {
  const current = fixture();
  try {
    assert.equal(readGraphFreshnessReceipt(current.receiptPath), null);
    fs.writeFileSync(current.receiptPath, "not-json\n", { mode: 0o600 });
    assert.equal(readGraphFreshnessReceipt(current.receiptPath), null);
    fs.writeFileSync(current.receiptPath, JSON.stringify({ schemaVersion: 99 }), { mode: 0o600 });
    assert.equal(readGraphFreshnessReceipt(current.receiptPath), null);
    fs.rmSync(current.receiptPath);
    const target = path.join(current.root, "target.json");
    fs.writeFileSync(target, "{}\n");
    fs.symlinkSync(target, current.receiptPath);
    assert.equal(readGraphFreshnessReceipt(current.receiptPath), null);
    assert.deepEqual(decideGraphPreparation({ receipt: null, source, engine, namespaceId: "b".repeat(64), forced: false }), {
      mode: "refreshed", reason: "missing-receipt",
    });
  } finally {
    current.cleanup();
  }
});

test("[AB-REFRESH-007] receipt commit is private and a failed atomic replace preserves prior bytes", () => {
  const current = fixture();
  const receipt = createGraphFreshnessReceipt({
    source, engine, namespaceId: "b".repeat(64), evidenceDigest: `sha256:${"c".repeat(64)}`,
    acceptedAt: "2026-08-12T00:01:00.000Z",
  });
  try {
    fs.writeFileSync(current.receiptPath, "previous\n", { mode: 0o600 });
    assert.throws(() => commitGraphFreshnessReceipt(current.receiptPath, receipt, {
      renameSync() { throw new Error("rename failed"); },
    }), /rename failed/);
    assert.equal(fs.readFileSync(current.receiptPath, "utf8"), "previous\n");
    assert.deepEqual(fs.readdirSync(current.root), ["freshness.json"]);

    commitGraphFreshnessReceipt(current.receiptPath, receipt);
    assert.equal(fs.statSync(current.receiptPath).mode & 0o777, 0o600);
    assert.deepEqual(readGraphFreshnessReceipt(current.receiptPath), receipt);
  } finally {
    current.cleanup();
  }
});
