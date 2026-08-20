#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ids = (prefix, count, start = 1) => Array.from(
  { length: count },
  (_, index) => `${prefix}-${String(index + start).padStart(3, "0")}`,
);

const DOCUMENT_ROUTES = [
  "docs/PRODUCT.md",
  "docs/ARCHITECTURE.md",
  "docs/contracts/foundation.md",
  "docs/contracts/code-graph.md",
  "docs/contracts/okf.md",
  "docs/contracts/hub.md",
  "docs/contracts/installation.md",
  "docs/contracts/benchmark.md",
];

const REQUIREMENT_GROUPS = [
  ["foundation", "docs/contracts/foundation.md", ids("AB-FND", 19), "SPEC-LIVING-MISSING", "SPEC-ID-MISSING"],
  ["managed graph", "docs/contracts/code-graph.md", ids("AB-MVP", 7), "SPEC-MVP-LIVING-MISSING", "SPEC-MVP-ID-MISSING"],
  ["graph lifecycle", "docs/contracts/code-graph.md", ids("AB-GRAPH", 14), "SPEC-GRAPH-LIVING-MISSING", "SPEC-GRAPH-ID-MISSING"],
  ["graph freshness", "docs/contracts/code-graph.md", ids("AB-REFRESH", 12), "SPEC-GRAPH-LIVING-MISSING", "SPEC-REFRESH-ID-MISSING"],
  ["MCP surface", "docs/contracts/code-graph.md", ids("AB-MCP", 14), "SPEC-GRAPH-LIVING-MISSING", "SPEC-MCP-ID-MISSING"],
  ["OKF proposal", "docs/contracts/okf.md", ids("AB-MVP", 16, 8), "SPEC-OKF-LIVING-MISSING", "SPEC-MVP-ID-MISSING"],
  ["observations", "docs/contracts/okf.md", ids("AB-OBS", 7), "SPEC-OKF-LIVING-MISSING", "SPEC-OBS-ID-MISSING"],
  ["schema catalog", "docs/contracts/okf.md", ids("AB-SCHEMA", 29), "SPEC-OKF-LIVING-MISSING", "SPEC-SCHEMA-ID-MISSING"],
  ["product", "docs/PRODUCT.md", [...ids("AB-PRODUCT", 5), ...ids("AB-MIGRATION", 2)], "SPEC-PRODUCT-LIVING-MISSING", "SPEC-PRODUCT-ID-MISSING"],
  ["local Hub", "docs/contracts/hub.md", [...ids("AB-LOCAL-HUB", 13), "AB-QUERY-001", ...ids("AB-HUB-SETUP", 17)], "SPEC-HUB-LIVING-MISSING", "SPEC-HUB-ID-MISSING"],
  ["installation", "docs/contracts/installation.md", ids("AB-INSTALL", 24), "SPEC-INSTALL-LIVING-MISSING", "SPEC-INSTALL-ID-MISSING"],
  ["benchmark", "docs/contracts/benchmark.md", ids("AB-BENCH", 38), "SPEC-BENCH-LIVING-MISSING", "SPEC-BENCH-ID-MISSING"],
];

const CURRENT_DOCUMENTS = [
  "AGENTS.md",
  "README.md",
  "docs/README.md",
  ...DOCUMENT_ROUTES,
  "specs/CURRENT.md",
];

