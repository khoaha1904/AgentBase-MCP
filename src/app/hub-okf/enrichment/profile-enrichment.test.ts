import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { createLocalOnlyHubState } from "../../../core/hub/index.ts";
import {
  AGENTBASE_OKF_SCHEMA_CATALOG_VERSION,
  classifyAgentBaseHubProfile,
  createQuestionId,
  loadOkfBundle,
  parseQuestionDocument,
  renderAgentBaseOkfProfileDocument,
  renderQuestionDocument,
  type SharedQuestion,
} from "../../../core/knowledge/index.ts";
import { AwsCliAdapter } from "../../../providers/aws-cli/index.ts";
import { createMockAwsSqsRunner } from "../test-support/mock-aws-sqs.ts";
import { finalizeDomainEnrichment, prepareDomainEnrichment, runDomainEnrichment } from "./index.ts";

const COMMIT = "a".repeat(40);
const REPOSITORY_ID = "repository-orders-aaaaaaaaaaaa";
const ACCOUNT_ID = "123456789012";
const REGION = "ap-southeast-1";
const CREATED_AT = "2026-09-04T00:00:00.000Z";

function write(root: string, relative: string, content: string): void {
  const target = path.join(root, ...relative.split("/"));
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

function concept(type: string, title: string, body: string, extra = ""): string {
  return `---\ntype: ${type}\ntitle: ${title}\ndescription: ${title}.\nstatus: draft\ngenerated: { by: agentbase/0.1.0, at: '${CREATED_AT}' }\n${extra}---\n# ${title}\n\n${body}\n`;
}

function question(kind: SharedQuestion["kind"], subject: string, property: string, scopeKey: string,
  candidateKey: string): SharedQuestion {
  const identity = { kind, originSubject: subject, originProperty: property, scopeKey };
  return {
    id: createQuestionId(identity), revision: 1, state: "open", ...identity, subject, property,
    references: [{ referenceKind: "candidate-evidence", candidateKey,
      sourceResource: `repository://${REPOSITORY_ID}/README.md#L1-L1` }],
    missingEvidence: ["exact provider evidence"], limitations: [], guidance: [],
    title: `${kind} ${property}`, createdAt: CREATED_AT,
  };
}

function seedProfile(root: string): readonly SharedQuestion[] {
  write(root, "index.md", `---\nokf_version: '0.2'\n---\n\n# Hub\n\n* [Profile](shared/agentbase-profile.md)\n* [Shared](shared/index.md)\n* [Platform](domains/platform/index.md)\n* [Commerce](domains/commerce/index.md)\n`);
  write(root, "shared/agentbase-profile.md", renderAgentBaseOkfProfileDocument());
  write(root, "domains/platform/index.md", `${concept("Domain", "Platform", "Platform domain.").trimEnd()}\n\n* [Orders](repositories/orders.md)\n`);
  write(root, "domains/commerce/index.md", concept("Domain", "Commerce", "Commerce domain."));
  write(root, "domains/platform/repositories/orders.md", concept("Repository", "Orders",
    "Orders repository.\n\n[Commerce](../../commerce/index.md)",
    `agentbase:\n  repository:\n    id: ${REPOSITORY_ID}\n    display_name: Orders\n    aliases: { remotes: [], root_commits: [] }\n    observed_source: { commit: '${COMMIT}', dirty: false, dirty_digest: null, observed_at: '${CREATED_AT}' }\nsources:\n  - id: interaction\n    resource: repository://${REPOSITORY_ID}/README.md#L1-L1\n  - id: owner-domain\n    resource: agentbase://owner-guidance/domains/commerce\nrelationships:\n  - kind: part-of\n    target: domains/commerce\n    evidence: [owner-domain]\n`));
  write(root, "shared/knowledge/orders-queue.md", concept("Resource", "Orders Queue", "Shared queue.",
    `sources:\n  - id: queue-doc\n    resource: repository://${REPOSITORY_ID}/infra.tf#L1-L2\n`));
  const questions = [
    question("relation-candidate", "domains/platform/repositories/orders", "queue.relation",
      "orders-relation", "candidate-111111111111111111111111"),
    question("conflict", "shared/knowledge/orders-queue", "queue.identity",
      "orders-identity", "candidate-222222222222222222222222"),
  ];
  write(root, `domains/platform/questions/${questions[0]!.id}.md`, renderQuestionDocument(questions[0]!));
  write(root, `shared/questions/${questions[1]!.id}.md`, renderQuestionDocument(questions[1]!));
  write(root, "domains/platform/index.md", `${fs.readFileSync(path.join(root, "domains/platform/index.md"), "utf8").trimEnd()}\n\n* [${questions[0]!.title}](questions/${questions[0]!.id}.md) - Question\n`);
  write(root, "shared/index.md", `# Shared\n\n* [Profile](agentbase-profile.md)\n* [Queue](knowledge/orders-queue.md)\n* [${questions[1]!.title}](questions/${questions[1]!.id}.md) - Question\n`);
  return questions;
}

test("[AB-PROFILE-ENRICH-001..011] Profile Enrichment preserves homes and resolves actual identities", async () => {
  const work = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-profile-enrichment-test-"));
  const publishedRoot = path.join(work, "hub"), stateRoot = path.join(work, "state");
  try {
    const questions = seedProfile(publishedRoot);
    const candidates = [
      { id: "candidate-111111111111111111111111", kind: "relation" as const,
        sourceConceptId: "domains/platform/repositories/orders", targetConceptId: "shared/knowledge/orders-queue",
        predicate: "depends-on" as const, queue: { name: "orders-events", accountId: ACCOUNT_ID, region: REGION },
        identityEvidenceIds: ["queue-doc"], interactionEvidenceIds: ["interaction"],
        question: { id: questions[0]!.id, revision: 1 } },
      { id: "candidate-222222222222222222222222", kind: "identity" as const,
        sourceConceptId: "shared/knowledge/orders-queue",
        queue: { name: "orders-dead-letter", accountId: ACCOUNT_ID, region: REGION },
        identityEvidenceIds: ["queue-doc"], interactionEvidenceIds: [],
        question: { id: questions[1]!.id, revision: 1 } },
    ];
    assert.throws(() => prepareDomainEnrichment({ stateRoot: path.join(work, "wrong-home"), publishedRoot,
      baseCommit: COMMIT, domainId: "domains/platform", repositoryIds: [REPOSITORY_ID], candidates,
      accountId: ACCOUNT_ID, regions: [REGION], createdAt: CREATED_AT }), /not Published in confirmed Domain/);

    const manifest = prepareDomainEnrichment({ stateRoot, publishedRoot, baseCommit: COMMIT,
      domainId: "domains/commerce", repositoryIds: [REPOSITORY_ID], candidates,
      accountId: ACCOUNT_ID, regions: [REGION], createdAt: CREATED_AT });
    assert.equal(manifest.domainId, "domains/commerce");
    const mock = createMockAwsSqsRunner({ accountId: ACCOUNT_ID, queues: [
      { name: "orders-events", accountId: ACCOUNT_ID, region: REGION },
      { name: "orders-dead-letter", accountId: ACCOUNT_ID, region: REGION },
    ] });
    const run = await runDomainEnrichment({ stateRoot, publishedRoot, manifestId: manifest.id,
      manifestRevision: manifest.revision, providerSessionConfirmed: true, adapter: new AwsCliAdapter(mock.runner) });
    assert.deepEqual(run.outcomes.map((item) => item.status), ["confirmed", "confirmed"]);
    assert.deepEqual(run.decisions.map((item) => item.tier), ["automatic", "recommended"]);

    const localDraftRoot = path.join(work, "local-draft");
    fs.cpSync(publishedRoot, localDraftRoot, { recursive: true });
    fs.appendFileSync(path.join(localDraftRoot, "domains", "platform", "questions", `${questions[0]!.id}.md`), "\nLocal draft.\n");
    const overlappingLocalHub = createLocalOnlyHubState({ kind: "local-only", root: localDraftRoot,
      localHubId: "c".repeat(24), baseCommit: COMMIT, remoteBase: COMMIT, activeHead: COMMIT,
      catalogVersion: AGENTBASE_OKF_SCHEMA_CATALOG_VERSION });
    assert.throws(() => finalizeDomainEnrichment({ stateRoot, publishedRoot, localHub: overlappingLocalHub,
      manifestId: manifest.id, manifestRevision: manifest.revision, answers: [] }),
    /Local Draft overlaps enrichment subject domains\/platform\/questions\//);

    const localHub = createLocalOnlyHubState({ kind: "local-only", root: publishedRoot,
      localHubId: "b".repeat(24), baseCommit: COMMIT, remoteBase: COMMIT, activeHead: COMMIT,
      catalogVersion: AGENTBASE_OKF_SCHEMA_CATALOG_VERSION });
    const finalized = finalizeDomainEnrichment({ stateRoot, publishedRoot, localHub,
      manifestId: manifest.id, manifestRevision: manifest.revision, answers: [{
        candidateId: candidates[1]!.id, questionId: questions[1]!.id, questionRevision: 1,
        action: "answer", answer: "Use the verified queue identity.", maintainer: "human:maintainer",
      }] });
    assert.equal(finalized.proposal.domainId, "domains/commerce");
    const proposalRoot = path.join(stateRoot, "proposals", finalized.proposal.id, "bundle");
    const proposed = loadOkfBundle(proposalRoot, { requireAgentBaseRootIndex: true });
    assert.equal(classifyAgentBaseHubProfile(proposed).kind, "profile-1.0");
    assert.equal(proposed.concepts.get("domains/platform/repositories/orders")?.path,
      "domains/platform/repositories/orders.md");
    assert.equal(proposed.concepts.get("shared/knowledge/orders-queue")?.path, "shared/knowledge/orders-queue.md");
    const repository = proposed.concepts.get("domains/platform/repositories/orders")!;
    assert.match(repository.body, /\.\.\/\.\.\/\.\.\/shared\/knowledge\/orders-queue\.md/);
    assert.equal(JSON.stringify(repository.frontmatter.relationships).includes("shared/knowledge/orders-queue"), true);
    for (const item of questions) {
      const concept = [...proposed.concepts.values()].find((value) => value.type === "Question"
        && parseQuestionDocument(value).id === item.id)!;
      assert.equal(parseQuestionDocument(concept).state, "resolved");
    }
    assert.equal([...proposed.concepts.values()].some((item) => item.path.startsWith("shared/knowledge/")
      && item.body.includes("verified queue identity")), true);
    assert.deepEqual(finalized.inspection.semanticImpact?.profile,
      { base: "profile-1.0", proposed: "profile-1.0" });
    assert.deepEqual(finalized.inspection.semanticImpact?.affected.domains.map((item) => item.identity),
      ["domains/commerce"]);
    assert.equal(finalized.inspection.semanticImpact?.affected.homes.some((home) => home.kind === "shared"), true);
    assert.equal(finalized.inspection.semanticImpact?.affected.homes.some((home) =>
      home.kind === "domain" && home.selector === "domains/platform"), true);

    const invalidRoot = path.join(work, "invalid");
    fs.cpSync(publishedRoot, invalidRoot, { recursive: true });
    const profilePath = path.join(invalidRoot, "shared", "agentbase-profile.md");
    fs.writeFileSync(profilePath, fs.readFileSync(profilePath, "utf8").replace('version: "1.0"', 'version: "2.0"'));
    const invalidState = path.join(work, "invalid-state");
    assert.throws(() => prepareDomainEnrichment({ stateRoot: invalidState, publishedRoot: invalidRoot,
      baseCommit: COMMIT, domainId: "domains/commerce", repositoryIds: [REPOSITORY_ID], candidates,
      accountId: ACCOUNT_ID, regions: [REGION], createdAt: CREATED_AT }), /Profile is unsupported/);
    assert.equal(fs.existsSync(path.join(invalidState, "enrichments")), false);
  } finally {
    fs.rmSync(work, { recursive: true, force: true });
  }
});
