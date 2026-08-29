import assert from "node:assert/strict";
import test from "node:test";

import { compareTaskPair, scoreTaskPlan, validateTaskPlan, validateTaskSession } from "./benchmark-task.mjs";

const commit = "a".repeat(40);
const plan = {
  summary: "Align the backend readiness route and ECS checks.",
  tasks: [{ id: "T1", title: "Update backend route", reason: "Expose readiness contract", scope: ["Code/server/src/app.js"], dependencies: [], acceptance: ["test and verify /health"], evidence_refs: ["e1"] }],
  questions: ["Is /status compatibility required during rollout?"] ,
  known_unknowns: ["Live deployment and rollback behavior are not proven."],
  evidence_refs: [{ id: "e1", path: "Code/server/src/app.js", start_line: 17, end_line: 32, commit }],
};

const event = (tool, args, result = { content: [{ type: "text", text: JSON.stringify({ file_path: "Code/server/src/app.js", source: "app.get('/status')" }) }] }) => JSON.stringify({ type: "item.completed", item: { type: "mcp_tool_call", tool, arguments: args, status: "completed", result } });

test("task session isolates direct and assisted tools", () => {
  const direct = validateTaskSession(event("search_tracker", { query: "health" }), { arm: "task-planning-only", sourceCommit: commit, sourceRoot: "<OUTPUT_ROOT>", tracker: { calls: 8 } });
  assert.deepEqual(direct.failures, []);
  const assisted = validateTaskSession([event("search_tracker", { query: "health" }), event("index_repository", { repo_path: "<OUTPUT_ROOT>", mode: "fast" }), event("search_graph", { query: "health" })].join("\n"), { arm: "task-planning-plus-agentbase", sourceCommit: commit, sourceRoot: "<OUTPUT_ROOT>", tracker: { calls: 8 } });
  assert.deepEqual(assisted.failures, []);
  const leaked = validateTaskSession(event("search_graph", { query: "health" }), { arm: "task-planning-only", sourceCommit: commit, sourceRoot: "<OUTPUT_ROOT>", tracker: { calls: 8 } });
  assert.match(leaked.failures.join(" "), /direct arm/);
});

test("task plan requires pinned, traced evidence", () => {
  assert.deepEqual(validateTaskPlan(plan, { arm: "task-planning-plus-agentbase", sourceCommit: commit, trace: { paths: ["Code/server/src/app.js"] } }).failures, []);
  const drifted = { ...plan, evidence_refs: [{ ...plan.evidence_refs[0], commit: "b".repeat(40) }] };
  assert.match(validateTaskPlan(drifted, { arm: "task-planning-plus-agentbase", sourceCommit: commit, trace: { paths: ["Code/server/src/app.js"] } }).failures.join(" "), /not pinned/);
});

test("comparison requires critical correctness and an important gain", () => {
  const expectations = { probes: [{ id: "route", priority: "critical", allTerms: ["Code/server/src/app.js", "/status"] }, { id: "verify", priority: "important", allTerms: ["test", "verify"] }] };
  const direct = { ...plan, tasks: [{ ...plan.tasks[0], acceptance: ["implement the route"], evidence_refs: [] }], evidence_refs: [] };
  const result = compareTaskPair({ direct: { output: direct, qualification: { status: "passed" } }, assisted: { output: plan, qualification: { status: "passed" } } }, expectations);
  assert.equal(result.status, "needs_review");
  assert.deepEqual(scoreTaskPlan(plan, expectations).matched.critical, ["route"]);
});
