import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  applyBundleProposal, computeOkfTreeDigest, diffBundleProposal, loadOkfBundle,
  prepareBundleProposal, readMaintainerDirectives, recoverBundleSwitch, validateBundleProposal,
} from "../index.ts";

function write(root: string, relative: string, content: string): void {
  const target = path.join(root, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

function concept(type: string, title: string, body: string): string {
  return `---\ntype: ${type}\ntitle: ${title}\nstatus: draft\n`
    + "generated: { by: 'agentbase/0.0.0', at: '2026-08-12T00:00:00Z' }\n"
    + "sources:\n  - id: repository-source\n"
    + "    resource: repository://repository-fixture-0123456789ab/src/main.ts#L1-L6\n"
    + `---\n\n${body}\n`;
}

function index(entries: readonly [string, string][]): string {
  return "---\nokf_version: '0.2'\n---\n\n# Knowledge\n\n"
    + entries.map(([title, target]) => `* [${title}](${target}) - knowledge`).join("\n") + "\n";
}

function prepare(root: string, id: string) {
  const proposalRoot = path.join(root, id), currentBundleRoot = path.join(root, "okf");
  const metadata = prepareBundleProposal({ currentBundleRoot, proposalRoot, proposalId: id,
    evidenceDigest: `sha256:${"b".repeat(64)}`, createdAt: "2026-08-12T00:00:00Z" });
  return { proposalRoot, currentBundleRoot, metadata, bundleRoot: path.join(proposalRoot, "bundle") };
}

test("[AB-MVP-008..015] product flow prepares, authors and diffs a linked multi-concept OKF bundle", (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-linked-proposal-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const before = computeOkfTreeDigest(path.join(root, "okf"));
  const proposal = prepare(root, "proposal-product-000001");
  write(proposal.bundleRoot, "index.md", index([
    ["Repository", "repositories/fixture.md"], ["Catalog", "components/catalog.md"],
    ["Inspection", "flows/inspection.md"], ["Question", "questions/policy-owner.md"],
  ]));
  write(proposal.bundleRoot, "repositories/fixture.md", concept("Software Repository", "Fixture",
    "Owns [catalog](../components/catalog.md) and [inspection](../flows/inspection.md)."));
  write(proposal.bundleRoot, "components/catalog.md", concept("Software Component", "Catalog",
    "Supplies metadata to [inspection](../flows/inspection.md)."));
  write(proposal.bundleRoot, "flows/inspection.md", concept("Software Flow", "Inspection",
    "Coordinates catalog and workspace; see [ownership question](../questions/policy-owner.md)."));
  write(proposal.bundleRoot, "questions/policy-owner.md", concept("Open Question", "Policy owner",
    "Which maintainer owns workspace policy?"));
  const validated = validateBundleProposal(proposal.currentBundleRoot, proposal.proposalRoot);
  assert.equal(validated.state, "generated");
  assert.equal(validated.producerValidation?.passed, true);
  const diff = diffBundleProposal(proposal.currentBundleRoot, proposal.proposalRoot);
  assert.equal(diff.applicable, true);
  assert.equal(diff.entries.filter((entry) => entry.change === "created").length, 5);
  assert.equal(computeOkfTreeDigest(proposal.currentBundleRoot), before);
  assert.equal(fs.existsSync(proposal.currentBundleRoot), false);
  assert.equal(applyBundleProposal({ repositoryRoot: root, proposalRoot: proposal.proposalRoot,
    owner: "test:explicit-apply" }).phase, "finalized");
  assert.equal(computeOkfTreeDigest(proposal.currentBundleRoot), diff.proposedTreeDigest);
});

test("[AB-MVP-016..021] revision rebuild preserves guidance, persistent defer and recoverable draft deletion", (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-proposal-recovery-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const first = prepare(root, "proposal-rehearsal-a-000001");
  write(first.bundleRoot, "index.md", index([
    ["Repository", "repository.md"], ["Flow", "flows/inspection.md"], ["Question", "questions/policy-owner.md"],
  ]));
  write(first.bundleRoot, "repository.md", concept("Software Repository", "Repository",
    "See [inspection](flows/inspection.md)."));
  write(first.bundleRoot, "flows/inspection.md", concept("Software Flow", "Inspection",
    "The flow has an [open question](../questions/policy-owner.md)."));
  write(first.bundleRoot, "questions/policy-owner.md", concept("Open Question", "Policy owner",
    "Which maintainer owns workspace policy?"));
  validateBundleProposal(first.currentBundleRoot, first.proposalRoot);
  applyBundleProposal({ repositoryRoot: root, proposalRoot: first.proposalRoot, owner: "test:first" });
  const guidance = "---\ntype: Maintainer Guidance\ntitle: Defer policy owner\nstatus: stable\n"
    + "generated: { by: 'human:maintainer', at: '2026-08-12T01:00:00Z' }\n"
    + "agentbase:\n  directive:\n    id: AB-DIRECTIVE-policy-owner\n    action: defer\n"
    + "    subject: questions/policy-owner\n---\n\n"
    + "Defer [this question](/questions/policy-owner.md) until ownership is documented.\n";
  write(first.currentBundleRoot, "guidance/policy-owner.md", guidance);
  write(first.currentBundleRoot, "index.md", index([
    ["Repository", "repository.md"], ["Flow", "flows/inspection.md"],
    ["Question", "questions/policy-owner.md"], ["Guidance", "guidance/policy-owner.md"],
  ]));
  const second = prepare(root, "proposal-rehearsal-b-000001");
  fs.rmSync(path.join(second.bundleRoot, "questions/policy-owner.md"));
  write(second.bundleRoot, "index.md", index([
    ["Repository", "repository.md"], ["Flow", "flows/inspection.md"], ["Guidance", "guidance/policy-owner.md"],
  ]));
  write(second.bundleRoot, "flows/inspection.md", concept("Software Flow", "Inspection",
    "The flow crosses catalog and workspace boundaries."));
  assert.equal(validateBundleProposal(second.currentBundleRoot, second.proposalRoot).state, "generated");
  assert.equal(readMaintainerDirectives(loadOkfBundle(second.bundleRoot)).deferredSubjects.has("questions/policy-owner"), true);
  assert.equal(fs.readFileSync(path.join(second.bundleRoot, "guidance/policy-owner.md"), "utf8"), guidance);
  const diff = diffBundleProposal(second.currentBundleRoot, second.proposalRoot);
  assert.equal(diff.entries.find((entry) => entry.path === "questions/policy-owner.md")?.change, "deleted-agentbase-draft");
  assert.equal(diff.entries.find((entry) => entry.path === "guidance/policy-owner.md")?.change, "preserved");
  assert.throws(() => applyBundleProposal({ repositoryRoot: root, proposalRoot: second.proposalRoot,
    owner: "test:interrupted", operationId: "switch-rehearsal-b-000001", interruptAfter: "next-active" }), /next-active/);
  assert.equal(recoverBundleSwitch(root, "test:recover").action, "finalize-next");
  const active = loadOkfBundle(second.currentBundleRoot);
  assert.equal(active.concepts.has("questions/policy-owner"), false);
  assert.equal(readMaintainerDirectives(active).deferredSubjects.has("questions/policy-owner"), true);
  const stale = prepare(root, "proposal-rehearsal-stale-000001");
  validateBundleProposal(stale.currentBundleRoot, stale.proposalRoot);
  fs.appendFileSync(path.join(stale.currentBundleRoot, "guidance/policy-owner.md"), "\nMaintainer update.\n");
  const lock = path.join(root, ".agentbase/okf.lock");
  fs.mkdirSync(lock);
  fs.writeFileSync(path.join(lock, "owner.json"), JSON.stringify({ owner: "other-agent" }));
  assert.throws(() => applyBundleProposal({ repositoryRoot: root, proposalRoot: stale.proposalRoot,
    owner: "test:competing" }), /other-agent/);
  fs.rmSync(lock, { recursive: true, force: true });
  assert.throws(() => applyBundleProposal({ repositoryRoot: root, proposalRoot: stale.proposalRoot,
    owner: "test:stale" }), /stale/);
});
