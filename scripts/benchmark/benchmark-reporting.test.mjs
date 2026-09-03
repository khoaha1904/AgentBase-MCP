import assert from "node:assert/strict";
import test from "node:test";

import { reportFor } from "./benchmark-reporting.mjs";

test("benchmark report keeps lifecycle, defect and limitation boundaries", () => {
  const report = reportFor({ id: "fixture" }, {
    outcome: "failed", arm: "mcp", failures: ["agent stopped"],
  }, {
    validation: { passed: false }, initialIngestAcceptance: "invalid",
    ownerReview: { status: "needs_revision", findings: [] },
    authoringAssessment: { status: "invalid", hardFailures: ["no bundle"], limitations: ["owner review required"] },
    regression: { status: "no-baseline" },
  });
  assert.match(report, /Initial Ingest acceptance: invalid/);
  assert.match(report, /### MCP\/runtime\n\n- agent stopped/);
  assert.match(report, /## Limitations\n\n- owner review required/);
});
