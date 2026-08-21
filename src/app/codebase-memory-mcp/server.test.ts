import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { Client, InMemoryTransport } from "@modelcontextprotocol/client";

import type { ScopedSession } from "../../providers/codebase-memory/index.ts";
import { createHubRuntimeActions, HUB_OKF_TOOLS } from "../hub-okf/index.ts";
import { createAgentBaseMcpServer } from "./server.ts";
import { SAFE_TOOLS } from "./tool-manifest.ts";
import { OKF_SCHEMA_TOOLS } from "./okf-schema-tools.ts";
import { runGit } from "../../providers/github-hub/index.ts";

test("[AB-MCP-001][AB-MCP-003][AB-MCP-008][AB-MCP-010] official client lists and calls the safe server surface", async () => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-server-repo-"));
  const state = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-server-state-"));
  let closes = 0;
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const runtimeActions = createHubRuntimeActions({ HOME: state, XDG_CONFIG_HOME: path.join(state, "config") }, path.join(state, "hub-runtime"));
  let liveSource: unknown;
  const current = createAgentBaseMcpServer({
    projectRoot: "/agentbase",
    stateRoot: state,
    hubActions: { ...runtimeActions, async readLiveEvidence(_relativePath, source) { liveSource = source; return source; } },
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
    const hubStatus = await client.callTool({ name: "get_hub_status", arguments: {} });
    assert.equal(hubStatus.isError, undefined);
    assert.match(hubStatus.content[0]?.type === "text" ? hubStatus.content[0].text : "", /unconfigured/);
    const unconfiguredHub = await client.callTool({ name: "prepare_hub_okf", arguments: {
      mode: "new", source_repository: repo, subject_directory: "repositories/acme",
      guidance_request: {
        candidates: [{ id: "system", identity_hint: "acme", identity_basis: "documented capability",
          query_value: "Acme capability", disposition: "concept", suggested_type: "System",
          evidence_ids: ["docs.system"], promotion: { basis: "operational", evidence_ids: ["docs.system"] } }],
        semantic_observations: [{ id: "docs.system", candidate_id: "system", role: "documentation",
          signal: "software system capability", source: { path: "README.md", start_line: 1, end_line: 1 } }],
        resource_observations: [],
      },
    } });
    assert.equal(unconfiguredHub.isError, true);
    assert.match(unconfiguredHub.content[0]?.type === "text" ? unconfiguredHub.content[0].text : "", /not configured/);
    const schemas = await client.callTool({ name: "list_okf_schemas", arguments: {} });
    assert.equal(schemas.isError, undefined);
    const before = await client.callTool({ name: "search_graph", arguments: { project: "fixture" } });
    assert.equal(before.isError, true);
    const indexed = await client.callTool({ name: "index_repository", arguments: { repo_path: repo } });
    assert.equal(indexed.content[0]?.type, "text");
    const live = await client.callTool({ name: "read_hub_live_evidence", arguments: { path: "systems/checkout.md" } });
    assert.equal(live.isError, undefined);
    assert.match(JSON.stringify(liveSource), /repository-agentbase-server-repo-/);
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

test("[AB-QUERY-006..008][SC-001/003] host workflow rereads changed source and never falls back for missing evidence", async () => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-live-source-"));
  const state = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-live-state-"));
  const setting = path.join(repo, "config.ts");
  fs.writeFileSync(setting, "export const SESSION_TTL_DAYS = 7;\n");
  await runGit({ args: ["init", "-b", "main"], cwd: repo, operation: "initialize live source" });
  await runGit({ args: ["add", "config.ts"], cwd: repo, operation: "stage live source" });
  await runGit({ args: ["-c", "user.name=AgentBase", "-c", "user.email=agentbase@localhost", "commit", "-m", "fixture"],
    cwd: repo, operation: "commit live source", commitTimestamp: "2026-08-17T00:00:00Z" });
  const runtimeActions = createHubRuntimeActions({ HOME: state, XDG_CONFIG_HOME: path.join(state, "config") }, path.join(state, "hub"));
  const sources: Array<{ repositoryId: string; dirty: boolean; dirtyDigest: string | null }> = [];
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const current = createAgentBaseMcpServer({
    projectRoot: "/agentbase", stateRoot: state,
    hubActions: { ...runtimeActions, async readLiveEvidence(_path, source) {
      assert.ok(source); sources.push(source);
      return { claims: [
        { id: "AB-CLAIM-ttl", role: "configuration", status: "ready", target: { kind: "symbol", name: "SESSION_TTL_DAYS" }, currentSource: source },
        { id: "AB-CLAIM-other", role: "documentation", status: "repository-mismatch", limitations: ["claim belongs to another repository"] },
      ] };
    } },
    providerFactory: async () => ({
      pid: 992, tools: SAFE_TOOLS,
      async invoke(name, argumentsValue) {
        if (name === "search_graph") return { content: [{ type: "text", text: fs.existsSync(setting)
          ? "SESSION_TTL_DAYS config.ts:1" : "unavailable: SESSION_TTL_DAYS was not found" }] };
        if (name === "get_code_snippet") return { content: [{ type: "text", text: fs.existsSync(setting)
          ? fs.readFileSync(setting, "utf8") : "unavailable: no current snippet" }] };
        return { content: [{ type: "text", text: `forwarded:${name}:${JSON.stringify(argumentsValue)}` }] };
      },
      async close() { return { status: "clean", pid: 992, graceful: true, forced: false, stderrBytes: 0 }; },
    }),
  });
  const client = new Client({ name: "agentbase-live-test", version: "0.0.0" });
  try {
    await current.connect(serverTransport); await client.connect(clientTransport);
    await client.callTool({ name: "index_repository", arguments: { repo_path: repo } });
    const bound = await client.callTool({ name: "read_hub_live_evidence", arguments: { path: "systems/checkout.md" } });
    assert.match(bound.content[0]?.type === "text" ? bound.content[0].text : "", /repository-mismatch/);
    const first = await client.callTool({ name: "get_code_snippet", arguments: { qualified_name: "SESSION_TTL_DAYS", project: "fixture" } });
    assert.match(first.content[0]?.type === "text" ? first.content[0].text : "", /7/);

    fs.writeFileSync(setting, "export const SESSION_TTL_DAYS = 30;\n");
    const dirty = await client.callTool({ name: "read_hub_live_evidence", arguments: { path: "systems/checkout.md" } });
    assert.match(dirty.content[0]?.type === "text" ? dirty.content[0].text : "", /\"dirty\":true/);
    const changed = await client.callTool({ name: "get_code_snippet", arguments: { qualified_name: "SESSION_TTL_DAYS", project: "fixture" } });
    const changedText = changed.content[0]?.type === "text" ? changed.content[0].text : "";
    assert.match(changedText, /30/); assert.doesNotMatch(changedText, /= 7/);
    assert.equal(sources.at(-1)?.dirty, true); assert.match(sources.at(-1)?.dirtyDigest ?? "", /^sha256:[a-f0-9]{64}$/);

    fs.rmSync(setting);
    const missing = await client.callTool({ name: "get_code_snippet", arguments: { qualified_name: "SESSION_TTL_DAYS", project: "fixture" } });
    const missingText = missing.content[0]?.type === "text" ? missing.content[0].text : "";
    assert.match(missingText, /unavailable/); assert.doesNotMatch(missingText, /7|30/);
  } finally {
    await client.close(); await current.close();
    fs.rmSync(repo, { recursive: true, force: true }); fs.rmSync(state, { recursive: true, force: true });
  }
});
