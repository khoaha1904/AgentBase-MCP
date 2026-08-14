import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

import { buildCodexArgs, renderAgentPrompt, runAgentRepository } from "./benchmark-agent.mjs";

test("[AB-BENCH-002][AB-BENCH-003] Codex invocation is ephemeral, isolated and requires AgentBase MCP", () => {
  const args = buildCodexArgs({ workspace: "/result/workspace", finalMessage: "/result/final.md", model: "model-x", reasoningEffort: "medium" });
  assert.ok(args.includes("--ephemeral"));
  assert.deepEqual(args.slice(0, 3), ["--ask-for-approval", "never", "exec"]);
  assert.ok(args.includes("--json"));
  assert.ok(args.includes("--ignore-user-config"));
  assert.ok(args.includes("--skip-git-repo-check"));
  assert.deepEqual(args.slice(args.indexOf("--sandbox"), args.indexOf("--sandbox") + 2), ["--sandbox", "workspace-write"]);
  assert.ok(args.includes("mcp_servers.agentbase.required=true"));
  assert.ok(args.includes('mcp_servers.agentbase.default_tools_approval_mode="approve"'));
  assert.equal(args.at(-1), "-");
});

test("[AB-BENCH-001][AB-BENCH-007] prompt rendering is exact and rejects missing inputs", () => {
  assert.equal(renderAgentPrompt("{{A}}/{{B}}", { A: "one", B: "two" }), "one/two");
  assert.throws(() => renderAgentPrompt("{{MISSING}}", {}), /prompt value is missing/);
});

test("[AB-BENCH-002][AB-BENCH-006][AB-BENCH-007] fake Codex run captures artifacts and preserves source", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-agent-benchmark-"));
  try {
    const source = path.join(root, "source");
    fs.mkdirSync(source);
    fs.writeFileSync(path.join(source, "README.md"), "unchanged\n");
    for (const args of [["init"], ["config", "user.name", "Benchmark"], ["config", "user.email", "benchmark@example.invalid"], ["add", "."], ["commit", "-m", "fixture"]]) {
      assert.equal(spawnSync("git", ["-C", source, ...args], { encoding: "utf8" }).status, 0);
    }
    const fake = path.join(root, "fake-codex.mjs");
    fs.writeFileSync(fake, `#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
if (process.argv[2] === "--version") { console.log("fake-codex 1.0.0"); process.exit(0); }
const args = process.argv.slice(2);
const workspace = args[args.indexOf("--cd") + 1];
const finalMessage = args[args.indexOf("--output-last-message") + 1];
fs.mkdirSync(path.join(workspace, "okf"));
fs.writeFileSync(path.join(workspace, "okf", "index.md"), "---\\nokf_version: \\\"0.2\\\"\\n---\\n\\n# Empty\\n");
fs.writeFileSync(finalMessage, "done\\n");
for (const tool of ["index_repository", "list_okf_schemas", "select_okf_schemas", "get_okf_schema", "validate_okf_concept"]) console.log(JSON.stringify({ type: "item.completed", item: { type: "mcp_tool_call", tool, status: "completed" } }));
`);
    fs.chmodSync(fake, 0o755);
    const commit = spawnSync("git", ["-C", source, "rev-parse", "HEAD"], { encoding: "utf8" }).stdout.trim();
    const resultRoot = path.join(root, "result");
    const result = runAgentRepository({
      manifest: { suite: "test", catalogVersion: "3.0.0", promptVersion: "okf-author-v1", agent: { executable: fake, version: "fake-codex 1.0.0", model: "fake", reasoningEffort: "medium", timeoutMs: 10_000 } },
      entry: { id: "fixture", kind: "test", path: "fixture", commit }, repository: source, root: resultRoot, executable: fake,
    });
    assert.equal(result.outcome, "succeeded");
    assert.equal(spawnSync("git", ["-C", source, "status", "--porcelain"], { encoding: "utf8" }).stdout, "");
    for (const artifact of ["run.json", "prompt.md", "agent-events.jsonl", "agent-final.md", "okf/index.md"]) assert.ok(fs.existsSync(path.join(resultRoot, artifact)));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
