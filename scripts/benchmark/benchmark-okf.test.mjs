import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import { parseConceptDocument } from "../../src/core/knowledge/index.ts";
import { assessOwnerReviewUsefulness, classifyInitialIngest, createAuthoringAssessment, createRunRegression,
  createPairComparison, scoreSemanticBenchmark } from "./benchmark-okf.mjs";
import {
  applyRefreshMutations, assessRefreshKnowledge, buildCodexArgs, summarizeAgentEvents, validateBatchLifecycle,
  validateFinalChangeCoverage, validateRefreshAccounting, validateRefreshKnowledge,
  validateReceiptDiscoveryLifecycle, validateRefreshLifecycle, validateSkillInitialIngestLifecycle, validateV13Lifecycle,
} from "./benchmark-agent.mjs";
import { resolveBenchmarkSourceSnapshot } from "./benchmark-agentbase-mcp.mjs";
import { benchmarkPath, benchmarkRoot } from "./benchmark-paths.mjs";

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
  const useful = "# Responsibility\n\nThis source-backed workload participates in the repository's primary orchestration flow.\n\n# Limitations\n\nRuntime deployment state is unknown.";
  const parentedFunctions = [
    concept("components/one.md", "Function", "one", {}, ["one.tf"], useful),
    concept("components/two.md", "Function", "two", {}, ["two.tf"], useful),
    concept("components/three.md", "Function", "three", {}, ["three.tf"], useful),
    concept("flows/primary.md", "Flow", "primary-flow", {}, ["flow.tf"], useful),
  ];
  assert.equal(assessOwnerReviewUsefulness(new Map(
    parentedFunctions.map((item) => [item.conceptId, item]),
  )).findings.some((finding) => /Function concepts form an implementation inventory/.test(finding)), false);
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

  const question = concept("questions/pipeline-ownership.md", "Question", "data-pipeline-ownership", {}, ["README.md"]);
  const missingSystem = scoreSemanticBenchmark({
    version: 18,
    concepts: [{ key: "data-pipeline-system", identityTerms: ["data", "pipeline"], type: "System",
      requiredMetadata: [], requiredSourcePaths: [] }],
    relationships: [],
  }, { concepts: new Map([[question.conceptId, question]]), warnings: [] }, repositoryId);
  assert.deepEqual(missingSystem.classifications.concepts.contradicted, []);
  assert.deepEqual(missingSystem.classifications.concepts.missingReference, ["data-pipeline-system"]);
  assert.equal(missingSystem.authoringAssessment.status, "reviewable");
});

