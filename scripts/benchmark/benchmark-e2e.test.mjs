import assert from "node:assert/strict";
import test from "node:test";

import { compareE2ePair, scoreE2eOutput, validateE2eOutput, validateE2eSession } from "./benchmark-e2e.mjs";

const commit = "a".repeat(40);
const output = {
  feature_summary: "Standardize readiness for ECS traffic.",
  user_story: { title: "Expose readiness", statement: "As an operator I want a readiness endpoint for ECS.", acceptance_criteria: ["A ready service returns a successful response."] },
  tasks: [{ id: "T1", title: "Update backend and infrastructure", reason: "Align the contract", scope: ["Code/server/src/app.js", "Infrastructure/main.tf"], dependencies: [], acceptance: ["test and verify the change"], evidence_refs: ["e1"] }],
  questions: ["Is /status compatibility required?"], known_unknowns: ["rollback behavior is unknown"],
  evidence_refs: [{ id: "e1", kind: "codegraph", path: "Code/server/src/app.js", commit }],
};
const event = (tool, arguments_, result = { content: [{ type: "text", text: JSON.stringify({ file_path: "Code/server/src/app.js" }) }] }) => JSON.stringify({ type: "item.completed", item: { type: "mcp_tool_call", tool, arguments: arguments_, status: "completed", result } });

test("end-to-end session keeps the two extremes isolated", () => {
  const direct = validateE2eSession(event("get_tracker_artifact", { id: "feature:readiness-health-contract" }), { arm: "e2e-without-agentbase", sourceCommit: commit, tracker: { calls: 8 } });
  assert.deepEqual(direct.failures, []);
  const full = validateE2eSession([event("get_tracker_artifact", { id: "feature:readiness-health-contract" }), event("search_hub_okf", { query: "readiness", limit: 8 }), event("index_repository", { repo_path: "<OUTPUT_ROOT>" }), event("get_code_snippet", { qualified_name: "app" })].join("\n"), { arm: "e2e-with-agentbase", sourceCommit: commit, tracker: { calls: 8 } });
  assert.deepEqual(full.failures, []);
  const leakedUs = validateE2eSession(event("get_tracker_artifact", { id: "us:health-endpoint" }), { arm: "e2e-without-agentbase", sourceCommit: commit, tracker: { calls: 8 } });
  assert.match(leakedUs.failures.join(" "), /existing US/);
});

test("end-to-end output requires one generated US and traced evidence", () => {
  assert.deepEqual(validateE2eOutput(output, { arm: "e2e-with-agentbase", sourceCommit: commit, trace: { paths: ["Code/server/src/app.js"] } }).failures, []);
  const direct = { ...output, evidence_refs: [{ ...output.evidence_refs[0] }], tasks: [{ ...output.tasks[0], evidence_refs: ["e1"] }] };
  assert.match(validateE2eOutput(direct, { arm: "e2e-without-agentbase", sourceCommit: commit, trace: { paths: [] } }).failures.join(" "), /without-AgentBase/);
});

test("end-to-end comparison reports an important full-arm gain", () => {
  const expectations = { probes: [{ id: "goal", priority: "critical", allTerms: ["readiness", "ecs"] }, { id: "source", priority: "important", allTerms: ["Code/server/src/app.js", "Infrastructure/main.tf"] }] };
  const direct = { ...output, tasks: [{ ...output.tasks[0], scope: ["backend"], evidence_refs: [] }], evidence_refs: [] };
  const result = compareE2ePair({ direct: { output: direct, qualification: { status: "passed" } }, assisted: { output, qualification: { status: "passed" } } }, expectations);
  assert.equal(result.status, "needs_review"); assert.deepEqual(scoreE2eOutput(output, expectations).matched.important, ["source"]);
});
