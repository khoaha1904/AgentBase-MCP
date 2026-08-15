import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

import { createHubIdentity } from "../../core/hub/index.ts";
import { prepareNewHubProposal } from "./prepare.ts";

const EVIDENCE = `sha256:${"b".repeat(64)}`;
const BASE_COMMIT = "a".repeat(40);
const SOURCE_ID = "repository-acme-aaaaaaaaaaaa";

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hub-prepare-test-"));
  const base = path.join(root, "base"), authored = path.join(root, "authored"), proposal = path.join(root, "proposal");
  fs.mkdirSync(base); fs.mkdirSync(path.join(authored, "repositories", "acme"), { recursive: true });
  fs.writeFileSync(path.join(authored, "index.md"), "---\nokf_version: '0.2'\n---\n\n# Knowledge\n\n* [Acme](repositories/acme/) - repository\n");
  fs.writeFileSync(path.join(authored, "repositories", "acme", "index.md"), "# Acme\n\n* [Repository](repository.md) - identity\n");
  const concept = "---\ntype: Repository\ntitle: Acme\ndescription: Acme repository\nstatus: draft\n"
    + "generated: { by: 'agentbase/0.0.0', at: '2026-08-12T00:00:00Z' }\nsources:\n"
    + "  - id: source\n    resource: repository://repository-acme-aaaaaaaaaaaa/README.md#L1-L2\n"
    + "---\n\n# Purpose\n\nAcme.[^source]\n";
  fs.writeFileSync(path.join(authored, "repositories", "acme", "repository.md"), concept);
  return { root, base, authored, proposal, cleanup: () => fs.rmSync(root, { recursive: true, force: true }) };
}

test("new preparation selects sparse schemas and locks an immutable local diff", () => {
  const current = fixture();
  try {
    const result = prepareNewHubProposal({
      hub: createHubIdentity("agentbase/hub", "main"), baseCommit: BASE_COMMIT, sourceRepositoryId: SOURCE_ID,
      hubBundleRoot: current.base, authoredBundleRoot: current.authored,
      proposalRoot: current.proposal, subjectDirectory: "repositories/acme",
      evidenceDigest: EVIDENCE, signals: ["repository"], createdAt: "2026-08-12T00:00:00Z",
    });
    assert.equal(result.proposal.mode, "new");
    assert.deepEqual(result.proposal.selectedSchemas, ["Repository"]);
    assert.ok(result.diff.entries.every((entry) => entry.change === "created"));
    assert.equal(fs.existsSync(path.join(current.base, "index.md")), false);
  } finally { current.cleanup(); }
});

test("new preparation rejects existing subjects and unselected concept schemas", () => {
  const existing = fixture();
  try {
    fs.mkdirSync(path.join(existing.base, "repositories", "acme"), { recursive: true });
    assert.throws(() => prepareNewHubProposal({
      hub: createHubIdentity("agentbase/hub", "main"), baseCommit: BASE_COMMIT, sourceRepositoryId: SOURCE_ID,
      hubBundleRoot: existing.base, authoredBundleRoot: existing.authored,
      proposalRoot: existing.proposal, subjectDirectory: "repositories/acme",
      evidenceDigest: EVIDENCE, signals: ["repository"], createdAt: "2026-08-12T00:00:00Z",
    }), /use refresh/);
  } finally { existing.cleanup(); }
  const wrongSchema = fixture();
  try {
    const concept = path.join(wrongSchema.authored, "repositories", "acme", "repository.md");
    fs.writeFileSync(concept, fs.readFileSync(concept, "utf8").replace("Repository", "Database Table"));
    assert.throws(() => prepareNewHubProposal({
      hub: createHubIdentity("agentbase/hub", "main"), baseCommit: BASE_COMMIT, sourceRepositoryId: SOURCE_ID,
      hubBundleRoot: wrongSchema.base, authoredBundleRoot: wrongSchema.authored,
      proposalRoot: wrongSchema.proposal, subjectDirectory: "repositories/acme",
      evidenceDigest: EVIDENCE, signals: ["repository"], createdAt: "2026-08-12T00:00:00Z",
    }), /unselected schema/);
  } finally { wrongSchema.cleanup(); }
});

test("new preparation admits a selected cross-repository relationship outside the repository folder", () => {
  const current = fixture();
  try {
    const relationship = "---\ntype: Cross-Repository Relationship\ntitle: Acme to Billing\n"
      + "description: Acme calls Billing\nstatus: draft\n"
      + "generated: { by: 'agentbase/0.0.0', at: '2026-08-12T00:00:00Z' }\n"
      + "sources:\n  - resource: repository://repository-acme-aaaaaaaaaaaa/src/a.ts#L1-L2\n"
      + "---\n\n# Relationship\n\nAcme calls Billing.\n";
    fs.mkdirSync(path.join(current.authored, "relationships"));
    fs.writeFileSync(path.join(current.authored, "relationships/acme-billing.md"), relationship);
    const result = prepareNewHubProposal({
      hub: createHubIdentity("agentbase/hub", "main"), baseCommit: BASE_COMMIT, sourceRepositoryId: SOURCE_ID,
      hubBundleRoot: current.base, authoredBundleRoot: current.authored,
      proposalRoot: current.proposal, subjectDirectory: "repositories/acme",
      evidenceDigest: EVIDENCE, signals: ["repository", "cross-repository"],
      createdAt: "2026-08-12T00:00:00Z",
    });
    assert.equal(result.diff.entries.some((entry) => entry.path === "relationships/acme-billing.md"), true);
  } finally { current.cleanup(); }
});

test("[AB-LOCAL-HUB-012] new preparation uses a logical canonical subject and current-source concepts", () => {
  const current = fixture();
  try {
    fs.rmSync(current.authored, { recursive: true });
    fs.mkdirSync(path.join(current.authored, "components"), { recursive: true });
    fs.writeFileSync(path.join(current.authored, "index.md"), "---\nokf_version: '0.2'\n---\n\n# Knowledge\n\n* [Cart service](components/cart-service.md)\n");
    fs.writeFileSync(path.join(current.authored, "components/cart-service.md"),
      "---\ntype: Service\ntitle: Cart service\ndescription: Owns cart behavior\nstatus: draft\n"
      + "generated: { by: 'agentbase/0.0.0', at: '2026-08-12T00:00:00Z' }\n"
      + "sources:\n  - resource: repository://repository-acme-aaaaaaaaaaaa/src/cart.ts#L1-L2\n"
      + "---\n\n# Responsibility\n\nOwns carts.\n");
    const result = prepareNewHubProposal({
      hub: createHubIdentity("agentbase/hub", "main"), baseCommit: BASE_COMMIT, sourceRepositoryId: SOURCE_ID,
      hubBundleRoot: current.base, authoredBundleRoot: current.authored,
      proposalRoot: current.proposal, subjectDirectory: "components/cart-service",
      evidenceDigest: EVIDENCE, signals: ["service"], createdAt: "2026-08-12T00:00:00Z",
    });
    assert.equal(result.proposal.subject, "components/cart-service");
    assert.equal(result.diff.entries.some((entry) => entry.path === "components/cart-service.md"), true);
  } finally { current.cleanup(); }
});
