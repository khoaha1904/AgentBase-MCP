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

function verifyNoGraphUiFrontend() {
  assert.equal(fs.existsSync(path.join(repositoryRoot, "vendor/codebase-memory/upstream/graph-ui")), false,
    "Graph UI frontend must not be retained in the released source snapshot");
  const preparation = fs.readFileSync(
    path.join(repositoryRoot, "scripts/upstream/prepare-codebase-memory.mjs"), "utf8",
  );
  assert.doesNotMatch(preparation, /--with-ui|cbm-with-ui/,
    "Codebase Memory preparation must not activate Graph UI");
}

function verifyDiagramFoundation() {
  const profile = readJson("vendor/diagram-design/agentbase/static-profile.json");
  assert.equal(profile.status, "active-diagram-only");
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
  assert.equal(fs.existsSync(path.join(repositoryRoot, ".agents/skills/use-diagram-design/SKILL.md")), true,
    "the narrow offline AgentBase diagram wrapper must be present");
}

function verifyNoActivation() {
  const rootPackage = readJson("package.json");
  const declared = { ...rootPackage.dependencies, ...rootPackage.devDependencies };
  assert.equal(rootPackage.dependencies.three, "0.183.0",
    "the approved offline Domain-site renderer must pin exact Three.js");
  for (const name of Object.keys(declared)) {
    if (name === "three") continue;
    assert.doesNotMatch(name, /diagram-design|playwright|chromium|react|vite/,
      `unapproved visualization dependency leaked into AgentBase: ${name}`);
  }
}

verifyInventories();
verifyNoGraphUiFrontend();
verifyDiagramFoundation();
verifyNoActivation();
process.stdout.write("upstream foundations: verified with narrow diagram activation\n");
