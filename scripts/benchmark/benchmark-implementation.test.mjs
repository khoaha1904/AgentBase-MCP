import assert from "node:assert/strict";
import test from "node:test";

import {
  assessImplementationOutcome, compareImplementationPair, validateImplementationSession,
} from "./benchmark-implementation.mjs";

const mcp = (tool, args = {}, result = {}) => JSON.stringify({ type: "item.completed", item: {
  type: "mcp_tool_call", tool, arguments: args, status: "completed", result,
} });

test("[AB-CONTEXT-024..026] implementation arms isolate graph without forbidding edits", () => {
  assert.deepEqual(validateImplementationSession("", { arm: "source-native" }).failures, []);
  const graph = [
    mcp("index_repository", { repo_path: "<OUTPUT_ROOT>", persistence: false }),
    mcp("search_graph", { query: "app server error" }),
  ].join("\n");
  assert.deepEqual(validateImplementationSession(graph, { arm: "source-plus-graph" }).failures, []);
  assert.match(validateImplementationSession(graph, { arm: "source-native" }).failures.join(" "), /must not call/);
});

test("[AB-CONTEXT-025][AB-BENCH-099] implementation admission requires scoped changes and every verifier", () => {
  const input = { processOk: true, traceFailures: [],
    paths: ["src/app.mjs", "src/app.test.mjs"],
    requiredPaths: ["src/app.mjs", "src/app.test.mjs"],
    allowedPaths: ["src/app.mjs", "src/app.test.mjs"],
    checks: [{ name: "focused", status: "passed" }, { name: "hidden", status: "passed" }] };
  assert.equal(assessImplementationOutcome(input).status, "passed");
  assert.match(assessImplementationOutcome({ ...input, paths: [...input.paths, "package.json"] }).failures.join(" "), /out-of-scope/);
  assert.match(assessImplementationOutcome({ ...input,
    checks: [{ name: "hidden", status: "failed" }] }).failures.join(" "), /hidden/);
});

test("[AB-CONTEXT-027] correctness precedes implementation cost", () => {
  const run = (status, elapsedMs, tokens) => ({ qualification: { status }, elapsedMs,
    usage: { inputTokens: tokens, outputTokens: 0 }, patch: { additions: 4, deletions: 1 } });
  assert.equal(compareImplementationPair({ "source-native": run("passed", 100, 100),
    "source-plus-graph": run("failed", 10, 10) }).status, "needs_revision");
  assert.equal(compareImplementationPair({ "source-native": run("passed", 100, 100),
    "source-plus-graph": run("passed", 80, 80) }).meaningfulCostReduction, true);
});
