import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  applyBundleProposal,
  loadOkfBundle,
  readMaintainerDirectives,
} from "../../../core/knowledge/index.ts";
import { recoverRepositoryOkf } from "./recovery.ts";
import {
  applyRepositoryProposal,
  diffRepositoryProposal,
  prepareRepositoryProposal,
  validateRepositoryProposal,
} from "./workflow.ts";

const EVIDENCE_A = `sha256:${"d".repeat(64)}`;
const EVIDENCE_B = `sha256:${"e".repeat(64)}`;

function generated(type: string, title: string, body: string): string {
  return `---\ntype: ${type}\ntitle: ${title}\nstatus: draft\ngenerated: { by: 'agentbase/0.0.0', at: '2026-08-12T00:00:00Z' }\n---\n\n${body}\n`;
}

function index(entries: readonly [string, string][]): string {
  return `---\nokf_version: '0.2'\n---\n\n# Knowledge\n\n${entries.map(([title, target]) => `* [${title}](${target}) - knowledge`).join("\n")}\n`;
}

function write(base: string, relative: string, content: string): void {
  const target = path.join(base, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

test("[AB-MVP-016..021] revision rebuild preserves guidance, persistent defer and recoverable draft deletion", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-rehearsal-"));
  const environment = { AGENTBASE_HOME: path.join(root, "agentbase") };
  try {
    const first = prepareRepositoryProposal(root, EVIDENCE_A, {
      proposalId: "proposal-rehearsal-a-000001",
      now: "2026-08-12T00:00:00.000Z",
      environment,
    });
    write(first.bundleRoot, "index.md", index([
      ["Repository", "repository.md"],
      ["Flow", "flows/inspection.md"],
      ["Question", "questions/policy-owner.md"],
    ]));
    write(first.bundleRoot, "repository.md", generated("Software Repository", "Repository", "See the [inspection flow](flows/inspection.md)."));
    write(first.bundleRoot, "flows/inspection.md", generated("Software Flow", "Inspection", "The flow has an [open question](../questions/policy-owner.md)."));
    write(first.bundleRoot, "questions/policy-owner.md", generated("Open Question", "Policy owner", "Which maintainer owns this policy?"));
    validateRepositoryProposal(root, first.metadata.proposalId, environment);
    applyRepositoryProposal(root, first.metadata.proposalId, "test:revision-a", environment);

    const guidance = [
      "---",
      "type: Maintainer Guidance",
      "title: Defer policy owner question",
      "status: stable",
      "generated: { by: 'human:khoa', at: '2026-08-12T01:00:00Z' }",
      "agentbase:",
      "  directive:",
      "    id: AB-DIRECTIVE-policy-owner",
      "    action: defer",
      "    subject: questions/policy-owner",
      "---",
      "",
      "# Guidance",
      "",
      "Defer [this question](/questions/policy-owner.md) until ownership is documented.",
      "",
    ].join("\n");
    write(path.join(root, "okf"), "guidance/policy-owner.md", guidance);
    write(path.join(root, "okf"), "index.md", index([
      ["Repository", "repository.md"],
      ["Flow", "flows/inspection.md"],
      ["Question", "questions/policy-owner.md"],
      ["Guidance", "guidance/policy-owner.md"],
    ]));

    const second = prepareRepositoryProposal(root, EVIDENCE_B, {
      proposalId: "proposal-rehearsal-b-000001",
      now: "2026-08-12T02:00:00.000Z",
      environment,
    });
    fs.rmSync(path.join(second.bundleRoot, "questions", "policy-owner.md"));
    write(second.bundleRoot, "index.md", index([
      ["Repository", "repository.md"],
      ["Flow", "flows/inspection.md"],
      ["Guidance", "guidance/policy-owner.md"],
    ]));
    write(second.bundleRoot, "flows/inspection.md", generated("Software Flow", "Inspection", "The flow crosses catalog and workspace boundaries."));
    const validated = validateRepositoryProposal(root, second.metadata.proposalId, environment);
    assert.equal(validated.state, "generated");
    const directives = readMaintainerDirectives(loadOkfBundle(second.bundleRoot));
    assert.equal(directives.deferredSubjects.has("questions/policy-owner"), true);
    assert.equal(fs.readFileSync(path.join(second.bundleRoot, "guidance", "policy-owner.md"), "utf8"), guidance);
    const diff = diffRepositoryProposal(root, second.metadata.proposalId, environment);
    assert.equal(diff.entries.find((entry) => entry.path === "questions/policy-owner.md")?.change, "deleted-agentbase-draft");
    assert.equal(diff.entries.find((entry) => entry.path === "guidance/policy-owner.md")?.change, "preserved");

    assert.throws(() => applyBundleProposal({
      repositoryRoot: root,
      proposalRoot: second.proposalRoot,
      owner: "test:interrupted-b",
      operationId: "switch-rehearsal-b-000001",
      interruptAfter: "next-active",
    }), /next-active/);
    const recovered = recoverRepositoryOkf(root, "test:recover-b");
    assert.equal(recovered.action, "finalize-next");
    const active = loadOkfBundle(path.join(root, "okf"));
    assert.equal(active.concepts.has("questions/policy-owner"), false);
    assert.equal(readMaintainerDirectives(active).deferredSubjects.has("questions/policy-owner"), true);

    const stale = prepareRepositoryProposal(root, EVIDENCE_B, {
      proposalId: "proposal-rehearsal-stale-000001",
      now: "2026-08-12T03:00:00.000Z",
      environment,
    });
    validateRepositoryProposal(root, stale.metadata.proposalId, environment);
    fs.appendFileSync(path.join(root, "okf", "guidance", "policy-owner.md"), "\nMaintainer update.\n");
    const lock = path.join(root, ".agentbase", "okf.lock");
    fs.mkdirSync(lock);
    fs.writeFileSync(path.join(lock, "owner.json"), JSON.stringify({ owner: "other-agent" }));
    assert.throws(() => applyRepositoryProposal(root, stale.metadata.proposalId, "test:competing", environment), /other-agent/);
    fs.rmSync(lock, { recursive: true, force: true });
    assert.throws(() => applyRepositoryProposal(root, stale.metadata.proposalId, "test:stale", environment), /stale/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
