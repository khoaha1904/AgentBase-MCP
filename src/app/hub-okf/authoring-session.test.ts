import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

import { createHubIdentity } from "../../core/hub/index.ts";
import { beginHubAuthoringSession, finalizeHubAuthoringSession } from "./authoring-session.ts";
import { readHubProposalState } from "./proposal-state.ts";

test("[AB-HUB-003..008] agent authors in a prepared workspace then finalizes an immutable proposal", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hub-authoring-session-"));
  const stateRoot = path.join(root, "state"), checkout = path.join(root, "persistent-hub");
  try {
    fs.mkdirSync(path.join(checkout, ".git"), { recursive: true });
    const session = beginHubAuthoringSession({
      stateRoot,
      mode: "new",
      hub: createHubIdentity("agentbase/hub", "main"),
      baseCommit: "a".repeat(40),
      checkoutRoot: checkout,
      sourceRepositoryId: "repository-acme-aaaaaaaaaaaa",
      evidenceDigest: `sha256:${"b".repeat(64)}`,
      subjectDirectory: "repositories/acme",
      signals: ["repository"],
      selectedSchemas: ["Repository"],
      createdAt: "2026-08-12T00:00:00Z",
    });
    fs.mkdirSync(path.join(session.bundleRoot, "repositories/acme"), { recursive: true });
    fs.writeFileSync(path.join(session.bundleRoot, "index.md"), "---\nokf_version: '0.2'\n---\n\n# Hub\n\n* [Acme](repositories/acme/) - repository\n");
    fs.writeFileSync(path.join(session.bundleRoot, "repositories/acme/index.md"), "# Acme\n\n* [Repository](repository.md) - identity\n");
    const concept = "---\ntype: Repository\ntitle: Acme\ndescription: Acme\nstatus: draft\n"
      + "generated: { by: 'agentbase/0.0.0', at: '2026-08-12T00:00:00Z' }\n"
      + "sources:\n  - id: readme\n    resource: repository://repository-acme-aaaaaaaaaaaa/README.md#L1-L1\n"
      + "agentbase:\n  live_claims:\n    - id: AB-CLAIM-readme-purpose\n"
      + "      subject: repositories/acme\n      property: repository.purpose\n      role: documentation\n"
      + "      source_id: readme\n      target: { kind: text, name: Purpose section }\n"
      + `      observed: { commit: ${"a".repeat(40)}, dirty: false, dirty_digest: null }\n`
      + "---\n\n# Purpose\n\nAcme.\n";
    fs.writeFileSync(path.join(session.bundleRoot, "repositories/acme/repository.md"), concept);
    assert.throws(
      () => finalizeHubAuthoringSession(stateRoot, session.id, path.join(root, "wrong-hub")),
      /session state is invalid/,
    );
    const result = finalizeHubAuthoringSession(stateRoot, session.id, checkout, [{
      subject: "repositories/acme", property: "repository.purpose",
      claimIds: ["AB-CLAIM-readme-purpose"], missingEvidence: ["implementation evidence"],
    }]);
    const proposalRoot = path.join(stateRoot, "proposals", result.proposal.id);
    assert.equal(readHubProposalState(proposalRoot).phase, "prepared");
    assert.equal(result.inspection.counts.created, 3);
    assert.equal(fs.existsSync(path.join(proposalRoot, "base")), true);
    assert.equal(result.inspection.questions?.length, 1);
    assert.equal(fs.existsSync(path.join(proposalRoot, "questions.json")), true);
    const attachment = JSON.parse(fs.readFileSync(path.join(proposalRoot, "questions.json"), "utf8")) as { claims: unknown[] };
    assert.equal(attachment.claims.length, 1);
    assert.equal(fs.existsSync(path.join(session.bundleRoot, ".git")), false);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test("[AB-HUB-008][AB-HUB-014] failed finalize leaves the workspace repairable", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hub-authoring-retry-"));
  const stateRoot = path.join(root, "state"), checkout = path.join(root, "persistent-hub");
  try {
    fs.mkdirSync(checkout, { recursive: true });
    const session = beginHubAuthoringSession({
      stateRoot, mode: "new", hub: createHubIdentity("agentbase/hub", "main"),
      baseCommit: "a".repeat(40), checkoutRoot: checkout,
      sourceRepositoryId: "repository-acme-aaaaaaaaaaaa",
      evidenceDigest: `sha256:${"b".repeat(64)}`, subjectDirectory: "repositories/acme",
      signals: ["repository"], selectedSchemas: ["Repository"],
      createdAt: "2026-08-12T00:00:00Z",
    });
    assert.throws(() => finalizeHubAuthoringSession(stateRoot, session.id, checkout), /0.2/);
    assert.equal(fs.existsSync(session.bundleRoot), true);
    assert.equal(fs.existsSync(path.join(stateRoot, "proposals", `.staging-${session.id}`)), false);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test("[AB-SCHEMA-024] confirmed Domain persists through session and final validation", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hub-authoring-domain-"));
  const stateRoot = path.join(root, "state"), checkout = path.join(root, "persistent-hub");
  const repository = "repository-acme-aaaaaaaaaaaa";
  try {
    fs.mkdirSync(checkout, { recursive: true });
    fs.writeFileSync(path.join(checkout, "index.md"), "---\nokf_version: '0.2'\n---\n\n# AgentBase-Hub\n");
    const confirmedDomain = {
      identity: "domains/commerce", title: "Commerce",
      evidenceResource: "agentbase://owner-guidance/domains/commerce",
    } as const;
    const session = beginHubAuthoringSession({
      stateRoot, mode: "new", hub: createHubIdentity("agentbase/hub", "main"),
      baseCommit: "a".repeat(40), checkoutRoot: checkout, sourceRepositoryId: repository,
      evidenceDigest: `sha256:${"d".repeat(64)}`, subjectDirectory: "systems/cart",
      confirmedDomain, signals: ["repository", "business domain", "software system"],
      selectedSchemas: ["Domain", "Repository", "System"], createdAt: "2026-08-16T00:00:00Z",
    });
    assert.throws(() => finalizeHubAuthoringSession(stateRoot, session.id, checkout), /confirmed Domain.*missing/);
    const write = (relative: string, content: string) => {
      const target = path.join(session.bundleRoot, relative);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, content);
    };
    write("index.md", ["---", "okf_version: '0.2'", "---", "", "# AgentBase-Hub", "",
      "* [Domains](domains/index.md) - business domains", "* [Systems](systems/index.md) - systems",
      "* [Repositories](repositories/index.md) - sources", ""].join("\n"));
    write("domains/index.md", "# Domains\n\n* [Commerce](commerce.md) - Commerce domain\n");
    write("systems/index.md", "# Systems\n\n* [Cart](cart.md) - Cart system\n");
    write("repositories/index.md", "# Repositories\n\n* [Acme](acme.md) - source\n");
    const generated = "status: draft\ngenerated: { by: agentbase/5.0.0, at: 2026-08-16T00:00:00Z }\n";
    const repoSource = `  - id: repo\n    resource: repository://${repository}/README.md#L1-L1\n`;
    const ownerSource = "  - id: owner-domain\n    resource: agentbase://owner-guidance/domains/commerce\n";
    write("domains/commerce.md", ["---", "type: Domain", "title: Commerce", "description: Commerce domain",
      `${generated}sources:`, ownerSource, repoSource, "---", "", "# Purpose", "", "Owner-confirmed domain.",
      "", "# Systems", "", "[Cart](../systems/cart.md).", ""].join("\n"));
    write("repositories/acme.md", ["---", "type: Repository", "title: Acme", "description: Acme source repository",
      `${generated}sources:`, repoSource, "---", "", "# Purpose", "", "Source for [Cart](../systems/cart.md).", ""].join("\n"));
    write("systems/cart.md", ["---", "type: System", "title: Cart", "description: Cart system",
      `${generated}sources:`, repoSource, ownerSource, "relationships:", "  - kind: part-of",
      "    target: domains/commerce", "    evidence: [owner-domain]", "---", "", "# Purpose", "",
      "Cart belongs to [Commerce](../domains/commerce.md) and is evidenced by [Acme](../repositories/acme.md).", ""].join("\n"));
    const result = finalizeHubAuthoringSession(stateRoot, session.id, checkout);
    assert.equal(result.proposal.subject, "systems/cart");
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
