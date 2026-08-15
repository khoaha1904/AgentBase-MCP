import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

import { buildCodexArgs, portableAgentText, renderAgentPrompt, runAgentRepository } from "./benchmark-agent.mjs";
import * as benchmarkAgent from "./benchmark-agent.mjs";

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

test("[AB-BENCH-010][AB-BENCH-011] direct invocation omits AgentBase MCP while MCP remains required", () => {
  const common = { workspace: "/result/workspace", finalMessage: "/result/final.md", model: "model-x", reasoningEffort: "medium" };
  const mcp = buildCodexArgs({ ...common, arm: "mcp" });
  const direct = buildCodexArgs({ ...common, arm: "direct" });
  assert.ok(mcp.some((arg) => arg.startsWith("mcp_servers.agentbase.")));
  assert.equal(direct.some((arg) => arg.startsWith("mcp_servers.agentbase.")), false);
});

test("[AB-BENCH-012][AB-BENCH-013][AB-BENCH-014] event summary uses final usage and preserves unknown fields", () => {
  const authoringArguments = { signals: ["aws lambda"] };
  const authoringResult = { content: [{ type: "text", text: "guidance" }] };
  const summary = benchmarkAgent.summarizeAgentEvents([
    JSON.stringify({ type: "turn.completed", usage: { input_tokens: 5, output_tokens: 2 } }),
    "{malformed",
    JSON.stringify({ type: "item.completed", item: { type: "mcp_tool_call", tool: "query", status: "completed" } }),
    JSON.stringify({ type: "item.completed", item: { type: "mcp_tool_call", tool: "query", status: "completed" } }),
    JSON.stringify({ type: "item.completed", item: {
      type: "mcp_tool_call", tool: "get_okf_authoring_schemas", status: "completed",
      arguments: authoringArguments, result: authoringResult,
    } }),
    JSON.stringify({ type: "item.completed", item: { type: "command_execution", status: "completed" } }),
    JSON.stringify({ type: "turn.completed", usage: { input_tokens: 10 } }),
  ].join("\n"));
  assert.deepEqual(summary.usage, {
    inputTokens: 10,
    cachedInputTokens: null,
    cacheWriteInputTokens: null,
    uncachedInputTokens: null,
    outputTokens: null,
    reasoningOutputTokens: null,
  });
  assert.deepEqual(summary.activity, {
    mcpToolCalls: 3,
    commandExecutions: 1,
    authoringToolCalls: 1,
    authoringArgumentBytes: Buffer.byteLength(JSON.stringify(authoringArguments)),
    authoringResultBytes: Buffer.byteLength(JSON.stringify(authoringResult)),
    authoringTools: {
      get_okf_authoring_schemas: {
        calls: 1,
        argumentBytes: Buffer.byteLength(JSON.stringify(authoringArguments)),
        resultBytes: Buffer.byteLength(JSON.stringify(authoringResult)),
      },
    },
    observedSourceReadBytes: null,
    limitation: "event trace does not prove complete source-read volume",
  });
});

test("[AB-BENCH-024][AB-BENCH-032][AB-BENCH-034] v4 keeps shared quality rules and uses only batch authoring tools", () => {
  const prompts = path.resolve(import.meta.dirname, "..", "benchmark", "prompts");
  const v3 = fs.readFileSync(path.join(prompts, "okf-author-v3.md"), "utf8");
  const mcp = fs.readFileSync(path.join(prompts, "okf-author-v4.md"), "utf8");
  const direct = fs.readFileSync(path.join(prompts, "okf-author-direct-v4.md"), "utf8");
  const shared = (value) => value.split("## Shared authoring contract\n")[1]?.split("## Arm-specific workflow\n")[0];
  assert.equal(shared(mcp), shared(v3));
  assert.equal(shared(mcp), shared(direct));
  assert.match(mcp, /get_okf_authoring_schemas/);
  assert.match(mcp, /validate_okf_bundle/);
  for (const legacy of ["`list_okf_schemas`", "`select_okf_schemas`", "`get_okf_schema`", "`validate_okf_concept`", "`validate_okf_relationships`"]) {
    assert.equal(mcp.includes(legacy), false, legacy);
  }
  assert.equal(direct.includes("get_okf_authoring_schemas"), false);
  assert.equal(direct.includes("validate_okf_bundle"), false);
  for (const goldOnly of ["aha-primary-region-lambda", "deploy_aha/variables.tf", "declares|aha-primary-region-lambda"]) {
    assert.equal(mcp.includes(goldOnly), false, goldOnly);
    assert.equal(direct.includes(goldOnly), false, goldOnly);
  }
});

