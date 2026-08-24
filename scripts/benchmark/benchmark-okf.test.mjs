import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import { parseConceptDocument } from "../../src/core/knowledge/index.ts";
import { assessOwnerReviewUsefulness, classifyInitialIngest, createAuthoringAssessment,
  createPairComparison, scoreSemanticBenchmark } from "./benchmark-okf.mjs";
import {
  summarizeAgentEvents, validateBatchLifecycle, validateFinalChangeCoverage, validateRefreshKnowledge,
  validateRefreshLifecycle, validateV13Lifecycle,
} from "./benchmark-agent.mjs";

const repositoryId = "repository-example-aaaaaaaaaaaa";

function concept(file, type, key, metadata, sources, body = "Evidence.") {
  return parseConceptDocument(file, [
    "---", `type: ${type}`, `title: ${key}`, "description: Benchmark fixture", "status: draft",
    "generated: { by: agentbase/0.0.0, at: '2026-08-14T00:00:00Z' }", `benchmark_key: ${key}`,
    ...Object.entries(metadata).map(([field, value]) => `${field}: ${JSON.stringify(value)}`),
    "relationships: []", "sources:",
    ...sources.map((source, index) => `  - { id: s${index}, resource: 'repository://${repositoryId}/${source}#L1-L2' }`),
    "---", "", body, "",
  ].join("\n"));
}

