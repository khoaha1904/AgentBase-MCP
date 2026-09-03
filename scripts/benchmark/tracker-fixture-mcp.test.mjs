import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { Client, InMemoryTransport } from "@modelcontextprotocol/client";

import { createTrackerMcpServer } from "./tracker-fixture-mcp.mjs";

const fixture = path.resolve(import.meta.dirname, "../../../AgentBase-AIT-Tracker-Fixture");

function result(call) {
  const text = call.content?.find((block) => block.type === "text")?.text;
  return JSON.parse(text ?? "{}");
}

test("tracker fixture exposes only bounded read operations and linked artifacts", async () => {
  assert.ok(fs.existsSync(fixture));
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const current = createTrackerMcpServer(fixture);
  const client = new Client({ name: "tracker-fixture-test", version: "0.0.0" });
  try {
    await current.server.connect(serverTransport);
    await client.connect(clientTransport);
    const tools = await client.listTools(undefined, { cacheMode: "bypass" });
    assert.deepEqual(tools.tools.map((tool) => tool.name), ["search_tracker", "get_tracker_artifact", "list_tracker_relations"]);
    const feature = result(await client.callTool({ name: "get_tracker_artifact", arguments: { id: "feature:readiness-health-contract" } }));
    assert.equal(feature.type, "Feature");
    assert.equal(feature.relations.some((link) => link.target === "us:health-endpoint"), true);
    const search = result(await client.callTool({ name: "search_tracker", arguments: { query: "readiness" } }));
    assert.equal(search.results.some((item) => item.id === "feature:readiness-health-contract"), true);
  } finally {
    await client.close();
    await current.server.close();
  }
});
