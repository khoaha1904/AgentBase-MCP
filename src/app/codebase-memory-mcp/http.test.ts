import assert from "node:assert/strict";
import test from "node:test";

import { createAgentBaseMcpHttpHandler } from "./http.ts";

test("[AB-MCPMOD-002][AB-MCPMOD-003] modern HTTP handler serves tools/list without a session", async () => {
  const handler = createAgentBaseMcpHttpHandler({ projectRoot: "/agentbase" });
  try {
    const response = await handler.fetch(new Request("https://agentbase.test/mcp", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "mcp-protocol-version": "2026-07-28",
        "mcp-method": "tools/list",
        "mcp-name": "agentbase-codebase-memory",
      },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list", params: {
        _meta: {
          "io.modelcontextprotocol/protocolVersion": "2026-07-28",
          "io.modelcontextprotocol/clientInfo": { name: "agentbase-test-client", version: "0.0.0" },
          "io.modelcontextprotocol/clientCapabilities": {},
        },
      } }),
    }));
    assert.equal(response.status, 200);
    const body = await response.json() as { result?: { tools?: unknown[] } };
    assert.ok(Array.isArray(body.result?.tools));
    assert.ok((body.result?.tools?.length ?? 0) > 0);
  } finally {
    await handler.close();
  }
});
