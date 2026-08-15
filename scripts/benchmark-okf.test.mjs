import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

import { parseConceptDocument } from "../src/core/knowledge/index.ts";
import * as benchmarkOkf from "./benchmark-okf.mjs";
import { loadScorableBundle, scoreSemanticBenchmark } from "./benchmark-okf.mjs";

const repositoryId = "repository-example-aaaaaaaaaaaa";

function concept(path, type, key, metadata, sources, relationships = [], body = "Evidence.") {
  return parseConceptDocument(path, [
    "---", `type: ${type}`, `title: ${key}`, "description: Benchmark fixture", "status: draft",
    "generated: { by: agentbase/0.0.0, at: '2026-08-14T00:00:00Z' }", `benchmark_key: ${key}`,
    ...Object.entries(metadata).map(([field, value]) => `${field}: ${JSON.stringify(value)}`),
    "relationships:", ...relationships.map((item) => `  - { kind: ${item.kind}, target: ${item.target} }`),
    "sources:", ...sources.map((source, index) => `  - { id: s${index}, resource: 'repository://${repositoryId}/${source}#L1-L2' }`),
    "---", "", body, "",
  ].join("\n"));
}

function fixtureBundle({ shallow = false, unexpected = false } = {}) {
  const lambda = concept("lambda.md", "AWS Lambda", "primary-lambda", shallow ? {} : {
    business_purpose: "Handle requests", resource_name: "Primary", runtime: "python3.11", handler: "handler.main",
  }, ["infra.tf", "handler.py"], [{ kind: "accesses", target: "orders-table" }], "Uses [orders](table.md).");
  const table = concept("table.md", "Database Table", "orders-table", { resource_name: "Orders" }, ["infra.tf"]);
  const concepts = new Map([["lambda", lambda], ["table", table]]);
  if (unexpected) concepts.set("extra", concept("extra.md", "Service", "extra", {}, ["README.md"]));
  return { concepts, warnings: [] };
}

const expectation = {
  concepts: [
    { key: "primary-lambda", type: "AWS Lambda", requiredMetadata: ["business_purpose", "resource_name", "runtime", "handler"], requiredSourcePaths: ["infra.tf", "handler.py"] },
    { key: "orders-table", type: "Database Table", requiredMetadata: ["resource_name"], requiredSourcePaths: ["infra.tf"] },
  ],
  relationships: [{ from: "primary-lambda", to: "orders-table", kind: "accesses" }],
};

