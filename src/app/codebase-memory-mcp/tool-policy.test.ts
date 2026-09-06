import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { controlledIndex, McpPolicyError } from "./tool-policy.ts";

function repository(prefix: string): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  fs.mkdirSync(path.join(root, ".git"));
  return root;
}

test("[AB-SOURCE-RESOLVE-001..003] resolves direct and nested selections to the nearest Git root", () => {
  const outer = repository("agentbase-source-resolver-");
  const nestedPath = path.join(outer, "services", "worker");
  const inner = path.join(nestedPath, "fixture");
  fs.mkdirSync(inner, { recursive: true });
  fs.mkdirSync(path.join(nestedPath, ".git"));
  try {
    assert.equal(controlledIndex({ repo_path: outer }).repositoryRoot, fs.realpathSync(outer));
    assert.equal(controlledIndex({ repo_path: inner }).repositoryRoot, fs.realpathSync(nestedPath));
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
    assert.equal(controlledIndex({ repo_path: linked }).repositoryRoot, fs.realpathSync(root));
  } finally {
    fs.rmSync(parent, { recursive: true, force: true });
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("[AB-SOURCE-RESOLVE-001] rejects readable directories outside a Git repository", () => {
  const filesystemRoot = path.parse(os.tmpdir()).root;
  assert.throws(() => controlledIndex({ repo_path: filesystemRoot }), (error: unknown) =>
    error instanceof McpPolicyError && /inside an existing Git repository/.test(error.message));
});
