import assert from "node:assert/strict";
import test from "node:test";

import { assertProviderManifest, SAFE_TOOLS, SAFE_TOOL_NAMES } from "./tool-manifest.ts";

test("[AB-MCP-003][AB-MCP-006][AB-MCP-014] pins exactly the approved upstream-compatible tool schemas", () => {
  assert.equal(SAFE_TOOLS.length, 12);
  assert.deepEqual(SAFE_TOOLS.map((tool) => tool.name), [...SAFE_TOOL_NAMES]);
  for (const omitted of ["delete_project", "manage_adr", "ingest_traces"]) {
    assert.equal(SAFE_TOOLS.some((tool) => tool.name === omitted), false);
  }
  assert.doesNotThrow(() => assertProviderManifest(SAFE_TOOLS));
  const drifted = SAFE_TOOLS.map((tool) => tool.name === "search_graph"
    ? { ...tool, inputSchema: { type: "object", properties: {} } }
    : tool);
  assert.throws(() => assertProviderManifest(drifted), /schema drift: search_graph/);
});
