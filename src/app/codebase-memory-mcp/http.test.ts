import assert from "node:assert/strict";
import test from "node:test";

import { createAgentBaseMcpHttpHandler } from "./http.ts";

const MODERN_META = {
  "io.modelcontextprotocol/protocolVersion": "2026-07-28",
  "io.modelcontextprotocol/clientInfo": { name: "agentbase-test-client", version: "0.0.0" },
  "io.modelcontextprotocol/clientCapabilities": {},
};

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
        _meta: MODERN_META,
      } }),
    }));
    assert.equal(response.status, 200);
    const body = await response.json() as { result?: { tools?: Array<{ inputSchema?: { $schema?: string } }> } };
    assert.ok(Array.isArray(body.result?.tools));
    assert.ok((body.result?.tools?.length ?? 0) > 0);
    assert.ok(body.result?.tools?.every((tool) =>
      tool.inputSchema?.$schema === "https://json-schema.org/draft/2020-12/schema"));
  } finally {
    await handler.close();
  }
});

test("[AB-MCPMOD-001] modern discovery advertises only the modern wire era", async () => {
  const handler = createAgentBaseMcpHttpHandler({ projectRoot: "/agentbase" });
  try {
    const response = await handler.fetch(new Request("https://agentbase.test/mcp", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "mcp-protocol-version": "2026-07-28",
        "mcp-method": "server/discover",
        "mcp-name": "agentbase-codebase-memory",
      },
      body: JSON.stringify({ jsonrpc: "2.0", id: 2, method: "server/discover", params: { _meta: MODERN_META } }),
    }));
    const body = await response.json() as { result?: { supportedVersions?: string[]; resultType?: string } };
    assert.equal(response.status, 200);
    assert.deepEqual(body.result?.supportedVersions, ["2026-07-28"]);
    assert.equal(body.result?.resultType, "complete");
  } finally {
    await handler.close();
  }
});

test("[AB-MCPMOD-003] legacy initialize remains available through stateless fallback", async () => {
  const handler = createAgentBaseMcpHttpHandler({ projectRoot: "/agentbase" });
  try {
    const response = await handler.fetch(new Request("https://agentbase.test/mcp", {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 3, method: "initialize", params: {
        protocolVersion: "2025-11-25", capabilities: {},
        clientInfo: { name: "agentbase-test-client", version: "0.0.0" },
      } }),
    }));
    const body = await response.text();
    assert.equal(response.status, 200);
    assert.match(body, /"protocolVersion":"2025-11-25"/);
  } finally {
    await handler.close();
  }
});
