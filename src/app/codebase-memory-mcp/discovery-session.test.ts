import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import type { CallToolResult } from "@modelcontextprotocol/server";

import type { ScopedSession } from "../../providers/codebase-memory/index.ts";
import type { SourceSnapshot } from "../../providers/github-hub/index.ts";
import { createInventoryItemId, createQuestionPlanId, createRepositorySourceResource, DiscoveryValidationError,
  validateDiscoverySeed } from "../../core/knowledge/index.ts";
import { DiscoverySession, DISCOVERY_ARCHITECTURE_ASPECTS, redactDiscoveryHint } from "./discovery-session.ts";
import { callOkfSchemaTool } from "./okf-schema-tools.ts";

const fixtureRoot = new URL("../../../fixtures/codebase-memory-v0.10.8/discovery/", import.meta.url);

function envelope(value: unknown): CallToolResult {
  return { content: [{ type: "text", text: typeof value === "string" ? value : JSON.stringify(value) }] };
}

function readFixture(name: string): unknown {
  const value = fs.readFileSync(new URL(name, fixtureRoot), "utf8");
  return name.endsWith(".json") ? JSON.parse(value) as unknown : value;
}

function snapshot(root: string): SourceSnapshot {
  return {
    repositoryId: "repository-fixture-aaaaaaaaaaaa",
    remote: { host: "github.example.test", repository: "acme/fixture",
      canonicalHttpsUrl: "https://github.example.test/acme/fixture.git" },
    defaultBranch: "main",
    commit: "a".repeat(40),
    requestedRoot: root,
    analysisRoot: root,
    kind: "current-checkout",
    createdAt: "2026-08-25T00:00:00.000Z",
    privateRoot: path.join(path.dirname(root), "private"),
  };
}

