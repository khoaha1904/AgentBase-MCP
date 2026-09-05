import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { Client, InMemoryTransport } from "@modelcontextprotocol/client";

import { createTrackerMcpServer } from "./tracker-fixture-mcp.mjs";

function result(call) {
  const text = call.content?.find((block) => block.type === "text")?.text;
  return JSON.parse(text ?? "{}");
}

test("tracker fixture exposes only bounded read operations and linked artifacts", async () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-tracker-fixture-"));
  fs.mkdirSync(path.join(fixture, "features"));
  fs.mkdirSync(path.join(fixture, "user-stories"));
  fs.writeFileSync(path.join(fixture, "features", "readiness.md"), `---
type: Feature
id: feature:readiness-health-contract
title: Standardize the readiness health contract
status: discovery
relations:
  - type: decomposes-to
    target: us:health-endpoint
---

Readiness discovery context.
`);
  fs.writeFileSync(path.join(fixture, "user-stories", "health-endpoint.md"), `---
type: User Story
id: us:health-endpoint
title: Expose a stable readiness endpoint
status: drafted
relations: []
---

Readiness endpoint acceptance criteria.
`);
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
    fs.rmSync(fixture, { recursive: true, force: true });
  }
});
