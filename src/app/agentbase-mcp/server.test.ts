import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { Client, InMemoryTransport } from "@modelcontextprotocol/client";

import {
  createHubRuntimeActions, HUB_OKF_TOOLS, readPublishedHubConcept, searchPublishedHub,
} from "../hub-okf/index.ts";
import { createHubIdentity } from "../../core/hub/index.ts";
import { createAgentBaseMcpServer } from "./server.ts";
import { DISCOVERY_TOOL } from "./discovery-tool.ts";
import { callOkfSchemaTool, OKF_SCHEMA_TOOLS } from "./okf-schema-tools.ts";

function repository(prefix: string): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  fs.mkdirSync(path.join(root, ".git"));
  return root;
}

test("[AB-REFRESH-017..018] session validation excludes changed skeleton targets and admits Published relationship targets", async () => {
  const content = [
    "---", "type: Function", "title: Reader", "description: Reads a shared queue.", "status: draft",
    "generated: { by: 'agentbase/0.0.0', at: '2026-08-31T00:00:00Z' }",
    "sources:", "  - id: source", "    resource: agentbase://fixture",
    "relationships:", "  - { kind: part-of, target: domains/orders, evidence: [source] }",
    "---", "", "# Reader", "", "[Orders](../index.md)", "",
  ].join("\n");
  const response = await callOkfSchemaTool("validate_okf_changes", {
    session_id: `hub-session-${"a".repeat(24)}`,
    changes: [{ identity: "domains/orders/knowledge/reader", path: "domains/orders/knowledge/reader.md", content }],
    targets: [],
  }, {
    validateAuthoringSession: async () => ({ valid: true, targets: [
      { identity: "domains/orders/knowledge/reader", path: "domains/orders/knowledge/reader.md", type: "Function" },
      { identity: "domains/orders", path: "domains/orders/index.md", type: "Domain" },
    ] }),
  });
  const value = JSON.parse(response.content[0]?.type === "text" ? response.content[0].text : "{}");
  assert.equal(value.valid, true);
  assert.deepEqual(value.relationshipFailures, []);
});

