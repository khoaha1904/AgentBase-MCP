import fs from "node:fs";
import path from "node:path";
import { Client, InMemoryTransport } from "@modelcontextprotocol/client";

import { createHubIdentity, hubProfileId } from "../../src/core/hub/index.ts";
import { loadOkfBundle } from "../../src/core/knowledge/index.ts";
import {
  createHubRuntimeActions, createLocalHub, readPersistedHubConfiguration, replacePersistedHubConfiguration,
} from "../../src/app/hub-okf/index.ts";
import { createAgentBaseMcpServer } from "../../src/app/agentbase-mcp/index.ts";
import { DiscoverySession } from "../../src/app/agentbase-mcp/discovery-session.ts";
import { runGit } from "../../src/providers/github-hub/index.ts";

function cost(value) {
  const bytes = Buffer.byteLength(JSON.stringify(value), "utf8");
  return { bytes, estimated_tokens: bytes / 4 };
}

function body(response) {
  if (response.isError) throw new Error("Fixture tool failed");
  return JSON.parse(response.content.find((item) => item.type === "text").text);
}

export async function measureFixtureCosts(root) {
  const source = path.join(root, "source"), state = path.join(root, "state");
  fs.mkdirSync(source, { recursive: true, mode: 0o700 });
  fs.writeFileSync(path.join(source, "README.md"), "# Measurement worker\n\nConsumes tasks and records results.\n");
  const git = (args, cwd = source) => runGit({ args, cwd, operation: "local measurement fixture" });
  await git(["init", "-b", "main"]); await git(["add", "."]);
  await git(["-c", "user.name=AgentBase", "-c", "user.email=agentbase@localhost", "commit", "-m", "fixture"]);
  const environment = { AGENTBASE_HOME: path.join(root, "home") };
  const local = await createLocalHub(environment), configuration = readPersistedHubConfiguration(environment);
  const hub = createHubIdentity("fixtures/measurement-hub", "main");
  await git(["remote", "add", "origin", hub.canonicalHttpsUrl], local.localRoot);
  replacePersistedHubConfiguration(configuration, { ...configuration, kind: "remote", localHubId: hubProfileId(hub),
    host: hub.host, repository: hub.repository, targetBranch: hub.targetBranch }, environment, { retireExpected: true });
  const discovery = new DiscoverySession(state);
  const actions = createHubRuntimeActions(environment, state, {
    sourceSnapshotResolver: async (input) => ({ repositoryId: input.repositoryId, requestedRoot: source, analysisRoot: source,
      commit: (await git(["rev-parse", "HEAD"])).stdout.trim(), defaultBranch: "main", kind: "current-checkout",
      createdAt: "2026-10-07T00:00:00Z", privateRoot: state,
      remote: { host: hub.host, repository: "fixtures/measurement-source",
        canonicalHttpsUrl: "https://github.com/fixtures/measurement-source.git" } }),
    onSourceSnapshot: (snapshot, mode, authority) => discovery.arm(snapshot, mode, authority),
    discoveryReceiptResolver: (id) => discovery.resolveReceipt(id),
  });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const server = createAgentBaseMcpServer({ hubActions: actions, discoverySession: discovery, hubStateRoot: state });
  const client = new Client({ name: "offline-measurement", version: "0.0.0" });
  try {
    await server.connect(serverTransport); await client.connect(clientTransport);
    const list = await client.listTools(), ingest = {};
    const call = async (label, name, args) => {
      const response = await client.callTool({ name, arguments: args });
      const parsed = body(response);
      ingest[label] = cost(response);
      return parsed;
    };
    await call("preflight", "preflight_hub_ingest", { source_repository: source });
    await call("discover", "discover_repository", { repo_path: source });
    const seed = discovery.activeSeed;
    const schema = await call("schemas", "get_okf_authoring_schemas", {
      candidates: [{ id: "repository", identity_hint: "measurement-worker", identity_basis: "README purpose",
        query_value: "Task worker", evidence_ids: ["readme"], disposition: "concept", suggested_type: "Repository" }],
      semantic_observations: [{ id: "readme", candidate_id: "repository", role: "documentation", signal: "repository purpose",
        source: { path: "README.md", start_line: 1, end_line: 3 } }],
      resource_observations: [],
      discovery_inventory: { seed_id: seed.id, limitations: ["Measurement fixture authors only repository purpose."],
        items: seed.groups.map((group) => group.lane === "identity-product"
          ? { origin_group_id: group.id, outcome: "materialized", candidate_ids: ["repository"] }
          : { origin_group_id: group.id, outcome: "ignored", reason: "No additional evidence in the measurement fixture." }) },
    });
    const prepared = await call("prepare", "prepare_hub_okf", { mode: "new", source_repository: source,
      subject_directory: "repositories/measurement-worker", discovery_receipt_id: schema.discovery_receipt_id });
    const changes = [...loadOkfBundle(prepared.bundleRoot).concepts.values()].filter((concept) => concept.type === "Repository")
      .map((concept) => ({ identity: concept.conceptId, path: concept.path,
        content: fs.readFileSync(path.join(prepared.bundleRoot, concept.path), "utf8") }));
    const validation = await call("validate", "validate_okf_changes", { session_id: prepared.sessionId, changes, targets: [] });
    if (!validation.valid) throw new Error("Fixture validation failed");
    const finalized = await call("finalize", "finalize_hub_okf_proposal", { session_id: prepared.sessionId });
    await call("inspect", "inspect_hub_okf_proposal", { proposal_id: finalized.proposal_id });
    return { list_tools: { ...cost(list), count: list.tools.length }, ingest };
  } finally { await client.close(); await server.close(); }
}
