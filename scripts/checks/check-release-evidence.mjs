#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const CONTRACT_FILE = /\.md$/;
const TEST_FILE = /\.test\.(?:mjs|ts)$/;
const REQUIREMENT = /AB-[A-Z0-9-]+-[0-9]{3}(?:\.\.[0-9]{3})?/g;
const ACTIVE_MARKER = /^> Release evidence: Required$/m;
const SKIPPED_DIRECTORIES = new Set([".git", "coverage", "dist", "node_modules"]);

function walk(directory, pattern, files = []) {
  if (!fs.existsSync(directory)) return files;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))) {
    if (entry.isSymbolicLink()) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!SKIPPED_DIRECTORIES.has(entry.name)) walk(absolute, pattern, files);
    } else if (entry.isFile() && pattern.test(entry.name)) {
      files.push(absolute);
    }
  }
  return files;
}

function requirementDefinitions(source) {
  return source.split("\n").flatMap((line) => {
    const declaration = /^- \*\*(.+?)\*\*/.exec(line)?.[1];
    return declaration?.match(/AB-[A-Z0-9-]+-[0-9]{3}/g) ?? [];
  });
}

export function expandRequirementReference(reference) {
  const match = /^(AB-[A-Z0-9-]+-)([0-9]{3})(?:\.\.([0-9]{3}))?$/.exec(reference);
  if (!match) throw new Error(`invalid requirement reference: ${reference}`);
  const start = Number(match[2]), end = Number(match[3] ?? match[2]);
  if (end < start || end - start > 999) throw new Error(`invalid requirement range: ${reference}`);
  return Array.from({ length: end - start + 1 }, (_, index) => `${match[1]}${String(start + index).padStart(3, "0")}`);
}

function testTitleReferences(source) {
  return source.split("\n").filter((line) => /^\s*(?:it|test)\s*\(/.test(line)).flatMap((line) => (
    (line.match(REQUIREMENT) ?? []).flatMap(expandRequirementReference)
  ));
}

function requirementNamespace(requirement) {
  return requirement.replace(/[0-9]{3}$/, "");
}

export function deriveReleaseEvidence({ requirementEntries, testEntries }) {
  const errors = [];
  const allDefinitions = new Map();
  const activeDefinitions = new Map();

  for (const entry of requirementEntries) {
    const active = ACTIVE_MARKER.test(entry.source);
    for (const requirement of requirementDefinitions(entry.source)) {
      const definitions = allDefinitions.get(requirement) ?? [];
      definitions.push(entry.relative);
      allDefinitions.set(requirement, definitions);
      if (active) {
        const prior = activeDefinitions.get(requirement);
        if (prior) {
          errors.push({
            code: "RELEASE-EVIDENCE-DUPLICATE",
            message: `${requirement} is active in both ${prior} and ${entry.relative}`,
          });
        } else {
          activeDefinitions.set(requirement, entry.relative);
        }
      }
    }
  }

  const references = new Map();
  for (const entry of testEntries) {
    for (const requirement of testTitleReferences(entry.source)) {
      const owners = references.get(requirement) ?? new Set();
      owners.add(entry.relative);
      references.set(requirement, owners);
    }
  }

  const activeNamespaces = new Set([...activeDefinitions.keys()].map(requirementNamespace));
  for (const requirement of [...references.keys()].sort()) {
    if (activeNamespaces.has(requirementNamespace(requirement)) && !allDefinitions.has(requirement)) {
      errors.push({
        code: "RELEASE-EVIDENCE-UNKNOWN",
        message: `${requirement} is referenced by a test but has no Capability Contract definition`,
      });
    }
  }
  for (const [requirement, owner] of [...activeDefinitions].sort(([left], [right]) => left.localeCompare(right))) {
    if (!references.has(requirement)) {
      errors.push({
        code: "RELEASE-EVIDENCE-MISSING",
        message: `${requirement} from ${owner} has no requirement-linked test`,
      });
    }
  }

  return {
    activeRequirements: activeDefinitions.size,
    referencedRequirements: [...activeDefinitions.keys()].filter((requirement) => references.has(requirement)).length,
    testFiles: testEntries.length,
    errors,
  };
}

function entries(root, files) {
  return files.map((absolute) => ({
    relative: path.relative(root, absolute).split(path.sep).join("/"),
    source: fs.readFileSync(absolute, "utf8"),
  }));
}

export function checkReleaseEvidence(root) {
  const requirementFiles = [
    ...walk(path.join(root, "docs/capabilities"), CONTRACT_FILE),
    ...walk(path.join(root, "docs/product"), CONTRACT_FILE),
  ].sort();
  const testFiles = [
    ...walk(path.join(root, "scripts"), TEST_FILE),
    ...walk(path.join(root, "src"), TEST_FILE),
  ].sort();
  return deriveReleaseEvidence({
    requirementEntries: entries(root, requirementFiles),
    testEntries: entries(root, testFiles),
  });
}

export function main(root = path.resolve(import.meta.dirname, "../..")) {
  const result = checkReleaseEvidence(root);
  result.errors.forEach((error) => console.error(`ERROR ${error.code}: ${error.message}`));
  console.log(result.errors.length
    ? `Release evidence check: ${result.errors.length} error(s).`
    : `Release evidence check passed: ${result.referencedRequirements}/${result.activeRequirements} active requirements across ${result.testFiles} test files.`);
  return result.errors.length ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exitCode = main();