test("[AB-BENCH-084][AB-BENCH-085] priority tiers gate critical probes", () => {
  const worker = concept("components/worker.md", "Function", "primary-worker", {}, ["main.tf"]);
  const result = scoreSemanticBenchmark({
    concepts: [{ key: "missing-domain", identityTerms: ["domain"], type: "Domain", requiredMetadata: [], requiredSourcePaths: [], priority: "critical" },
      { key: "primary-worker", type: "Function", requiredMetadata: [], requiredSourcePaths: [], priority: "important" },
      { key: "optional-note", identityTerms: ["never-present"], type: "Component", requiredMetadata: [], requiredSourcePaths: [], priority: "optional" }],
    relationships: [],
  }, { concepts: new Map([[worker.conceptId, worker]]), warnings: [] }, repositoryId);
  assert.deepEqual(result.priority.tiers.critical, { matched: 0, total: 1, score: 0, possible: 3 });
  assert.deepEqual(result.priority.tiers.important, { matched: 1, total: 1, score: 2, possible: 2 });
  assert.deepEqual(result.priority.tiers.optional, { matched: 0, total: 1, score: 0, possible: 1 });
  assert.equal(result.priority.qualityStatus, "needs_revision");
  assert.equal(result.priority.weightedPercent, 33);
  assert.equal(result.initialIngestAcceptance, "valid_partial");
  assert.throws(() => benchmarkPath("..", "outside"), /escapes root/);
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
  const root = path.join(benchmarkRoot(), "suites", "legacy", "aws-serverless");
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
  assert.deepEqual(validateFinalChangeCoverage(["repositories/a"], ["questions/generated", "repositories/a"]), []);
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
  const ecsRoot = path.join(benchmarkRoot(), "suites", "legacy", "aws-ecs-fullstack");
  const ecs = JSON.parse(fs.readFileSync(path.join(ecsRoot, "manifest.json"), "utf8"));
  assert.equal(ecs.agent.model, "gpt-5.6-sol");
  assert.equal(ecs.repositories[0].kind, "terraform-ecs-fullstack");
  assert.equal(ecs.repositories[0].commit, "98ee8e693a5ebc4b14f3dfe731bdc786637c1eb4");
  const ecsExpected = JSON.parse(fs.readFileSync(path.join(ecsRoot, ecs.repositories[0].expectation), "utf8"));
  assert.ok(ecsExpected.requiredConcepts.some((item) => item.key === "vue-client-component"));
  assert.ok(ecsExpected.requiredConcepts.some((item) => item.key === "node-server-component"));
  assert.ok(ecsExpected.embeddedKnowledge.some((item) => item.key === "server-health-contract"));
  const ecsRefreshRoot = path.join(benchmarkRoot(), "suites", "legacy", "aws-ecs-fullstack-refresh");
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
  const refreshRoot = path.join(benchmarkRoot(), "suites", "legacy", "aws-serverless-refresh");
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
  const batchRoot = path.join(benchmarkRoot(), "suites", "legacy", "aws-cloud-operations-batch");
  const batch = JSON.parse(fs.readFileSync(path.join(batchRoot, "manifest.json"), "utf8"));
  assert.equal(batch.workflow, "batch-initial-ingest");
  assert.equal(batch.agent.model, "gpt-5.6-sol");
  assert.equal(batch.confirmedDomain.identity, "domains/cloud-operations");
  assert.equal(batch.repositories.length, 2);
  const batchTools = Object.fromEntries([
    "get_hub_status", "configure_hub", "prepare_batch_hub_ingest", "confirm_batch_hub_ingest",
    "finalize_batch_hub_ingest_proposal", "inspect_hub_okf_proposal",
  ].map((tool) => [tool, 1]));
  for (const tool of ["preflight_hub_ingest", "index_repository", "get_okf_authoring_schemas",
    "prepare_hub_okf", "validate_okf_changes", "record_batch_hub_ingest_member"]) batchTools[tool] = 2;
  assert.deepEqual(validateBatchLifecycle(batchTools, 2), []);
  batchTools.get_okf_authoring_schemas = 3;
  assert.deepEqual(validateBatchLifecycle(batchTools, 2), []);
  batchTools.accept_hub_okf_proposal = 1;
  assert.match(validateBatchLifecycle(batchTools, 2).at(-1), /forbidden Batch Init/);
  const diverseRoot = path.join(benchmarkRoot(), "suites", "legacy", "aws-terraform-diverse");
  const diverse = JSON.parse(fs.readFileSync(path.join(diverseRoot, "manifest.json"), "utf8"));
  assert.equal(diverse.catalogVersion, "7.0.0");
  assert.equal(diverse.promptVersion, "okf-author-v17");
  assert.equal(diverse.agent.model, "gpt-5.6-sol");
  assert.equal(diverse.repositories.length, 6);
  assert.ok(diverse.repositories.every((entry) => /terraform|terragrunt/.test(entry.kind)));
  assert.ok(diverse.repositories.every((entry) => !/(?:^|[-_/])sam(?:$|[-_/])|cloudformation/i.test(
    `${entry.id}/${entry.kind}/${entry.path}`,
  )));
  const skillLifecycle = { ...lifecycleTools };
  delete skillLifecycle.configure_hub;
  delete skillLifecycle.get_hub_status;
  assert.deepEqual(validateSkillInitialIngestLifecycle(skillLifecycle, corrected.attempts), []);
});

