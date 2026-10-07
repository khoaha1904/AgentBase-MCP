import assert from "node:assert/strict";
import test from "node:test";
import { contextualDiff } from "./context-diff.ts";

test("[AB-LOCAL-HUB-014] contextual review preserves separate edits, line ranges and truncation", () => {
  const before = Array.from({ length: 30 }, (_, index) => `line ${index + 1}\n`);
  const after = [...before];
  after[5] = "first edit\n"; after[25] = "second edit\n";
  const diff = contextualDiff(before.join(""), after.join(""));
  assert.equal(diff.truncated, false);
  assert.match(diff.text, /@@ -3,7 \+3,7 @@/);
  assert.match(diff.text, /@@ -23,7 \+23,7 @@/);
  assert.match(diff.text, /-line 6\n\+first edit\n/);
  assert.doesNotMatch(diff.text, /line 15/);
  assert.match(contextualDiff("", "new\n").text, /@@ -0,0 \+1,1 @@\n\+new\n/);
  assert.match(contextualDiff("old", "").text, /No newline at end of file/);
  assert.deepEqual(contextualDiff("same\n", "same\n"), { text: "", truncated: false });
  const rewrite = contextualDiff("old\n".repeat(2000), "new\n".repeat(2000));
  assert.equal(rewrite.truncated, true);
  assert.ok(Buffer.byteLength(rewrite.text) <= 8192);
});
