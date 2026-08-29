import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { activatePersistedHubConfiguration } from "../../src/app/hub-okf/configuration/configuration-file.ts";
import { createHubIdentity, hubProfileId } from "../../src/core/hub/index.ts";
import { buildCodexArgs } from "./benchmark-agent.mjs";

import {
  agentFailureFromEvents,
  compareContextPair,
  recordContextReview,
  runContextPair,
  scoreDiscoveryDraft,
  seedPinnedContextHub,
  validateContextSession,
  validateDiscoveryDraft,
} from "./benchmark-context.mjs";

const commit = "3d0127bf2dee3eddbc54d72576e2d81fb94a9790";
const limits = { searches: 3, reads: 5, searchResultLimit: 8, resultBytes: 64 * 1024 };
const pathRef = "domains/crawler/concepts/crawler-worker.md";

function runGit(cwd, args) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

function result(value) {
  return { content: [{ type: "text", text: JSON.stringify(value) }] };
}

function call(tool, args, value, status = "completed") {
  return JSON.stringify({
    type: "item.completed",
    item: { type: "mcp_tool_call", tool, arguments: args, status, result: result(value) },
  });
}

const search = () => call("search_hub_okf", { query: "crawler worker queue", limit: 8 }, {
  commit,
  matches: [{ identity: "component:crawler-worker", path: pathRef }, {
    identity: "resource:sqs:crawler-jobs", path: "domains/crawler/concepts/crawler-jobs.md",
  }],
});
const read = () => call("read_hub_okf_concept", { path: pathRef }, {
  commit, path: pathRef, excerpt: "component:crawler-worker consumes resource:sqs:crawler-jobs",
});

const assistedDraft = {
  overview: "Crawler work crosses a publisher, an SQS queue, and a worker.",
  affected_areas: [{
    identity: "component:crawler-worker", reason: "Consumes queued crawl jobs.", evidence_refs: ["e1"],
  }],
  relevant_relations: [{
    source: "component:crawler-worker", predicate: "consumes", target: "resource:sqs:crawler-jobs", evidence_refs: ["e1"],
  }],
  discovery_questions: ["Who owns retries and alarms?"],
  known_unknowns: ["No existing DLQ is established by the available evidence."],
  evidence_refs: [{ id: "e1", path: pathRef, commit }],
};

const directDraft = {
  overview: "Add crawler processing.",
  affected_areas: [], relevant_relations: [],
  discovery_questions: ["Which component changes?"], known_unknowns: [], evidence_refs: [],
};

test("admits only bounded Published Hub search/read activity", () => {
  const requestedPath = "components/requested-directly.md";
  const sourceRef = "repository://repository-example/source.tf#L1-L8";
  const directRead = call("read_hub_okf_concept", { path: requestedPath }, {
    commit, excerpt: `Source: ${sourceRef}`,
  });
  const admitted = validateContextSession(`${search()}\n${read()}\n${directRead}\n`, {
    arm: "discovery-plus-agentbase", pinnedCommit: commit, limits,
  });
  assert.deepEqual(admitted.failures, []);
  assert.equal(admitted.trace.searches, 1);
  assert.equal(admitted.trace.reads, 2);
  assert(admitted.trace.resultBytes > 0);
  assert(admitted.trace.values.includes("component:crawler-worker"));
  assert(admitted.trace.evidence.includes(`${requestedPath}\0${commit}`));
  assert(admitted.trace.evidence.includes(`${sourceRef}\0${commit}`));
});

test("rejects wrong revision, missing search, excessive limits, shell and non-allowlisted tools", () => {
  const cases = [
    [read(), "at least one completed search"],
    [call("search_hub_okf", { query: "x", limit: 9 }, { commit, matches: [] }), "limit must be an integer from 1 to 8"],
    [call("search_graph", { query: "x" }, { commit }), "tool is not allowed"],
    [JSON.stringify({ type: "item.completed", item: { type: "command_execution", status: "completed" } }), "forbidden agent activity"],
    [call("search_hub_okf", { query: "x", limit: 8 }, { commit: "a".repeat(40), matches: [] }), "result is not pinned"],
  ];
  for (const [events, message] of cases) {
    const admitted = validateContextSession(`${events}\n`, {
      arm: "discovery-plus-agentbase", pinnedCommit: commit, limits,
    });
    assert(admitted.failures.some((failure) => failure.includes(message)), admitted.failures.join("\n"));
  }
  const tooMany = Array.from({ length: 4 }, search).join("\n");
  assert(validateContextSession(tooMany, {
    arm: "discovery-plus-agentbase", pinnedCommit: commit, limits,
  }).failures.some((failure) => failure.includes("search call limit")));
  const tooManyReads = [search(), ...Array.from({ length: 6 }, read)].join("\n");
  assert(validateContextSession(tooManyReads, {
    arm: "discovery-plus-agentbase", pinnedCommit: commit, limits,
  }).failures.some((failure) => failure.includes("read call limit")));
  const oversized = call("search_hub_okf", { query: "x", limit: 8 }, { commit, value: "x".repeat(70 * 1024) });
  assert(validateContextSession(oversized, {
    arm: "discovery-plus-agentbase", pinnedCommit: commit, limits,
  }).failures.some((failure) => failure.includes("result byte limit")));
});