test("[AB-DISC-007][AB-SCHEMA-049][AB-INGEST-003][AB-HOME-012][AB-PROFILE-LIFECYCLE-010][AB-PROFILE-READ-009..010][AB-REFRESH-020] official client lists and calls the safe server surface", async () => {
  const repo = repository("agentbase-server-repo-");
  const state = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-server-state-"));
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const runtimeActions = createHubRuntimeActions({ HOME: state, XDG_CONFIG_HOME: path.join(state, "config") }, path.join(state, "hub-runtime"));
  let initializationPreviews = 0, initializations = 0, visualizations = 0, validatedSessions = 0;
  let finalizedAccounting: unknown;
  const hubActions = { ...runtimeActions,
    async validate(sessionId: string) { validatedSessions += 1; return { valid: true, session_id: sessionId }; },
    async finalize(sessionId: string, _questions?: unknown, _removals?: unknown, changeAccounting?: unknown) {
      finalizedAccounting = changeAccounting;
      return { sessionId };
    },
    async previewHubInitialization() { initializationPreviews += 1; return { state: "changes-required", base_commit: "a".repeat(40) }; },
    async initializeHub(input: Readonly<{ expectedBase: string; expectedInitializationDigest: string }>) {
      initializations += 1; return input;
    },
    async visualize(input: Readonly<{ mode: "diagram"; domain: string;
      diagramType: "architecture" | "dependency" | "sequence"; conceptIds: readonly string[] }>
      | Readonly<{ mode: "domain-site"; domain: string; outputDirectory: string; visibilityAcknowledged: true }>) {
      visualizations += 1; return { status: "ready", ...input };
    },
  };
  const current = createAgentBaseMcpServer({
    hubStateRoot: path.join(state, "hub-runtime"),
    hubActions,
  });
  const client = new Client({ name: "agentbase-test-client", version: "0.0.0" });
  try {
    await current.connect(serverTransport);
    await client.connect(clientTransport);
    const tools = await client.listTools(undefined, { cacheMode: "bypass" });
    assert.deepEqual(
      tools.tools.map((tool) => tool.name),
      [...HUB_OKF_TOOLS, ...OKF_SCHEMA_TOOLS, DISCOVERY_TOOL].map((tool) => tool.name),
    );
    const toolNames = tools.tools.map((tool) => tool.name);
    assert.equal(toolNames.length, 36);
    assert.equal(tools.tools.every((tool) => tool.annotations
      && typeof tool.annotations.readOnlyHint === "boolean"
      && typeof tool.annotations.destructiveHint === "boolean"
      && typeof tool.annotations.idempotentHint === "boolean"
      && typeof tool.annotations.openWorldHint === "boolean"), true);
    const retiredToolNames = ["index_repository", "search_graph", "trace_path", "get_code_snippet", "get_architecture", "search_code", "index_status", "check_index_coverage", "detect_changes", "query_graph", "get_graph_schema", "list_projects", "select_okf_schemas",
      "validate_okf_concept", "validate_okf_relationships", "validate_okf_bundle"];
    assert.equal(toolNames.some((name) => retiredToolNames.includes(name)), false);
    assert.doesNotMatch(JSON.stringify(tools.tools), new RegExp(retiredToolNames.join("|")));
    const discoveryTool = tools.tools.find((tool) => tool.name === "discover_repository");
    assert.deepEqual(Object.keys(discoveryTool?.inputSchema.properties ?? {}).sort(),
      ["discovery_confirmation", "discovery_mode", "repo_path"]);
    assert.deepEqual(discoveryTool?.annotations, {
      readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false,
    });
    assert.deepEqual(tools.tools.find((tool) => tool.name === "search_hub_okf")?.annotations, {
      readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false,
    });
    assert.deepEqual(Object.keys(tools.tools.find((tool) => tool.name === "search_hub_okf")?.inputSchema.properties ?? {}).sort(),
      ["domain", "global", "limit", "query", "types"]);
    assert.equal(toolNames.includes("accept_hub_okf_proposal"), false);
    assert.equal(toolNames.includes("submit_hub_okf_proposals"), false);
    assert.equal(toolNames.includes("list_pending_hub_okf"), false);
    assert.deepEqual(tools.tools.find((tool) => tool.name === "prepare_hub_profile_migration")?.annotations, {
      readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false,
    });
    assert.deepEqual(tools.tools.find((tool) => tool.name === "publish_hub_okf_proposal")?.annotations, {
      readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true,
    });
    assert.deepEqual(toolNames.filter((name) => name === "search_hub_okf" || name === "read_hub_okf_concept"),
      ["search_hub_okf", "read_hub_okf_concept"]);
    const visualizationTool = tools.tools.find((tool) => tool.name === "prepare_hub_visualization");
    assert.deepEqual(Object.keys(visualizationTool?.inputSchema.properties ?? {}).sort(),
      ["concept_ids", "diagram_type", "domain", "mode", "output_directory", "visibility_acknowledged"]);
    assert.deepEqual(visualizationTool?.inputSchema.properties?.mode, { type: "string", enum: ["diagram", "domain-site"] });
    const visualization = await client.callTool({ name: "prepare_hub_visualization", arguments: {
      mode: "diagram", domain: "domains/commerce", diagram_type: "architecture",
      concept_ids: ["systems/orders"],
    } });
    assert.deepEqual(JSON.parse(visualization.content[0]?.type === "text" ? visualization.content[0].text : "{}"), {
      status: "ready", mode: "diagram", domain: "domains/commerce",
      diagramType: "architecture", conceptIds: ["systems/orders"],
    });
    assert.equal(visualization.structuredContent, undefined);
    const site = await client.callTool({ name: "prepare_hub_visualization", arguments: {
      mode: "domain-site", domain: "domains/commerce", output_directory: "/tmp/domain-site",
      visibility_acknowledged: true,
    } });
    assert.deepEqual(JSON.parse(site.content[0]?.type === "text" ? site.content[0].text : "{}"), {
      status: "ready", mode: "domain-site", domain: "domains/commerce",
      outputDirectory: "/tmp/domain-site", visibilityAcknowledged: true,
    });
    assert.equal(visualizations, 2);
    assert.equal(toolNames.some((name) => ["traverse_hub_okf", "read_hub_observed_values", "read_hub_freshness"].includes(name)), false);
    assert.equal(toolNames.includes("list_hub_questions") && toolNames.includes("answer_hub_question"), true);
    assert.equal(toolNames.filter((name) => name === "scan_workspace_repositories").length, 1);
    const bootstrapTools = tools.tools.filter((tool) => tool.name === "preview_hub_bootstrap" || tool.name === "bootstrap_hub");
    assert.equal(bootstrapTools.length, 2);
    assert.equal(bootstrapTools.every((tool) => !("mode" in (tool.inputSchema.properties ?? {}))), true);
    assert.match(bootstrapTools.find((tool) => tool.name === "bootstrap_hub")?.description ?? "", /knowledge remains pending/);
    const configureTool = tools.tools.find((tool) => tool.name === "configure_hub");
    assert.deepEqual(Object.keys(configureTool?.inputSchema.properties ?? {}).sort(), ["repository_url", "target_branch"]);
    const prepareTool = tools.tools.find((tool) => tool.name === "prepare_hub_okf");
    const finalizeTool = tools.tools.find((tool) => tool.name === "finalize_hub_okf_proposal");
    assert.match(prepareTool?.description ?? "", /changed paths, observed source state and known gaps/);
    assert.match(JSON.stringify(prepareTool?.inputSchema), /New Initial Ingest requires repositories\/<slug>/);
    assert.ok("home_plan" in ((prepareTool?.inputSchema.properties ?? {}) as Record<string, unknown>));
    assert.match(JSON.stringify((prepareTool?.inputSchema.properties ?? {}).home_plan), /default_home.*exceptions.*participations/);
    assert.deepEqual((prepareTool?.inputSchema.properties ?? {}).refresh_scope,
      { type: "string", enum: ["delta", "coverage"],
        description: "Refresh-only scope. Delta is backward-compatible default; coverage is explicit broad bounded recovery and requires coverage." });
    assert.ok("removals" in ((finalizeTool?.inputSchema.properties ?? {}) as Record<string, unknown>));
    assert.ok("change_accounting" in ((finalizeTool?.inputSchema.properties ?? {}) as Record<string, unknown>));
    assert.match(JSON.stringify(finalizeTool?.inputSchema), /updated.*new.*embedded.*question.*ignored/);
    assert.doesNotMatch(JSON.stringify(finalizeTool?.inputSchema), /supersede|retract|lifecycle/);
    assert.match(JSON.stringify(finalizeTool?.inputSchema), /observation_refs/);
    assert.doesNotMatch(JSON.stringify(finalizeTool?.inputSchema), /claim_ids/);
    await client.callTool({ name: "finalize_hub_okf_proposal", arguments: {
      session_id: `hub-session-${"a".repeat(24)}`,
      change_accounting: [{ path: "src/auth/forgot-password.ts", outcome: "new", reason: "Adds password reset." }],
    } });
    assert.deepEqual(finalizedAccounting, [{
      path: "src/auth/forgot-password.ts", outcome: "new", reason: "Adds password reset.",
    }]);
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
    assert.deepEqual(Object.keys(recordBatch?.inputSchema.properties ?? {}).sort(),
      ["manifest_id", "manifest_revision", "member_id", "session_id"]);
    assert.doesNotMatch(JSON.stringify(recordBatch), /questions|observed_values|observation_refs/);
    const hubStatus = await client.callTool({ name: "get_hub_status", arguments: {} });
    assert.equal(hubStatus.isError, undefined);
    assert.match(hubStatus.content[0]?.type === "text" ? hubStatus.content[0].text : "", /unconfigured/);
    assert.equal(fs.existsSync(path.join(state, "config")), false, "status must not create Hub configuration state");
    const scanned = await client.callTool({ name: "scan_workspace_repositories", arguments: { workspace_root: repo } });
    assert.equal(scanned.isError, undefined);
    assert.match(scanned.content[0]?.type === "text" ? scanned.content[0].text : "", /"hub":"unavailable"/);
    await assert.rejects(client.callTool({ name: "search_graph", arguments: { project: "fixture" } }), /not found/);
    const unarmedDiscovery = await client.callTool({ name: "discover_repository", arguments: { repo_path: repo } });
    assert.equal(unarmedDiscovery.isError, true);
    const unconfiguredHub = await client.callTool({ name: "prepare_hub_okf", arguments: {
      mode: "new", source_repository: repo, subject_directory: "repositories/acme",
      discovery_receipt_id: `discovery-receipt-${"a".repeat(24)}`,
    } });
    assert.equal(unconfiguredHub.isError, true);
    assert.match(unconfiguredHub.content[0]?.type === "text" ? unconfiguredHub.content[0].text : "", /connect an existing Hub or bootstrap an empty remote Hub/);
    const conflictingHome = await client.callTool({ name: "prepare_hub_okf", arguments: {
      mode: "new", source_repository: repo, subject_directory: "repositories/acme",
      discovery_receipt_id: `discovery-receipt-${"a".repeat(24)}`,
      confirmed_domain: { identity: "domains/orders", title: "Orders" },
      home_plan: { default_home: { kind: "shared" }, exceptions: [], participations: [] },
    } });
    assert.equal(conflictingHome.isError, true);
    assert.match(conflictingHome.content[0]?.type === "text" ? conflictingHome.content[0].text : "", /never both/);
    const refreshHome = await client.callTool({ name: "prepare_hub_okf", arguments: {
      mode: "refresh", source_repository: repo, subject_directory: "repositories/acme",
      home_plan: { default_home: { kind: "shared" }, exceptions: [], participations: [] },
    } });
    assert.equal(refreshHome.isError, true);
    assert.match(refreshHome.content[0]?.type === "text" ? refreshHome.content[0].text : "", /Refresh does not accept home_plan/);
    const initialWithRefreshScope = await client.callTool({ name: "prepare_hub_okf", arguments: {
      mode: "new", refresh_scope: "coverage", source_repository: repo, subject_directory: "repositories/acme",
      discovery_receipt_id: `discovery-receipt-${"a".repeat(24)}`,
    } });
    assert.equal(initialWithRefreshScope.isError, true);
    assert.match(initialWithRefreshScope.content[0]?.type === "text" ? initialWithRefreshScope.content[0].text : "",
      /Initial Ingest does not accept refresh_scope/);
    const coverageWithoutAccount = await client.callTool({ name: "prepare_hub_okf", arguments: {
      mode: "refresh", refresh_scope: "coverage", source_repository: repo, subject_directory: "repositories/acme",
    } });
    assert.equal(coverageWithoutAccount.isError, true);
    assert.match(coverageWithoutAccount.content[0]?.type === "text" ? coverageWithoutAccount.content[0].text : "",
      /Coverage Refresh requires coverage/);
    const unchangedStatus = await client.callTool({ name: "get_hub_status", arguments: {} });
    assert.match(unchangedStatus.content[0]?.type === "text" ? unchangedStatus.content[0].text : "", /unconfigured/);
    const schemas = await client.callTool({ name: "list_okf_schemas", arguments: {} });
    assert.equal(schemas.isError, undefined);
    const validateTool = tools.tools.find((tool) => tool.name === "validate_okf_changes");
    assert.ok("session_id" in ((validateTool?.inputSchema.properties ?? {}) as Record<string, unknown>));
    const sessionValidation = await client.callTool({ name: "validate_okf_changes", arguments: {
      session_id: `hub-session-${"a".repeat(24)}`,
      changes: [{ identity: "resources/retry-queue", path: "resources/retry-queue.md", content: [
        "---", "type: Resource", "title: Retry queue", "description: Retry queue", "status: draft",
        "generated: { by: 'agentbase/0.0.0', at: '2026-08-31T00:00:00Z' }", "sources: []", "---", "", "# Purpose", "",
      ].join("\n") }], targets: [],
    } });
    assert.equal(sessionValidation.isError, undefined);
    assert.equal(validatedSessions, 1);
    const combinedValidation = await client.callTool({ name: "validate_okf_changes", arguments: {
      session_id: `hub-session-${"a".repeat(24)}`,
      changes: [{ identity: "resources/retry-queue", path: "resources/retry-queue.md", content: [
        "---", "type: Resource", "title: Retry queue", "description: Retry queue", "status: draft",
        "generated: { by: 'agentbase/0.0.0', at: '2026-08-31T00:00:00Z' }",
        "sources:", "  - id: duplicate", "    resource: agentbase://one",
        "  - id: duplicate", "    resource: agentbase://two", "---", "", "# Purpose", "",
      ].join("\n") }], targets: [],
    } });
    assert.equal(combinedValidation.isError, true);
    assert.equal(validatedSessions, 2, "session preflight must run even when changed concept validation also fails");
    assert.match(combinedValidation.content[0]?.type === "text" ? combinedValidation.content[0].text : "",
      /source ids must be stable and unique/);
    assert.match(combinedValidation.content[0]?.type === "text" ? combinedValidation.content[0].text : "",
      /sessionValidation/);
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
  } finally {
    await client.close();
    await current.close();
    fs.rmSync(repo, { recursive: true, force: true });
    fs.rmSync(state, { recursive: true, force: true });
  }

});

