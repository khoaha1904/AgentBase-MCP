import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { createHubIdentity, createLocalHubState } from "../../core/hub/index.ts";
import { computeOkfTreeDigest } from "../../core/knowledge/index.ts";
import { runGit } from "../../providers/github-hub/index.ts";
import { prepareQuestionGuidanceProposal } from "./guidance-proposal.ts";
import { applyQuestionDeclarations } from "./questions.ts";

async function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hub-guidance-"));
  const hubRoot = path.join(root, "hub"), stateRoot = path.join(root, "state");
  fs.mkdirSync(hubRoot);
  await runGit({ args: ["init", "-b", "main"], cwd: hubRoot, operation: "init" });
  await runGit({ args: ["config", "user.name", "Test"], cwd: hubRoot, operation: "name" });
  await runGit({ args: ["config", "user.email", "test@example.invalid"], cwd: hubRoot, operation: "email" });
  fs.writeFileSync(path.join(hubRoot, "index.md"), "---\nokf_version: '0.2'\n---\n\n# Hub\n");
  await runGit({ args: ["add", "index.md"], cwd: hubRoot, operation: "add" });
  await runGit({ args: ["commit", "-m", "base"], cwd: hubRoot, operation: "commit", commitTimestamp: "2026-08-17T00:00:00Z" });
  const head = (await runGit({ args: ["rev-parse", "HEAD"], cwd: hubRoot, operation: "head" })).stdout.trim();
  const localHub = createLocalHubState({ root: hubRoot, hub: createHubIdentity("acme/Hub", "main"),
    remoteBase: head, activeHead: head, catalogVersion: "5.0.0" });
  const [question] = applyQuestionDeclarations(stateRoot, localHub, [{
    subject: "systems/checkout", property: "session.ttl",
    claimIds: ["AB-CLAIM-doc", "AB-CLAIM-code"], missingEvidence: [],
  }], "1".repeat(24), "2026-08-17T00:01:00Z", "repository-shop-123456789abc");
  return { root, hubRoot, stateRoot, localHub, question: question!, cleanup: () => fs.rmSync(root, { recursive: true, force: true }) };
}

test("[AB-QUESTION-004] answer prepares one exact human guidance proposal without changing accepted Hub", async () => {
  const current = await fixture();
  try {
    const before = computeOkfTreeDigest(current.hubRoot);
    const result = await prepareQuestionGuidanceProposal({ stateRoot: current.stateRoot, localHub: current.localHub,
      question: current.question, answer: "The intended TTL is seven days.", by: "human:khoa",
      at: "2026-08-17T00:02:00Z" });
    assert.equal(computeOkfTreeDigest(current.hubRoot), before);
    assert.equal(result.proposal.baseCommit, current.localHub.activeHead);
    const created = result.inspection.entries.filter((entry) => entry.change === "created");
    assert.equal(created.length, 1);
    assert.match(created[0]?.path ?? "", /^guidance\//);
    assert.match(created[0]?.after?.content ?? "", /generated:\n  by: human:khoa/);
    assert.match(created[0]?.after?.content ?? "", /The intended TTL is seven days/);
  } finally { current.cleanup(); }
});

test("[AB-QUESTION-004] stale admitted Hub fails before guidance proposal creation", async () => {
  const current = await fixture();
  try {
    fs.writeFileSync(path.join(current.hubRoot, "README.md"), "advanced\n");
    await runGit({ args: ["add", "README.md"], cwd: current.hubRoot, operation: "add" });
    await runGit({ args: ["commit", "-m", "advance"], cwd: current.hubRoot, operation: "advance", commitTimestamp: "2026-08-17T00:02:00Z" });
    await assert.rejects(prepareQuestionGuidanceProposal({ stateRoot: current.stateRoot, localHub: current.localHub,
      question: current.question, answer: "Seven days", by: "human:khoa", at: "2026-08-17T00:03:00Z" }), /advanced/);
  } finally { current.cleanup(); }
});
