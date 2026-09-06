#!/usr/bin/env node
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  createHubRuntimeActions,
  defaultHubRuntimeStateRoot,
} from "../../src/app/hub-okf/index.ts";
import { createHubIdentity } from "../../src/core/hub/index.ts";
import { createMockAwsSqsRunner } from "../../src/app/hub-okf/test-support/mock-aws-sqs.ts";
import { AwsCliAdapter } from "../../src/providers/aws-cli/index.ts";

const ACCOUNT = "123456789012";
const REGION = "ap-southeast-1";
const QUEUE = "crawler-jobs";
const QUESTION = "question-42e7cd074990c6c54fa0be6c";
const PUBLISHER = "repository-crawler-publisher-111111111111";
const WORKER = "repository-crawler-worker-222222222222";
const CANDIDATE = `candidate-${createHash("sha256").update("qualification-hub/crawler-jobs/provider-identity").digest("hex").slice(0, 24)}`;

function record(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : undefined;
}

export function qualificationTarget(environment) {
  const repository = environment.AGENTBASE_QUALIFICATION_HUB_REPOSITORY;
  if (!repository) throw new Error("fixture qualification requires AGENTBASE_QUALIFICATION_HUB_REPOSITORY");
  return createHubIdentity(repository, environment.AGENTBASE_QUALIFICATION_HUB_BRANCH ?? "main",
    environment.AGENTBASE_QUALIFICATION_HUB_HOST ?? "github.com");
}

export function assertHub3QualificationStatus(value, target) {
  const status = record(value), hub = record(status?.hub), local = record(status?.local);
  const remote = record(status?.remote), sync = record(status?.sync);
  const valid = target && status?.kind === "remote"
    && hub?.host === target.host
    && hub?.repository === target.repository
    && hub?.branch === target.targetBranch
    && local?.state === "ready"
    && local?.draft_count === 0
    && typeof local?.published_head === "string"
    && local.active_head === local.published_head
    && status?.credential === "ready"
    && remote?.state === "current"
    && remote.head === local.published_head
    && sync?.state === "ready";
  if (!valid) throw new Error("fixture qualification requires the exact configured Hub target with no Local Draft or recovery");
}

export function createHub3FixtureInput() {
  return {
    domainId: "domains/crawler",
    repositoryIds: [PUBLISHER, WORKER],
    accountId: ACCOUNT,
    regions: [REGION],
    candidates: [{
      id: CANDIDATE,
      kind: "identity",
      sourceConceptId: "resources/crawler-jobs",
      queue: { name: QUEUE, accountId: ACCOUNT, region: REGION },
      identityEvidenceIds: ["publisher-terraform", "worker-terraform"],
      interactionEvidenceIds: [],
      question: { id: QUESTION, revision: 1 },
    }],
  };
}

export async function runHub3FixtureQualification(actions, awsCalls, target) {
  assertHub3QualificationStatus(await actions.status(), target);
  const input = createHub3FixtureInput();
  const prepared = await actions.prepareEnrichment(input);
  const manifest = record(prepared)?.manifest;
  if (!record(manifest) || typeof manifest.id !== "string" || !Number.isSafeInteger(manifest.revision)) {
    throw new Error("fixture qualification did not prepare a valid enrichment manifest");
  }
  const run = await actions.runEnrichment({ manifestId: manifest.id, manifestRevision: manifest.revision,
    providerSessionConfirmed: true });
  const outcome = Array.isArray(run?.outcomes) ? run.outcomes.find((item) => item?.candidateId === CANDIDATE) : undefined;
  const decision = Array.isArray(run?.decisions) ? run.decisions.find((item) => item?.candidateId === CANDIDATE) : undefined;
  if (run?.status !== "ready" || outcome?.status !== "confirmed" || decision?.tier !== "automatic") {
    throw new Error("fixture qualification requires one confirmed provider outcome and automatic factual Question decision");
  }
  const finalized = await actions.finalizeEnrichment({ manifestId: manifest.id,
    manifestRevision: manifest.revision, answers: [] });
  const proposal = record(finalized)?.proposal, inspection = record(finalized)?.inspection;
  if (!record(proposal) || typeof proposal.id !== "string" || typeof proposal.diffDigest !== "string") {
    throw new Error("fixture qualification did not produce a reviewable proposal");
  }
  return {
    proposalId: proposal.id,
    diffDigest: proposal.diffDigest,
    providerOutcome: outcome.status,
    decisionTier: decision.tier,
    changedPaths: Array.isArray(inspection?.entries)
      ? inspection.entries.flatMap((entry) => entry?.change !== "preserved" && typeof entry?.path === "string" ? [entry.path] : []) : [],
    awsCalls: awsCalls.map((args) => [...args]),
  };
}

export async function main(environment = process.env) {
  const target = qualificationTarget(environment);
  const fixture = createMockAwsSqsRunner({ accountId: ACCOUNT,
    queues: [{ name: QUEUE, accountId: ACCOUNT, region: REGION }] });
  const actions = createHubRuntimeActions(environment, defaultHubRuntimeStateRoot(), {
    enrichmentAdapter: new AwsCliAdapter(fixture.runner),
  });
  return runHub3FixtureQualification(actions, fixture.calls, target);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { process.stdout.write(`${JSON.stringify(await main(), null, 2)}\n`); }
  catch (error) {
    process.stderr.write(`SQS fixture qualification failed: ${error instanceof Error ? error.message : "unknown failure"}\n`);
    process.exitCode = 1;
  }
}