function metrics(status = "reviewable") {
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

test("[AB-BENCH-023] hard failures, not incomplete coverage, invalidate authoring", () => {
  assert.equal(createAuthoringAssessment({
    actualConcepts: 1, validationFailures: [], contradictionFailures: [], relationshipIntegrityFailures: [],
  }).status, "reviewable");
  for (const input of [
    { actualConcepts: 0, validationFailures: [], contradictionFailures: [], relationshipIntegrityFailures: [] },
    { actualConcepts: 1, validationFailures: ["bad index"], contradictionFailures: [], relationshipIntegrityFailures: [] },
    { actualConcepts: 1, validationFailures: [], contradictionFailures: ["wrong schema"], relationshipIntegrityFailures: [] },
  ]) assert.equal(createAuthoringAssessment(input).status, "invalid");
  assert.equal(classifyInitialIngest({ status: "reviewable" }, { status: "needs_revision" }), "valid_partial");
  assert.equal(classifyInitialIngest({ status: "reviewable" }, { status: "useful_for_owner_review" }), "review_ready");
  assert.equal(classifyInitialIngest({ status: "invalid" }, { status: "useful_for_owner_review" }), "invalid");

  const domain = parseConceptDocument("domains/health.md", [
    "---", "type: Domain", "title: Health", "description: Confirmed domain", "status: draft",
    "generated: { by: agentbase/0.0.0, at: '2026-08-14T00:00:00Z' }", "relationships: []", "sources:",
    "  - { id: owner, resource: 'agentbase://owner-guidance/domains/health' }", "---", "",
    "# Purpose", "", "Current confirmed scope. See [Repository](../repositories/health.md).", "",
  ].join("\n"));
  assert.equal(assessOwnerReviewUsefulness(new Map([[domain.conceptId, domain]])).status,
    "useful_for_owner_review");
});

test("[AB-BENCH-004][AB-BENCH-005] semantic scorer keeps quality metrics separate", () => {
  const worker = concept("components/worker.md", "Function", "primary-worker", {
    business_purpose: "Process health events", runtime: "python3.11",
  }, ["main.tf", "handler.py"]);
  const result = scoreSemanticBenchmark({
    concepts: [{ key: "primary-worker", type: "Function", requiredMetadata: ["business_purpose", "runtime"],
      requiredSourcePaths: ["main.tf", "handler.py"] }], relationships: [],
  }, { concepts: new Map([[worker.conceptId, worker]]), warnings: [] }, repositoryId);
  assert.equal(result.validation.passed, true);
  assert.equal(result.authoringAssessment.status, "reviewable");
  assert.equal(result.initialIngestAcceptance, "valid_partial");
  assert.equal(result.referenceConceptCoveragePercent, 100);
  assert.equal(result.recognizedSchemaAgreementPercent, 100);
  assert.equal(result.metadataCompletenessPercent, 100);
  assert.equal(result.provenanceCoveragePercent, 100);
});

test("[AB-BENCH-045] embedded infrastructure is scored through its useful parent", () => {
  const expectation = {
    version: 15, requiredConcepts: [], relationships: [],
    embeddedKnowledge: [{ key: "delete-queue", requiredTerms: ["queue", "delete"],
      requiredSourcePaths: ["main.tf"], allowedParentTypes: ["Component", "Function", "System", "Flow"] }],
  };
  const queue = concept("resources/delete-queue.md", "Resource", "delete-queue", {}, ["main.tf"], "Delete queue.");
  const standalone = scoreSemanticBenchmark(expectation, {
    concepts: new Map([[queue.conceptId, queue]]), warnings: [],
  }, repositoryId);
  assert.equal(standalone.embeddedKnowledgeCoveragePercent, 0);
  assert.equal(standalone.referenceConceptCoveragePercent, null);
  assert.deepEqual(standalone.ratios.referenceConceptCoverage, { matched: 0, total: 0, percent: null });
  const parent = concept("components/migration.md", "Component", "migration", {}, ["main.tf"],
    "The migration component sends delete work through its internal queue.\n\n## Limitations\n\nRuntime state is unknown.");
  assert.equal(scoreSemanticBenchmark(expectation, {
    concepts: new Map([[parent.conceptId, parent]]), warnings: [],
  }, repositoryId).embeddedKnowledgeCoveragePercent, 100);
});

test("[AB-BENCH-045][AB-BENCH-046] current qualification is catalog 7 and Terraform-only", () => {
  const root = path.resolve(import.meta.dirname, "..", "..", "benchmark", "repos", "aws-serverless");
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));
  assert.equal(manifest.version, 15);
  assert.equal(manifest.catalogVersion, "7.0.0");
  assert.deepEqual(manifest.repositories.map((entry) => [entry.id, entry.kind]), [
    ["aws-health-aware", "terraform-serverless"],
  ]);
  const expected = JSON.parse(fs.readFileSync(path.join(root, manifest.repositories[0].expectation), "utf8"));
  assert.ok(expected.requiredConcepts.length > 0);
  assert.ok(expected.embeddedKnowledge.length > 0);
  assert.equal(expected.requiredConcepts.some((item) => item.type === "Flow"), false);
  assert.ok(expected.embeddedKnowledge.some((item) => item.key === "aha-alert-processing"));
  assert.deepEqual(validateFinalChangeCoverage(["repositories/a", "systems/a"], ["repositories/a", "systems/a"]), []);
  assert.match(validateFinalChangeCoverage(["repositories/a"], ["domains/a", "repositories/a"])[0], /omitted.*domains\/a/);
  const corrected = summarizeAgentEvents([
    JSON.stringify({ type: "item.completed", item: { type: "mcp_tool_call", tool: "get_okf_authoring_schemas",
      status: "failed", result: { content: [{ type: "text", text: JSON.stringify({ error: "bad candidate", code: "INVALID_ARGUMENT", retryable: true }) }] } } }),
    JSON.stringify({ type: "item.completed", item: { type: "mcp_tool_call", tool: "get_okf_authoring_schemas",
      status: "completed", result: { content: [{ type: "text", text: "{}" }] } } }),
  ].join("\n")).activity.guidance;
  assert.equal(corrected.inputCorrectionsUsed, 1);
  assert.equal(corrected.firstAttemptSucceeded, false);
  const lifecycleTools = Object.fromEntries([
    "get_hub_status", "configure_hub", "preflight_hub_ingest", "index_repository", "get_architecture",
    "prepare_hub_okf", "validate_okf_changes", "finalize_hub_okf_proposal", "inspect_hub_okf_proposal",
  ].map((tool) => [tool, 1]));
  lifecycleTools.get_okf_authoring_schemas = 2;
  assert.deepEqual(validateV13Lifecycle(lifecycleTools, corrected.attempts), []);
  const ecsRoot = path.resolve(import.meta.dirname, "..", "..", "benchmark", "repos", "aws-ecs-fullstack");
  const ecs = JSON.parse(fs.readFileSync(path.join(ecsRoot, "manifest.json"), "utf8"));
  assert.equal(ecs.agent.model, "gpt-5.6-sol");
  assert.equal(ecs.repositories[0].kind, "terraform-ecs-fullstack");
  assert.equal(ecs.repositories[0].commit, "98ee8e693a5ebc4b14f3dfe731bdc786637c1eb4");
  const ecsExpected = JSON.parse(fs.readFileSync(path.join(ecsRoot, ecs.repositories[0].expectation), "utf8"));
  assert.ok(ecsExpected.requiredConcepts.some((item) => item.key === "vue-client-component"));
  assert.ok(ecsExpected.requiredConcepts.some((item) => item.key === "node-server-component"));
  assert.ok(ecsExpected.embeddedKnowledge.some((item) => item.key === "server-health-contract"));
  const ecsRefreshRoot = path.resolve(import.meta.dirname, "..", "..", "benchmark", "repos", "aws-ecs-fullstack-refresh");
  const ecsRefresh = JSON.parse(fs.readFileSync(path.join(ecsRefreshRoot, "manifest.json"), "utf8"));
  assert.equal(ecsRefresh.agent.model, "gpt-5.6-terra");
  assert.equal(ecsRefresh.promptVersion, "okf-refresh-v3");
  assert.deepEqual(ecsRefresh.repositories[0].mutations.map((mutation) => [mutation.path, mutation.count]), [
    ["Code/server/src/app.js", 2],
    ["Infrastructure/main.tf", 2],
  ]);
  assert.deepEqual(ecsRefresh.repositories[0].expectedOkf, {
    path: "interfaces/backend-http-api.md",
    includes: ["GET /health", "Infrastructure/main.tf"],
    excludes: ["GET /status"],
  });
  const refreshRoot = path.resolve(import.meta.dirname, "..", "..", "benchmark", "repos", "aws-serverless-refresh");
  const refresh = JSON.parse(fs.readFileSync(path.join(refreshRoot, "manifest.json"), "utf8"));
  assert.equal(refresh.version, 2);
  assert.equal(refresh.promptVersion, "okf-refresh-v2");
  assert.equal(refresh.repositories[0].workflow, "refresh");
  assert.deepEqual(refresh.repositories[0].expectedOkf, {
    path: "components/aha-health-alert-processor.md",
    includes: ["rate(5 minutes)", "Five-minute EventBridge schedule"],
    excludes: ["rate(1 minute)", "One-minute EventBridge schedule"],
  });
  const refreshWorkspace = fs.mkdtempSync(path.join(import.meta.dirname, "refresh-knowledge-"));
  try {
    const target = path.join(refreshWorkspace, "okf", "components");
    fs.mkdirSync(target, { recursive: true });
    fs.writeFileSync(path.join(target, "aha-health-alert-processor.md"), "rate(5 minutes)\nFive-minute EventBridge schedule\n");
    assert.doesNotThrow(() => validateRefreshKnowledge(refreshWorkspace, refresh.repositories[0]));
    fs.writeFileSync(path.join(target, "aha-health-alert-processor.md"), "rate(1 minute)\nOne-minute EventBridge schedule\n");
    assert.throws(() => validateRefreshKnowledge(refreshWorkspace, refresh.repositories[0]), /Refresh knowledge mismatch/);
  } finally {
    fs.rmSync(refreshWorkspace, { recursive: true, force: true });
  }
  const refreshTools = Object.fromEntries([
    "get_hub_status", "preflight_hub_ingest", "index_repository", "get_architecture", "prepare_hub_okf",
    "validate_okf_changes", "finalize_hub_okf_proposal", "inspect_hub_okf_proposal",
  ].map((tool) => [tool, 1]));
  assert.deepEqual(validateRefreshLifecycle(refreshTools), []);
  const batchRoot = path.resolve(import.meta.dirname, "..", "..", "benchmark", "repos", "aws-cloud-operations-batch");
  const batch = JSON.parse(fs.readFileSync(path.join(batchRoot, "manifest.json"), "utf8"));
  assert.equal(batch.workflow, "batch-initial-ingest");
  assert.equal(batch.agent.model, "gpt-5.6-sol");
  assert.equal(batch.confirmedDomain.identity, "domains/cloud-operations");
  assert.equal(batch.repositories.length, 2);
  const batchTools = Object.fromEntries([
    "get_hub_status", "configure_hub", "prepare_batch_hub_ingest", "confirm_batch_hub_ingest",
    "finalize_batch_hub_ingest_proposal", "inspect_hub_okf_proposal",
  ].map((tool) => [tool, 1]));
  for (const tool of ["index_repository", "get_architecture", "get_okf_authoring_schemas",
    "prepare_hub_okf", "validate_okf_changes", "record_batch_hub_ingest_member"]) batchTools[tool] = 2;
  assert.deepEqual(validateBatchLifecycle(batchTools, 2), []);
  batchTools.get_okf_authoring_schemas = 3;
  assert.deepEqual(validateBatchLifecycle(batchTools, 2), []);
  batchTools.accept_hub_okf_proposal = 1;
  assert.match(validateBatchLifecycle(batchTools, 2).at(-1), /forbidden Batch Init/);
  const diverseRoot = path.resolve(import.meta.dirname, "..", "..", "benchmark", "repos", "aws-terraform-diverse");
  const diverse = JSON.parse(fs.readFileSync(path.join(diverseRoot, "manifest.json"), "utf8"));
  assert.equal(diverse.catalogVersion, "7.0.0");
  assert.equal(diverse.promptVersion, "okf-author-v16");
  assert.equal(diverse.agent.model, "gpt-5.6-sol");
  assert.equal(diverse.repositories.length, 6);
  assert.ok(diverse.repositories.every((entry) => /terraform|terragrunt/.test(entry.kind)));
  assert.ok(diverse.repositories.every((entry) => !/(?:^|[-_/])sam(?:$|[-_/])|cloudformation/i.test(
    `${entry.id}/${entry.kind}/${entry.path}`,
  )));
});

