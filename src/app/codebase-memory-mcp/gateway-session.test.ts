import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import type { ScopedSession } from "../../providers/codebase-memory/index.ts";
import { GatewaySession, type RawProviderFactory } from "./gateway-session.ts";
import { SAFE_TOOLS } from "./tool-manifest.ts";

function fixtureFactory(events: string[], drift = false): RawProviderFactory {
  return async ({ repositoryRoot, cacheRoot }) => {
    events.push(`open:${repositoryRoot}`);
    events.push(`cache:${cacheRoot}`);
    const tools = drift
      ? SAFE_TOOLS.map((tool) => tool.name === "trace_path" ? { ...tool, inputSchema: { type: "null" } } : tool)
      : SAFE_TOOLS;
    let closed = false;
    return {
      pid: 777,
      tools,
      async invoke(name, argumentsValue) {
        events.push(`call:${name}:${JSON.stringify(argumentsValue)}`);
        return { content: [{ type: "text", text: name }], structuredContent: { argumentsValue } };
      },
      async close() {
        if (!closed) events.push("close");
        closed = true;
        return { status: "clean", pid: 777, graceful: true, forced: false, stderrBytes: 0 };
      },
    } satisfies ScopedSession;
  };
}

test("[AB-MCP-001][AB-MCP-002][AB-MCP-007][AB-MCP-008][AB-MCP-010] lazily binds, forwards raw results and closes once", async () => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-gateway-repo-"));
  const state = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-gateway-state-"));
  const events: string[] = [];
  try {
    const gateway = new GatewaySession({ projectRoot: "/agentbase", stateRoot: state, providerFactory: fixtureFactory(events) });
    await assert.rejects(gateway.call("search_graph", { project: "fixture" }), /index_repository/);
    assert.equal(events.length, 0);
    const indexed = await gateway.call("index_repository", { repo_path: repo, mode: "fast" });
    assert.equal(indexed.content[0]?.type, "text");
    const queried = await gateway.call("search_graph", { project: "fixture", query: "login" });
    assert.deepEqual(queried.structuredContent, { argumentsValue: { project: "fixture", query: "login" } });
    assert.equal(events.filter((event) => event.startsWith("open:")).length, 1);
    assert.match(events.find((event) => event.startsWith("call:index_repository")) ?? "", /"persistence":false/);
    const cache = events.find((event) => event.startsWith("cache:"))?.slice(6) ?? "";
    assert.equal(cache.startsWith(repo), false);
    assert.equal((await gateway.close()).status, "clean");
    await gateway.close();
    assert.equal(events.filter((event) => event === "close").length, 1);
  } finally {
    fs.rmSync(repo, { recursive: true, force: true });
    fs.rmSync(state, { recursive: true, force: true });
  }
});

test("[AB-MCP-003][AB-MCP-009][AB-MCP-010] rejects schema drift and cleans the candidate provider", async () => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-gateway-drift-"));
  const state = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-gateway-state-"));
  const events: string[] = [];
  try {
    const gateway = new GatewaySession({ projectRoot: "/agentbase", stateRoot: state, providerFactory: fixtureFactory(events, true) });
    await assert.rejects(gateway.call("index_repository", { repo_path: repo }), /schema drift/);
    assert.deepEqual(events.filter((event) => event === "close"), ["close"]);
    assert.equal(gateway.repositoryRoot, undefined);
  } finally {
    fs.rmSync(repo, { recursive: true, force: true });
    fs.rmSync(state, { recursive: true, force: true });
  }
});
