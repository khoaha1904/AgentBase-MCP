import assert from "node:assert/strict";
import { test } from "node:test";

import type { HubToolActions } from "./mcp/mcp-tools.ts";
import { executeHubCli } from "./cli.ts";

function actions(events: string[]): HubToolActions {
  return {
    async status() { events.push("status"); return { kind: "unconfigured" }; },
    async configure(input) { events.push(`configure:${input.mode}`); return input; },
    async previewBootstrap(url, mode) { events.push(`preview:${url}:${mode}`); return { mode }; },
    async bootstrap(url, mode) { events.push(`bootstrap:${url}:${mode}`); return { mode }; },
    async prepare(input) { events.push(`prepare:${input.mode}`); return { id: "p1" }; },
    async finalize(id, questions = []) { events.push(`finalize:${id}:${questions.length}`); return { id: "p1" }; },
    async inspect(id) { events.push(`inspect:${id}`); return { id }; },
    async accept(id, digest) { events.push(`accept:${id}:${digest}`); return { id }; },
    async search(query, options) { events.push(`search:${query}:${JSON.stringify(options ?? {})}`); return []; },
    async traverse(start, options) { events.push(`traverse:${start}:${JSON.stringify(options ?? {})}`); return []; },
    async read(relativePath) { events.push(`read:${relativePath}`); return { path: relativePath }; },
    async readLiveEvidence(relativePath, source) { events.push(`live:${relativePath}`); return { path: relativePath, source }; },
    async listQuestions(options) { events.push(`questions:${options.status ?? "all"}`); return []; },
    async answerQuestion(input) { events.push(`answer:${input.questionId}`); return input; },
    async listPending() { events.push("pending"); return []; },
    async submitMany(ids) { events.push(`submit:${ids.join(",")}`); return { number: 2 }; },
    async synchronize() { events.push("synchronize"); return { active: "main" }; },
    async recover(id) { events.push(`recover:${id}`); return { number: 2 }; },
  };
}

test("[AB-LOCAL-HUB-006] CLI routes explicit Hub batch publication", async () => {
  const events: string[] = [], output: string[] = [], errors: string[] = [];
  const code = await executeHubCli(
    ["submit", "--proposals", "p1,p2"],
    actions(events), output.push.bind(output), errors.push.bind(errors),
  );
  assert.equal(code, 0);
  assert.deepEqual(events, ["submit:p1,p2"]);
  assert.equal(errors.length, 0);
});

test("[AB-HUB-SETUP-002][AB-HUB-SETUP-010] CLI routes status and reviewed bootstrap mode", async () => {
  const events: string[] = [];
  assert.equal(await executeHubCli(["status"], actions(events), () => {}, () => {}), 0);
  assert.equal(await executeHubCli(["bootstrap-preview", "--url", "https://github.com/acme/Hub", "--mode", "base-to-main-knowledge-pr"],
    actions(events), () => {}, () => {}), 0);
  assert.deepEqual(events, ["status", "preview:https://github.com/acme/Hub:base-to-main-knowledge-pr"]);
});

test("[AB-LOCAL-HUB-002][AB-LOCAL-HUB-004] CLI routes local accept and query actions", async () => {
  const events: string[] = [];
  assert.equal(await executeHubCli(
    ["accept", "--proposal", "p1", "--digest", `sha256:${"a".repeat(64)}`],
    actions(events), () => {}, () => {},
  ), 0);
  assert.equal(await executeHubCli([
    "search", "--query", "orders", "--domain", "domains/commerce", "--types", "System,Component", "--limit", "3",
  ], actions(events), () => {}, () => {}), 0);
  assert.equal(await executeHubCli([
    "traverse", "--start", "systems/orders", "--direction", "both", "--depth", "2",
  ], actions(events), () => {}, () => {}), 0);
  assert.deepEqual(events, [
    `accept:p1:sha256:${"a".repeat(64)}`,
    'search:orders:{"domain":"domains/commerce","types":["System","Component"],"limit":3}',
    'traverse:systems/orders:{"direction":"both","maxDepth":2}',
  ]);
});

test("[AB-HUB-001][AB-HUB-002][AB-HUB-011] CLI rejects authority and credential flags", async () => {
  for (const flag of ["--token", "--remote", "--target", "--force", "--merge"]) {
    const errors: string[] = [];
    const code = await executeHubCli(["inspect", "--proposal", "p1", flag, "x"], actions([]), () => {}, errors.push.bind(errors));
    assert.equal(code, 1);
    assert.match(errors.join(""), /forbidden/);
  }
});
