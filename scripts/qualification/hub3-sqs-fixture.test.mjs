import assert from "node:assert/strict";
import test from "node:test";

import {
  assertHub3QualificationStatus,
  createHub3FixtureInput,
  qualificationTarget,
  runHub3FixtureQualification,
} from "./hub3-sqs-fixture.mjs";

const TARGET = {
  host: "github.example.com",
  repository: "agentbase-fixtures/qualification-hub",
  targetBranch: "main",
};
const READY = {
  kind: "remote",
  hub: { host: TARGET.host, repository: TARGET.repository, branch: TARGET.targetBranch },
  local: { state: "ready", published_head: "a".repeat(40), active_head: "a".repeat(40), draft_count: 0 },
  credential: "ready",
  remote: { state: "current", head: "a".repeat(40) },
  sync: { state: "ready" },
};

test("[AB-ENRICH-016] configured fixture target guard fails before authoring", () => {
  assert.deepEqual(qualificationTarget({
    AGENTBASE_QUALIFICATION_HUB_HOST: TARGET.host,
    AGENTBASE_QUALIFICATION_HUB_REPOSITORY: TARGET.repository,
  }), { ...TARGET, canonicalHttpsUrl: `https://${TARGET.host}/${TARGET.repository}.git` });
  assert.throws(() => qualificationTarget({}), /AGENTBASE_QUALIFICATION_HUB_REPOSITORY/);
  assert.doesNotThrow(() => assertHub3QualificationStatus(READY, TARGET));
  for (const status of [
    { ...READY, hub: { ...READY.hub, repository: "agentbase-fixtures/another-hub" } },
    { ...READY, hub: { ...READY.hub, branch: "develop" } },
    { ...READY, remote: { state: "updates-available", head: "b".repeat(40) } },
    { ...READY, local: { ...READY.local, draft_count: 1, active_head: "b".repeat(40) } },
    { ...READY, sync: { state: "blocked" } },
  ]) assert.throws(() => assertHub3QualificationStatus(status, TARGET), /fixture qualification/);
});

test("[AB-ENRICH-015][AB-ENRICH-018] fixture input targets only the factual queue Question", () => {
  const input = createHub3FixtureInput();
  assert.deepEqual(input.repositoryIds, [
    "repository-crawler-publisher-111111111111",
    "repository-crawler-worker-222222222222",
  ]);
  assert.equal(input.candidates.length, 1);
  assert.equal(input.candidates[0].sourceConceptId, "resources/crawler-jobs");
  assert.deepEqual(input.candidates[0].question, { id: "question-42e7cd074990c6c54fa0be6c", revision: 1 });
  assert.deepEqual(input.candidates[0].interactionEvidenceIds, []);
  assert.deepEqual(input.candidates[0].identityEvidenceIds, ["publisher-terraform", "worker-terraform"]);
});

test("[AB-ENRICH-017..018] qualification stops at a reviewable proposal and supplies no maintainer answer", async () => {
  const calls = [];
  const actions = {
    async status() { calls.push("status"); return READY; },
    async prepareEnrichment(input) {
      calls.push(["prepare", input]);
      return { manifest: { id: `enrichment-${"1".repeat(24)}`, revision: 1 } };
    },
    async runEnrichment(input) {
      calls.push(["run", input]);
      return { status: "ready", outcomes: [{ candidateId: createHub3FixtureInput().candidates[0].id, status: "confirmed" }],
        decisions: [{ candidateId: createHub3FixtureInput().candidates[0].id, tier: "automatic" }] };
    },
    async finalizeEnrichment(input) {
      calls.push(["finalize", input]);
      return { proposal: { id: "2".repeat(24), diffDigest: `sha256:${"3".repeat(64)}` }, inspection: { entries: [] } };
    },
  };
  const report = await runHub3FixtureQualification(actions, [["--version"], ["sts", "get-caller-identity"], ["sqs", "get-queue-url"], ["sqs", "get-queue-attributes"]], TARGET);
  assert.deepEqual(calls.map((call) => Array.isArray(call) ? call[0] : call), ["status", "prepare", "run", "finalize"]);
  assert.deepEqual(calls[3][1].answers, []);
  assert.equal(report.providerOutcome, "confirmed");
  assert.equal(report.decisionTier, "automatic");
  assert.equal(JSON.stringify(report).includes("mock"), false);
});
