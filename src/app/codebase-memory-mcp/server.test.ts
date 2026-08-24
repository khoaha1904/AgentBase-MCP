import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { Client, InMemoryTransport } from "@modelcontextprotocol/client";

import type { ScopedSession } from "../../providers/codebase-memory/index.ts";
import {
  createHubRuntimeActions, executeHubCli, HUB_OKF_TOOLS, readActiveHubObservedValues,
} from "../hub-okf/index.ts";
import {
  normalizeRepositoryObservedValues, parseConceptDocument, renderConceptDocument,
} from "../../core/knowledge/index.ts";
import { createAgentBaseMcpServer } from "./server.ts";
import { GatewaySession } from "./gateway-session.ts";
import { SAFE_TOOLS } from "./tool-manifest.ts";
import { OKF_SCHEMA_TOOLS } from "./okf-schema-tools.ts";

test("[AB-MCP-001][AB-MCP-003][AB-MCP-008][AB-MCP-010][AB-INGEST-003] official client lists and calls the safe server surface", async () => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-server-repo-"));
  const secondRepo = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-server-repo-"));
  const state = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-server-state-"));
  let closes = 0;
  const bindings: string[] = [];
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const runtimeActions = createHubRuntimeActions({ HOME: state, XDG_CONFIG_HOME: path.join(state, "config") }, path.join(state, "hub-runtime"));
  let observedReads = 0, freshnessReads = 0, initializationPreviews = 0, initializations = 0;
  const freshnessReport = { commit: "f".repeat(40), generated_at: "2026-08-22T00:00:00.000Z",
    publication_layer: "published", summary: { total: 0, observed: 0, unknown: 0 }, repositories: [] };
  const hubActions = { ...runtimeActions,
    async readObservedValues(relativePath: string) {
      observedReads += 1;
      return { path: relativePath, values: [], source_access: "not-checked" };
    },
    async readFreshness() { freshnessReads += 1; return freshnessReport; },
    async previewHubInitialization() { initializationPreviews += 1; return { state: "changes-required", base_commit: "a".repeat(40) }; },
    async initializeHub(input: Readonly<{ expectedBase: string; expectedInitializationDigest: string }>) {
      initializations += 1; return input;
    },
  };
  const current = createAgentBaseMcpServer({
    projectRoot: "/agentbase",
    stateRoot: state,
    hubActions,
    providerFactory: async ({ repositoryRoot }) => {
      bindings.push(repositoryRoot);
      return {
      pid: 991,
      tools: SAFE_TOOLS,
      async invoke(name) { return { content: [{ type: "text", text: `forwarded:${name}:${path.basename(repositoryRoot)}` }] }; },
      async close() {
        closes += 1;
        return { status: "clean", pid: 991, graceful: true, forced: false, stderrBytes: 0 };
      },
    } satisfies ScopedSession;
    },
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
    const prepareTool = tools.tools.find((tool) => tool.name === "prepare_hub_okf");
    const finalizeTool = tools.tools.find((tool) => tool.name === "finalize_hub_okf_proposal");
    assert.match(prepareTool?.description ?? "", /changed paths, observed source state and known gaps/);
    assert.ok("lifecycle_intents" in ((finalizeTool?.inputSchema.properties ?? {}) as Record<string, unknown>));
    assert.match(JSON.stringify(finalizeTool?.inputSchema), /observation_refs/);
    assert.doesNotMatch(JSON.stringify(finalizeTool?.inputSchema), /claim_ids/);
    const enrichmentTools = tools.tools.filter((tool) => tool.name.includes("domain_enrichment"));
    assert.deepEqual(enrichmentTools.map((tool) => tool.name), ["prepare_domain_enrichment",
      "revise_domain_enrichment_membership", "run_domain_enrichment", "finalize_domain_enrichment_proposal"]);
    assert.doesNotMatch(JSON.stringify(enrichmentTools), /credential|access_key|secret_key|profile_path|executable|arbitrary_command/);
    const batchTools = tools.tools.filter((tool) => tool.name.includes("batch_hub_ingest"));
    assert.deepEqual(batchTools.map((tool) => tool.name), ["prepare_batch_hub_ingest", "confirm_batch_hub_ingest",
      "record_batch_hub_ingest_member", "retry_batch_hub_ingest_member",
      "revise_batch_hub_ingest_membership", "finalize_batch_hub_ingest_proposal"]);
    assert.doesNotMatch(JSON.stringify(batchTools), /workspace_scan|parallel|credential|publish|accept/);
    const recordBatch = batchTools.find((tool) => tool.name === "record_batch_hub_ingest_member");
    assert.match(JSON.stringify(recordBatch), /observed_values.*exact property.*role.*source_id/);
    assert.match(JSON.stringify(recordBatch), /\^\[A-Za-z0-9\]/);
    const hubStatus = await client.callTool({ name: "get_hub_status", arguments: {} });
    assert.equal(hubStatus.isError, undefined);
    assert.match(hubStatus.content[0]?.type === "text" ? hubStatus.content[0].text : "", /unconfigured/);
    assert.equal(fs.existsSync(path.join(state, "config")), false, "status must not create Hub configuration state");
    const before = await client.callTool({ name: "search_graph", arguments: { project: "fixture" } });
    assert.equal(before.isError, true);
    const indexed = await client.callTool({ name: "index_repository", arguments: { repo_path: repo } });
    assert.equal(indexed.content[0]?.type, "text");
    const graphWithoutHub = await client.callTool({ name: "get_architecture", arguments: { project: "fixture" } });
    assert.match(graphWithoutHub.content[0]?.type === "text" ? graphWithoutHub.content[0].text : "", /forwarded:get_architecture/);
    const stillUnconfigured = await client.callTool({ name: "get_hub_status", arguments: {} });
    assert.match(stillUnconfigured.content[0]?.type === "text" ? stillUnconfigured.content[0].text : "", /unconfigured/);
    assert.equal(fs.existsSync(path.join(state, "config")), false, "Code Graph use must not create Hub state");
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
    assert.equal(unconfiguredHub.isError, undefined);
    const localStatus = await client.callTool({ name: "get_hub_status", arguments: {} });
    assert.match(localStatus.content[0]?.type === "text" ? localStatus.content[0].text : "", /local-only/);
    const schemas = await client.callTool({ name: "list_okf_schemas", arguments: {} });
    assert.equal(schemas.isError, undefined);
    const invalidGuidance = await client.callTool({ name: "get_okf_authoring_schemas", arguments: {
      candidates: [
        { id: "function", identity_hint: "worker", identity_basis: "deployed runtime", query_value: "Worker runtime",
          disposition: "concept", suggested_type: "Function", evidence_ids: ["docs.worker"] },
        { id: "queue", identity_hint: "work queue", identity_basis: "internal transport", query_value: "Queue role",
          disposition: "embedded", parent_candidate_id: "function", evidence_ids: ["docs.worker"] },
      ],
      semantic_observations: [{ id: "docs.worker", candidate_id: "function", role: "documentation",
        signal: "independently deployed worker", source: { path: "README.md", start_line: 1, end_line: 1 } }],
      resource_observations: [],
    } });
    assert.equal(invalidGuidance.isError, true);
    const guidanceError = JSON.parse(invalidGuidance.content[0]?.type === "text" ? invalidGuidance.content[0].text : "{}");
    assert.deepEqual({ code: guidanceError.code, retryable: guidanceError.retryable, recovery: guidanceError.recovery }, {
      code: "INVALID_ARGUMENT", retryable: true, recovery: "correct-and-retry-same-tool",
    });
    const observed = await client.callTool({ name: "read_hub_observed_values", arguments: { path: "systems/checkout.md" } });
    assert.equal(observed.isError, undefined);
    assert.match(observed.content[0]?.type === "text" ? observed.content[0].text : "", /"source_access":"not-checked"/);
    assert.equal(observedReads, 1);
    const freshness = await client.callTool({ name: "read_hub_freshness", arguments: {} });
    const freshnessText = freshness.content[0]?.type === "text" ? freshness.content[0].text : "";
    assert.deepEqual(JSON.parse(freshnessText), freshnessReport);
    let cliOutput = "";
    assert.equal(await executeHubCli(["freshness"], hubActions, (value) => { cliOutput += value; }), 0);
    assert.deepEqual(JSON.parse(cliOutput), freshnessReport);
    let cliError = "";
    assert.equal(await executeHubCli(["freshness", "--threshold", "7"], hubActions, () => {},
      (value) => { cliError += value; }), 1);
    assert.match(cliError, /accepts no arguments/);
    assert.equal(freshnessReads, 2);
    const initializationPreview = await client.callTool({ name: "preview_hub_initialization", arguments: {} });
    assert.match(initializationPreview.content[0]?.type === "text" ? initializationPreview.content[0].text : "", /"state":"changes-required"/);
    const initializationDigest = `sha256:${"b".repeat(64)}`;
    const initialization = await client.callTool({ name: "initialize_hub", arguments: {
      expected_base: "a".repeat(40), expected_initialization_digest: initializationDigest,
    } });
    assert.deepEqual(JSON.parse(initialization.content[0]?.type === "text" ? initialization.content[0].text : "{}"), {
      expectedBase: "a".repeat(40), expectedInitializationDigest: initializationDigest,
    });
    assert.equal(initializationPreviews, 1); assert.equal(initializations, 1);
    const queried = await client.callTool({ name: "get_architecture", arguments: { project: "fixture" } });
    assert.match(queried.content[0]?.type === "text" ? queried.content[0].text : "", /forwarded:get_architecture:agentbase-server-repo-/);
    const switched = await client.callTool({ name: "index_repository", arguments: { repo_path: secondRepo } });
    assert.equal(switched.isError, undefined);
    assert.equal(closes, 1);
    assert.deepEqual(bindings, [fs.realpathSync(repo), fs.realpathSync(secondRepo)]);
    const secondQuery = await client.callTool({ name: "get_architecture", arguments: { project: "fixture" } });
    assert.match(secondQuery.content[0]?.type === "text" ? secondQuery.content[0].text : "",
      new RegExp(`forwarded:get_architecture:${path.basename(secondRepo)}`));
  } finally {
    await client.close();
    await current.close();
    fs.rmSync(repo, { recursive: true, force: true });
    fs.rmSync(secondRepo, { recursive: true, force: true });
    fs.rmSync(state, { recursive: true, force: true });
  }
  assert.equal(closes, 2);

  const failedFirst = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-failed-switch-"));
  const blockedSecond = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-blocked-switch-"));
  let opened = 0;
  const gateway = new GatewaySession({ projectRoot: "/agentbase", stateRoot: state,
    providerFactory: async () => {
      opened += 1;
      return { pid: 993, tools: SAFE_TOOLS,
        async invoke() { return { content: [{ type: "text", text: "indexed" }] }; },
        async close() { return { status: "failed", pid: 993, graceful: false, forced: true, stderrBytes: 0 }; } };
    } });
  try {
    await gateway.call("index_repository", { repo_path: failedFirst });
    await assert.rejects(gateway.call("index_repository", { repo_path: blockedSecond }), /could not be cleaned up/);
    assert.equal(opened, 1);
    assert.equal(gateway.repositoryRoot, fs.realpathSync(failedFirst));
  } finally {
    await gateway.close();
    fs.rmSync(failedFirst, { recursive: true, force: true });
    fs.rmSync(blockedSecond, { recursive: true, force: true });
  }
});

