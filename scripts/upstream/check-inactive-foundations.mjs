#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const repositoryRoot = path.resolve(import.meta.dirname, "../..");

function readJson(relative) {
  return JSON.parse(fs.readFileSync(path.join(repositoryRoot, relative), "utf8"));
}

function verifyDiagramFoundation() {
  const assets = path.join(repositoryRoot, ".agents/skills/use-diagram-design/assets");
  const template = fs.readFileSync(path.join(assets, "template.html"), "utf8");
  assert.match(template, /<svg\b/, "diagram foundation requires an inline SVG template");
  const externalUrls = [...template.matchAll(/https?:\/\/[^\s"'<>]+/g)]
    .map((match) => match[0])
    .filter((url) => url !== "http://www.w3.org/2000/svg");
  assert.deepEqual(externalUrls, [],
    "static HTML/SVG profile must not retain network-loaded assets");
  assert.doesNotMatch(template, /(?:src|href)\s*=\s*["']\s*\/\//i,
    "diagram template must not load protocol-relative network assets");
  const notice = fs.readFileSync(path.join(assets, "NOTICE.md"), "utf8");
  assert.match(notice, /https:\/\/github\.com\/carhrynlavery\/diagram-design/);
  assert.match(notice, /2\.6\.5/);
  assert.match(notice, /648c2a597839301e06df1e7434a08bde9f42eed3/);
  assert.match(notice, /MIT License/);
  assert.equal(fs.existsSync(path.join(repositoryRoot, "vendor/diagram-design")), false,
    "the retired upstream source snapshot must not be shipped");

  assert.equal(fs.existsSync(path.join(repositoryRoot, ".agents/skills/diagram-design")), false,
    "diagram-design must not be installed as an AgentBase skill");
  assert.equal(fs.existsSync(path.join(repositoryRoot, ".agents/skills/use-diagram-design/SKILL.md")), true,
    "the narrow offline AgentBase diagram wrapper must be present");
}

function verifyNoActivation() {
  const rootPackage = readJson("package.json");
  const declared = { ...rootPackage.dependencies, ...rootPackage.devDependencies };
  assert.equal(rootPackage.dependencies.cytoscape, "3.34.2",
    "the approved offline Domain-site renderer must pin exact Cytoscape.js");
  for (const name of Object.keys(declared)) {
    if (name === "cytoscape") continue;
    assert.doesNotMatch(name, /diagram-design|playwright|chromium|react|vite/,
      `unapproved visualization dependency leaked into AgentBase: ${name}`);
  }
}

verifyDiagramFoundation();
verifyNoActivation();
process.stdout.write("upstream foundations: verified with narrow diagram activation\n");
