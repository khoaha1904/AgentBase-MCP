import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { controlledIndex, McpPolicyError } from "./tool-policy.ts";

test("[AB-MCP-004][AB-MCP-005] accepts one absolute root and forces non-persistent private-cache indexing", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-policy-"));
  try {
    const result = controlledIndex({ repo_path: root, mode: "fast", name: "fixture" });
    assert.equal(result.repositoryRoot, fs.realpathSync(root));
    assert.deepEqual(result.arguments, { repo_path: fs.realpathSync(root), mode: "fast", name: "fixture", persistence: false });
    assert.equal(controlledIndex({ repo_path: root }, result.repositoryRoot).repositoryRoot, result.repositoryRoot);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test("[AB-MCP-004][AB-MCP-005] rejects invalid authority before provider invocation", () => {
  const first = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-policy-a-"));
  const second = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-policy-b-"));
  try {
    for (const argumentsValue of [
      { repo_path: "relative" },
      { repo_path: path.join(first, "missing") },
      { repo_path: first, persistence: true },
      { repo_path: first, mode: "cross-repo-intelligence" },
      { repo_path: first, target_projects: ["other"] },
    ]) assert.throws(() => controlledIndex(argumentsValue), McpPolicyError);
    assert.throws(() => controlledIndex({ repo_path: second }, fs.realpathSync(first)), /reconnect/);
  } finally {
    fs.rmSync(first, { recursive: true, force: true });
    fs.rmSync(second, { recursive: true, force: true });
  }
});
