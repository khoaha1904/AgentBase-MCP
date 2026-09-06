import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { assertTaskGraphPreflight, compareTaskPair, compareTaskTriad, scoreTaskPlan, validateTaskPlan, validateTaskSession } from "./benchmark-task.mjs";

const commit = "a".repeat(40);
const hubCommit = "b".repeat(40);
const sourceRef = { id: "e1", kind: "source", path: "Code/server/src/app.js", start_line: 1, end_line: 2, commit };
const plan = {
  summary: "Align the backend readiness route and ECS checks.",
  tasks: [{ id: "T1", title: "Update backend route", reason: "Expose readiness contract",
    scope: ["Code/server/src/app.js"], dependencies: [], acceptance: ["test and verify /health"], evidence_refs: ["e1"] }],
  questions: ["Is /status compatibility required during rollout?"],
  known_unknowns: ["Live deployment and rollback behavior are not proven."],
  evidence_refs: [sourceRef],
};

const mcpEvent = (tool, args, result = { content: [{ type: "text", text: JSON.stringify({ file_path: "Code/server/src/app.js", source: "app.get('/status')" }) }] }) =>
  JSON.stringify({ type: "item.completed", item: { type: "mcp_tool_call", tool, arguments: args, status: "completed", result } });
const commandEvent = (output = "Code/server/src/app.js:1:app.get('/status')") => JSON.stringify({ type: "item.completed",
  item: { type: "command_execution", command: "/bin/bash -lc 'rg status'", aggregated_output: output, exit_code: 0, status: "completed" } });

function session(arm, additions = []) {
  return validateTaskSession([mcpEvent("search_tracker", { query: "health" }), commandEvent(), ...additions].join("\n"),
    { arm, sourceCommit: commit, sourceRoot: "<OUTPUT_ROOT>", tracker: { calls: 8 }, limits: {} });
}

test("[AB-CONTEXT-019..022][AB-BENCH-097] task arms share source and isolate graph and Hub", () => {
  assert.deepEqual(session("source-native").failures, []);
  const graph = [mcpEvent("index_repository", { repo_path: "<OUTPUT_ROOT>", mode: "fast" }),
    mcpEvent("search_graph", { query: "health" })];
  assert.deepEqual(session("source-plus-graph", graph).failures, []);
  assert.deepEqual(session("source-plus-graph", [mcpEvent("index_repository", { repo_path: "<OUTPUT_ROOT>", mode: "fast" }),
    mcpEvent("search_code", { project: "fixture", pattern: "health" })]).failures, []);
  assert.match(session("source-plus-graph", [mcpEvent("index_repository", { repo_path: "<OUTPUT_ROOT>", mode: "fast" }),
    mcpEvent("index_status", { project: "fixture" })]).failures.join(" "), /bounded graph navigation/);
  const hub = mcpEvent("search_hub_okf", { global: true, query: "health ownership", limit: 5 },
    { content: [{ type: "text", text: JSON.stringify({ path: "systems/readiness.md", commit: hubCommit }) }] });
  assert.deepEqual(session("source-plus-graph-plus-hub", [...graph, hub]).failures, []);
  assert.match(session("source-native", graph).failures.join(" "), /must not call Code Graph/);
  assert.match(session("source-plus-graph", [...graph, hub]).failures.join(" "), /must not query Hub/);
});