test("[AB-BENCH-024][AB-BENCH-036][AB-BENCH-037] v5 uses canonical useful units without benchmark metadata", () => {
  const prompts = path.resolve(import.meta.dirname, "..", "benchmark", "prompts");
  const mcp = fs.readFileSync(path.join(prompts, "okf-author-v5.md"), "utf8");
  const direct = fs.readFileSync(path.join(prompts, "okf-author-direct-v5.md"), "utf8");
  const shared = (value) => value.split("## Shared authoring contract\n")[1]?.split("## Arm-specific workflow\n")[0];
  assert.ok(shared(mcp));
  assert.equal(shared(mcp), shared(direct));
  for (const rule of ["one canonical concept", "API Surface", "implementation-only handlers", "useful Markdown", "Limitations", "unresolved items"]) {
    assert.ok(shared(mcp).includes(rule), rule);
  }
  assert.equal(mcp.includes("benchmark_key"), false);
  assert.equal(direct.includes("benchmark_key"), false);
  assert.match(mcp, /get_okf_authoring_schemas/);
  assert.match(mcp, /validate_okf_bundle/);
});

test("[AB-BENCH-001][AB-BENCH-007] prompt rendering is exact and rejects missing inputs", () => {
  assert.equal(renderAgentPrompt("{{A}}/{{B}}", { A: "one", B: "two" }), "one/two");
  assert.throws(() => renderAgentPrompt("{{MISSING}}", {}), /prompt value is missing/);
});

test("[AB-BENCH-018][AB-BENCH-019][AB-BENCH-022][AB-BENCH-024][AB-BENCH-031] v3 prompts share quality rules without gold answers", () => {
  const prompts = path.resolve(import.meta.dirname, "..", "benchmark", "prompts");
  const mcp = fs.readFileSync(path.join(prompts, "okf-author-v3.md"), "utf8");
  const direct = fs.readFileSync(path.join(prompts, "okf-author-direct-v3.md"), "utf8");
  const shared = (value) => value.split("## Shared authoring contract\n")[1]?.split("## Arm-specific workflow\n")[0];
  assert.ok(shared(mcp));
  assert.equal(shared(mcp), shared(direct));
  for (const rule of [
    'okf_version: "0.2"', "stable resource or business behavior", "most concrete supported",
    "relationship guidance", "frontmatter", "Markdown link", "exact line spans", "limitations",
  ]) assert.ok(shared(mcp).includes(rule), rule);
  for (const goldOnly of ["aha-primary-region-lambda", "deploy_aha/variables.tf", "declares|aha-primary-region-lambda"]) {
    assert.equal(mcp.includes(goldOnly), false, goldOnly);
    assert.equal(direct.includes(goldOnly), false, goldOnly);
  }
  assert.match(mcp, /validate_okf_relationships/);
  assert.equal(direct.includes("validate_okf_relationships"), false);
  assert.equal(fs.existsSync(path.join(prompts, "okf-author-v1.md")), true);
  assert.equal(fs.existsSync(path.join(prompts, "okf-author-direct-v1.md")), true);
  assert.equal(fs.existsSync(path.join(prompts, "okf-author-v2.md")), true);
  assert.equal(fs.existsSync(path.join(prompts, "okf-author-direct-v2.md")), true);
});