test("[AB-MCPMOD-007..011] capability policy filters composition without changing the trusted default", async () => {
  const seen: Array<Readonly<{ name: string; capability: string }>> = [];
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const current = createAgentBaseMcpServer({
    capabilityPolicy: {
      allows(tool) {
        seen.push(tool);
        return tool.name !== "bootstrap_hub";
      },
    },
  });
  const client = new Client({ name: "agentbase-policy-test", version: "0.0.0" });
  try {
    await current.connect(serverTransport);
    await client.connect(clientTransport);
    const tools = await client.listTools(undefined, { cacheMode: "bypass" });
    assert.equal(tools.tools.some((tool) => tool.name === "bootstrap_hub"), false);
    assert.equal(tools.tools.length, 35);
    assert.equal(seen.some((tool) => tool.name === "search_hub_okf" && tool.capability === "hub"), true);
    assert.equal(seen.some((tool) => tool.name === "list_okf_schemas" && tool.capability === "schema"), true);
    assert.equal(seen.some((tool) => tool.name === "discover_repository" && tool.capability === "discovery"), true);
  } finally {
    await client.close();
    await current.close();
  }
});

test("[AB-QUERY-004][AB-QUERY-012..013][SC-001/002] Hub query reads Published only", async () => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-published-query-"));
  const baseCommit = "1".repeat(40), draftCommit = "2".repeat(40);
  const paths = ["systems/checkout.md", "questions/question-aaaaaaaaaaaaaaaaaaaaaaaa.md"];
  const published = new Map([
    [paths[0]!, "---\ntype: System\ntitle: Checkout\ndescription: Published checkout.\n---\n\n# Checkout\n\nPublished snapshot value: 7.\n"],
    [paths[1]!, "---\ntype: Question\ntitle: Checkout TTL\ndescription: Published unresolved question.\n---\n\n# Question\n\nWhich TTL is authoritative?\n"],
  ]);
  const draft = new Map(published);
  draft.set(paths[0]!, published.get(paths[0]!)!.replace("Published snapshot value: 7.", "Draft-only value: 30."));
  const queryGit = async (request: Readonly<{ args: readonly string[]; operation: string }>) => {
    if (request.operation === "list local Hub concepts") return { stdout: `${paths.join("\0")}\0`, stderr: "" };
    const revisionPath = String(request.args[1]);
    const commit = revisionPath.slice(0, 40), relative = revisionPath.slice(41);
    return { stdout: (commit === baseCommit ? published : draft).get(relative) ?? "", stderr: "" };
  };
  const localHub = { root: repo, hub: createHubIdentity("acme/AgentBase-Hub", "main"),
    remoteBase: baseCommit, activeHead: draftCommit, catalogVersion: "7.0.0" };
  try {
    const found = await searchPublishedHub(localHub, "Published snapshot", {}, queryGit);
    assert.equal(found.commit, baseCommit);
    assert.equal(found.status === "ok" && found.matches[0]?.path, paths[0]);
    const hidden = await searchPublishedHub(localHub, "Draft-only", {}, queryGit);
    assert.equal(hidden.status === "ok" && hidden.matches.length, 0);
    const question = await searchPublishedHub(localHub, "authoritative", {}, queryGit);
    assert.equal(question.status === "ok" && question.matches[0]?.path, paths[1]);
    const read = await readPublishedHubConcept(localHub, paths[0]!, queryGit);
    assert.equal(read.commit, baseCommit);
    assert.match(read.excerpt, /Published snapshot value: 7/);
    assert.doesNotMatch(read.excerpt, /Draft-only/);
    assert.throws(() => searchPublishedHub({ kind: "local-only", root: repo,
      localHubId: "6".repeat(24), baseCommit, remoteBase: baseCommit, activeHead: draftCommit,
      catalogVersion: "7.0.0" }, "Checkout", {}, queryGit), /Published Hub knowledge is unavailable/);
  } finally {
    fs.rmSync(repo, { recursive: true, force: true });
  }
});
