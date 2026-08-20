import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { createHubIdentity, createLocalHubState } from "../../../core/hub/index.ts";
import { applyQuestionDeclarations, listHubQuestions, recordQuestionAnswer } from "./questions.ts";

const hub = createLocalHubState({
  root: "/private/hub", hub: createHubIdentity("acme/AgentBase-Hub", "main"),
  remoteBase: "a".repeat(40), activeHead: "b".repeat(40), catalogVersion: "2.0.0",
});

test("[AB-QUESTION-001..003/005] equivalent declarations reuse one restart-safe question and retain claims", () => {
  const state = fs.mkdtempSync(path.join(os.tmpdir(), "hub-questions-"));
  try {
    const first = applyQuestionDeclarations(state, hub, [{
      subject: "systems/checkout", property: "session.ttl",
      claimIds: ["AB-CLAIM-doc", "AB-CLAIM-code"], missingEvidence: ["runtime deployment"],
    }], "1".repeat(24), "2026-08-17T00:00:00Z");
    const second = applyQuestionDeclarations(state, hub, [{
      subject: "systems/checkout", property: "session.ttl",
      claimIds: ["AB-CLAIM-config"], missingEvidence: [],
    }], "2".repeat(24), "2026-08-17T00:01:00Z");
    assert.equal(first[0]?.id, second[0]?.id);
    const restarted = listHubQuestions(state, hub);
    assert.equal(restarted.length, 1);
    assert.deepEqual(restarted[0]?.claimIds, ["AB-CLAIM-code", "AB-CLAIM-config", "AB-CLAIM-doc"]);
    assert.equal(restarted[0]?.history.length, 2);
  } finally { fs.rmSync(state, { recursive: true, force: true }); }
});

test("[AB-QUESTION-003/005] answers require human attribution and exact revision without overwriting history", () => {
  const state = fs.mkdtempSync(path.join(os.tmpdir(), "hub-question-answer-"));
  try {
    const [question] = applyQuestionDeclarations(state, hub, [{
      subject: "systems/checkout", property: "session.ttl",
      claimIds: ["AB-CLAIM-doc", "AB-CLAIM-code"], missingEvidence: [],
    }], "1".repeat(24), "2026-08-17T00:00:00Z");
    assert.ok(question);
    assert.throws(() => recordQuestionAnswer(state, hub, question.id, question.revision, "7 days", "agentbase/0.0.0",
      "3".repeat(24), "2026-08-17T00:01:00Z"), /human:/);
    const resolved = recordQuestionAnswer(state, hub, question.id, question.revision, "7 days", "human:khoa",
      "3".repeat(24), "2026-08-17T00:01:00Z");
    assert.equal(resolved.status, "resolved");
    assert.equal(resolved.history.length, 2);
    assert.throws(() => recordQuestionAnswer(state, hub, question.id, question.revision, "30 days", "human:other",
      "4".repeat(24), "2026-08-17T00:02:00Z"), /revision/);
    const reopened = recordQuestionAnswer(state, hub, question.id, resolved.revision, "30 days", "human:other",
      "4".repeat(24), "2026-08-17T00:02:00Z");
    assert.equal(reopened.status, "pending");
    assert.equal(reopened.history.length, 3);
    assert.deepEqual(reopened.claimIds, resolved.claimIds);
  } finally { fs.rmSync(state, { recursive: true, force: true }); }
});
