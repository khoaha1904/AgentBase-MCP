import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import { parseConceptDocument } from "../../src/core/knowledge/index.ts";
import { assessOwnerReviewUsefulness, classifyInitialIngest, createAuthoringAssessment,
  createPairComparison, scoreSemanticBenchmark } from "./benchmark-okf.mjs";
import { validateFinalChangeCoverage } from "./benchmark-agent.mjs";

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
