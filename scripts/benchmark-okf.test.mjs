import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { parseConceptDocument } from "../src/core/knowledge/index.ts";
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

test("[AB-BENCH-004][AB-BENCH-005] complete semantic OKF receives separate perfect metrics", () => {
  const result = scoreSemanticBenchmark(expectation, fixtureBundle(), repositoryId);
  assert.equal(result.validation.passed, true);
  for (const field of ["conceptPrecisionPercent", "conceptRecallPercent", "schemaPrecisionPercent", "schemaRecallPercent", "metadataCompletenessPercent", "provenanceCoveragePercent", "relationshipCoveragePercent"]) {
    assert.equal(result[field], 100, field);
  }
});

test("[AB-BENCH-005] shallow valid Markdown loses metadata without hiding conformance", () => {
  const result = scoreSemanticBenchmark(expectation, fixtureBundle({ shallow: true }), repositoryId);
  assert.equal(result.validation.passed, true);
  assert.equal(result.conceptRecallPercent, 100);
  assert.equal(result.metadataCompletenessPercent, 20);
});

test("[AB-BENCH-005] unexpected concepts reduce precision and remain visible", () => {
  const result = scoreSemanticBenchmark(expectation, fixtureBundle({ unexpected: true }), repositoryId);
  assert.equal(result.conceptRecallPercent, 100);
  assert.equal(result.conceptPrecisionPercent, 67);
  assert.deepEqual(result.unexpectedConcepts, ["extra"]);
});

test("[AB-BENCH-004][AB-BENCH-005] semantic identity matching does not hide a wrong schema", () => {
  const worker = concept("worker.md", "Service", "custom-worker", {}, ["infra.tf"], [], "Scheduled Lambda worker.");
  const result = scoreSemanticBenchmark({
    concepts: [{ key: "canonical-lambda", identityTerms: ["scheduled", "lambda"], type: "AWS Lambda", requiredMetadata: [], requiredSourcePaths: ["infra.tf"] }],
    relationships: [],
  }, { concepts: new Map([["worker", worker]]), warnings: [] }, repositoryId);
  assert.equal(result.conceptRecallPercent, 100);
  assert.equal(result.conceptPrecisionPercent, 100);
  assert.equal(result.schemaRecallPercent, 0);
  assert.deepEqual(result.unexpectedConcepts, []);
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
