import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  compareIncidentPair, validateIncidentDiagnosis, validateIncidentSession,
} from "./benchmark-incident.mjs";

const publisherCommit = "a".repeat(40);
const workerCommit = "b".repeat(40);
const pipelineCommit = "c".repeat(40);
const hubCommit = "d".repeat(40);
const hub = { commit: hubCommit, domain: "domains/crawler" };

const command = (output) => JSON.stringify({ type: "item.completed", item: { type: "command_execution",
  command: "/bin/bash -lc 'rg CRAWLER_NAME repositories'", aggregated_output: output, status: "completed", exit_code: 0 } });
const search = (args = { domain: hub.domain, limit: 5 }, commit = hubCommit) => JSON.stringify({ type: "item.completed", item: {
  type: "mcp_tool_call", tool: "search_hub_okf", arguments: args, status: "completed",
  result: { content: [{ type: "text", text: JSON.stringify({ commit, matches: [{ path: "components/crawler-publisher-function.md" }] }) }] },
} });

test("[AB-CONTEXT-028..029][AB-BENCH-100] incident arms share source and isolate one Hub search", () => {
  const sources = [{ id: "crawler-publisher" }, { id: "crawler-worker" }, { id: "serverless-data-pipelines-demo" }];
  const sourceEvent = command("repositories/crawler-publisher/src/handler.py:14:Payload=json.dumps({'bucket': bucket, 'key': key})\nrepositories/serverless-data-pipelines-demo/lambdas/glue_crawler_initiation/src/main.py:42:args[0]['CRAWLER_NAME']");
  const direct = validateIncidentSession(sourceEvent, { arm: "source-native", sources, hub });
  assert.deepEqual(direct.failures, []);
  assert.equal(direct.trace.firstRootEvidenceCommand, 1);
  assert.deepEqual(direct.trace.repositoriesInspected, ["crawler-publisher", "serverless-data-pipelines-demo"]);
  const assisted = validateIncidentSession(`${search()}\n${sourceEvent}`, { arm: "source-plus-hub", sources, hub });
  assert.deepEqual(assisted.failures, []);
  assert.deepEqual(assisted.trace.hubPaths, ["components/crawler-publisher-function.md"]);
  assert.match(validateIncidentSession(`${search()}\n${search()}\n${sourceEvent}`,
    { arm: "source-plus-hub", sources, hub }).failures.join(" "), /exactly one search/);
  assert.match(validateIncidentSession(`${search()}\n${sourceEvent}`,
    { arm: "source-native", sources, hub }).failures.join(" "), /must not call MCP/);
});