test("[AB-BENCH-013..017] pair comparison reports quality and efficiency without a winner", () => {
  const comparison = createPairComparison({
    pair: { suite: "test", repository: "fixture", pairId: "pair" },
    runs: {
      mcp: { outcome: "succeeded", elapsedMs: 80,
        usage: { inputTokens: 100, cachedInputTokens: 70, cacheWriteInputTokens: 0, uncachedInputTokens: 30, outputTokens: 10, reasoningOutputTokens: 2 },
        activity: { mcpToolCalls: 5, commandExecutions: 1, observedSourceReadBytes: null, limitation: "unknown" } },
      direct: { outcome: "succeeded", elapsedMs: 100,
        usage: { inputTokens: 160, cachedInputTokens: 80, cacheWriteInputTokens: null, uncachedInputTokens: 80, outputTokens: 12, reasoningOutputTokens: 3 },
        activity: { mcpToolCalls: 0, commandExecutions: 4, observedSourceReadBytes: null, limitation: "unknown" } },
    },
    metrics: { mcp: metrics(), direct: metrics("invalid") },
  });
  assert.equal(comparison.completeness.status, "complete");
  assert.equal(comparison.quality.direct.authoringAssessment.status, "invalid");
  assert.equal(comparison.efficiency.delta.inputTokens, -60);
  assert.equal(JSON.stringify(comparison).includes("winner"), false);
});
