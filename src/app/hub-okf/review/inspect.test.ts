import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

import { inspectHubProposal } from "./inspect.ts";

test("[AB-HUB-007] inspection reports every refresh lifecycle classification", () => {
  const inspection = inspectHubProposal([
    { path: "a.md", change: "created", allowed: true },
    { path: "b.md", change: "modified", allowed: true },
    { path: "c.md", change: "preserved", allowed: true },
    { path: "d.md", change: "conflict", allowed: true },
    { path: "e.md", change: "supersession", allowed: true, previousConceptId: "old" },
    { path: "f.md", change: "prohibited-deletion", allowed: false },
  ]);
  assert.equal(inspection.counts.created, 1);
  assert.equal(inspection.counts.conflict, 1);
  assert.equal(inspection.counts.supersession, 1);
  assert.equal(inspection.applicable, false);
});

test("[AB-HUB-005] inspection includes bounded before and after content", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hub-inspection-test-"));
  const base = path.join(root, "base"), proposed = path.join(root, "proposed");
  try {
    fs.mkdirSync(base); fs.mkdirSync(proposed);
    fs.writeFileSync(path.join(base, "a.md"), "before");
    fs.writeFileSync(path.join(proposed, "a.md"), "after-content");
    const result = inspectHubProposal(
      [{ path: "a.md", change: "modified", allowed: true }],
      { baseRoot: base, proposedRoot: proposed, maximumFileBytes: 5 },
    );
    assert.equal(result.entries[0]?.before?.content, "befor");
    assert.equal(result.entries[0]?.before?.truncated, true);
    assert.equal(result.entries[0]?.after?.content, "after");
    assert.equal(result.entries[0]?.after?.truncated, true);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