test("direct arm rejects every tool call and malformed event stream", () => {
  assert(validateContextSession(search(), {
    arm: "discovery-only", pinnedCommit: commit, limits,
  }).failures.some((failure) => failure.includes("must not call MCP")));
  assert(validateContextSession("not-json", {
    arm: "discovery-only", pinnedCommit: commit, limits,
  }).failures.some((failure) => failure.includes("malformed event")));
});

test("direct runner disables the built-in shell while assisted keeps Hub MCP available", () => {
  const base = { workspace: "/tmp/workspace", finalMessage: "/tmp/final.json", model: "gpt-5.6-sol", reasoningEffort: "medium" };
  const direct = buildCodexArgs({ ...base, arm: "direct" });
  const assisted = buildCodexArgs({ ...base, arm: "mcp", enabledTools: ["search_hub_okf"] });
  assert.deepEqual(direct.slice(direct.indexOf("--disable"), direct.indexOf("--disable") + 2), ["--disable", "shell_tool"]);
  assert(!assisted.includes("shell_tool"));
});

test("classifies model failures without copying provider prose into run metadata", () => {
  const events = [
    JSON.stringify({ type: "error", message: "You've hit your usage limit. purchase more credits at a provider URL" }),
    JSON.stringify({ type: "turn.failed", error: { message: "You've hit your usage limit." } }),
  ].join("\n");
  assert.equal(agentFailureFromEvents(events), "agent usage limit reached");
  assert.equal(agentFailureFromEvents(JSON.stringify({ type: "turn.failed", error: { message: "unexpected provider detail" } })),
    "agent turn failed; inspect retained events");
});

