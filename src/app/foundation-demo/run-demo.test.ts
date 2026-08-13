import assert from "node:assert/strict";
import test from "node:test";

import { stableSerialize } from "../../core/code-intelligence/index.ts";
import { executeFoundationCli, runFoundationDemo } from "./index.ts";

test("[AB-FND-004][SC-FND-002] returns the map followed by the accepted neighborhood", async () => {
  const result = await runFoundationDemo();
  assert.equal(result.repositoryMap.nodes.filter((node) => node.kind === "file").length, 12);
  assert.equal(result.benchmark.distinctFiles, 3);
  assert.equal(result.benchmark.missingNodeIds.length, 0);
  assert.equal(result.benchmark.missingEdgeIds.length, 0);
});

test("[AB-FND-008][SC-FND-003] produces byte-equivalent normalized output five times", async () => {
  const serializations = await Promise.all(Array.from({ length: 5 }, async () => stableSerialize(await runFoundationDemo())));
  assert.equal(new Set(serializations).size, 1);
});

test("[AB-FND-019] CLI completes locally and emits one complete JSON flow", async () => {
  let stdout = "";
  let stderr = "";
  const status = await executeFoundationCli((value) => { stdout += value; }, (value) => { stderr += value; });
  assert.equal(status, 0, stderr);
  const output = JSON.parse(stdout);
  assert.equal(output.repositoryMap.snapshot.completeness, "complete");
  assert.equal(output.relevantNeighborhood.completeness, "complete");
  assert.equal(output.benchmark.passed, true);
});
