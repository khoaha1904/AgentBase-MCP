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
  const stateRoot = path.join(root, "state"), checkout = path.join(stateRoot, "checkout", "owned");
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
      + "sources:\n  - resource: repository://repository-acme-aaaaaaaaaaaa/README.md#L1-L1\n"
      + "---\n\n# Purpose\n\nAcme.\n";
    fs.writeFileSync(path.join(session.bundleRoot, "repositories/acme/repository.md"), concept);
    const result = finalizeHubAuthoringSession(stateRoot, session.id);
    const proposalRoot = path.join(stateRoot, "proposals", result.proposal.id);
    assert.equal(readHubProposalState(proposalRoot).phase, "prepared");
    assert.equal(result.inspection.counts.created, 3);
    assert.equal(fs.existsSync(path.join(proposalRoot, "base")), true);
    assert.equal(fs.existsSync(path.join(session.bundleRoot, ".git")), false);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test("[AB-HUB-008][AB-HUB-014] failed finalize leaves the workspace repairable", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hub-authoring-retry-"));
  const stateRoot = path.join(root, "state"), checkout = path.join(stateRoot, "checkout", "owned");
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
    assert.throws(() => finalizeHubAuthoringSession(stateRoot, session.id), /0.2/);
    assert.equal(fs.existsSync(session.bundleRoot), true);
    assert.equal(fs.existsSync(path.join(stateRoot, "proposals", `.staging-${session.id}`)), false);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
