import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  applyBundleProposal,
  computeOkfTreeDigest,
  prepareBundleProposal,
  recoverBundleSwitch,
  validateBundleProposal,
  type SwitchPhase,
} from "./index.ts";

const EVIDENCE_DIGEST = `sha256:${"c".repeat(64)}`;

function index(title: string): string {
  return `---\nokf_version: '0.2'\n---\n\n# Concepts\n\n* [${title}](component.md) - component\n`;
}

function concept(title: string): string {
  return `---\ntype: Software Component\ntitle: ${title}\nstatus: draft\ngenerated: { by: 'agentbase/0.0.0', at: '2026-08-12T00:00:00Z' }\n---\n\n# Overview\n\n${title}.\n`;
}

function fixture(withCurrent = true) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-switch-"));
  const current = path.join(root, "okf");
  const proposal = path.join(root, ".agentbase", "proposals", "proposal-switch-000001");
  const write = (base: string, relative: string, content: string) => {
    const target = path.join(base, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
  };
  if (withCurrent) {
    write(current, "index.md", index("Current"));
    write(current, "component.md", concept("Current"));
  }
  prepareBundleProposal({
    currentBundleRoot: current,
    proposalRoot: proposal,
    proposalId: "proposal-switch-000001",
    evidenceDigest: EVIDENCE_DIGEST,
    createdAt: "2026-08-12T00:00:00.000Z",
  });
  const proposedBundle = path.join(proposal, "bundle");
  write(proposedBundle, "index.md", index("Next"));
  write(proposedBundle, "component.md", concept("Next"));
  validateBundleProposal(current, proposal);
  return {
    root,
    current,
    proposal,
    currentDigest: computeOkfTreeDigest(current),
    nextDigest: computeOkfTreeDigest(proposedBundle),
    cleanup: () => fs.rmSync(root, { recursive: true, force: true }),
  };
}

test("[AB-MVP-019][AB-MVP-020] applies a validated complete proposal under one exclusive lock", () => {
  const current = fixture();
  try {
    const manifest = applyBundleProposal({
      repositoryRoot: current.root,
      proposalRoot: current.proposal,
      owner: "test:apply",
      operationId: "switch-test-complete-000001",
    });
    assert.equal(manifest.phase, "finalized");
    assert.equal(computeOkfTreeDigest(current.current), current.nextDigest);
    assert.equal(fs.existsSync(path.join(current.root, ".agentbase", "okf-switch.json")), false);
    assert.equal(fs.existsSync(path.join(current.root, ".agentbase", "okf.lock")), false);
  } finally {
    current.cleanup();
  }
});

for (const phase of ["prepared", "current-moved", "next-active", "finalized"] as const satisfies readonly SwitchPhase[]) {
  test(`[AB-MVP-020] recovers deterministically after the ${phase} checkpoint`, () => {
    const current = fixture();
    try {
      assert.throws(() => applyBundleProposal({
        repositoryRoot: current.root,
        proposalRoot: current.proposal,
        owner: `test:${phase}`,
        operationId: `switch-test-${phase}-000001`,
        interruptAfter: phase,
      }), new RegExp(phase));
      const recovered = recoverBundleSwitch(current.root, `test:recover:${phase}`);
      if (phase === "prepared" || phase === "current-moved") {
        assert.equal(recovered.activeTreeDigest, current.currentDigest);
      } else {
        assert.equal(recovered.activeTreeDigest, current.nextDigest);
      }
      assert.equal(fs.existsSync(path.join(current.root, ".agentbase", "okf-switch.json")), false);
    } finally {
      current.cleanup();
    }
  });
}

test("[AB-MVP-020] interrupted first apply with no current bundle finishes the staged next bundle", () => {
  const current = fixture(false);
  try {
    assert.throws(() => applyBundleProposal({
      repositoryRoot: current.root,
      proposalRoot: current.proposal,
      owner: "test:first",
      operationId: "switch-test-first-000001",
      interruptAfter: "current-moved",
    }), /current-moved/);
    const recovered = recoverBundleSwitch(current.root, "test:recover:first");
    assert.equal(recovered.action, "finish-next");
    assert.equal(recovered.activeTreeDigest, current.nextDigest);
  } finally {
    current.cleanup();
  }
});

test("[AB-MVP-019][AB-MVP-020] rejects stale base and competing writer before mutation", () => {
  const stale = fixture();
  try {
    fs.appendFileSync(path.join(stale.current, "component.md"), "External current edit.\n");
    assert.throws(() => applyBundleProposal({
      repositoryRoot: stale.root,
      proposalRoot: stale.proposal,
      owner: "test:stale",
      operationId: "switch-test-stale-000001",
    }), /stale/);
  } finally {
    stale.cleanup();
  }

  const locked = fixture();
  try {
    const lock = path.join(locked.root, ".agentbase", "okf.lock");
    fs.mkdirSync(lock, { recursive: true });
    fs.writeFileSync(path.join(lock, "owner.json"), JSON.stringify({ owner: "other-agent" }));
    assert.throws(() => applyBundleProposal({
      repositoryRoot: locked.root,
      proposalRoot: locked.proposal,
      owner: "test:locked",
      operationId: "switch-test-locked-000001",
    }), /other-agent/);
    assert.equal(computeOkfTreeDigest(locked.current), locked.currentDigest);
  } finally {
    locked.cleanup();
  }
});

test("[AB-MVP-020] recovery rejects manifest paths outside owned siblings", () => {
  const current = fixture();
  try {
    const state = path.join(current.root, ".agentbase");
    fs.writeFileSync(path.join(state, "okf-switch.json"), JSON.stringify({
      formatVersion: 1,
      operationId: "switch-bad",
      phase: "prepared",
      currentPath: current.current,
      nextPath: "/tmp/not-owned",
      backupPath: null,
      currentTreeDigest: current.currentDigest,
      nextTreeDigest: current.nextDigest,
      backupTreeDigest: null,
      recoveryAction: "discard-next",
    }));
    assert.throws(() => recoverBundleSwitch(current.root, "test:unsafe"), /unowned path/);
  } finally {
    current.cleanup();
  }
});