test("[AB-BENCH-091..095] feature recall uses versioned, placement-independent semantic obligations", async () => {
  const source = fs.mkdtempSync(path.join(import.meta.dirname, "refresh-source-"));
  const workspace = fs.mkdtempSync(path.join(import.meta.dirname, "refresh-assessment-"));
  try {
    const suiteRoot = path.join(benchmarkRoot(), "suites", "crawler", "refresh-retry-dlq");
    const manifest = JSON.parse(fs.readFileSync(path.join(suiteRoot, "manifest.json"), "utf8"));
    const [scenario] = manifest.repositories;
    assert.equal(manifest.version, 7);
    assert.equal(manifest.promptVersion, "okf-refresh-v7");
    assert.equal(manifest.evaluationProfile, "refresh-semantic-recall-v1");
    assert.ok(scenario.semanticObligations.length >= 3 && scenario.semanticObligations.length <= 5);
    assert.ok(scenario.semanticObligations.every((item) => item.sourcePaths.length));
    assert.equal(Object.hasOwn(scenario, "expectedRelationships"), false);
    assert.equal(Object.hasOwn(scenario, "expectedKnowledge"), false);
    assert.doesNotMatch(fs.readFileSync(path.join(benchmarkRoot(), "prompts", "feature-discovery-v8.md"), "utf8"),
      /\*\*\* Update File:/);

    fs.mkdirSync(path.join(source, "src"), { recursive: true });
    fs.writeFileSync(path.join(source, "src", "worker.py"), "return {'processed': 1}\n");
    applyRefreshMutations(source, [
      { path: "src/worker.py", from: "processed", to: "batchItemFailures", count: 1 },
      { path: "tests/test_worker.py", content: "def test_retry(): pass\n" },
    ]);
    assert.match(fs.readFileSync(path.join(source, "src", "worker.py"), "utf8"), /batchItemFailures/);
    assert.equal(fs.readFileSync(path.join(source, "tests", "test_worker.py"), "utf8"), "def test_retry(): pass\n");
    assert.throws(() => applyRefreshMutations(source, [
      { path: "../escape", content: "no" },
    ]), /invalid refresh mutation path/);

    const baseline = path.join(suiteRoot, "baseline");
    fs.cpSync(baseline, path.join(workspace, "okf"), { recursive: true });
    const worker = path.join(workspace, "okf", "components", "crawler-worker.md");
    fs.appendFileSync(worker, [
      "", "# Failure and recovery", "",
      "Partial batch response returns batchItemFailures for each failed record.",
      "After three receives, failed records move to a DLQ monitored by a CloudWatch visible-message alarm.", "",
    ].join("\n"));
    const queue = path.join(workspace, "okf", "interfaces", "crawler-jobs-queue.md");
    fs.appendFileSync(queue, "\nFailed identifiers are retried individually.\n");
    const inspection = {
      entries: [
        { path: "components/crawler-worker.md", change: "modified" },
        { path: "interfaces/crawler-jobs-queue.md", change: "modified" },
      ],
      changeAccounting: {
        outcomes: [
          { path: "src/handler.py", outcome: "updated", reason: "Durable retry behavior changed." },
          { path: "tests/test_handler.py", outcome: "ignored", reason: "Verification only." },
        ],
        partial: false,
        omitted: 0,
        limitations: [],
      },
    };
    const entry = {
      repositoryId: scenario.repositoryId,
      expectedChangeAccounting: { paths: {
        "src/handler.py": ["updated", "embedded"],
        "tests/test_handler.py": ["ignored", "embedded"],
      } },
      semanticObligations: [
        { id: "partial-retry", priority: "critical",
          termGroups: [["batchItemFailures"], ["retry"]], sourcePaths: ["src/handler.py"] },
        { id: "dead-letter-recovery", priority: "critical",
          termGroups: [["DLQ", "dead-letter"], ["three receives"]], sourcePaths: ["main.tf"] },
        { id: "operational-visibility", priority: "important",
          termGroups: [["CloudWatch"], ["visible message"], ["alarm"]], sourcePaths: ["main.tf"] },
      ],
      forbiddenClaims: [{ id: "unsupported-notification", priority: "critical",
        termGroups: [["alarm sends a notification", "alarm pages the operator"]] }],
    };
    assert.doesNotThrow(() => validateRefreshAccounting(inspection, entry));
    const assessment = assessRefreshKnowledge(workspace, inspection, entry, "refresh-semantic-recall-v1");
    assert.equal(assessment.qualityStatus, "knowledge_recalled");
    assert.equal(assessment.evaluationProfile, "refresh-semantic-recall-v1");
    assert.deepEqual(assessment.tiers.critical, { matched: 3, total: 3 });
    const missed = assessRefreshKnowledge(workspace, inspection, { ...entry,
      semanticObligations: entry.semanticObligations.map((item, index) => index ? item : {
        id: "missing-recovery-owner", priority: "critical",
        termGroups: [["recovery owner"]], sourcePaths: ["main.tf"],
      }) }, "refresh-semantic-recall-v1");
    assert.equal(missed.qualityStatus, "needs_revision");
    assert.deepEqual(missed.missingCritical, ["missing-recovery-owner"]);
    assert.throws(() => assessRefreshKnowledge(workspace, inspection, entry), /versioned evaluation profile/);
    assert.throws(() => assessRefreshKnowledge(workspace, inspection, { ...entry,
      semanticObligations: entry.semanticObligations.slice(0, 2) }, "refresh-semantic-recall-v1"),
    /between three and five obligations/);
    const fixture = path.join(benchmarkRoot(), "repositories", "crawler", "crawler-worker");
    const snapshot = await resolveBenchmarkSourceSnapshot({ requestedRoot: fixture,
      repositoryId: "repository-crawler-worker-222222222222", hub: { host: "github.com" },
      stateRoot: workspace, createdAt: "2026-08-31T00:00:00Z" });
    assert.equal(snapshot.commit, "8cd506e999e897b9978b90affb55bef5826c385d");
    assert.equal(snapshot.remote.canonicalHttpsUrl, "https://github.com/agentbase-benchmark/crawler-worker.git");
    const args = buildCodexArgs({ workspace, finalMessage: path.join(workspace, "final.md"),
      model: "gpt-5.6-terra", reasoningEffort: "medium", mcpEntryPoint: "/benchmark/mcp.mjs" });
    assert.ok(args.includes('mcp_servers.agentbase.args=["/benchmark/mcp.mjs"]'));
  } finally {
    fs.rmSync(source, { recursive: true, force: true });
    fs.rmSync(workspace, { recursive: true, force: true });
  }
});