test("[AB-BENCH-007][AB-BENCH-012] captured agent text removes task and home-local roots", () => {
  const repository = path.join(os.homedir(), "source");
  const workspace = path.join(os.tmpdir(), "output");
  assert.equal(
    portableAgentText(`${repository} ${workspace} ${path.join(os.homedir(), ".codex", "skill.md")}`, { repository, workspace }),
    "<SOURCE_ROOT> <OUTPUT_ROOT> <HOME>/.codex/skill.md",
  );
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
for (const tool of ["index_repository", "list_okf_schemas", "select_okf_schemas", "get_okf_schema", "validate_okf_concept", "validate_okf_relationships", "get_okf_authoring_schemas", "validate_okf_bundle"]) console.log(JSON.stringify({ type: "item.completed", item: { type: "mcp_tool_call", tool, status: "completed", arguments: {}, result: {} } }));
`);
    fs.chmodSync(fake, 0o755);
    const commit = spawnSync("git", ["-C", source, "rev-parse", "HEAD"], { encoding: "utf8" }).stdout.trim();
    const resultRoot = path.join(root, "result");
    const result = runAgentRepository({
      manifest: { suite: "test", catalogVersion: "3.0.0", promptVersion: "okf-author-v3", agent: { executable: fake, version: "fake-codex 1.0.0", model: "fake", reasoningEffort: "medium", timeoutMs: 10_000 } },
      entry: { id: "fixture", kind: "test", path: "fixture", commit }, repository: source, root: resultRoot, executable: fake,
    });
    assert.equal(result.outcome, "succeeded");
    assert.equal(result.requiredToolUsage.validate_okf_relationships, true);
    const v4 = runAgentRepository({
      manifest: { suite: "test", catalogVersion: "3.0.0", promptVersion: "okf-author-v4", agent: { executable: fake, version: "fake-codex 1.0.0", model: "fake", reasoningEffort: "medium", timeoutMs: 10_000 } },
      entry: { id: "fixture", kind: "test", path: "fixture", commit }, repository: source,
      root: path.join(root, "result-v4"), executable: fake,
    });
    assert.equal(v4.outcome, "succeeded");
    assert.deepEqual(v4.requiredToolUsage, {
      index_repository: true, get_okf_authoring_schemas: true, validate_okf_bundle: true,
    });
    const v5 = runAgentRepository({
      manifest: { suite: "test", catalogVersion: "4.0.0", promptVersion: "okf-author-v5", agent: { executable: fake, version: "fake-codex 1.0.0", model: "fake", reasoningEffort: "medium", timeoutMs: 10_000 } },
      entry: { id: "fixture", kind: "test", path: "fixture", commit }, repository: source,
      root: path.join(root, "result-v5"), executable: fake,
    });
    assert.equal(v5.outcome, "succeeded");
    assert.deepEqual(v5.requiredToolUsage, v4.requiredToolUsage);
    assert.equal(v4.activity.authoringToolCalls, 7);
    assert.equal(spawnSync("git", ["-C", source, "status", "--porcelain"], { encoding: "utf8" }).stdout, "");
    for (const artifact of ["run.json", "prompt.md", "agent-events.jsonl", "agent-final.md", "okf/index.md"]) assert.ok(fs.existsSync(path.join(resultRoot, artifact)));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("[AB-BENCH-010][AB-BENCH-012] fake direct run has no MCP requirement and retains measurements", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-direct-benchmark-"));
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
if (args.some((arg) => arg.startsWith("mcp_servers.agentbase."))) process.exit(9);
const workspace = args[args.indexOf("--cd") + 1];
const finalMessage = args[args.indexOf("--output-last-message") + 1];
fs.mkdirSync(path.join(workspace, "okf"));
fs.writeFileSync(path.join(workspace, "okf", "index.md"), ["---", 'okf_version: "0.2"', "---", "", "# Empty", ""].join(String.fromCharCode(10)));
fs.writeFileSync(finalMessage, "done");
console.log(JSON.stringify({ type: "turn.completed", usage: { input_tokens: 20, output_tokens: 4 } }));
`);
    fs.chmodSync(fake, 0o755);
    const commit = spawnSync("git", ["-C", source, "rev-parse", "HEAD"], { encoding: "utf8" }).stdout.trim();
    const result = runAgentRepository({
      manifest: { suite: "test", catalogVersion: "3.0.0", promptVersion: "okf-author-v1", agent: { executable: fake, version: "fake-codex 1.0.0", model: "fake", reasoningEffort: "medium", timeoutMs: 10_000 } },
      entry: { id: "fixture", kind: "test", path: "fixture", commit }, repository: source,
      root: path.join(root, "result"), executable: fake, arm: "direct",
    });
    assert.equal(result.outcome, "succeeded");
    assert.equal(result.arm, "direct");
    assert.deepEqual(result.requiredToolUsage, {});
    assert.equal(result.usage.inputTokens, 20);
    assert.equal(result.usage.cachedInputTokens, null);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
