import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { Client, InMemoryTransport } from "@modelcontextprotocol/client";

import type { ScopedSession } from "../../providers/codebase-memory/index.ts";
import { HUB_OKF_TOOLS } from "../hub-okf/index.ts";
import { createAgentBaseMcpServer } from "./server.ts";
import { SAFE_TOOLS } from "./tool-manifest.ts";
import { OKF_SCHEMA_TOOLS } from "./okf-schema-tools.ts";

test("[AB-MCP-001][AB-MCP-003][AB-MCP-008][AB-MCP-010] official client lists and calls the safe server surface", async () => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-server-repo-"));
  const state = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-server-state-"));
  let closes = 0;
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const current = createAgentBaseMcpServer({
    projectRoot: "/agentbase",
    stateRoot: state,
    providerFactory: async () => ({
      pid: 991,
      tools: SAFE_TOOLS,
      async invoke(name) { return { content: [{ type: "text", text: `forwarded:${name}` }] }; },
      async close() {
        closes += 1;
        return { status: "clean", pid: 991, graceful: true, forced: false, stderrBytes: 0 };
      },
    } satisfies ScopedSession),
  });
  const client = new Client({ name: "agentbase-test-client", version: "0.0.0" });
  try {
    await current.connect(serverTransport);
    await client.connect(clientTransport);
    const tools = await client.listTools(undefined, { cacheMode: "bypass" });
    assert.deepEqual(
      tools.tools.map((tool) => tool.name),
      [...HUB_OKF_TOOLS, ...OKF_SCHEMA_TOOLS, ...SAFE_TOOLS].map((tool) => tool.name),
    );
    const unconfiguredHub = await client.callTool({ name: "inspect_hub_okf_proposal", arguments: { proposal_id: "p1" } });
    assert.equal(unconfiguredHub.isError, true);
    const schemas = await client.callTool({ name: "list_okf_schemas", arguments: {} });
    assert.equal(schemas.isError, undefined);
    const before = await client.callTool({ name: "search_graph", arguments: { project: "fixture" } });
    assert.equal(before.isError, true);
    const indexed = await client.callTool({ name: "index_repository", arguments: { repo_path: repo } });
    assert.equal(indexed.content[0]?.type, "text");
    const queried = await client.callTool({ name: "get_architecture", arguments: { project: "fixture" } });
    assert.equal(queried.content[0]?.type === "text" ? queried.content[0].text : "", "forwarded:get_architecture");
  } finally {
    await client.close();
    await current.close();
    fs.rmSync(repo, { recursive: true, force: true });
    fs.rmSync(state, { recursive: true, force: true });
  }
  assert.equal(closes, 1);
});
