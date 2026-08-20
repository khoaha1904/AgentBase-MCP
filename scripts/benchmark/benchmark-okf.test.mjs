import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

import { parseConceptDocument } from "../../src/core/knowledge/index.ts";
import * as benchmarkOkf from "./benchmark-okf.mjs";
import { assessOwnerReviewUsefulness, loadScorableBundle, scoreSemanticBenchmark } from "./benchmark-okf.mjs";

const repositoryId = "repository-example-aaaaaaaaaaaa";

function concept(path, type, key, metadata, sources, relationships = [], body = "Evidence.") {
  return parseConceptDocument(path, [
    "---", `type: ${type}`, `title: ${key}`, "description: Benchmark fixture", "status: draft",
    "generated: { by: agentbase/0.0.0, at: '2026-08-14T00:00:00Z' }", ...(key ? [`benchmark_key: ${key}`] : []),
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
    'if (mcp) for (const tool of ["index_repository", "list_okf_schemas", "select_okf_schemas", "get_okf_schema", "validate_okf_concept", "validate_okf_relationships"]) console.log(JSON.stringify({ type: "item.completed", item: { type: "mcp_tool_call", tool, status: "completed" } }));',
    malformedDirectUsage ? 'if (!mcp) console.log("{malformed"); else console.log(JSON.stringify({ type: "turn.completed", usage: { input_tokens: 10, cached_input_tokens: 2, output_tokens: 4, reasoning_output_tokens: 1 } }));' : 'console.log(JSON.stringify({ type: "turn.completed", usage: { input_tokens: mcp ? 10 : 20, cached_input_tokens: 2, output_tokens: 4, reasoning_output_tokens: 1 } }));',
  ].join("\n"));
  fs.chmodSync(fake, 0o755);
  const commit = spawnSync("git", ["-C", source, "rev-parse", "HEAD"], { encoding: "utf8" }).stdout.trim();
  return {
    root, source, log, result: path.join(root, "result"), executable: fake,
    manifest: {
      suite: "test-suite", root: suiteRoot, catalogVersion: "3.0.0",
      promptVersion: "okf-author-v3", directPromptVersion: "okf-author-direct-v3",
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

test("[AB-BENCH-036][AB-BENCH-037] v5 matches hidden probes without authored benchmark metadata", () => {
  const system = concept(
    "systems/shopping-cart.md", "System", null, { business_purpose: "Manage shopping carts" },
    ["README.md", "src/cart.ts"], [],
    "# Shopping cart\n\nThe system owns cart lifecycle and exposes the supported cart behavior to clients.\n\n## Limitations\n\nDeployment ownership is not evidenced.",
  );
  const result = scoreSemanticBenchmark({
    concepts: [{
      key: "shopping-cart-system", identityTerms: ["shopping", "cart"], type: "System",
      requiredMetadata: ["business_purpose"], requiredSourcePaths: ["README.md"],
    }],
    relationships: [],
  }, { concepts: new Map([[system.conceptId, system]]), warnings: [] }, repositoryId);
  assert.equal(result.validation.passed, true);
  assert.deepEqual(result.classifications.concepts.confirmed, ["systems/shopping-cart"]);
  assert.equal(result.authoringAssessment.status, "reviewable");
  assert.equal(result.ownerReview.status, "useful_for_owner_review");
});

test("[AB-BENCH-036][AB-BENCH-037] usefulness flags shallow route fragmentation independently from validity", () => {
  const concepts = new Map(["get", "put", "delete"].map((method) => {
    const item = concept(`interfaces/${method}-cart.md`, "API Endpoint", null, {
      method: method.toUpperCase(), route: "/cart", handler: `${method}.handler`,
    }, [`src/${method}.ts`], [], "Evidence-backed route.");
    return [item.conceptId, item];
  }));
  const assessment = assessOwnerReviewUsefulness(concepts);
  assert.equal(assessment.status, "needs_revision");
  assert.match(assessment.findings.join("\n"), /API Endpoint|substance/);
});

test("[AB-BENCH-037] pinned source paths and line spans are verified when the repository is available", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-source-evidence-"));
  try {
    fs.writeFileSync(path.join(root, "infra.tf"), "one\ntwo\n");
    const bad = concept("components/runtime.md", "Service", null, {}, ["missing.tf"], [],
      "# Runtime\n\nThis service has enough explanatory content for a maintainer to understand its responsibility and boundary.");
    const result = scoreSemanticBenchmark({ concepts: [], relationships: [] }, {
      concepts: new Map([[bad.conceptId, bad]]), warnings: [],
    }, repositoryId, root);
    assert.equal(result.validation.passed, false);
    assert.match(result.validation.failures.join("\n"), /does not exist at the pinned revision/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test("[AB-BENCH-037] v5 never matches a probe from shared schema and manifest evidence alone", () => {
  const unrelated = concept("components/billing.md", "Service", null, {}, ["template.yaml"], [],
    "# Responsibility\n\nProcesses billing records with an independently owned runtime boundary.\n\n# Limitations\n\nIts external owner is not evidenced.");
  const result = scoreSemanticBenchmark({
    version: 5,
    concepts: [{
      key: "cart-service", identityTerms: ["shopping", "cart"], type: "Service",
      requiredMetadata: [], requiredSourcePaths: ["template.yaml"],
    }],
    relationships: [],
  }, { concepts: new Map([[unrelated.conceptId, unrelated]]), warnings: [] }, repositoryId);
  assert.equal(result.referenceConceptCoveragePercent, 0);
  assert.deepEqual(result.classifications.concepts.unjudged, ["components/billing"]);
});

test("[AB-BENCH-037] boundary schemas surface a missing Limitations section for owner review", () => {
  const system = concept("systems/cart.md", "System", null, {}, ["README.md"], [],
    "# Purpose\n\nThis system description is substantial enough to explain the stable cart capability and its cooperating parts.");
  const result = assessOwnerReviewUsefulness(new Map([[system.conceptId, system]]));
  assert.equal(result.status, "needs_revision");
  assert.match(result.findings.join("\n"), /Limitations/);
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

test("[AB-BENCH-021][AB-BENCH-023] declared relationships require targets and resolving links", () => {
  for (const [name, lambda] of [
    ["missing target", concept("lambda.md", "AWS Lambda", "primary-lambda", {}, ["infra.tf"], [{ kind: "accesses", target: "ghost" }], "Uses [ghost](ghost.md).")],
    ["missing Markdown link", concept("lambda.md", "AWS Lambda", "primary-lambda", {}, ["infra.tf"], [{ kind: "accesses", target: "orders-table" }])],
  ]) {
    const table = concept("table.md", "Database Table", "orders-table", {}, ["infra.tf"]);
    const result = scoreSemanticBenchmark(expectation, {
      concepts: new Map([["lambda", lambda], ["table", table]]), warnings: [],
    }, repositoryId);
    assert.equal(result.authoringAssessment.status, "invalid", name);
    assert.match(result.authoringAssessment.hardFailures.join("\n"), /relationship/i, name);
  }
  const unjudged = concept("lambda.md", "AWS Lambda", "primary-lambda", {}, ["infra.tf"], [
    { kind: "triggers", target: "orders-table" },
  ], "Uses [orders](table.md).");
  const table = concept("table.md", "Database Table", "orders-table", {}, ["infra.tf"]);
  const result = scoreSemanticBenchmark(expectation, {
    concepts: new Map([["lambda", unjudged], ["table", table]]), warnings: [],
  }, repositoryId);
  assert.equal(result.authoringAssessment.status, "reviewable");
  assert.deepEqual(result.classifications.relationships.unjudged, ["primary-lambda|triggers|orders-table"]);
});

test("[AB-SCHEMA-019][AB-BENCH-040] v6 benchmark rejects new canonical edges without evidence", () => {
  const service = concept("components/cart.md", "Service", "cart-service", {}, ["service.yaml"], [
    { kind: "part-of", target: "cart-system" },
  ], "The cart service belongs to the [shopping cart system](../systems/cart.md) and owns its runtime behavior.");
  const system = concept("systems/cart.md", "System", "cart-system", {}, ["README.md"], [],
    "# Purpose\n\nThe shopping cart system provides an evidenced customer cart capability across cooperating runtime units.\n\n# Limitations\n\nOwnership is not evidenced.");
  const result = scoreSemanticBenchmark({ version: 6, concepts: [], relationships: [] }, {
    concepts: new Map([[service.conceptId, service], [system.conceptId, system]]), warnings: [],
  }, repositoryId);
  assert.equal(result.authoringAssessment.status, "invalid");
  assert.match(result.authoringAssessment.hardFailures.join("\n"), /evidence must be a non-empty source ID list/);
});

test("[AB-QUERY-005][AB-BENCH-039] v6 owner review catches an unbounded root concept link", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-progressive-navigation-"));
  try {
    fs.mkdirSync(path.join(root, "systems"), { recursive: true });
    fs.mkdirSync(path.join(root, "components"), { recursive: true });
    fs.writeFileSync(path.join(root, "index.md"), "---\nokf_version: '0.2'\n---\n\n# Knowledge\n\n* [Cart](systems/cart.md) - direct concept\n");
    fs.writeFileSync(path.join(root, "systems", "cart.md"), `---
type: System
title: Shopping cart
description: Customer shopping cart capability.
status: draft
generated: { by: agentbase/0.0.0, at: '2026-08-15T00:00:00Z' }
sources:
  - { id: readme, resource: 'repository://${repositoryId}/README.md#L1-L2' }
relationships: []
---

# Purpose

The system coordinates the [cart runtime](../components/cart.md) to provide customer shopping cart behavior.

# Limitations

Production ownership is not evidenced.
`);
    fs.writeFileSync(path.join(root, "components", "cart.md"), `---
type: Service
title: Cart runtime
description: Implements shopping cart behavior.
status: draft
generated: { by: agentbase/0.0.0, at: '2026-08-15T00:00:00Z' }
sources:
  - { id: runtime, resource: 'repository://${repositoryId}/src/cart.py#L1-L2' }
relationships: []
---

# Responsibility

This runtime implements the cart operations and forms an independently deployable service boundary for the system.
`);
    const bundle = loadScorableBundle(root);
    const result = scoreSemanticBenchmark({ version: 6, concepts: [], relationships: [] }, bundle, repositoryId);
    assert.equal(result.authoringAssessment.status, "reviewable");
    assert.equal(result.ownerReview.status, "needs_revision");
    assert.match(result.ownerReview.findings.join("\n"), /root index links directly/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test("[AB-SCHEMA-024][AB-LOCAL-HUB-015][AB-BENCH-041] v7 scores confirmed Domain navigation and root identity", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-confirmed-domain-"));
  try {
    fs.mkdirSync(path.join(root, "domains"));
    fs.mkdirSync(path.join(root, "systems"));
    fs.writeFileSync(path.join(root, "index.md"), "---\nokf_version: '0.2'\n---\n\n# AgentBase-Hub\n\n* [Domains](domains/index.md) - domains\n* [Systems](systems/index.md) - systems\n");
    fs.writeFileSync(path.join(root, "domains/index.md"), "# Domains\n\n* [Commerce](commerce.md) - commerce\n");
    fs.writeFileSync(path.join(root, "systems/index.md"), "# Systems\n\n* [Cart](cart.md) - cart\n");
    fs.writeFileSync(path.join(root, "domains/commerce.md"), `---
type: Domain
title: Commerce
description: Owner-confirmed commerce domain.
status: draft
generated: { by: agentbase/5.0.0, at: '2026-08-16T00:00:00Z' }
sources:
  - { id: owner-domain, resource: 'agentbase://owner-guidance/domains/commerce' }
  - { id: readme, resource: 'repository://${repositoryId}/README.md#L1-L2' }
relationships: []
---

# Purpose

Commerce contains the [Shopping Cart](../systems/cart.md) customer capability and provides its business navigation boundary.

# Limitations

Domain ownership beyond the explicit maintainer guidance is not evidenced.
`);
    fs.writeFileSync(path.join(root, "systems/cart.md"), `---
type: System
title: Shopping Cart
description: Shopping cart customer capability.
status: draft
generated: { by: agentbase/5.0.0, at: '2026-08-16T00:00:00Z' }
sources:
  - { id: owner-domain, resource: 'agentbase://owner-guidance/domains/commerce' }
  - { id: readme, resource: 'repository://${repositoryId}/README.md#L1-L2' }
relationships:
  - kind: part-of
    target: domains/commerce
    evidence: [owner-domain]
---

# Purpose

The Shopping Cart belongs to [Commerce](../domains/commerce.md) and delivers the customer cart capability described by the repository.

# Limitations

Production ownership is not evidenced.
`);
    const result = scoreSemanticBenchmark({
      version: 7,
      confirmedDomain: { identity: "domains/commerce", title: "Commerce", rootHeading: "AgentBase-Hub" },
      concepts: [], relationships: [],
    }, loadScorableBundle(root), repositoryId);
    assert.equal(result.ownerReview.status, "useful_for_owner_review");
    fs.writeFileSync(path.join(root, "index.md"), fs.readFileSync(path.join(root, "index.md"), "utf8").replace("AgentBase-Hub", "Shopping Cart"));
    const renamed = scoreSemanticBenchmark({
      version: 7,
      confirmedDomain: { identity: "domains/commerce", title: "Commerce", rootHeading: "AgentBase-Hub" },
      concepts: [], relationships: [],
    }, loadScorableBundle(root), repositoryId);
    assert.match(renamed.ownerReview.findings.join("\n"), /root heading/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test("[AB-BENCH-037][AB-BENCH-040] source conflicts are visible only with evidence in Limitations", () => {
  const withConflict = parseConceptDocument("resources/cart-table.md", `---
type: Database Table
title: Cart table
description: Stores shopping cart items and their expiration.
status: draft
generated: { by: agentbase/0.0.0, at: '2026-08-15T00:00:00Z' }
sources:
  - { id: readme, resource: 'repository://${repositoryId}/README.md#L36-L38' }
  - { id: add, resource: 'repository://${repositoryId}/add_to_cart.py#L62-L104' }
  - { id: migrate, resource: 'repository://${repositoryId}/migrate_cart.py#L27-L39' }
relationships: []
---

# Purpose

The table stores durable cart items and their expiration timestamp for anonymous and authenticated customers.

# Limitations

TTL behavior conflicts: documentation says 1 day and 7 days, while migration writes 30 days.
`);
  const conflicts = [{
    key: "cart-ttl", requiredTerms: ["1 day", "7 days", "30 days"],
    requiredSourcePaths: ["README.md", "add_to_cart.py", "migrate_cart.py"],
  }];
  const visible = scoreSemanticBenchmark({ version: 6, concepts: [], relationships: [], conflicts }, {
    concepts: new Map([[withConflict.conceptId, withConflict]]), warnings: [],
  }, repositoryId);
  assert.equal(visible.conflictVisibilityPercent, 100);
  assert.equal(visible.ownerReview.status, "useful_for_owner_review");

  const hidden = concept("resources/cart-table.md", "Database Table", "cart-table", {}, ["README.md"], [],
    "# Purpose\n\nThe table stores durable cart items and their expiration timestamp for customer shopping cart behavior.");
  const missing = scoreSemanticBenchmark({ version: 6, concepts: [], relationships: [], conflicts }, {
    concepts: new Map([[hidden.conceptId, hidden]]), warnings: [],
  }, repositoryId);
  assert.equal(missing.conflictVisibilityPercent, 0);
  assert.equal(missing.ownerReview.status, "needs_revision");
  assert.match(missing.ownerReview.findings.join("\n"), /cart-ttl/);
});

test("[AB-BENCH-042] v8 scores live evidence references without durable volatile scalar snapshots", () => {
  const sourceCommit = "a".repeat(40);
  const current = parseConceptDocument("resources/cart-table.md", `---
type: Database Table
title: Cart table
description: Stores shopping cart items.
status: draft
generated: { by: agentbase/5.0.0, at: '2026-08-17T00:00:00Z' }
sources:
  - { id: docs, resource: 'repository://${repositoryId}/README.md#L1-L2' }
  - { id: code, resource: 'repository://${repositoryId}/src/cart.py#L1-L2' }
agentbase:
  live_claims:
    - id: AB-CLAIM-cart-ttl-docs
      subject: resources/cart-table
      property: cart.retention.ttl
      role: documentation
      source_id: docs
      target: { kind: text, name: retention policy }
      observed: { commit: ${sourceCommit}, dirty: false, dirty_digest: null }
    - id: AB-CLAIM-cart-ttl-code
      subject: resources/cart-table
      property: cart.retention.ttl
      role: implementation
      source_id: code
      target: { kind: symbol, name: CART_TTL }
      observed: { commit: ${sourceCommit}, dirty: false, dirty_digest: null }
relationships: []
---

# Purpose

The table stores shopping cart items while current retention values remain source-resolved evidence.
`);
  const result = scoreSemanticBenchmark({ version: 8, concepts: [], relationships: [], liveEvidence: [{
    key: "cart-ttl", subject: "resources/cart-table", property: "cart.retention.ttl",
    roles: ["documentation", "implementation"], requiredSourcePaths: ["README.md", "src/cart.py"],
  }] }, { concepts: new Map([[current.conceptId, current]]), warnings: [] }, repositoryId);
  assert.equal(result.liveEvidenceReferenceCoveragePercent, 100);
  assert.equal(result.validation.passed, true);
  assert.equal(JSON.stringify(current.frontmatter.agentbase).includes('"value"'), false);

  assert.deepEqual(benchmarkOkf.assessLiveResolutionCases([
    { key: "changed", expectedStatus: "resolved", status: "resolved", usedStaleFallback: false,
      roles: ["implementation"], expectedRoles: ["implementation"], selectedWinner: false },
    { key: "missing", expectedStatus: "unavailable", status: "unavailable", usedStaleFallback: false,
      roles: ["documentation", "implementation"], expectedRoles: ["documentation", "implementation"], selectedWinner: false },
    { key: "maintainer-mismatch", expectedStatus: "resolved", status: "resolved", usedStaleFallback: false,
      roles: ["documentation", "implementation", "maintainer-guidance"],
      expectedRoles: ["documentation", "implementation", "maintainer-guidance"], selectedWinner: false },
  ]), { status: "passed", findings: [] });
  assert.match(benchmarkOkf.assessLiveResolutionCases([
    { key: "invalid-winner", expectedStatus: "resolved", status: "resolved", usedStaleFallback: false,
      roles: ["documentation", "implementation", "maintainer-guidance"],
      expectedRoles: ["documentation", "implementation", "maintainer-guidance"], selectedWinner: true },
  ]).findings.join("\n"), /automatic truth winner/);
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
    mcp: "okf-author-v3", direct: "okf-author-direct-v3",
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
  assert.match(report, /authoring schema\/validation calls/);
  assert.match(report, /supplied bytes/);
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
        activity: {
          mcpToolCalls: 5, commandExecutions: 1, authoringToolCalls: 2,
          authoringArgumentBytes: 200, authoringResultBytes: 300,
          observedSourceReadBytes: null, limitation: "unknown",
        },
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
  assert.equal(comparison.activity.mcp.authoringToolCalls, 2);
  assert.equal(comparison.activity.mcp.authoringArgumentBytes, 200);
  assert.equal(comparison.activity.mcp.authoringResultBytes, 300);
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
