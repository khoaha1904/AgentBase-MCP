import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { qualify } from "./crawler-domain.mjs";

function createRepository(fixtureRoot, name, files) {
  const root = path.join(fixtureRoot, name);
  for (const [relativePath, content] of Object.entries(files)) {
    const target = path.join(root, relativePath);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
  }
  execFileSync("git", ["init", "--quiet", "--initial-branch=main"], { cwd: root });
  execFileSync("git", ["-c", "user.name=AgentBase", "-c", "user.email=agentbase@localhost", "add", "."], { cwd: root });
  execFileSync("git", ["-c", "user.name=AgentBase", "-c", "user.email=agentbase@localhost", "commit", "--quiet", "-m", "fixture"], { cwd: root });
}

test("[AB-BATCH-014..015][AB-QUERY-020][AB-VIS-016] Crawler qualification covers source, query, UI and mock proposal", async () => {
  const output = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-crawler-site-"));
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-crawler-fixture-"));
  try {
    createRepository(fixtureRoot, "crawler-publisher", {
      "README.md": "# Crawler publisher\n",
      "main.tf": "resource \"aws_sqs_queue\" \"crawler_jobs\" { name = \"crawler-jobs\" }\n",
      "src/handler.py": "def handler(event, context):\n    return 'crawler-jobs'\n",
    });
    createRepository(fixtureRoot, "crawler-worker", {
      "README.md": "# Crawler worker\n",
      "main.tf": "resource \"aws_lambda_event_source_mapping\" \"crawler_jobs\" { function_name = \"crawler-jobs\" }\n",
      "src/handler.py": "def handler(event, context):\n    return 'crawler-jobs'\n",
    });
    createRepository(fixtureRoot, "serverless-data-pipelines-demo", {
      "README.md": "# Serverless data pipelines\n",
    });
    const report = await qualify(output, { fixtureRoot });
    assert.equal(report.query, "domains/crawler/knowledge/crawler-jobs.md");
    assert.equal(report.enrichment, "confirmed");
    assert.equal(report.counts.nodes >= 8, true);
  } finally {
    fs.rmSync(output, { recursive: true, force: true });
    fs.rmSync(fixtureRoot, { recursive: true, force: true });
  }
});