test("[AB-CONTEXT-030] diagnosis requires exact pinned source and retained Hub routing evidence", (context) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-incident-test-"));
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const fixtures = [
    { id: "crawler-publisher", commit: publisherCommit, path: "src/handler.py", body: "one\ntwo\n" },
    { id: "crawler-worker", commit: workerCommit, path: "src/handler.py", body: "one\ntwo\n" },
    { id: "serverless-data-pipelines-demo", commit: pipelineCommit, path: "lambdas/glue/main.py", body: "one\ntwo\n" },
  ];
  const sources = fixtures.map((fixture) => {
    const sourceRoot = path.join(root, fixture.id);
    fs.mkdirSync(path.dirname(path.join(sourceRoot, fixture.path)), { recursive: true });
    fs.writeFileSync(path.join(sourceRoot, fixture.path), fixture.body);
    return { id: fixture.id, commit: fixture.commit, root: sourceRoot };
  });
  const refs = [
    { id: "p", kind: "source", repository: "crawler-publisher", path: "src/handler.py", start_line: 1, end_line: 2, commit: publisherCommit },
    { id: "g", kind: "source", repository: "serverless-data-pipelines-demo", path: "lambdas/glue/main.py", start_line: 1, end_line: 2, commit: pipelineCommit },
  ];
  const diagnosis = { summary: "Publisher sends the wrong Glue invocation contract.",
    root_cause: { repository: "crawler-publisher", summary: "Payload omits CRAWLER_NAME.", evidence_refs: ["p", "g"] },
    causal_chain: [
      { step: 1, repository: "crawler-publisher", claim: "Publisher invokes Glue asynchronously.", evidence_refs: ["p"] },
      { step: 2, repository: "serverless-data-pipelines-demo", claim: "Glue requires CRAWLER_NAME.", evidence_refs: ["g"] },
    ],
    minimal_repair: { repository: "crawler-publisher", path: "src/handler.py", summary: "Send the required payload.", evidence_refs: ["p", "g"] },
    ruled_out: ["Worker persistence can succeed independently."],
    unknowns: ["No live runtime or deployed payload was inspected."], evidence_refs: refs };
  assert.deepEqual(validateIncidentDiagnosis(diagnosis, { arm: "source-native", sources, hub, trace: { hubPaths: [] } }).failures, []);
  const assisted = { ...diagnosis, evidence_refs: [...refs,
    { id: "h", kind: "hub", repository: null, path: "components/crawler-publisher-function.md",
      start_line: null, end_line: null, commit: hubCommit }],
    unknowns: [...diagnosis.unknowns, "The Published Hub snapshot may differ from the pinned source revisions."] };
  assert.deepEqual(validateIncidentDiagnosis(assisted, { arm: "source-plus-hub", sources, hub,
    trace: { hubPaths: ["components/crawler-publisher-function.md"] } }).failures, []);
  const drifted = { ...diagnosis, evidence_refs: [{ ...refs[0], commit: "e".repeat(40) }, refs[1]] };
  assert.match(validateIncidentDiagnosis(drifted, { arm: "source-native", sources, hub,
    trace: { hubPaths: [] } }).failures.join(" "), /not pinned/);
  const workspaceIdentity = { ...diagnosis,
    root_cause: { ...diagnosis.root_cause, repository: "repositories/crawler-publisher" },
    minimal_repair: { ...diagnosis.minimal_repair, repository: "repositories/crawler-publisher" },
    causal_chain: diagnosis.causal_chain.map((step) => ({ ...step, repository: `repositories/${step.repository}` })),
    evidence_refs: refs.map((ref) => ({ ...ref, repository: `repositories/${ref.repository}` })) };
  assert.deepEqual(validateIncidentDiagnosis(workspaceIdentity, { arm: "source-native", sources, hub,
    trace: { hubPaths: [] } }).failures, []);
});

test("[AB-CONTEXT-031] incident quality and navigation precede total cost", () => {
  const expectations = { probes: [
    { id: "contract", priority: "critical", allTerms: ["crawler_name", "bucket", "key"] },
    { id: "async", priority: "important", allTerms: ["invocationtype", "send_message"] },
  ], unsupportedClaims: [] };
  const run = (output, commands, rootCommand, elapsedMs, tokens) => ({ output,
    qualification: { status: "passed" }, trace: { sourceCommands: commands, firstRootEvidenceCommand: rootCommand,
      sourceResultBytes: commands * 100, hubResultBytes: 0 },
    elapsedMs, usage: { inputTokens: tokens, outputTokens: 0 } });
  const controlOutput = { summary: "bucket key CRAWLER_NAME", root_cause: {}, causal_chain: [], minimal_repair: {}, ruled_out: [], unknowns: [], evidence_refs: [] };
  const assistedOutput = { ...controlOutput, summary: "bucket key CRAWLER_NAME InvocationType send_message" };
  const result = compareIncidentPair({ "source-native": run(controlOutput, 8, 6, 100, 1000),
    "source-plus-hub": run(assistedOutput, 4, 3, 120, 1200) }, expectations);
  assert.equal(result.status, "needs_review");
  assert.deepEqual(result.newImportant, ["async"]);
  assert.equal(result.navigationGainCandidate, true);
  assert.equal(result.costReductionCandidate, false);
  assert.equal(result.sourceResultBytesDelta, -400);
});

test("[AB-CONTEXT-031] unsupported live-state claims fail comparison before cost", () => {
  const expectations = { probes: [], unsupportedClaims: [
    { id: "live", phrases: ["confirmed in production", "verified in the live deployment"] },
  ] };
  const run = (summary) => ({ output: { summary }, qualification: { status: "passed" },
    trace: { sourceCommands: 2, firstRootEvidenceCommand: 1, sourceResultBytes: 100, hubResultBytes: 0 },
    elapsedMs: 10, usage: { inputTokens: 10, outputTokens: 0 } });
  const result = compareIncidentPair({ "source-native": run("source-only candidate"),
    "source-plus-hub": run("confirmed in production and much faster") }, expectations);
  assert.equal(result.status, "needs_revision");
  assert.deepEqual(result.scores["source-plus-hub"].unsupportedClaims, ["live"]);
});