function pairHarness({
  failMcp = false,
  timeoutMcp = false,
  omitMcpOutput = false,
  malformedDirectUsage = false,
  driftMcp = false,
} = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-pair-benchmark-"));
  const source = path.join(root, "source");
  const suiteRoot = path.join(root, "suite");
  const expected = path.join(suiteRoot, "expected");
  const log = path.join(root, "calls.log");
  fs.mkdirSync(source);
  fs.mkdirSync(expected, { recursive: true });
  fs.writeFileSync(path.join(source, "README.md"), "unchanged\n");
  fs.writeFileSync(path.join(expected, "fixture.json"), JSON.stringify({ concepts: [], relationships: [] }));
  for (const args of [["init"], ["config", "user.name", "Benchmark"], ["config", "user.email", "benchmark@example.invalid"], ["add", "."], ["commit", "-m", "fixture"]]) {
    assert.equal(spawnSync("git", ["-C", source, ...args], { encoding: "utf8" }).status, 0);
  }
  const fake = path.join(root, "fake-codex.mjs");
  fs.writeFileSync(fake, [
    "#!/usr/bin/env node",
    'import fs from "node:fs";',
    'import path from "node:path";',
    'if (process.argv[2] === "--version") { console.log("fake-codex 1.0.0"); process.exit(0); }',
    "const args = process.argv.slice(2);",
    'const mcp = args.some((arg) => arg.startsWith("mcp_servers.agentbase."));',
    "const log = " + JSON.stringify(log) + ";",
    'fs.appendFileSync(log, (mcp ? "mcp" : "direct") + String.fromCharCode(10));',
    failMcp ? 'if (mcp) { console.error("mcp failed"); process.exit(7); }' : "",
    timeoutMcp ? "if (mcp) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 500);" : "",
    'const workspace = args[args.indexOf("--cd") + 1];',
    'const finalMessage = args[args.indexOf("--output-last-message") + 1];',
    omitMcpOutput ? 'if (!mcp) fs.mkdirSync(path.join(workspace, "okf"));' : 'fs.mkdirSync(path.join(workspace, "okf"));',
    omitMcpOutput ? 'if (!mcp) fs.writeFileSync(path.join(workspace, "okf", "index.md"), ["---", "okf_version: " + String.fromCharCode(34) + "0.2" + String.fromCharCode(34), "---", "", "# Empty", ""].join(String.fromCharCode(10)));' : 'fs.writeFileSync(path.join(workspace, "okf", "index.md"), ["---", "okf_version: " + String.fromCharCode(34) + "0.2" + String.fromCharCode(34), "---", "", "# Empty", ""].join(String.fromCharCode(10)));',
    omitMcpOutput ? 'if (!mcp) fs.writeFileSync(finalMessage, "done");' : 'fs.writeFileSync(finalMessage, "done");',
    driftMcp ? 'if (mcp) fs.writeFileSync(' + JSON.stringify(path.join(source, "README.md")) + ', "changed");' : "",
    'if (mcp) for (const tool of ["index_repository", "list_okf_schemas", "select_okf_schemas", "get_okf_schema", "validate_okf_concept"]) console.log(JSON.stringify({ type: "item.completed", item: { type: "mcp_tool_call", tool, status: "completed" } }));',
    malformedDirectUsage ? 'if (!mcp) console.log("{malformed"); else console.log(JSON.stringify({ type: "turn.completed", usage: { input_tokens: 10, cached_input_tokens: 2, output_tokens: 4, reasoning_output_tokens: 1 } }));' : 'console.log(JSON.stringify({ type: "turn.completed", usage: { input_tokens: mcp ? 10 : 20, cached_input_tokens: 2, output_tokens: 4, reasoning_output_tokens: 1 } }));',
  ].join("\n"));
  fs.chmodSync(fake, 0o755);
  const commit = spawnSync("git", ["-C", source, "rev-parse", "HEAD"], { encoding: "utf8" }).stdout.trim();
  return {
    root, source, log, result: path.join(root, "result"), executable: fake,
    manifest: {
      suite: "test-suite", root: suiteRoot, catalogVersion: "3.0.0",
      promptVersion: "okf-author-v2", directPromptVersion: "okf-author-direct-v2",
      agent: { executable: fake, version: "fake-codex 1.0.0", model: "fake", reasoningEffort: "medium", timeoutMs: timeoutMcp ? 150 : 10_000 },
    },
    entry: { id: "fixture", kind: "test", path: "fixture", commit, expectation: "expected/fixture.json" },
  };
}

function sampleMetrics(status = "reviewable") {
  return {
    validation: { passed: true, failures: [] },
    authoringAssessment: { status, hardFailures: [], limitations: [] },
    referenceConceptCoveragePercent: 100,
    recognizedSchemaAgreementPercent: 100,
    metadataCompletenessPercent: 100,
    provenanceCoveragePercent: 100,
    referenceRelationshipCoveragePercent: 100,
    classifications: {
      concepts: { confirmed: [], contradicted: [], unjudged: [], missingReference: [] },
      relationships: { confirmed: [], contradicted: [], unjudged: [], missingReference: [] },
    },
  };
}

test("[AB-BENCH-023] authoring assessment gates hard failures, not completeness", () => {
  assert.equal(benchmarkOkf.createAuthoringAssessment({
    actualConcepts: 1,
    validationFailures: [],
    contradictionFailures: [],
    relationshipIntegrityFailures: [],
  }).status, "reviewable");

  for (const [name, input] of [
    ["empty output", { actualConcepts: 0, validationFailures: [], contradictionFailures: [], relationshipIntegrityFailures: [] }],
    ["conformance", { actualConcepts: 1, validationFailures: ["bad index"], contradictionFailures: [], relationshipIntegrityFailures: [] }],
    ["contradiction", { actualConcepts: 1, validationFailures: [], contradictionFailures: ["wrong schema"], relationshipIntegrityFailures: [] }],
    ["relationship", { actualConcepts: 1, validationFailures: [], contradictionFailures: [], relationshipIntegrityFailures: ["broken target"] }],
  ]) {
    const assessment = benchmarkOkf.createAuthoringAssessment(input);
    assert.equal(assessment.status, "invalid", name);
    assert.ok(assessment.hardFailures.length > 0, name);
  }
});

