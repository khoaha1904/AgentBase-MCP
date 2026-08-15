import assert from "node:assert/strict";
import { test } from "node:test";

import { callHubOkfTool, HUB_OKF_TOOLS, type HubToolActions } from "./mcp-tools.ts";

function actions(events: string[]): HubToolActions {
  return {
    async status() { events.push("status"); return { kind: "unconfigured" }; },
    async configure(input) { events.push(`configure:${input.mode}`); return input; },
    async previewBootstrap(url, mode) { events.push(`preview:${url}:${mode}`); return { mode }; },
    async bootstrap(url, mode) { events.push(`bootstrap:${url}:${mode}`); return { mode }; },
    async prepare(input) { events.push(`prepare:${input.mode}:${input.sourceRepository}`); return { id: "p1" }; },
    async finalize(id) { events.push(`finalize:${id}`); return { id: "p1" }; },
    async inspect(id) { events.push(`inspect:${id}`); return { id }; },
    async accept(id, digest) { events.push(`accept:${id}:${digest}`); return { id }; },
    async search(query, options) { events.push(`search:${query}:${JSON.stringify(options ?? {})}`); return []; },
    async traverse(start, options) { events.push(`traverse:${start}:${JSON.stringify(options ?? {})}`); return []; },
    async read(relativePath) { events.push(`read:${relativePath}`); return { path: relativePath }; },
    async listPending() { events.push("pending"); return []; },
    async submitMany(ids) { events.push(`submit:${ids.join(",")}`); return { number: 1 }; },
    async synchronize() { events.push("synchronize"); return { active: "main" }; },
    async recover(id) { events.push(`recover:${id}`); return { number: 1 }; },
  };
}

test("[AB-HUB-001..003] Hub MCP schemas contain no authority or credential override", () => {
  const schemas = JSON.stringify(HUB_OKF_TOOLS);
  for (const forbidden of ["token", "remote", "target", "force", "merge"]) assert.doesNotMatch(schemas, new RegExp(`\"${forbidden}\"`));
  assert.deepEqual(HUB_OKF_TOOLS.map((tool) => tool.name), [
    "get_hub_status", "configure_hub", "preview_hub_bootstrap", "bootstrap_hub",
    "prepare_hub_okf", "finalize_hub_okf_proposal", "inspect_hub_okf_proposal",
    "accept_hub_okf_proposal", "search_hub_okf", "traverse_hub_okf", "read_hub_okf_concept",
    "list_pending_hub_okf", "submit_hub_okf_proposals", "synchronize_hub_okf", "recover_hub_okf",
  ]);
});

test("[AB-LOCAL-HUB-002][AB-LOCAL-HUB-006] MCP routes explicit prepare and batch submit actions", async () => {
  const events: string[] = [], current = actions(events);
  const prepared = await callHubOkfTool("prepare_hub_okf", {
    mode: "new", source_repository: "/source",
    evidence_digest: `sha256:${"a".repeat(64)}`,
    subject_directory: "repositories/acme", signals: ["repository"],
  }, current);
  const submitted = await callHubOkfTool("submit_hub_okf_proposals", {
    proposal_ids: ["p1", "p2"],
  }, current);
  assert.equal(prepared.isError, undefined);
  assert.equal(submitted.isError, undefined);
  assert.deepEqual(events, ["prepare:new:/source", "submit:p1,p2"]);
});

test("[AB-HUB-SETUP-002][AB-HUB-SETUP-003][AB-HUB-SETUP-010] MCP routes explicit setup and bootstrap choices", async () => {
  const events: string[] = [], current = actions(events);
  await callHubOkfTool("get_hub_status", {}, current);
  await callHubOkfTool("configure_hub", { mode: "new" }, current);
  await callHubOkfTool("preview_hub_bootstrap", {
    repository_url: "https://github.com/acme/Hub", mode: "base-to-main-knowledge-pr",
  }, current);
  assert.deepEqual(events, ["status", "configure:new", "preview:https://github.com/acme/Hub:base-to-main-knowledge-pr"]);
  const invalid = await callHubOkfTool("configure_hub", { mode: "existing" }, current);
  assert.equal(invalid.isError, true);
});

test("[AB-LOCAL-HUB-002][AB-LOCAL-HUB-004] MCP routes local accept, search and read separately", async () => {
  const events: string[] = [], current = actions(events);
  await callHubOkfTool("accept_hub_okf_proposal", {
    proposal_id: "p1", proposal_digest: `sha256:${"c".repeat(64)}`,
  }, current);
  await callHubOkfTool("search_hub_okf", {
    query: "orders", domain: "domains/commerce", types: ["System"], limit: 5,
  }, current);
  await callHubOkfTool("traverse_hub_okf", {
    start: "systems/orders", direction: "inbound", kinds: ["part-of"], max_depth: 2, limit: 10,
  }, current);
  await callHubOkfTool("read_hub_okf_concept", { path: "repositories/orders/repository.md" }, current);
  assert.deepEqual(events, [
    `accept:p1:sha256:${"c".repeat(64)}`,
    'search:orders:{"domain":"domains/commerce","types":["System"],"limit":5}',
    'traverse:systems/orders:{"direction":"inbound","kinds":["part-of"],"maxDepth":2,"limit":10}',
    "read:repositories/orders/repository.md",
  ]);
});

test("unconfigured Hub action fails visibly without exposing environment", async () => {
  const result = await callHubOkfTool("inspect_hub_okf_proposal", { proposal_id: "p1" });
  assert.equal(result.isError, true);
  assert.match(result.content[0]?.type === "text" ? result.content[0].text : "", /not configured/);
});