test("[AB-BENCH-046] released-skill trace proves source-to-Seed-to-Receipt handoff", () => {
  const seedId = `discovery-seed-${"a".repeat(24)}`;
  const groupId = `discovery-group-${"b".repeat(24)}`;
  const receiptId = `discovery-receipt-${"c".repeat(24)}`;
  const commit = "d".repeat(40);
  const completed = (tool, argumentsValue, values) => JSON.stringify({
    type: "item.completed",
    item: { type: "mcp_tool_call", tool, arguments: argumentsValue, status: "completed",
      result: { content: values.map((value) => ({ type: "text", text: JSON.stringify(value) })) } },
  });
  const summary = summarizeAgentEvents([
    completed("index_repository", {}, [{ project: "fixture" }, { agentbase_discovery_seed: {
      id: seedId, state: "ready", source: { commit }, groups: [{ id: groupId,
        lane: "deploy-operations", priority: "p0", kind: "infrastructure-workload",
        sources: [{ path: "main.tf", startLine: 1, endLine: 1 }], hints: ["do-not-copy"] }],
    } }]),
    completed("get_okf_authoring_schemas", { discovery_inventory: { seed_id: seedId,
      items: [{ origin_group_id: groupId, outcome: "materialized" }] } }, [{ discovery_receipt_id: receiptId }]),
    completed("prepare_hub_okf", { discovery_receipt_id: receiptId }, [{ sessionId: "session" }]),
  ].join("\n"));
  assert.deepEqual(summary.activity.discovery.seed.groups, [{ id: groupId, lane: "deploy-operations",
    priority: "p0", kind: "infrastructure-workload", sourcePaths: ["main.tf"] }]);
  assert.equal(JSON.stringify(summary.activity.discovery).includes("do-not-copy"), false);
  assert.deepEqual(validateReceiptDiscoveryLifecycle(summary.activity.discovery,
    [{ lane: "deploy-operations", priority: "p0", sourcePath: "main.tf" }], commit), []);
  const broken = structuredClone(summary.activity.discovery);
  broken.prepareReceiptId = `discovery-receipt-${"e".repeat(24)}`;
  assert.match(validateReceiptDiscoveryLifecycle(broken, [], commit).at(-1), /exact frozen Discovery Receipt/);
  const superseded = structuredClone(summary.activity.discovery);
  delete superseded.inventory.items[0].outcome;
  superseded.inventory.items[0].disposition = "concept";
  assert.match(validateReceiptDiscoveryLifecycle(superseded, [], commit).at(0), /unsupported outcome/);
  const currentMetrics = metrics("reviewable");
  currentMetrics.initialIngestAcceptance = "valid_partial";
  const priorMetrics = metrics("reviewable");
  priorMetrics.initialIngestAcceptance = "review_ready";
  const regression = createRunRegression(
    { elapsedMs: 90, usage: { inputTokens: 110 }, discoveryQualification: { status: "passed" } },
    currentMetrics,
    { runId: "2026-08-24T000000Z", run: { elapsedMs: 100, usage: { inputTokens: 100 },
      discoveryQualification: { status: "passed" } }, metrics: priorMetrics },
  );
  assert.deepEqual(regression.changes.elapsedMs, -10);
  assert.match(regression.regressions[0], /acceptance declined/);
  const qualificationRoot = path.join(benchmarkRoot(), "suites", "legacy", "initial-ingest-discovery-v1");
  const qualification = JSON.parse(fs.readFileSync(path.join(qualificationRoot, "manifest.json"), "utf8"));
  const qualificationExpectation = JSON.parse(fs.readFileSync(path.join(qualificationRoot, "expectation.json"), "utf8"));
  assert.equal(qualification.promptVersion, "okf-author-v22");
  assert.equal(qualification.agent.model, "gpt-5.6-sol");
  assert.equal(qualification.repositories.length, 1);
  assert.ok(qualificationExpectation.discoveryChecks.every((check) => check.priority === "p0"));
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
