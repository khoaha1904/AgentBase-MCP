import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  computeOkfTreeDigest,
  diffBundleProposal,
  prepareBundleProposal,
  validateBundleProposal,
} from "../index.ts";

const EVIDENCE_DIGEST = `sha256:${"a".repeat(64)}`;

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-proposal-"));
  const current = path.join(root, "okf");
  const proposal = path.join(root, ".agentbase", "proposals", "proposal-test-000001");
  const write = (base: string, relative: string, content: string) => {
    const target = path.join(base, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
  };
  return { root, current, proposal, write, cleanup: () => fs.rmSync(root, { recursive: true, force: true }) };
}

function agentConcept(title: string, body = "# Overview\n\nDraft knowledge.\n", extra = ""): string {
  return [
    "---",
    "type: Software Component",
    `title: ${title}`,
    "status: draft",
    "generated: { by: 'agentbase/0.0.0', at: '2026-08-12T00:00:00Z' }",
    extra,
    "---",
    "",
    body,
  ].filter((line) => line !== "").join("\n") + "\n";
}

function rootIndex(entries: readonly string[]): string {
  return `---\nokf_version: '0.2'\n---\n\n# Concepts\n\n${entries.map((entry) => `* [${entry}](${entry}.md) - draft concept`).join("\n")}\n`;
}

test("[AB-MVP-009][AB-MVP-015] prepare byte-copies current and does not mutate shared bytes", () => {
  const current = fixture();
  try {
    current.write(current.current, "index.md", rootIndex(["existing"]));
    current.write(current.current, "existing.md", agentConcept("Existing"));
    const before = computeOkfTreeDigest(current.current);
    const metadata = prepareBundleProposal({
      currentBundleRoot: current.current,
      proposalRoot: current.proposal,
      proposalId: "proposal-test-000001",
      evidenceDigest: EVIDENCE_DIGEST,
      createdAt: "2026-08-12T00:00:00.000Z",
    });
    assert.equal(metadata.state, "prepared");
    assert.equal(metadata.baseTreeDigest, before);
    assert.equal(computeOkfTreeDigest(path.join(current.proposal, "bundle")), before);
    assert.equal(computeOkfTreeDigest(current.current), before);
  } finally {
    current.cleanup();
  }
});

test("[AB-MVP-012][AB-MVP-015] validation locks the generated tree and diff exposes created and modified files", () => {
  const current = fixture();
  try {
    fs.mkdirSync(current.current);
    prepareBundleProposal({
      currentBundleRoot: current.current,
      proposalRoot: current.proposal,
      proposalId: "proposal-test-000001",
      evidenceDigest: EVIDENCE_DIGEST,
      createdAt: "2026-08-12T00:00:00.000Z",
    });
    const bundle = path.join(current.proposal, "bundle");
    current.write(bundle, "index.md", rootIndex(["repository", "component"]));
    current.write(bundle, "repository.md", agentConcept("Repository", "# Components\n\nSee [component](component.md)."));
    current.write(bundle, "component.md", agentConcept("Component"));
    const validated = validateBundleProposal(current.current, current.proposal);
    assert.equal(validated.state, "generated");
    assert.equal(validated.producerValidation?.passed, true);
    assert.equal(validated.generatedTreeDigest, computeOkfTreeDigest(bundle));
    const diff = diffBundleProposal(current.current, current.proposal);
    assert.equal(diff.applicable, true);
    assert.ok(diff.entries.every((entry) => entry.change === "created"));

    fs.appendFileSync(path.join(bundle, "component.md"), "Changed after validation.\n");
    assert.throws(() => diffBundleProposal(current.current, current.proposal), /changed after validation/);
  } finally {
    current.cleanup();
  }
});

test("[AB-MVP-014] previous AgentBase drafts may be linked as continuity but not cited as independent sources", () => {
  const current = fixture();
  try {
    current.write(current.current, "index.md", rootIndex(["old"]));
    current.write(current.current, "old.md", agentConcept("Old"));
    prepareBundleProposal({
      currentBundleRoot: current.current,
      proposalRoot: current.proposal,
      proposalId: "proposal-test-000001",
      evidenceDigest: EVIDENCE_DIGEST,
      createdAt: "2026-08-12T00:00:00.000Z",
    });
    const bundle = path.join(current.proposal, "bundle");
    current.write(bundle, "index.md", rootIndex(["old", "new"]));
    current.write(bundle, "new.md", agentConcept("New", "See [old](old.md).", "sources:\n  - id: old\n    resource: old.md"));
    const result = validateBundleProposal(current.current, current.proposal);
    assert.equal(result.state, "prepared");
    assert.ok(result.producerValidation?.failures.some((failure) => failure.includes("continuity context")));
  } finally {
    current.cleanup();
  }
});

