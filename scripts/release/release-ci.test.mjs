import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { parse } from "yaml";

const projectRoot = path.resolve(import.meta.dirname, "../..");

function workflow(name) {
  return parse(fs.readFileSync(path.join(projectRoot, ".github/workflows", name), "utf8"));
}

function stepIndex(steps, predicate) {
  return steps.findIndex(predicate);
}

test("[AB-RELEASE-CI-001..002][AB-RELEASE-CI-010][AB-RELEASE-CI-012] repository workflow runs the canonical gate with pinned bounded inputs", () => {
  const definition = workflow("repository-verification.yml"), job = definition.jobs.verify;
  assert.deepEqual(Object.keys(definition.on).sort(), ["pull_request", "push", "workflow_dispatch"]);
  assert.deepEqual(definition.permissions, { contents: "read" });
  assert.equal(definition.concurrency["cancel-in-progress"], true);
  assert.equal(job["runs-on"], "ubuntu-24.04");
  assert.equal(job["timeout-minutes"], 30);
  assert.equal(job.steps.some((step) => step.uses === "actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1"), true);
  assert.equal(job.steps.some((step) => step.uses === "actions/setup-node@820762786026740c76f36085b0efc47a31fe5020"
    && step.with["node-version"] === "24.12.0"), true);
  const gitleaks = job.steps.find((step) => step.name === "Install pinned Gitleaks");
  assert.equal(gitleaks.env.GITLEAKS_VERSION, "8.30.1");
  assert.equal(gitleaks.env.GITLEAKS_SHA256, "551f6fc83ea457d62a0d98237cbad105af8d557003051f41f3e7ca7b3f2470eb");
  assert.match(gitleaks.run, /sha256sum --check --strict/);
  const install = stepIndex(job.steps, (step) => step.run === "npm ci");
  const verify = stepIndex(job.steps, (step) => step.run === "npm run verify");
  assert.equal(install >= 0 && verify > install, true);
});

test("[AB-RELEASE-CI-006..007][AB-RELEASE-CI-009..012] release workflow uploads only qualified linux-x64 outputs after its gate", () => {
  const definition = workflow("release.yml"), job = definition.jobs["linux-x64"];
  assert.deepEqual(definition.on.push.tags, ["v*.*.*"]);
  assert.deepEqual(definition.permissions, { contents: "read" });
  assert.equal(definition.concurrency["cancel-in-progress"], true);
  assert.deepEqual(Object.keys(definition.jobs), ["linux-x64"]);
  assert.equal(job["runs-on"], "ubuntu-24.04");
  assert.equal(job["timeout-minutes"], 30);
  const qualify = stepIndex(job.steps, (step) => step.run === "npm run release:qualify -- --target linux-x64 --output dist/releases");
  const upload = stepIndex(job.steps, (step) => step.uses === "actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a");
  assert.equal(qualify >= 0 && upload > qualify, true);
  assert.equal(job.steps[upload].if, "${{ success() }}");
  assert.equal(job.steps[upload].with["if-no-files-found"], "error");
  assert.deepEqual(job.steps[upload].with.path.trim().split("\n"), [
    "dist/releases/agentbase-mcp-*-linux-x64.tar.gz",
    "dist/releases/agentbase-mcp-*-linux-x64.tar.gz.sha256",
  ]);
});
