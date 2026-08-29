#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const ids = (prefix, count, start = 1) => Array.from(
  { length: count },
  (_, index) => `${prefix}-${String(index + start).padStart(3, "0")}`,
);

const DOCUMENT_ROUTES = [
  "docs/present/README.md",
  "docs/present/00-product-scope-and-authority.md",
  "docs/design/README.md",
  "docs/design/00-architecture.md",
  "docs/design/01-repository-reading/05-runtime-requirements.md",
  "docs/design/05-knowledge-entry/06-runtime-requirements.md",
  "docs/design/10-query-routing/07-runtime-requirements.md",
  "docs/design/11-review-and-publish/01-runtime-requirements.md",
  "docs/design/12-version-scope/01-foundation-requirements.md",
  "docs/design/12-version-scope/02-installation-requirements.md",
  "docs/design/12-version-scope/03-benchmark-requirements.md",
];

const REQUIREMENT_GROUPS = [
  ["foundation", "docs/design/12-version-scope/01-foundation-requirements.md", ids("AB-FND", 19), "SPEC-LIVING-MISSING", "SPEC-ID-MISSING"],
  ["managed graph", "docs/design/01-repository-reading/05-runtime-requirements.md", ids("AB-MVP", 7), "SPEC-MVP-LIVING-MISSING", "SPEC-MVP-ID-MISSING"],
  ["graph lifecycle", "docs/design/01-repository-reading/05-runtime-requirements.md", ids("AB-GRAPH", 14), "SPEC-GRAPH-LIVING-MISSING", "SPEC-GRAPH-ID-MISSING"],
  ["graph freshness", "docs/design/01-repository-reading/05-runtime-requirements.md", ids("AB-GRAPH-REFRESH", 12), "SPEC-GRAPH-LIVING-MISSING", "SPEC-GRAPH-REFRESH-ID-MISSING"],
  ["MCP surface", "docs/design/01-repository-reading/05-runtime-requirements.md", ids("AB-MCP", 26), "SPEC-GRAPH-LIVING-MISSING", "SPEC-MCP-ID-MISSING"],
  ["OKF proposal", "docs/design/05-knowledge-entry/06-runtime-requirements.md", ids("AB-MVP", 16, 8), "SPEC-OKF-LIVING-MISSING", "SPEC-MVP-ID-MISSING"],
  ["observations", "docs/design/05-knowledge-entry/06-runtime-requirements.md", ids("AB-OBS", 7), "SPEC-OKF-LIVING-MISSING", "SPEC-OBS-ID-MISSING"],
  ["schema catalog", "docs/design/05-knowledge-entry/06-runtime-requirements.md", ids("AB-SCHEMA", 36), "SPEC-OKF-LIVING-MISSING", "SPEC-SCHEMA-ID-MISSING"],
  ["live claims", "docs/design/05-knowledge-entry/06-runtime-requirements.md", ids("AB-CLAIM", 5), "SPEC-OKF-LIVING-MISSING", "SPEC-CLAIM-ID-MISSING"],
  ["initial ingest", "docs/design/05-knowledge-entry/06-runtime-requirements.md", ids("AB-INGEST", 21), "SPEC-OKF-LIVING-MISSING", "SPEC-INGEST-ID-MISSING"],
  ["product", "docs/present/00-product-scope-and-authority.md", [...ids("AB-PRODUCT", 5), ...ids("AB-MIGRATION", 6)], "SPEC-PRODUCT-LIVING-MISSING", "SPEC-PRODUCT-ID-MISSING"],
  ["query", "docs/design/10-query-routing/07-runtime-requirements.md", ids("AB-QUERY", 18), "SPEC-QUERY-LIVING-MISSING", "SPEC-QUERY-ID-MISSING"],
  ["local Hub", "docs/design/11-review-and-publish/01-runtime-requirements.md", [...ids("AB-LOCAL-HUB", 16), ...ids("AB-PUBLISH", 10), ...ids("AB-HUB-SETUP", 17)], "SPEC-HUB-LIVING-MISSING", "SPEC-HUB-ID-MISSING"],
  ["installation", "docs/design/12-version-scope/02-installation-requirements.md", ids("AB-INSTALL", 31), "SPEC-INSTALL-LIVING-MISSING", "SPEC-INSTALL-ID-MISSING"],
  ["benchmark", "docs/design/12-version-scope/03-benchmark-requirements.md", ids("AB-BENCH", 87), "SPEC-BENCH-LIVING-MISSING", "SPEC-BENCH-ID-MISSING"],
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
const LANGUAGE_EXCLUSIONS = ["assets/hub-ci/", "fixtures/", "vendor/"];
const VIETNAMESE_TEXT = /[\u0102\u0103\u0110\u0111\u01A0\u01A1\u01AF\u01B0\u1EA0-\u1EF9]|\b(?:c\u00f3|c\u1ee7a|\u0111\u01b0\u1ee3c|kh\u00f4ng|m\u1ed9t|nh\u1eefng|ph\u1ea3i|tr\u006fng|v\u00e0|v\u1edbi)\b/iu;

function read(root, relative) {
  const file = path.join(root, relative);
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
}

export function checkRepositoryLanguageEntries(entries) {
  return entries.flatMap(({ relative, source }) => {
    if (LANGUAGE_EXCLUSIONS.some((prefix) => relative.startsWith(prefix)) || source.includes("\0")) return [];
    const match = VIETNAMESE_TEXT.exec(source);
    if (!match) return [];
    const line = source.slice(0, match.index).split("\n").length;
    return [{ code: "SPEC-NON-ENGLISH", message: `${relative}:${line} contains Vietnamese text` }];
  });
}

function checkRepositoryLanguage(root) {
  const files = execFileSync("git", ["ls-files", "-z"], { cwd: root, encoding: "utf8" })
    .split("\0")
    .filter(Boolean);
  return checkRepositoryLanguageEntries(files.map((relative) => ({
    relative,
    source: fs.readFileSync(path.join(root, relative), "utf8"),
  })));
}

export function checkSpecifications(root) {
  const errors = checkRepositoryLanguage(root);
  const agentGuide = read(root, "AGENTS.md");
  const docsIndex = read(root, "docs/README.md");
  const current = read(root, "specs/CURRENT.md");

  if (!agentGuide) errors.push({ code: "SPEC-GUIDE-MISSING", message: "AGENTS.md is required" });
  else for (const route of ["docs/README.md", "specs/CURRENT.md"]) {
    if (!agentGuide.includes(route)) errors.push({ code: "SPEC-ROUTE-MISSING", message: `AGENTS.md does not route to ${route}` });
  }
  if (agentGuide) for (const marker of [
    "## Mandatory change lifecycle",
    "### Before implementation",
    "### During implementation",
    "### Completion gate",
  ]) {
    if (!agentGuide.includes(marker)) {
      errors.push({ code: "SPEC-LIFECYCLE-MISSING", message: `AGENTS.md is missing the canonical lifecycle section: ${marker}` });
    }
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
    if (!source) errors.push({ code: missingCode, message: `${label} current requirements are required at ${relative}` });
    else for (const requirement of requirements) {
      if (!source.includes(requirement)) errors.push({ code: idCode, message: `${requirement} is missing from the ${label} requirements` });
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
  return errors;
}

export function main(root = path.resolve(import.meta.dirname, "../..")) {
  const errors = checkSpecifications(root);
  errors.forEach((error) => console.error(`ERROR ${error.code}: ${error.message}`));
  console.log(errors.length ? `Specification check: ${errors.length} error(s).` : "Specification checks passed.");
  return errors.length ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exitCode = main();