test("[AB-MCP-019..023][AB-INGEST-017] armed Init derives one fixed bounded Seed without changing provider blocks", async (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-discovery-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, "src"));
  fs.writeFileSync(path.join(root, "README.md"), "# Job worker\n\nProcesses queued jobs.\n");
  fs.writeFileSync(path.join(root, "src/handler.ts"), 'const database_url = "postgres://admin:super-secret@db.example.test/app";\nexport async function main() { return "ok"; }\n');
  fs.writeFileSync(path.join(root, "Dockerfile"), "FROM scratch\n");
  fs.writeFileSync(path.join(root, "main.tf"), [
    "resource \"aws_lambda_function\" \"worker\" { handler = \"src/handler.main\" }",
    "resource \"aws_lambda_event_source_mapping\" \"queue\" { event_source_arn = aws_sqs_queue.jobs.arn }",
    "resource \"aws_sqs_queue\" \"jobs\" {}",
  ].join("\n"));
  fs.writeFileSync(path.join(root, ".env"), "DATABASE_URL=https://secret.example.test\n");
  fs.writeFileSync(path.join(root, "credentials.json"), "{\"token\":\"secret\"}\n");

  const calls: Array<Readonly<{ name: string; arguments: Readonly<Record<string, unknown>> }>> = [];
  const coveragePages = readFixture("coverage-pages.json") as readonly unknown[];
  let coverageIndex = 0;
  const provider: ScopedSession = {
    pid: 1,
    tools: [],
    async invoke(name, argumentsValue) {
      calls.push({ name, arguments: argumentsValue });
      if (name === "index_status") return envelope(readFixture("index-status.json"));
      if (name === "check_index_coverage") return envelope(coveragePages[coverageIndex++]);
      if (name === "get_architecture") return envelope(readFixture("architecture.txt"));
      throw new Error(`unexpected provider call: ${name}`);
    },
    async close() { return { status: "clean", pid: 1, graceful: true, forced: false, stderrBytes: 0 }; },
  };
  const discoveryState = path.join(root, "state");
  const discovery = new DiscoverySession(discoveryState);
  discovery.arm(snapshot(root), "new", { hubProfileId: "b".repeat(24), publishedBase: "c".repeat(40) });
  const original = envelope("provider-index-result");
  const result = await discovery.captureAfterIndex({ repositoryRoot: root, project: "fixture", provider, result: original });
  assert.deepEqual(result.content[0], original.content[0]);
  assert.equal(result.content.length, 2);
  assert.deepEqual(calls.map((call) => call.name), ["index_status", "check_index_coverage", "check_index_coverage", "get_architecture"]);
  assert.deepEqual(calls[1]?.arguments, { project: "fixture", scopes: ["."], scope_limit: 200, scope_offset: 0 });
  assert.deepEqual(calls[2]?.arguments, { project: "fixture", scopes: ["."], scope_limit: 200, scope_offset: 200 });
  assert.deepEqual(calls[3]?.arguments, { project: "fixture", aspects: [...DISCOVERY_ARCHITECTURE_ASPECTS] });
  const seed = discovery.activeSeed;
  assert.equal(seed?.state, "ready");
  assert.deepEqual(seed?.lanes.map((lane) => lane.status), ["covered", "covered", "covered", "covered", "covered"]);
  assert.deepEqual([...new Set(seed?.groups.map((group) => group.priority))].sort(), ["p0", "p1", "p2"]);
  assert.equal(seed?.groups.some((group) => group.priority === "p1" && group.kind === "flow-candidate"), true);
  assert.ok(seed?.capture.limitations.some((value) => value.includes("boundaries were captured but not promoted")));
  assert.ok(seed?.capture.limitations.some((value) => value.includes("layers were captured but not promoted")));
  assert.equal(JSON.stringify(seed).includes("secret.example.test"), false);
  assert.equal(JSON.stringify(seed).includes("super-secret"), false);
  assert.equal(JSON.stringify(seed).includes("credentials.json"), false);
  assert.ok(seed);
  const nestedGroupIndex = seed.groups.findIndex((group) => group.sources.some((source) => source.path.includes("/")));
  assert.notEqual(nestedGroupIndex, -1, "fixture must expose one nested source path");
  const questionIndex = seed.groups.findIndex((_group, index) => index !== nestedGroupIndex);
  const parentIndex = seed.groups.findIndex((_group, index) => index !== nestedGroupIndex && index !== questionIndex);
  const ignoredIndex = seed.groups.findIndex((group, index) => group.priority === "p0"
    && ![nestedGroupIndex, questionIndex, parentIndex].includes(index));
  assert.notEqual(questionIndex, -1, "fixture must expose a separate Question origin group");
  assert.notEqual(parentIndex, -1, "fixture must expose a materialized owner group");
  assert.notEqual(ignoredIndex, -1, "fixture must expose a duplicate-covered P0 group");
  const discoveryCandidates = seed.groups.map((group, index) => ({
    id: `candidate-${index + 1}`, identity_hint: `${group.kind}-${index + 1}`, identity_basis: group.title,
    query_value: group.title,
    ...(index === nestedGroupIndex
      ? { disposition: "embedded", parent_candidate_id: `candidate-${parentIndex + 1}` }
      : { disposition: "concept", suggested_type: "Repository" }),
    evidence_ids: [`evidence-${index + 1}`],
  }));
  const discoveryObservations = seed.groups.map((group, index) => {
    const source = group.sources.find((candidate) => candidate.path.includes("/")) ?? group.sources[0]!;
    return {
    id: `evidence-${index + 1}`, candidate_id: `candidate-${index + 1}`, role: "implementation",
    signal: group.title, source: { path: source.path,
      start_line: source.startLine, end_line: source.endLine },
  };
  });
  const nestedIndex = discoveryObservations.findIndex((observation) => observation.source.path.includes("/"));
  assert.equal(nestedIndex, nestedGroupIndex);
  const inventory = {
    seed_id: seed.id,
    items: seed.groups.map((group, index) => index === questionIndex ? {
      origin_group_id: group.id,
      outcome: "question",
      question: {
        kind: "relation-candidate",
        target_candidate_id: `candidate-${nestedIndex + 1}`,
        property: "dependency",
        scope_key: "repository-runtime",
        candidate_evidence: [{ candidate_key: `candidate-${nestedIndex + 1}`, evidence_id: `evidence-${nestedIndex + 1}` }],
        missing_evidence: ["Confirm the runtime dependency."],
        limitations: [],
      },
    } : index === ignoredIndex ? {
      origin_group_id: group.id,
      outcome: "ignored",
      reason: "duplicate-covered",
      covered_by_origin_group_id: seed.groups[parentIndex]!.id,
    } : {
      origin_group_id: group.id,
      outcome: "materialized",
      candidate_ids: index === nestedIndex
        ? [`candidate-${parentIndex + 1}`, `candidate-${nestedIndex + 1}`]
        : [`candidate-${index + 1}`],
      reason: "harmless Agent explanation is not a correctness field",
    }),
    limitations: [],
  };
  const guidanceRequest = {
    candidates: discoveryCandidates,
    semantic_observations: discoveryObservations,
    resource_observations: [],
  };
  const invalidInventory = structuredClone(inventory);
  const invalidQuestion = invalidInventory.items[questionIndex] as typeof inventory.items[number] & {
    question: { candidate_evidence: Array<{ candidate_key: string; evidence_id: string }> };
  };
  invalidQuestion.question.candidate_evidence[0]!.evidence_id = `evidence-${questionIndex + 1}`;
  const invalidMaterialized = invalidInventory.items[nestedIndex] as typeof inventory.items[number] & { candidate_ids: string[] };
  invalidMaterialized.candidate_ids.push("unknown-candidate");
  const invalidGuidance = callOkfSchemaTool("get_okf_authoring_schemas", {
    ...guidanceRequest, discovery_inventory: invalidInventory,
  }, { discovery });
  assert.equal(invalidGuidance.isError, true);
  const invalidValue = JSON.parse(invalidGuidance.content[0]?.type === "text" ? invalidGuidance.content[0].text : "{}") as {
    code?: string; retryable?: boolean; recovery?: string;
  };
  assert.equal(invalidValue.code, "INVALID_ARGUMENT");
  assert.equal(invalidValue.retryable, true);
  assert.equal(invalidValue.recovery, "correct-and-retry-same-tool");
  assert.match((invalidValue as { error?: string }).error ?? "", /candidate evidence is invalid/);
  assert.match((invalidValue as { error?: string }).error ?? "", /unknown-candidate mapping is invalid/);

  const guidance = callOkfSchemaTool("get_okf_authoring_schemas", {
    ...guidanceRequest, discovery_inventory: inventory,
  }, { discovery });
  assert.equal(guidance.isError, undefined);
  const guidanceValue = JSON.parse(guidance.content[0]?.type === "text" ? guidance.content[0].text : "{}") as {
    discovery_receipt_id?: string; coverage?: { p0_acknowledged: number };
  };
  assert.match(guidanceValue.discovery_receipt_id ?? "", /^discovery-receipt-[a-f0-9]{24}$/);
  assert.equal(guidanceValue.coverage?.p0_acknowledged, seed.groups.filter((group) => group.priority === "p0").length);
  const receipt = discovery.resolveReceipt(guidanceValue.discovery_receipt_id!);
  assert.ok(receipt);
  const mixedItem = receipt.inventory.items.find((item) => item.originGroupId === seed.groups[nestedIndex]!.id)!;
  assert.equal(mixedItem.id, createInventoryItemId(seed.id, seed.groups[nestedIndex]!.id));
  assert.deepEqual(mixedItem.outputs, [
    { candidateId: `candidate-${parentIndex + 1}` },
    { candidateId: `candidate-${nestedIndex + 1}`, parentCandidateId: `candidate-${parentIndex + 1}` },
  ]);
  assert.equal(receipt.inventory.questionPlans[0]!.id,
    createQuestionPlanId(seed.id, seed.groups[questionIndex]!.id));
  assert.equal(receipt.inventory.items.find((item) => item.originGroupId === seed.groups[ignoredIndex]!.id)?.coveredByItemId,
    createInventoryItemId(seed.id, seed.groups[parentIndex]!.id));
  const evidence = receipt.inventory.questionPlans[0]!.candidateEvidence[0]!;
  const nestedSource = discoveryObservations[nestedIndex]!.source;
  assert.equal(evidence.sourceResource, createRepositorySourceResource(seed.source.repositoryId,
    nestedSource.path, nestedSource.start_line, nestedSource.end_line));
  assert.equal(evidence.observedRevision, seed.source.commit);
  assert.match(evidence.sourceResource, /src\/handler\.ts/);
  assert.doesNotMatch(evidence.sourceResource, /%2F/);
  assert.equal(new DiscoverySession(discoveryState).resolveReceipt(guidanceValue.discovery_receipt_id!)?.id,
    guidanceValue.discovery_receipt_id, "a frozen Receipt survives MCP connection restart");
  const replacement = new DiscoverySession(discoveryState).rebaseReceipt(
    guidanceValue.discovery_receipt_id!, "d".repeat(40), "2026-08-26T00:00:00.000Z");
  assert.notEqual(replacement?.id, guidanceValue.discovery_receipt_id);
  assert.equal(new DiscoverySession(discoveryState).resolveReceipt(replacement!.id)?.publishedBase, "d".repeat(40));

  const unarmed = new DiscoverySession();
  const untouched = await unarmed.captureAfterIndex({ repositoryRoot: root, project: "fixture", provider, result: original });
  assert.equal(untouched, original);
  assert.equal(calls.length, 4);

  const refresh = new DiscoverySession();
  refresh.arm(snapshot(root), "refresh");
  const refreshResult = await refresh.captureAfterIndex({ repositoryRoot: root, project: "fixture", provider, result: original });
  assert.equal(refreshResult, original);
  assert.equal(calls.length, 4);

  assert.throws(() => validateDiscoverySeed({ ...seed,
    groups: Array.from({ length: 65 }, (_value, index) => ({ ...seed.groups[0]!,
      id: `discovery-group-${index.toString(16).padStart(24, "0")}` })) }),
  (error: unknown) => error instanceof DiscoveryValidationError && error.code === "DISCOVERY_OVERFLOW");
});