const UNRESOLVED = /\b(?:NEEDS CLARIFICATION|TODO|TKTK)\b|\?\?\?|<placeholder>/i;
const ACTIVE_NAMING_RULES = [
  { code: "SPEC-TEMP-PRODUCT-NAME", pattern: /^#\s+AgentBase Next\b/im, message: "current docs must use AgentBase-MCP" },
  { code: "SPEC-TEMP-PRODUCT-NAME", pattern: /\bAgentBase Next is\b/i, message: "current docs must not present the rebuild name as product identity" },
  { code: "SPEC-TEMP-RUNTIME-PATH", pattern: /\/agentbase-next\/src\/cli\.ts\b/i, message: "launcher examples must use AgentBase-MCP" },
  { code: "SPEC-LEGACY-HUB-IDENTITY", pattern: /AGENTBASE_HUB_REPOSITORY[^\n]*knowledger-hub/i, message: "Hub examples must use an admitted AgentBase-Hub identity" },
  { code: "SPEC-TEMP-SUBJECT", pattern: /repositories\/agentbase-next[^\n]*(?:default|generated|subject)/i, message: "a rebuild worktree must not become a generated subject" },
];

function read(root, relative) {
  const file = path.join(root, relative);
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
}

export function checkSpecifications(root) {
  const errors = [];
  const agentGuide = read(root, "AGENTS.md");
  const docsIndex = read(root, "docs/README.md");
  const current = read(root, "specs/CURRENT.md");

  if (!agentGuide) errors.push({ code: "SPEC-GUIDE-MISSING", message: "AGENTS.md is required" });
  else for (const route of ["docs/README.md", "specs/CURRENT.md"]) {
    if (!agentGuide.includes(route)) errors.push({ code: "SPEC-ROUTE-MISSING", message: `AGENTS.md does not route to ${route}` });
  }

  if (!docsIndex) errors.push({ code: "SPEC-DOCS-INDEX-MISSING", message: "docs/README.md is required" });
  else for (const route of DOCUMENT_ROUTES) {
    if (!docsIndex.includes(route)) errors.push({ code: "SPEC-ROUTE-MISSING", message: `docs/README.md does not route to ${route}` });
    if (!read(root, route)) errors.push({ code: "SPEC-CURRENT-DOC-MISSING", message: `${route} is required` });
  }

  const checkedFiles = new Map();
  for (const [label, relative, requirements, missingCode, idCode] of REQUIREMENT_GROUPS) {
    const source = checkedFiles.has(relative) ? checkedFiles.get(relative) : read(root, relative);
    checkedFiles.set(relative, source);
    if (!source) errors.push({ code: missingCode, message: `${label} current contract is required at ${relative}` });
    else for (const requirement of requirements) {
      if (!source.includes(requirement)) errors.push({ code: idCode, message: `${requirement} is missing from the ${label} contract` });
    }
  }

  if (!current) errors.push({ code: "SPEC-CURRENT-MISSING", message: "specs/CURRENT.md is required" });
  else {
    const activeNone = /Active capability:\s*None\b/.test(current);
    const target = activeNone
      ? current.match(/Most recent completed:\s*\[[^\]]+\]\(([^)]+)\)/)?.[1]
      : current.match(/Active capability:\s*\[[^\]]+\]\(([^)]+)\)/)?.[1];
    if (!target || !fs.existsSync(path.resolve(root, "specs", target))) {
      errors.push({ code: "SPEC-ACTIVE-BROKEN", message: "specs/CURRENT.md must link to an existing active or most recently completed specification" });
    }
  }

  for (const relative of CURRENT_DOCUMENTS) {
    const source = read(root, relative);
    if (source && UNRESOLVED.test(source)) errors.push({ code: "SPEC-UNRESOLVED", message: `${relative} contains an unresolved marker` });
    if (!source) continue;
    for (const rule of ACTIVE_NAMING_RULES) {
      if (rule.pattern.test(source)) errors.push({ code: rule.code, message: `${relative}: ${rule.message}` });
    }
  }

  const packageSource = read(root, "package.json");
  if (packageSource) {
    let manifest;
    try { manifest = JSON.parse(packageSource); } catch { manifest = null; }
    const dependencySources = [manifest?.dependencies, manifest?.devDependencies, manifest?.optionalDependencies, manifest?.peerDependencies]
      .flatMap((dependencies) => Object.values(dependencies ?? {}));
    if (dependencySources.some((source) => typeof source === "string" && /agentbase-(?:mcp|docs|hub)/i.test(source))) {
      errors.push({ code: "SPEC-LEGACY-DEPENDENCY", message: "package.json must not depend on a legacy AgentBase repository" });
    }
  }

  const ignore = read(root, ".gitignore");
  if (!ignore?.split(/\r?\n/).includes("docs/.archived/")) {
    errors.push({ code: "SPEC-ARCHIVE-NOT-IGNORED", message: "docs/.archived/ must remain local and Git-ignored" });
  }

  return errors;
}

export function main(root = path.resolve(import.meta.dirname, "../..")) {
  const errors = checkSpecifications(root);
  errors.forEach((error) => console.error(`ERROR ${error.code}: ${error.message}`));
  console.log(errors.length ? `Specification check: ${errors.length} error(s).` : "Specification checks passed.");
  return errors.length ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exitCode = main();