test("copies the pinned Published revision from the active local fixture without remote access", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-context-hub-"));
  const sourceRoot = path.join(root, "source");
  const runtimeRoot = path.join(root, "runtime");
  const sourceEnvironment = {
    ...process.env, HOME: path.join(root, "source-home"), AGENTBASE_HOME: path.join(root, "source-state"),
    XDG_CONFIG_HOME: path.join(root, "source-config"), XDG_DATA_HOME: path.join(root, "source-data"),
  };
  const identity = createHubIdentity("acme/hub-3", "main");
  try {
    fs.mkdirSync(sourceRoot, { recursive: true });
    runGit(sourceRoot, ["init", "--initial-branch=main"]);
    fs.writeFileSync(path.join(sourceRoot, "index.md"), "---\nokf_version: \"0.2\"\n---\n\n# Fixture\n");
    runGit(sourceRoot, ["add", "index.md"]);
    runGit(sourceRoot, ["-c", "user.name=AgentBase", "-c", "user.email=agentbase@localhost", "commit", "-m", "fixture"]);
    const pinned = runGit(sourceRoot, ["rev-parse", "HEAD"]);
    runGit(sourceRoot, ["remote", "add", "origin", identity.canonicalHttpsUrl]);
    runGit(sourceRoot, ["update-ref", "refs/agentbase/published", pinned]);
    activatePersistedHubConfiguration({
      formatVersion: 1, kind: "remote", localHubId: hubProfileId(identity), localRoot: sourceRoot,
      baseCommit: pinned, catalogVersion: "7.0.0", host: identity.host,
      repository: identity.repository, targetBranch: identity.targetBranch,
    }, sourceEnvironment, null);
    fs.mkdirSync(runtimeRoot);
    const seeded = seedPinnedContextHub(runtimeRoot, {
      host: identity.host, repository: identity.repository, branch: identity.targetBranch,
      commit: pinned, catalogVersion: "7.0.0",
    }, sourceEnvironment);
    assert.equal(runGit(seeded.localRoot, ["rev-parse", "HEAD"]), pinned);
    assert.equal(runGit(sourceRoot, ["rev-parse", "HEAD"]), pinned);
    assert.equal(runGit(sourceRoot, ["status", "--porcelain"]), "");
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("validates exact output schema and resolves assisted evidence through retained trace", () => {
  const trace = validateContextSession(`${search()}\n${read()}\n`, {
    arm: "discovery-plus-agentbase", pinnedCommit: commit, limits,
  }).trace;
  assert.deepEqual(validateDiscoveryDraft(assistedDraft, {
    arm: "discovery-plus-agentbase", trace,
  }).failures, []);

  const unresolved = structuredClone(assistedDraft);
  unresolved.evidence_refs[0].path = "unknown.md";
  unresolved.affected_areas[0].identity = "component:invented";
  const failures = validateDiscoveryDraft(unresolved, {
    arm: "discovery-plus-agentbase", trace,
  }).failures;
  assert(failures.some((failure) => failure.includes("identity is absent")));
  assert(failures.some((failure) => failure.includes("does not resolve")));

  const extra = { ...directDraft, prose: "outside schema" };
  assert(validateDiscoveryDraft(extra, { arm: "discovery-only", trace: null }).failures
    .some((failure) => failure.includes("exact fields")));
});

test("admits an explicit insufficient-Hub outcome without invented identities", () => {
  const emptySearch = call("search_hub_okf", { query: "unavailable capability", limit: 8 }, { commit, matches: [] });
  const admitted = validateContextSession(emptySearch, {
    arm: "discovery-plus-agentbase", pinnedCommit: commit, limits,
  });
  const draft = {
    overview: "The requested system surface is not established by Published Hub evidence.",
    affected_areas: [], relevant_relations: [], discovery_questions: ["Which system owns this behavior?"],
    known_unknowns: ["Published Hub search returned no matching concept."], evidence_refs: [],
  };
  assert.deepEqual(admitted.failures, []);
  assert.deepEqual(validateDiscoveryDraft(draft, {
    arm: "discovery-plus-agentbase", trace: admitted.trace,
  }).failures, []);
});

const expectations = {
  probes: [
    { id: "critical-worker", priority: "critical", fields: ["affected_areas", "overview"], allTerms: ["crawler-worker"] },
    { id: "critical-queue", priority: "critical", fields: ["relevant_relations", "overview"], allTerms: ["crawler-jobs"] },
    { id: "important-retry", priority: "important", fields: ["discovery_questions"], allTerms: ["retries"] },
    { id: "optional-alarm", priority: "optional", fields: ["discovery_questions"], allTerms: ["alarms"] },
  ],
  unsupportedClaims: [{ id: "invented-dlq", fields: ["overview", "affected_areas", "relevant_relations"], allTerms: ["existing dlq"] }],
};

test("scores priority tiers and unsupported claims deterministically", () => {
  const score = scoreDiscoveryDraft(assistedDraft, expectations);
  assert.deepEqual(score.matched.critical, ["critical-worker", "critical-queue"]);
  assert.deepEqual(score.matched.important, ["important-retry"]);
  assert.deepEqual(score.matched.optional, ["optional-alarm"]);
  assert.deepEqual(score.unsupportedClaims, []);

  const invented = { ...assistedDraft, overview: `${assistedDraft.overview} Existing DLQ handles failure.` };
  assert.deepEqual(scoreDiscoveryDraft(invented, expectations).unsupportedClaims, ["invented-dlq"]);
});

function arm(armName, draft, failures = [], kind = "fake") {
  return {
    arm: armName, kind, promptDigest: "sha256:same", inputDigest: "sha256:same-input",
    process: { exitCode: 0, signal: null, error: null }, elapsedMs: armName === "discovery-only" ? 100 : 10,
    usage: { inputTokens: armName === "discovery-only" ? 100 : 10, outputTokens: 10 },
    output: draft, qualification: { failures },
  };
}

test("requires no critical regression plus a new important probe; efficiency cannot compensate", () => {
  const direct = structuredClone(assistedDraft);
  direct.discovery_questions = [];
  const passed = compareContextPair({ direct: arm("discovery-only", direct), assisted: arm("discovery-plus-agentbase", assistedDraft) }, expectations);
  assert.equal(passed.status, "passed");
  assert.equal(passed.ownerReview, "not_required");

  const regressed = structuredClone(assistedDraft);
  regressed.relevant_relations = [];
  regressed.overview = "Crawler worker only.";
  const failed = compareContextPair({ direct: arm("discovery-only", assistedDraft), assisted: arm("discovery-plus-agentbase", regressed) }, expectations);
  assert.equal(failed.status, "needs_revision");
  assert(failed.reasons.some((reason) => reason.includes("critical")));

  const incomplete = compareContextPair({
    direct: arm("discovery-only", direct),
    assisted: arm("discovery-plus-agentbase", assistedDraft, ["tool limit exceeded"]),
  }, expectations);
  assert.equal(incomplete.status, "incomplete");
});

test("real passing evidence remains pending immutable owner review", () => {
  const direct = structuredClone(assistedDraft);
  direct.discovery_questions = [];
  const comparison = compareContextPair({
    direct: arm("discovery-only", direct, [], "real"),
    assisted: arm("discovery-plus-agentbase", assistedDraft, [], "real"),
  }, expectations);
  assert.equal(comparison.status, "needs_review");
  assert.equal(comparison.ownerReview, "pending");
});

test("owner review is immutable and cannot rewrite the first decision", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-context-review-"));
  const comparison = { status: "needs_review", ownerReview: "pending", reasons: [] };
  try {
    const recorded = recordContextReview({ base: root, comparison, decision: "accepted", note: "supported",
      now: () => "2026-01-01T00:00:00.000Z" });
    assert.equal(recorded.final.status, "passed");
    assert.throws(() => recordContextReview({ base: root, comparison, decision: "rejected", note: "changed",
      now: () => "2026-01-02T00:00:00.000Z" }), /immutable evidence already exists/);
    assert.equal(JSON.parse(fs.readFileSync(path.join(root, "owner-review.json"))).decision, "accepted");
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("comparison rejects mismatched paired inputs even when scores improve", () => {
  const direct = arm("discovery-only", directDraft);
  const assisted = arm("discovery-plus-agentbase", assistedDraft);
  assisted.inputDigest = "sha256:different";
  const comparison = compareContextPair({ direct, assisted }, expectations);
  assert.equal(comparison.status, "incomplete");
  assert(comparison.reasons.some((reason) => reason.includes("identical prompt and input")));
});

test("pair runner executes direct then assisted with identical inputs and retains partial failure", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-context-test-"));
  const order = [];
  const manifest = { domain: "crawler", suite: "crawler-feature-discovery", promptVersion: "feature-discovery-v1", feature: "F", trackerContext: "T" };
  const prompt = "{{FEATURE}}\n{{TRACKER_CONTEXT}}";
  try {
    const pair = await runContextPair({
      manifest, prompt, root, pairId: "2026-01-01T00-00-00Z",
      runArm: async ({ arm: armName, renderedPrompt }) => {
        order.push(armName);
        if (armName === "discovery-plus-agentbase") throw new Error("synthetic failure");
        return { kind: "fake", events: "", output: directDraft, elapsedMs: 1, usage: null,
          process: { exitCode: 0, signal: null, error: null }, renderedPrompt };
      },
    });
    assert.deepEqual(order, ["discovery-only", "discovery-plus-agentbase"]);
    assert.equal(pair.direct.promptDigest, pair.assisted.promptDigest);
    assert.equal(pair.direct.inputDigest, pair.assisted.inputDigest);
    assert.equal(pair.assisted.process.error, "synthetic failure");
    assert(fs.existsSync(path.join(root, "results/crawler/crawler-feature-discovery/2026-01-01T00-00-00Z/discovery-only/run.json")));
    assert(fs.existsSync(path.join(root, "results/crawler/crawler-feature-discovery/2026-01-01T00-00-00Z/discovery-plus-agentbase/run.json")));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("deterministic fake pair retains trace, telemetry and tiered comparison without a model", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-context-fake-"));
  const manifest = {
    domain: "crawler", suite: "crawler-feature-discovery", promptVersion: "feature-discovery-v1",
    feature: "F", trackerContext: "T", hub: { commit }, limits,
  };
  try {
    const pair = await runContextPair({
      manifest, prompt: "{{FEATURE}}\n{{TRACKER_CONTEXT}}", root, pairId: "2026-01-02T00-00-00Z",
      runArm: async ({ arm: armName }) => armName === "discovery-only"
        ? { kind: "fake", events: "", output: directDraft, elapsedMs: 11,
          usage: { inputTokens: 10, outputTokens: 5 }, process: { exitCode: 0, signal: null, error: null } }
        : { kind: "fake", events: `${search()}\n${read()}\n`, output: assistedDraft, elapsedMs: 22,
          usage: { inputTokens: 20, outputTokens: 8 }, process: { exitCode: 0, signal: null, error: null } },
    });
    const comparison = compareContextPair(pair, expectations);
    assert.equal(comparison.status, "passed");
    assert.equal(pair.assisted.trace.searches, 1);
    assert(pair.assisted.trace.resultBytes > 0);
    assert.deepEqual(pair.assisted.qualification.failures, []);
    assert.equal(comparison.efficiency.diagnosticOnly, true);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
