import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  createQuestionId,
  renderAgentBaseOkfProfileDocument,
  renderQuestionDocument,
  resolveQuestion,
  type SharedQuestion,
} from "../index.ts";
import { buildProposalSemanticImpact } from "./proposal-impact.ts";

const REPOSITORY_ID = "repository-orders-aaaaaaaaaaaa";
const EXTERNAL_IDENTITY = `arn:aws:sqs:ap-southeast-1:123456789012:orders`;
const AT = "2026-09-04T00:00:00.000Z";

function write(root: string, relative: string, content: string): void {
  const target = path.join(root, ...relative.split("/"));
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

function concept(type: string, title: string, body: string, extra = ""): string {
  return `---\ntype: ${type}\ntitle: ${title}\ndescription: ${title}.\n${extra}---\n# ${title}\n\n${body}\n`;
}

function resource(title: string): string {
  return concept("Resource", title, "Queue resource.", `sources:\n  - id: src\n    resource: repository://${REPOSITORY_ID}/infra.tf#L1-L2\nagentbase:\n  external_identities:\n    - provider: aws\n      identity_type: arn\n      value: ${EXTERNAL_IDENTITY}\n      service: sqs\n      resource_type: queue\n      scope: { account_id: '123456789012', region: ap-southeast-1 }\n      evidence: [src]\n`);
}

function componentDocument(evidence: string, body: string): string {
  return concept("Component", "Orders API", body, `sources:\n  - id: src-a\n    resource: repository://${REPOSITORY_ID}/src/api.ts#L1-L2\n  - id: src-b\n    resource: repository://${REPOSITORY_ID}/src/api.ts#L3-L4\nrelationships:\n  - kind: implemented-in\n    target: repositories/orders\n    evidence: [${evidence}]\n  - kind: depends-on\n    target: resources/orders-queue\n    evidence: [${evidence}]\nflow_steps:\n  - order: 1\n    source: components/orders-api\n    action: publishes\n    target: resources/orders-queue\n    mode: asynchronous\n    evidence: [${evidence}]\n`);
}

function repository(): string {
  return concept("Repository", "Orders", "[Domain](../domains/commerce.md)", `agentbase:\n  repository:\n    id: ${REPOSITORY_ID}\n    display_name: Orders\n    aliases: { remotes: [], root_commits: [] }\n    observed_source: { commit: '${"a".repeat(40)}', dirty: false, dirty_digest: null, observed_at: '${AT}' }\nrelationships:\n  - kind: part-of\n    target: domains/commerce\n`);
}

function question(): SharedQuestion {
  const input = { kind: "missing-evidence" as const, originSubject: "components/orders-api",
    originProperty: "runtime", scopeKey: "orders-runtime" };
  return {
    id: createQuestionId(input), revision: 1, state: "open", kind: input.kind,
    originSubject: input.originSubject, originProperty: input.originProperty,
    subject: input.originSubject, property: input.originProperty, scopeKey: input.scopeKey,
    references: [{ referenceKind: "owned-item", owner: "components/orders-api", itemKind: "property",
      itemKey: "runtime", sourceId: "src-a" }],
    missingEvidence: ["runtime topology"], limitations: [], guidance: [], title: "Orders runtime",
    createdAt: AT,
  };
}

function seed(root: string, proposed: boolean): void {
  write(root, "index.md", `---\nokf_version: '0.2'\n---\n\n# Hub\n\n* [Domains](domains/index.md) - Domains\n${proposed ? "* [Missing](missing/index.md) - Missing\n" : ""}`);
  write(root, "domains/index.md", "# Domains\n\n* [Commerce](commerce.md) - Commerce\n");
  write(root, "domains/commerce.md", concept("Domain", "Commerce", "Commerce domain."));
  write(root, "repositories/orders.md", repository());
  write(root, "resources/orders-queue.md", resource("Orders Queue"));
  write(root, "components/orders-api.md", componentDocument(proposed ? "src-b" : "src-a",
    proposed
      ? "[Self](orders-api.md)\n\n[Repository](../repositories/orders.md)\n\n[Queue](../resources/orders-queue.md)\n\n[Recovered](../resources/recovered.md)\n\nUpdated behavior."
      : "[Self](orders-api.md)\n\n[Repository](../repositories/orders.md)\n\n[Queue](../resources/orders-queue.md)\n\n[Broken](../resources/recovered.md)"));
  write(root, "resources/recovered.md", proposed ? concept("Resource", "Recovered", "Recovered target.") : "not markdown");
  if (!proposed) fs.rmSync(path.join(root, "resources/recovered.md"));
  if (proposed) write(root, "resources/orders-queue-alias.md", resource("Orders Queue Alias"));
  const current = question();
  const rendered = proposed ? resolveQuestion(current, "guidance/orders-runtime") : current;
  write(root, `questions/${current.id}.md`, renderQuestionDocument(rendered));
  write(root, "README.md", proposed ? "# Hub\n\n[Orders](components/orders-api.md)\n" : "# Hub\n");
}

test("[AB-IMPACT-001..008][AB-IMPACT-012] semantic impact is exact, deterministic and canonical", () => {
  const work = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-impact-test-"));
  const baseRoot = path.join(work, "base"), proposedRoot = path.join(work, "proposed");
  try {
    seed(baseRoot, false); seed(proposedRoot, true);
    const options = {
      baseRoot,
      proposedRoot,
      identity: { proposalId: "1".repeat(24), mode: "refresh" as const, baseCommit: "2".repeat(40),
        diffDigest: `sha256:${"3".repeat(64)}`, sourceRepositoryIds: [REPOSITORY_ID] },
    };
    const first = buildProposalSemanticImpact(options), second = buildProposalSemanticImpact(options);
    assert.deepEqual(second, first);
    assert.match(first.digest, /^sha256:[a-f0-9]{64}$/);
    assert.equal(first.identity.baseTreeDigest === first.identity.proposedTreeDigest, false);
    assert.equal(first.concepts.updated.some((item) => item.after.identity === "components/orders-api"), true);
    assert.equal(first.concepts.added.some((item) => item.identity === "resources/orders-queue-alias"), true);
    assert.equal(first.relations.updated.length, 2);
    assert.equal(first.flowSteps.updated.length, 1);
    assert.deepEqual(first.flowSteps.updated[0]?.before.evidence, ["src-a"]);
    assert.deepEqual(first.flowSteps.updated[0]?.after.evidence, ["src-b"]);
    assert.equal(first.questions.updated[0]?.before.state, "open");
    assert.equal(first.questions.updated[0]?.after.state, "resolved");
    assert.equal(first.navigation.documents.updated.some((item) => item.after.path === "index.md"), true);
    assert.equal(first.navigation.links.added.some((item) => item.target === "resources/recovered.md"), true);
    assert.deepEqual(first.profile, { base: "legacy-unprofiled", proposed: "legacy-unprofiled" });
    assert.deepEqual(first.affected.homes, []);
    assert.deepEqual(first.affected.domains.map((item) => item.identity), ["domains/commerce"]);
    assert.deepEqual(first.affected.repositories.map((item) => item.repositoryId), [REPOSITORY_ID]);
    assert.equal(first.danglingReferences.some((item) => item.state === "resolved"
      && item.before?.detail.includes("resources/recovered.md")), true);
    assert.equal(first.danglingReferences.some((item) => item.state === "introduced"
      && item.after?.detail.includes("missing/index.md")), true);
    assert.equal(first.duplicateCandidates.some((item) => item.state === "introduced"
      && item.after?.kind === "external-identity" && item.after.owners.length === 2), true);
  } finally { fs.rmSync(work, { recursive: true, force: true }); }
});

function profileIndex(): string {
  return `---\nokf_version: '0.2'\n---\n\n# Hub\n\n* [Profile](shared/agentbase-profile.md)\n* [Shared](shared/index.md)\n* [Platform](domains/platform/index.md)\n* [Commerce](domains/commerce/index.md)\n`;
}

function seedProfile(root: string, proposed: boolean): void {
  write(root, "index.md", profileIndex());
  write(root, "shared/agentbase-profile.md", renderAgentBaseOkfProfileDocument());
  write(root, "shared/index.md", "# Shared\n\n* [Profile](agentbase-profile.md)\n* [Config](knowledge/shared-config.md)\n");
  write(root, "shared/knowledge/shared-config.md", concept("Resource", "Shared Config",
    proposed ? "Updated shared configuration." : "Shared configuration."));
  for (const domain of ["platform", "commerce"] as const) {
    const title = domain === "platform" ? "Platform" : "Commerce";
    write(root, `domains/${domain}/index.md`, `${concept("Domain", title, `${title} domain.`).trimEnd()}\n${domain === "platform" ? "\n* [Orders](repositories/orders.md)\n" : ""}`);
  }
  write(root, "domains/platform/repositories/orders.md", concept("Repository", "Orders",
    "Orders repository.\n\n[Commerce](../../commerce/index.md)",
    `agentbase:\n  repository:\n    id: ${REPOSITORY_ID}\n    display_name: Orders\n    aliases: { remotes: [], root_commits: [] }\n    observed_source: { commit: '${"a".repeat(40)}', dirty: false, dirty_digest: null, observed_at: '${AT}' }\nrelationships:\n  - kind: part-of\n    target: domains/commerce\n`));
}

test("[AB-IMPACT-014..019] Profile impact separates physical home from semantic Domain scope", () => {
  const work = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-profile-impact-test-"));
  const baseRoot = path.join(work, "base"), proposedRoot = path.join(work, "proposed");
  try {
    seedProfile(baseRoot, false); seedProfile(proposedRoot, true);
    const options = {
      baseRoot,
      proposedRoot,
      identity: { proposalId: "4".repeat(24), mode: "refresh" as const, baseCommit: "5".repeat(40),
        diffDigest: `sha256:${"6".repeat(64)}`, sourceRepositoryIds: [REPOSITORY_ID] },
    };
    const impact = buildProposalSemanticImpact(options);
    assert.deepEqual(impact.profile, { base: "profile-1.0", proposed: "profile-1.0" });
    assert.deepEqual(impact.concepts.updated.find((item) => item.after.identity === "shared/knowledge/shared-config")?.after.home,
      { kind: "shared", selector: "shared" });
    assert.deepEqual(impact.affected.homes, [
      { kind: "domain", selector: "domains/platform", domainIdentity: "domains/platform" },
      { kind: "shared", selector: "shared" },
    ]);
    assert.deepEqual(impact.affected.domains.map((item) => item.identity), ["domains/commerce"]);
    assert.equal(impact.affected.domains.some((item) => item.identity === "domains/platform"), false);

    fs.rmSync(path.join(proposedRoot, "shared/index.md"));
    assert.throws(() => buildProposalSemanticImpact(options), /proposed proposal Hub Profile is unsupported/);
  } finally { fs.rmSync(work, { recursive: true, force: true }); }
});

test("[AB-IMPACT-005][AB-IMPACT-019] generated Domain navigation does not change semantic Domain content", () => {
  const work = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-profile-navigation-impact-test-"));
  const baseRoot = path.join(work, "base"), proposedRoot = path.join(work, "proposed");
  try {
    seedProfile(baseRoot, false); seedProfile(proposedRoot, false);
    write(proposedRoot, "domains/platform/knowledge/helper.md", concept("Component", "Helper", "Helper component."));
    const domainPath = path.join(proposedRoot, "domains/platform/index.md");
    fs.writeFileSync(domainPath, `${fs.readFileSync(domainPath, "utf8").trimEnd()}\n\n# Batch Navigation\n\n* [Helper](knowledge/helper.md) - Component\n`);
    const impact = buildProposalSemanticImpact({
      baseRoot,
      proposedRoot,
      identity: { proposalId: "7".repeat(24), mode: "batch-new", baseCommit: "8".repeat(40),
        diffDigest: `sha256:${"9".repeat(64)}`, sourceRepositoryIds: [REPOSITORY_ID] },
    });
    assert.equal(impact.concepts.updated.some((item) => item.after.identity === "domains/platform"), false);
    assert.equal(impact.concepts.added.some((item) => item.identity === "domains/platform/knowledge/helper"), true);
    assert.equal(impact.navigation.documents.updated.some((item) => item.after.path === "domains/platform/index.md"), true);
    assert.equal(impact.navigation.links.added.some((item) => item.target === "domains/platform/knowledge/helper.md"), true);
  } finally { fs.rmSync(work, { recursive: true, force: true }); }
});

test("[AB-IMPACT-009][AB-IMPACT-013] semantic impact bounds categories and rejects malformed identity", () => {
  const work = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-impact-bound-test-"));
  const baseRoot = path.join(work, "base"), proposedRoot = path.join(work, "proposed");
  try {
    write(baseRoot, "index.md", "---\nokf_version: '0.2'\n---\n\n# Hub\n");
    write(proposedRoot, "index.md", "---\nokf_version: '0.2'\n---\n\n# Hub\n");
    for (let index = 0; index < 513; index += 1) {
      const name = String(index).padStart(3, "0");
      write(proposedRoot, `components/c-${name}.md`, concept("Component", `C ${name}`, "Bounded."));
    }
    const identity = { proposalId: "1".repeat(24), mode: "new" as const, baseCommit: "2".repeat(40),
      diffDigest: `sha256:${"3".repeat(64)}`, sourceRepositoryIds: [] };
    const result = buildProposalSemanticImpact({ baseRoot, proposedRoot, identity });
    assert.equal(result.concepts.added.length, 512);
    assert.deepEqual(result.omissions.find((item) => item.category === "concepts.added"),
      { category: "concepts.added", reason: "limit", count: 1 });
    assert.throws(() => buildProposalSemanticImpact({ baseRoot, proposedRoot,
      identity: { ...identity, proposalId: "bad" } }), /identity is invalid/);
  } finally { fs.rmSync(work, { recursive: true, force: true }); }
});
