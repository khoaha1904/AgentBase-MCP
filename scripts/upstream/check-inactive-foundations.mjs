#!/usr/bin/env node
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const repositoryRoot = path.resolve(import.meta.dirname, "../..");

function readJson(relative) {
  return JSON.parse(fs.readFileSync(path.join(repositoryRoot, relative), "utf8"));
}

function verifyInventories() {
  for (const name of ["codebase-memory", "diagram-design"]) {
    execFileSync(process.execPath, [
      path.join(repositoryRoot, "scripts/upstream/manage-upstreams.mjs"),
      "verify",
      name,
    ], { stdio: "inherit" });
  }
}

function verifyGraphUi() {
  const packageJson = readJson("vendor/codebase-memory/upstream/graph-ui/package.json");
  const lock = readJson("vendor/codebase-memory/upstream/graph-ui/package-lock.json");
  assert.equal(packageJson.private, true, "Graph UI must remain a private package");
  assert.equal(lock.lockfileVersion, 3, "Graph UI must retain an auditable npm lockfile");

  for (const [name, entry] of Object.entries(lock.packages ?? {})) {
    if (entry.resolved !== undefined) {
      assert.match(entry.resolved, /^https:\/\/registry\.npmjs\.org\//,
        `Graph UI lock entry has a non-registry source: ${name}`);
      assert.match(entry.integrity ?? "", /^sha512-/,
        `Graph UI lock entry lacks sha512 integrity: ${name}`);
    }
  }

  const preparation = fs.readFileSync(
    path.join(repositoryRoot, "scripts/upstream/prepare-codebase-memory.mjs"), "utf8",
  );
  assert.doesNotMatch(preparation, /--with-ui|cbm-with-ui/,
    "Codebase Memory preparation must not activate Graph UI");
}

function verifyDiagramFoundation() {
  const profile = readJson("vendor/diagram-design/agentbase/static-profile.json");
  assert.equal(profile.status, "inactive");
  assert.deepEqual(profile.allowedOutput, ["html", "svg"]);
  assert.equal(profile.fontPolicy, "system-only");

  const templatePath = path.join(repositoryRoot, "vendor/diagram-design", profile.sourceTemplate);
  const original = fs.readFileSync(templatePath, "utf8");
  assert.match(original, /<svg\b/, "diagram foundation requires an inline SVG template");

  const offlineCandidate = original.replace(
    /^\s*<link[^>]*fonts\.googleapis\.com[^>]*>\s*$/m,
    "",
  );
  const externalUrls = [...offlineCandidate.matchAll(/https?:\/\/[^\s"'<>]+/g)]
    .map((match) => match[0])
    .filter((url) => url !== "http://www.w3.org/2000/svg");
  assert.deepEqual(externalUrls, [],
    "static HTML/SVG profile must not retain network-loaded assets");

  assert.equal(fs.existsSync(path.join(repositoryRoot, ".agents/skills/diagram-design")), false,
    "diagram-design must not be installed as an AgentBase skill");
}

function verifyNoActivation() {
  const rootPackage = readJson("package.json");
  const declared = { ...rootPackage.dependencies, ...rootPackage.devDependencies };
  for (const name of Object.keys(declared)) {
    assert.doesNotMatch(name, /diagram-design|playwright|chromium|three|react|vite/,
      `inactive foundation leaked into AgentBase dependencies: ${name}`);
  }
}

verifyInventories();
verifyGraphUi();
verifyDiagramFoundation();
verifyNoActivation();
process.stdout.write("inactive foundations: verified and not activated\n");
