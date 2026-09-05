import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { qualify } from "./crawler-domain.mjs";

test("[AB-BATCH-014..015][AB-QUERY-020][AB-VIS-016] Crawler qualification covers source, query, UI and mock proposal", async () => {
  const output = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-crawler-site-"));
  try {
    const report = await qualify(output);
    assert.equal(report.query, "domains/crawler/knowledge/crawler-jobs.md");
    assert.equal(report.enrichment, "confirmed");
    assert.equal(report.counts.nodes >= 8, true);
  } finally {
    fs.rmSync(output, { recursive: true, force: true });
  }
});
