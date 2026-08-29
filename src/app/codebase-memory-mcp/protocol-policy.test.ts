import assert from "node:assert/strict";
import test from "node:test";

import {
  AGENTBASE_MCP_PROTOCOL_VERSIONS,
  AGENTBASE_MCP_SERVER_OPTIONS,
} from "./protocol-policy.ts";

test("[AB-MCPMOD-001] supports legacy stdio and modern MCP eras", () => {
  assert.deepEqual(AGENTBASE_MCP_PROTOCOL_VERSIONS, ["2025-11-25", "2026-07-28"]);
  assert.deepEqual(AGENTBASE_MCP_SERVER_OPTIONS.supportedProtocolVersions, ["2025-11-25", "2026-07-28"]);
});

test("[AB-MCPMOD-004] keeps conservative private tool-list caching", () => {
  assert.deepEqual(AGENTBASE_MCP_SERVER_OPTIONS.cacheHints, {
    "tools/list": { ttlMs: 0, cacheScope: "private" },
  });
});

