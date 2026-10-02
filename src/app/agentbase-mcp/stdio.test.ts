import assert from "node:assert/strict";
import test from "node:test";

import { Client, InMemoryTransport } from "@modelcontextprotocol/client";

import { serveAgentBaseMcp } from "./server.ts";

test("[AB-MCPMOD-001][AB-MCPMOD-003] stdio auto-negotiates the modern era", async () => {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const server = serveAgentBaseMcp(serverTransport);
  const client = new Client(
    { name: "agentbase-modern-stdio-test", version: "0.0.0" },
    { versionNegotiation: { mode: "auto" } },
  );
  try {
    await client.connect(clientTransport);
    assert.equal(client.getProtocolEra(), "modern");
    assert.equal(client.getNegotiatedProtocolVersion(), "2026-07-28");
    assert.ok((await client.listTools()).tools.length > 0);
  } finally {
    await client.close();
    await server.close();
  }
});