test("[AB-MCP-025] discovery hint redaction preserves structure without exposing credential values", () => {
  const hint = redactDiscoveryHint('Authorization: Bearer super-secret token https://user:password@example.test/api');
  assert.equal(hint.includes("super-secret"), false);
  assert.equal(hint.includes("password"), false);
  assert.match(hint, /Authorization: Bearer \[REDACTED\]/);
  assert.match(hint, /https:\/\/user:\[REDACTED\]@example\.test/);
});

test("[AB-MCP-021][AB-MCP-023] malformed and P0-hiding diagnostics fail visibly", async (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-discovery-failure-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, "README.md"), "# Fixture\n");

  const malformed = new DiscoverySession();
  malformed.arm(snapshot(root), "new", { hubProfileId: "b".repeat(24), publishedBase: "c".repeat(40) });
  const malformedProvider: ScopedSession = {
    pid: 2, tools: [],
    async invoke(name) {
      if (name === "index_status") return envelope({ project: "fixture", status: "unknown" });
      throw new Error(`unexpected provider call: ${name}`);
    },
    async close() { return { status: "clean", pid: 2, graceful: true, forced: false, stderrBytes: 0 }; },
  };
  await assert.rejects(() => malformed.captureAfterIndex({ repositoryRoot: root, project: "fixture",
    provider: malformedProvider, result: envelope("provider-index-result") }), /status must be ready or empty/);

  const limited = new DiscoverySession();
  limited.arm(snapshot(root), "new", { hubProfileId: "b".repeat(24), publishedBase: "c".repeat(40) });
  const diagnostic = structuredClone(readFixture("index-status.json")) as Record<string, unknown>;
  diagnostic.parse_partial = { files: [{ path: "README.md", error_ranges: "1-1" }], count: 1, truncated: true };
  const coverageTemplate = (readFixture("coverage-pages.json") as readonly Record<string, unknown>[])[0]!;
  const limitedProvider: ScopedSession = {
    pid: 3, tools: [],
    async invoke(name, argumentsValue) {
      if (name === "index_status") return envelope(diagnostic);
      if (name === "check_index_coverage") {
        const page = structuredClone(coverageTemplate) as { scopes: Array<Record<string, unknown>> };
        const offset = Number(argumentsValue.scope_offset ?? 0);
        page.scopes[0] = { ...page.scopes[0], has_more: true, next_offset: offset + 200 };
        return envelope(page);
      }
      if (name === "get_architecture") return envelope(readFixture("architecture.txt"));
      throw new Error(`unexpected provider call: ${name}`);
    },
    async close() { return { status: "clean", pid: 3, graceful: true, forced: false, stderrBytes: 0 }; },
  };
  const result = await limited.captureAfterIndex({ repositoryRoot: root, project: "fixture",
    provider: limitedProvider, result: envelope("provider-index-result") });
  assert.equal(result.content.length, 2);
  assert.equal(limited.activeSeed?.state, "invalid");
  assert.equal(limited.activeSeed?.capture.coverageTerminal, false);
  assert.ok(limited.activeSeed?.capture.limitations.some((value) => value.includes("did not reach a terminal page")));
  assert.ok(limited.activeSeed?.lanes.every((lane) => lane.status === "limited"));
});