test("[AB-QUERY-006..009][SC-001/003] observed-value query never binds or probes repository source", async () => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-observed-source-"));
  const state = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-observed-state-"));
  const setting = path.join(repo, "config.ts");
  fs.writeFileSync(setting, "export const SESSION_TTL_DAYS = 30;\n");
  const baseCommit = "1".repeat(40), draftCommit = "2".repeat(40);
  const repositoryId = "repository-checkout-123456789abc";
  const authored = parseConceptDocument("systems/checkout.md", [
    "---", "type: System", "status: draft",
    "generated: { by: agentbase/0.0.0, at: '2026-08-17T00:00:00Z' }",
    "sources:", "  - id: ttl-source", `    resource: repository://${repositoryId}/config.ts`,
    "agentbase:", "  observed_values:", "    - subject: systems/checkout",
    "      property: session.ttl", "      role: configuration", "      value: 7", "      source_id: ttl-source",
    "---", "# Checkout",
  ].join("\n"));
  const concept = normalizeRepositoryObservedValues(authored, {
    repositoryId, sourceState: { commit: "3".repeat(40), dirty: false, dirtyDigest: null },
    observedAt: "2026-08-17T00:00:00Z",
  });
  const conceptBytes = renderConceptDocument(concept);
  const queryGit = async (request: Readonly<{ operation: string }>) => ({
    stdout: request.operation === "read local Hub concept" ? conceptBytes
      : request.operation === "list pending ancestry" ? `${draftCommit}\n`
        : request.operation === "read pending proposal trailers" ? [
          "AgentBase-Proposal-ID: abcdef0123456789abcdef01",
          "AgentBase-Subject: systems/checkout",
          `AgentBase-Source-ID: ${repositoryId}`,
          `AgentBase-Evidence-Digest: sha256:${"4".repeat(64)}`,
          `AgentBase-Diff-Digest: sha256:${"5".repeat(64)}`,
          "AgentBase-Schema-Catalog: 7.0.0",
          "AgentBase-Proposal-Mode: refresh",
        ].join("\n")
          : request.operation === "resolve pending proposal parent" ? `${baseCommit}\n` : "",
    stderr: "",
  });
  const queried = await readActiveHubObservedValues({
    kind: "local-only", root: repo, localHubId: "6".repeat(24), baseCommit,
    remoteBase: baseCommit, activeHead: draftCommit, catalogVersion: "7.0.0",
  }, "systems/checkout.md", queryGit, () => new Date("2026-08-22T00:00:00Z"));
  assert.equal(queried.publication_layer, "local-draft");
  assert.equal(queried.proposal_id, "abcdef0123456789abcdef01");
  assert.equal(queried.values[0]?.age_milliseconds, 432_000_000);
  assert.equal(queried.values[0]?.source_access, "not-checked");
  const runtimeActions = createHubRuntimeActions({ HOME: state, XDG_CONFIG_HOME: path.join(state, "config") }, path.join(state, "hub"));
  let reads = 0;
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const current = createAgentBaseMcpServer({
    projectRoot: "/agentbase", stateRoot: state,
    hubActions: { ...runtimeActions, async readObservedValues(relativePath) {
      reads += 1;
      return { commit: "a".repeat(40), path: relativePath, conceptId: "systems/checkout",
        publication_layer: "published", values: [{ id: `AB-OBS-${"b".repeat(24)}`, value: 7,
          observed: { commit: "c".repeat(40), dirty: false, dirtyDigest: null, at: "2026-08-17T00:00:00Z" },
          age_milliseconds: 432_000_000, source_access: "not-checked" }] };
    } },
    providerFactory: async () => ({
      pid: 992, tools: SAFE_TOOLS,
      async invoke(name, argumentsValue) { return { content: [{ type: "text", text: `forwarded:${name}:${JSON.stringify(argumentsValue)}` }] }; },
      async close() { return { status: "clean", pid: 992, graceful: true, forced: false, stderrBytes: 0 }; },
    }),
  });
  const client = new Client({ name: "agentbase-observed-test", version: "0.0.0" });
  try {
    await current.connect(serverTransport); await client.connect(clientTransport);
    await client.callTool({ name: "index_repository", arguments: { repo_path: repo } });
    const snapshot = await client.callTool({ name: "read_hub_observed_values", arguments: { path: "systems/checkout.md" } });
    const snapshotText = snapshot.content[0]?.type === "text" ? snapshot.content[0].text : "";
    assert.match(snapshotText, /\"value\":7/);
    assert.match(snapshotText, /\"source_access\":\"not-checked\"/);
    assert.doesNotMatch(snapshotText, /SESSION_TTL_DAYS|repositoryRoot|currentSource/);
    assert.equal(reads, 1);
  } finally {
    await client.close(); await current.close();
    fs.rmSync(repo, { recursive: true, force: true }); fs.rmSync(state, { recursive: true, force: true });
  }
});