test("[AB-BENCH-004][AB-BENCH-005] complete semantic OKF receives separate perfect metrics", () => {
  const result = scoreSemanticBenchmark(expectation, fixtureBundle(), repositoryId);
  assert.equal(result.validation.passed, true);
  assert.equal(result.authoringAssessment.status, "reviewable");
  for (const field of ["referenceConceptCoveragePercent", "recognizedSchemaAgreementPercent", "metadataCompletenessPercent", "provenanceCoveragePercent", "referenceRelationshipCoveragePercent"]) {
    assert.equal(result[field], 100, field);
  }
});

test("[AB-BENCH-005] shallow valid Markdown loses metadata without hiding conformance", () => {
  const result = scoreSemanticBenchmark(expectation, fixtureBundle({ shallow: true }), repositoryId);
  assert.equal(result.validation.passed, true);
  assert.equal(result.authoringAssessment.status, "reviewable");
  assert.equal(result.referenceConceptCoveragePercent, 100);
  assert.equal(result.metadataCompletenessPercent, 20);
});

test("[AB-BENCH-026][AB-BENCH-027] non-reference concepts are unjudged, not false", () => {
  const result = scoreSemanticBenchmark(expectation, fixtureBundle({ unexpected: true }), repositoryId);
  assert.equal(result.referenceConceptCoveragePercent, 100);
  assert.equal(result.authoringAssessment.status, "reviewable");
  assert.deepEqual(result.classifications.concepts.unjudged, ["extra"]);
  assert.equal("conceptPrecisionPercent" in result, false);
});

test("[AB-BENCH-004][AB-BENCH-005] semantic identity matching does not hide a wrong schema", () => {
  const worker = concept("worker.md", "Service", "custom-worker", {}, ["infra.tf"], [], "Scheduled Lambda worker.");
  const result = scoreSemanticBenchmark({
    concepts: [{ key: "canonical-lambda", identityTerms: ["scheduled", "lambda"], type: "AWS Lambda", requiredMetadata: [], requiredSourcePaths: ["infra.tf"] }],
    relationships: [],
  }, { concepts: new Map([["worker", worker]]), warnings: [] }, repositoryId);
  assert.equal(result.referenceConceptCoveragePercent, 100);
  assert.equal(result.recognizedSchemaAgreementPercent, 0);
  assert.equal(result.authoringAssessment.status, "invalid");
  assert.deepEqual(result.classifications.concepts.contradicted, [{
    actual: "custom-worker", expected: "canonical-lambda", actualType: "Service", expectedType: "AWS Lambda",
  }]);
});

test("[AB-BENCH-004][AB-BENCH-005] schema and evidence outrank a greedy identity collision", () => {
  const lambda = concept("lambda.md", "AWS Lambda", "aha-lambda-function", {}, ["infra.tf", "handler.py"], [], "Alert processing runtime.");
  const schedule = concept("schedule.md", "Event", "aha-lambda-schedule", {}, ["infra.tf"], [], "Scheduled Lambda invocation runs every minute.");
  const result = scoreSemanticBenchmark({
    concepts: [
      { key: "primary-lambda", identityTerms: ["scheduled", "lambda"], type: "AWS Lambda", requiredMetadata: [], requiredSourcePaths: ["infra.tf", "handler.py"] },
      { key: "primary-schedule", identityTerms: ["minute", "schedule"], type: "Event", requiredMetadata: [], requiredSourcePaths: ["infra.tf"] },
      { key: "alert-flow", identityTerms: ["alert", "processing"], type: "Business Flow", requiredMetadata: [], requiredSourcePaths: ["handler.py"] },
    ],
    relationships: [],
  }, { concepts: new Map([["lambda", lambda], ["schedule", schedule]]), warnings: [] }, repositoryId);
  assert.equal(result.referenceConceptCoveragePercent, 67);
  assert.equal(result.recognizedSchemaAgreementPercent, 100);
  assert.equal(result.authoringAssessment.status, "reviewable");
  assert.deepEqual(result.classifications.concepts.missingReference, ["alert-flow"]);
});

