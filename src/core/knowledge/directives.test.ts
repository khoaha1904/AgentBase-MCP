import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { loadOkfBundle, readMaintainerDirectives } from "./index.ts";

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-directives-"));
  const write = (relative: string, content: string) => {
    const target = path.join(root, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
  };
  return { root, write, cleanup: () => fs.rmSync(root, { recursive: true, force: true }) };
}

function guidance(id: string, action: "defer" | "reopen", subject: string): string {
  return [
    "---",
    "type: Maintainer Guidance",
    "status: stable",
    "generated: { by: 'human:khoa', at: '2026-08-12T00:00:00Z' }",
    "agentbase:",
    "  directive:",
    `    id: ${id}`,
    `    action: ${action}`,
    `    subject: ${subject}`,
    "---",
    "",
    "# Guidance",
    "",
    `This guidance affects [the question](/${subject}.md).`,
    "",
  ].join("\n");
}

test("[AB-MVP-016][AB-MVP-017] reads stable human maintainer defer guidance", () => {
  const current = fixture();
  try {
    current.write("guidance/defer-policy.md", guidance("AB-DIRECTIVE-policy", "defer", "questions/policy-owner"));
    const result = readMaintainerDirectives(loadOkfBundle(current.root));
    assert.deepEqual(result.directives, [{
      id: "AB-DIRECTIVE-policy",
      action: "defer",
      subject: "questions/policy-owner",
      conceptId: "guidance/defer-policy",
    }]);
    assert.deepEqual([...result.deferredSubjects], ["questions/policy-owner"]);
  } finally {
    current.cleanup();
  }
});

test("[AB-MVP-017] defer persists regardless of unrelated bundle evidence changes", () => {
  const current = fixture();
  try {
    current.write("guidance/defer-policy.md", guidance("AB-DIRECTIVE-policy", "defer", "questions/policy-owner"));
    current.write("components/new.md", "---\ntype: Software Component\n---\n\n# New evidence\n");
    const result = readMaintainerDirectives(loadOkfBundle(current.root));
    assert.equal(result.deferredSubjects.has("questions/policy-owner"), true);
  } finally {
    current.cleanup();
  }
});

test("[AB-MVP-017] changing the same stable directive to reopen explicitly removes suppression", () => {
  const current = fixture();
  try {
    current.write("guidance/defer-policy.md", guidance("AB-DIRECTIVE-policy", "reopen", "questions/policy-owner"));
    const result = readMaintainerDirectives(loadOkfBundle(current.root));
    assert.equal(result.deferredSubjects.has("questions/policy-owner"), false);
    assert.equal(result.reopenedSubjects.has("questions/policy-owner"), true);
  } finally {
    current.cleanup();
  }
});

test("[AB-MVP-016][AB-MVP-017] ignores non-human or non-stable pseudo-guidance and warns on malformed directives", () => {
  const current = fixture();
  try {
    current.write("guidance/agent.md", guidance("AB-DIRECTIVE-agent", "defer", "questions/agent").replace("human:khoa", "agentbase/0.0.0"));
    current.write("guidance/draft.md", guidance("AB-DIRECTIVE-draft", "defer", "questions/draft").replace("status: stable", "status: draft"));
    current.write("guidance/bad.md", guidance("bad", "defer", "../escape"));
    const result = readMaintainerDirectives(loadOkfBundle(current.root));
    assert.deepEqual(result.directives, []);
    assert.ok(result.warnings.some((warning) => warning.includes("bad.md")));
  } finally {
    current.cleanup();
  }
});