test("[AB-MVP-018] protected concepts remain exact while owned drafts may change or be deleted", () => {
  const current = fixture();
  try {
    const human = "---\ntype: Maintainer Guidance\nstatus: stable\ngenerated: { by: 'human:khoa', at: '2026-08-12T00:00:00Z' }\n---\n\n# Guidance\n\nKeep this exact.\n";
    current.write(current.current, "index.md", rootIndex(["draft", "guidance"]));
    current.write(current.current, "draft.md", agentConcept("Draft"));
    current.write(current.current, "guidance.md", human);
    prepareBundleProposal({
      currentBundleRoot: current.current,
      proposalRoot: current.proposal,
      proposalId: "proposal-test-000001",
      evidenceDigest: EVIDENCE_DIGEST,
      createdAt: "2026-08-12T00:00:00.000Z",
    });
    const bundle = path.join(current.proposal, "bundle");
    current.write(bundle, "index.md", rootIndex(["guidance"]));
    fs.rmSync(path.join(bundle, "draft.md"));
    const validated = validateBundleProposal(current.current, current.proposal);
    assert.equal(validated.state, "generated");
    const diff = diffBundleProposal(current.current, current.proposal);
    assert.equal(diff.entries.find((entry) => entry.path === "draft.md")?.change, "deleted-agentbase-draft");
    assert.equal(diff.entries.find((entry) => entry.path === "guidance.md")?.change, "preserved");
    assert.equal(fs.readFileSync(path.join(bundle, "guidance.md"), "utf8"), human);
  } finally {
    current.cleanup();
  }
});

test("[AB-MVP-018][AB-MVP-019] protected mutation and deletion fail visibly", () => {
  const current = fixture();
  try {
    const human = "---\ntype: Maintainer Guidance\n---\n\n# Guidance\n\nProtected.\n";
    current.write(current.current, "index.md", rootIndex(["guidance"]));
    current.write(current.current, "guidance.md", human);
    prepareBundleProposal({
      currentBundleRoot: current.current,
      proposalRoot: current.proposal,
      proposalId: "proposal-test-000001",
      evidenceDigest: EVIDENCE_DIGEST,
      createdAt: "2026-08-12T00:00:00.000Z",
    });
    const bundle = path.join(current.proposal, "bundle");
    current.write(bundle, "guidance.md", human.replace("Protected.", "Changed."));
    const modified = validateBundleProposal(current.current, current.proposal);
    assert.ok(modified.producerValidation?.failures.some((failure) => failure.includes("protected")));

    current.write(bundle, "guidance.md", human);
    fs.rmSync(path.join(bundle, "guidance.md"));
    const validated = validateBundleProposal(current.current, current.proposal);
    assert.equal(validated.state, "generated");
    const diff = diffBundleProposal(current.current, current.proposal);
    assert.equal(diff.applicable, false);
    assert.equal(diff.entries.find((entry) => entry.path === "guidance.md")?.change, "prohibited-deletion");
  } finally {
    current.cleanup();
  }
});

test("[AB-MVP-013][AB-MVP-018] modified owned drafts preserve unknown frontmatter values", () => {
  const current = fixture();
  try {
    current.write(current.current, "index.md", rootIndex(["draft"]));
    current.write(current.current, "draft.md", agentConcept("Draft", "# Before\n", "extension:\n  nested: [one, { two: true }]"));
    prepareBundleProposal({
      currentBundleRoot: current.current,
      proposalRoot: current.proposal,
      proposalId: "proposal-test-000001",
      evidenceDigest: EVIDENCE_DIGEST,
      createdAt: "2026-08-12T00:00:00.000Z",
    });
    const bundle = path.join(current.proposal, "bundle");
    current.write(bundle, "draft.md", agentConcept("Draft", "# After\n"));
    const invalid = validateBundleProposal(current.current, current.proposal);
    assert.ok(invalid.producerValidation?.failures.some((failure) => failure.includes("extension")));

    current.write(bundle, "draft.md", agentConcept("Draft", "# After\n", "extension:\n  nested: [one, { two: true }]"));
    const valid = validateBundleProposal(current.current, current.proposal);
    assert.equal(valid.state, "generated");
  } finally {
    current.cleanup();
  }
});