test("[AB-CONTEXT-019][AB-BENCH-097] every task plan requires exact pinned source evidence", (context) => {
  const sourceRoot = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-task-plan-"));
  context.after(() => fs.rmSync(sourceRoot, { recursive: true, force: true }));
  fs.mkdirSync(path.join(sourceRoot, "Code/server/src"), { recursive: true });
  fs.writeFileSync(path.join(sourceRoot, sourceRef.path), "line one\nline two\n");
  assert.deepEqual(validateTaskPlan(plan, { arm: "source-native", sourceCommit: commit, sourceRoot,
    hubCommit, trace: { paths: [] } }).failures, []);
  const withHub = { ...plan, evidence_refs: [...plan.evidence_refs,
    { id: "h1", kind: "hub", path: "systems/readiness.md", start_line: null, end_line: null, commit: hubCommit }] };
  assert.deepEqual(validateTaskPlan(withHub, { arm: "source-plus-graph-plus-hub", sourceCommit: commit,
    sourceRoot, hubCommit, trace: { paths: ["systems/readiness.md"] } }).failures, []);
  const drifted = { ...plan, evidence_refs: [{ ...sourceRef, commit: "c".repeat(40) }] };
  assert.match(validateTaskPlan(drifted, { arm: "source-native", sourceCommit: commit, sourceRoot,
    trace: { paths: [] } }).failures.join(" "), /not pinned/);
  const detailed = { ...plan, evidence_refs: Array.from({ length: 17 }, (_, index) => ({
    ...sourceRef, id: `e${index + 1}`,
  })) };
  assert.deepEqual(validateTaskPlan(detailed, { arm: "source-native", sourceCommit: commit, sourceRoot,
    trace: { paths: [] } }).failures, []);
});

test("[AB-CONTEXT-023] triad comparison reports graph and Hub increments separately", () => {
  const expectations = { probes: [
    { id: "route", priority: "critical", allTerms: ["Code/server/src/app.js", "/status"] },
    { id: "verify", priority: "important", allTerms: ["test", "verify"] },
    { id: "ownership", priority: "important", allTerms: ["repository", "ownership"] },
  ] };
  const sourceNative = { ...plan, tasks: [{ ...plan.tasks[0], acceptance: ["implement route"] }] };
  const graph = plan;
  const hub = { ...plan, summary: `${plan.summary} Repository ownership is explicit.` };
  const run = (output, elapsedMs, inputTokens) => ({ output, elapsedMs, usage: { inputTokens, outputTokens: 100 },
    qualification: { status: "passed" } });
  const result = compareTaskTriad({ "source-native": run(sourceNative, 100, 1000),
    "source-plus-graph": run(graph, 120, 1200), "source-plus-graph-plus-hub": run(hub, 140, 1400) }, expectations);
  assert.equal(result.status, "needs_review");
  assert.equal(result.qualifications["source-plus-graph"].status, "passed");
  assert.deepEqual(result.increments[0].newImportant, ["verify"]);
  assert.deepEqual(result.increments[1].newImportant, ["ownership"]);
  assert.deepEqual(scoreTaskPlan(hub, expectations).matched.critical, ["route"]);
});

test("[AB-CONTEXT-023] equal quality with lower time and tokens remains an owner-reviewed candidate", () => {
  const expectations = { probes: [{ id: "route", priority: "critical", allTerms: ["/status"] }] };
  const run = (elapsedMs, inputTokens) => ({ output: plan, elapsedMs, usage: { inputTokens, outputTokens: 100 },
    qualification: { status: "passed" } });
  const result = compareTaskTriad({ "source-native": run(200, 2000), "source-plus-graph": run(150, 1500),
    "source-plus-graph-plus-hub": run(170, 1800) }, expectations);
  assert.equal(result.status, "needs_review");
  assert.equal(result.increments[0].costReductionCandidate, true);
  assert.equal(result.increments[1].costReductionCandidate, false);
});

test("[AB-CONTEXT-023] source-versus-graph pair does not require a Hub arm", () => {
  const expectations = { probes: [{ id: "route", priority: "critical", allTerms: ["/status"] }] };
  const run = (elapsedMs, inputTokens) => ({ output: plan, elapsedMs, usage: { inputTokens, outputTokens: 100 },
    qualification: { status: "passed" } });
  const result = compareTaskPair({ "source-native": run(200, 2000), "source-plus-graph": run(150, 1500) }, expectations);
  assert.equal(result.status, "needs_review");
  assert.deepEqual(Object.keys(result.qualifications), ["source-native", "source-plus-graph"]);
  assert.equal(result.increments[0].costReductionCandidate, true);
});

test("[AB-BENCH-098] graph preflight rejects provider conflicts before model execution", () => {
  assert.doesNotThrow(() => assertTaskGraphPreflight({ status: 0, error: undefined }));
  assert.throws(() => assertTaskGraphPreflight({ status: 1, error: undefined }), /before model execution/);
});
