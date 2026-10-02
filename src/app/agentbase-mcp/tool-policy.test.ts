import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { controlledDiscovery, McpPolicyError } from "./tool-policy.ts";

function repository(prefix: string): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  fs.mkdirSync(path.join(root, ".git"));
  return root;
}

test("[AB-INGEST-023] census controls admit only the bounded discovery contract", (t) => {
  const root = repository("agentbase-index-budget-");
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const standard = controlledDiscovery({ repo_path: root });
  assert.equal(standard.discoveryMode, "standard");
  const confirmation = { seed_id: "discovery-seed-" + "a".repeat(24), user_confirmed: true, reason: "Missing deployment" };
  const expanded = controlledDiscovery({ repo_path: root, discovery_mode: "expanded", discovery_confirmation: confirmation });
  assert.equal(expanded.discoveryMode, "expanded");
  assert.deepEqual(expanded.discoveryConfirmation, confirmation);
  assert.throws(() => controlledDiscovery({ repo_path: root, discovery_mode: "unlimited" }), /discovery_mode/);
  assert.throws(() => controlledDiscovery({ repo_path: root, discovery_confirmation: confirmation }), /only allowed/);
});

test("[AB-SOURCE-RESOLVE-001..003] resolves direct and nested selections to the nearest Git root", () => {
  const outer = repository("agentbase-source-resolver-");
  const nestedPath = path.join(outer, "services", "worker");
  const inner = path.join(nestedPath, "fixture");
  fs.mkdirSync(inner, { recursive: true });
  fs.mkdirSync(path.join(nestedPath, ".git"));
  try {
    assert.equal(controlledDiscovery({ repo_path: outer }).repositoryRoot, fs.realpathSync(outer));
    assert.equal(controlledDiscovery({ repo_path: inner }).repositoryRoot, fs.realpathSync(nestedPath));
  } finally {
    fs.rmSync(outer, { recursive: true, force: true });
  }
});

test("[AB-SOURCE-RESOLVE-001..003] accepts a symlinked selection without changing repository identity", () => {
  const root = repository("agentbase-source-resolver-");
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-source-link-"));
  const linked = path.join(parent, "repository");
  fs.symlinkSync(root, linked, "dir");
  try {
    assert.equal(controlledDiscovery({ repo_path: linked }).repositoryRoot, fs.realpathSync(root));
  } finally {
    fs.rmSync(parent, { recursive: true, force: true });
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("[AB-SOURCE-RESOLVE-001] rejects readable directories outside a Git repository", () => {
  const filesystemRoot = path.parse(os.tmpdir()).root;
  assert.throws(() => controlledDiscovery({ repo_path: filesystemRoot }), (error: unknown) =>
    error instanceof McpPolicyError && /inside an existing Git repository/.test(error.message));
});