test("[AB-BENCH-021][AB-BENCH-023] declared relationships require target, link and schema guidance", () => {
  for (const [name, lambda] of [
    ["missing target", concept("lambda.md", "AWS Lambda", "primary-lambda", {}, ["infra.tf"], [{ kind: "accesses", target: "ghost" }], "Uses [ghost](ghost.md).")],
    ["missing Markdown link", concept("lambda.md", "AWS Lambda", "primary-lambda", {}, ["infra.tf"], [{ kind: "accesses", target: "orders-table" }])],
    ["unsupported schema relation", concept("lambda.md", "AWS Lambda", "primary-lambda", {}, ["infra.tf"], [{ kind: "triggers", target: "orders-table" }], "Uses [orders](table.md).")],
  ]) {
    const table = concept("table.md", "Database Table", "orders-table", {}, ["infra.tf"]);
    const result = scoreSemanticBenchmark(expectation, {
      concepts: new Map([["lambda", lambda], ["table", table]]), warnings: [],
    }, repositoryId);
    assert.equal(result.authoringAssessment.status, "invalid", name);
    assert.match(result.authoringAssessment.hardFailures.join("\n"), /relationship/i, name);
  }
});

test("[AB-BENCH-026] linked relationships from an unknown Google OKF type stay unjudged", () => {
  const custom = concept("custom.md", "Custom Runtime", "custom-runtime", {}, ["custom.ts"], [
    { kind: "uses", target: "orders-table" },
  ], "Uses [orders](table.md). ");
  const table = concept("table.md", "Database Table", "orders-table", {}, ["infra.tf"]);
  const result = scoreSemanticBenchmark({ concepts: [], relationships: [] }, {
    concepts: new Map([["custom", custom], ["table", table]]), warnings: [],
  }, repositoryId);
  assert.equal(result.authoringAssessment.status, "reviewable");
  assert.deepEqual(result.classifications.relationships.unjudged, ["custom-runtime|uses|orders-table"]);
});

test("[AB-BENCH-027] missing reference coverage stays diagnostic below 80 percent", () => {
  const one = concept("lambda.md", "AWS Lambda", "primary-lambda", {}, ["infra.tf"]);
  const result = scoreSemanticBenchmark({
    concepts: [
      expectation.concepts[0], expectation.concepts[1],
      { key: "third", type: "Service", requiredMetadata: ["owner"], requiredSourcePaths: ["third.ts"] },
      { key: "fourth", type: "Event", requiredMetadata: [], requiredSourcePaths: ["fourth.ts"] },
    ],
    relationships: [],
  }, { concepts: new Map([["lambda", one]]), warnings: [] }, repositoryId);
  assert.equal(result.referenceConceptCoveragePercent, 25);
  assert.equal(result.provenanceCoveragePercent, 20);
  assert.equal(result.authoringAssessment.status, "reviewable");
});

test("[AB-BENCH-005][AB-BENCH-006] invalid index fails conformance without hiding scorable concepts", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-scorable-okf-"));
  try {
    fs.writeFileSync(path.join(root, "index.md"), "---\nokf_version: '0.2'\n---\n\n# Index\n\nInvalid prose.\n");
    fs.writeFileSync(path.join(root, "lambda.md"), "---\ntype: AWS Lambda\ntitle: Primary\nbenchmark_key: primary-lambda\n---\n\nEvidence.\n");
    const bundle = loadScorableBundle(root);
    assert.equal(bundle.concepts.size, 1);
    assert.match(bundle.warnings[0], /OKF conformance failed/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("[AB-BENCH-009][AB-BENCH-010][AB-BENCH-011][AB-BENCH-017] paired invocation shares inputs and isolates sequential arms", async (t) => {
  const harness = pairHarness();
  t.after(() => fs.rmSync(harness.root, { recursive: true, force: true }));
  const pair = await benchmarkOkf.runPairRepository({
    manifest: harness.manifest,
    entry: harness.entry,
    repository: harness.source,
    root: harness.result,
    executable: harness.executable,
    pairId: "2026-08-15T000000Z",
  });
  assert.deepEqual(fs.readFileSync(harness.log, "utf8").trim().split("\n"), ["mcp", "direct"]);
  assert.equal(pair.commonInputs.fixtureCommit, harness.entry.commit);
  assert.equal(pair.commonInputs.model, "fake");
  assert.equal(pair.commonInputs.reasoningEffort, "medium");
  assert.deepEqual(pair.commonInputs.promptVersions, {
    mcp: "okf-author-v2", direct: "okf-author-direct-v2",
  });
  assert.equal(typeof pair.commonInputs.expectationDigest, "string");
  assert.equal(typeof pair.agentBaseSource.dirty, "boolean");
  assert.equal(pair.arms.mcp.outcome, "succeeded");
  assert.equal(pair.arms.direct.outcome, "succeeded");
  assert.equal(JSON.parse(fs.readFileSync(path.join(harness.result, "mcp", "run.json"))).arm, "mcp");
  assert.equal(JSON.parse(fs.readFileSync(path.join(harness.result, "direct", "run.json"))).arm, "direct");
  assert.equal(spawnSync("git", ["-C", harness.source, "status", "--porcelain"], { encoding: "utf8" }).stdout, "");
  const comparison = benchmarkOkf.comparePairRepository({
    manifest: harness.manifest,
    entry: harness.entry,
    repository: harness.source,
    root: harness.result,
    pairId: "2026-08-15T000000Z",
  });
  assert.equal(comparison.completeness.status, "complete");
  assert.ok(fs.existsSync(path.join(harness.result, "comparison.json")));
  assert.ok(fs.existsSync(path.join(harness.result, "report.md")));
  const report = fs.readFileSync(path.join(harness.result, "report.md"), "utf8");
  assert.ok(report.indexOf("assessment") < report.indexOf("## Efficiency"));
  assert.match(report, /human review/i);
  assert.match(report, /declares no overall winner/);
  await assert.rejects(() => benchmarkOkf.runPairRepository({
    manifest: harness.manifest,
    entry: harness.entry,
    repository: harness.source,
    root: harness.result,
    executable: harness.executable,
    pairId: "2026-08-15T000000Z",
  }), /result already exists/);
});

test("[AB-BENCH-013][AB-BENCH-014][AB-BENCH-015] comparison keeps quality and efficiency separate without a winner", () => {
  const comparison = benchmarkOkf.createPairComparison({
    pair: { suite: "test", repository: "fixture", pairId: "2026-08-15T000000Z" },
    runs: {
      mcp: {
        outcome: "succeeded", elapsedMs: 80,
        usage: { inputTokens: 100, cachedInputTokens: 70, cacheWriteInputTokens: 0, uncachedInputTokens: 30, outputTokens: 10, reasoningOutputTokens: 2 },
        activity: { mcpToolCalls: 5, commandExecutions: 1, observedSourceReadBytes: null, limitation: "unknown" },
      },
      direct: {
        outcome: "succeeded", elapsedMs: 100,
        usage: { inputTokens: 160, cachedInputTokens: 80, cacheWriteInputTokens: null, uncachedInputTokens: 80, outputTokens: 12, reasoningOutputTokens: 3 },
        activity: { mcpToolCalls: 0, commandExecutions: 4, observedSourceReadBytes: null, limitation: "unknown" },
      },
    },
    metrics: { mcp: sampleMetrics(), direct: sampleMetrics("invalid") },
  });
  assert.equal(comparison.completeness.status, "complete");
  assert.equal(comparison.quality.mcp.authoringAssessment.status, "reviewable");
  assert.equal(comparison.quality.direct.authoringAssessment.status, "invalid");
  assert.equal(comparison.efficiency.delta.inputTokens, -60);
  assert.equal(comparison.efficiency.delta.elapsedMs, -20);
  assert.equal("cacheWriteInputTokens" in comparison.efficiency.delta, false);
  assert.equal(comparison.activity.mcp.mcpToolCalls, 5);
  assert.equal(JSON.stringify(comparison).includes("winner"), false);
});

test("[AB-BENCH-016][AB-BENCH-017] first-arm failure still runs the direct arm and yields incomplete evidence", async (t) => {
  const harness = pairHarness({ failMcp: true });
  t.after(() => fs.rmSync(harness.root, { recursive: true, force: true }));
  const pair = await benchmarkOkf.runPairRepository({
    manifest: harness.manifest,
    entry: harness.entry,
    repository: harness.source,
    root: harness.result,
    executable: harness.executable,
    pairId: "2026-08-15T000001Z",
  });
  assert.deepEqual(fs.readFileSync(harness.log, "utf8").trim().split("\n"), ["mcp", "direct"]);
  assert.equal(pair.status, "incomplete");
  assert.equal(pair.arms.mcp.outcome, "failed");
  assert.equal(pair.arms.direct.outcome, "succeeded");
  assert.ok(fs.existsSync(path.join(harness.result, "mcp", "run.json")));
  assert.ok(fs.existsSync(path.join(harness.result, "direct", "run.json")));
  const comparison = benchmarkOkf.comparePairRepository({
    manifest: harness.manifest,
    entry: harness.entry,
    repository: harness.source,
    root: harness.result,
    pairId: "2026-08-15T000001Z",
  });
  assert.equal(comparison.completeness.status, "incomplete");
  assert.match(comparison.completeness.failures.join("\n"), /mcp arm/);
  assert.ok(fs.existsSync(path.join(harness.result, "comparison.json")));
});

test("[AB-BENCH-016][AB-BENCH-017] timeout, missing output and malformed usage retain honest partial pairs", async (t) => {
  for (const [name, options] of [
    ["timeout", { timeoutMcp: true }],
    ["missing-output", { omitMcpOutput: true }],
    ["malformed-usage", { malformedDirectUsage: true }],
  ]) {
    await t.test(name, async (t) => {
      const harness = pairHarness(options);
      t.after(() => fs.rmSync(harness.root, { recursive: true, force: true }));
      await benchmarkOkf.runPairRepository({
        manifest: harness.manifest,
        entry: harness.entry,
        repository: harness.source,
        root: harness.result,
        executable: harness.executable,
        pairId: "2026-08-15T000002Z",
      });
      assert.equal(fs.readFileSync(harness.log, "utf8").includes("direct"), true);
      const comparison = benchmarkOkf.comparePairRepository({
        manifest: harness.manifest,
        entry: harness.entry,
        repository: harness.source,
        root: harness.result,
        pairId: "2026-08-15T000002Z",
      });
      assert.equal(comparison.completeness.status, "incomplete");
      assert.equal(spawnSync("git", ["-C", harness.source, "status", "--porcelain"], { encoding: "utf8" }).stdout, "");
    });
  }
});

test("[AB-BENCH-009][AB-BENCH-016] source drift blocks a contaminated second execution but retains its failure evidence", async (t) => {
  const harness = pairHarness({ driftMcp: true });
  t.after(() => fs.rmSync(harness.root, { recursive: true, force: true }));
  const pair = await benchmarkOkf.runPairRepository({
    manifest: harness.manifest,
    entry: harness.entry,
    repository: harness.source,
    root: harness.result,
    executable: harness.executable,
    pairId: "2026-08-15T000003Z",
  });
  assert.equal(pair.status, "incomplete");
  assert.match(pair.arms.mcp.failures.join("\n"), /source repository changed/);
  assert.equal(pair.arms.direct.outcome, "failed");
  assert.deepEqual(fs.readFileSync(harness.log, "utf8").trim().split("\n"), ["mcp"]);
  assert.match(pair.arms.direct.failures.join("\n"), /source repository changed before direct arm/);
  assert.ok(fs.existsSync(path.join(harness.result, "direct", "run.json")));
});
