#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const REQUIRED_IDS = Array.from({ length: 19 }, (_, index) => `AB-FND-${String(index + 1).padStart(3, "0")}`);
const REQUIRED_MVP_IDS = Array.from({ length: 22 }, (_, index) => `AB-MVP-${String(index + 1).padStart(3, "0")}`);
const REQUIRED_GRAPH_IDS = Array.from({ length: 14 }, (_, index) => `AB-GRAPH-${String(index + 1).padStart(3, "0")}`);
const REQUIRED_REFRESH_IDS = Array.from({ length: 12 }, (_, index) => `AB-REFRESH-${String(index + 1).padStart(3, "0")}`);
const REQUIRED_MCP_IDS = Array.from({ length: 14 }, (_, index) => `AB-MCP-${String(index + 1).padStart(3, "0")}`);
const REQUIRED_PRODUCT_IDS = Array.from({ length: 5 }, (_, index) => `AB-PRODUCT-${String(index + 1).padStart(3, "0")}`);
const REQUIRED_MIGRATION_IDS = ["AB-MIGRATION-001", "AB-MIGRATION-002"];
const REQUIRED_LOCAL_HUB_IDS = Array.from({ length: 11 }, (_, index) => `AB-LOCAL-HUB-${String(index + 1).padStart(3, "0")}`);
const REQUIRED_SCHEMA_IDS = Array.from({ length: 9 }, (_, index) => `AB-SCHEMA-${String(index + 1).padStart(3, "0")}`);
const REQUIRED_QUERY_IDS = ["AB-QUERY-001"];
const REQUIRED_INSTALL_IDS = Array.from({ length: 6 }, (_, index) => `AB-INSTALL-${String(index + 1).padStart(3, "0")}`);
const UNRESOLVED = /\b(?:NEEDS CLARIFICATION|TODO|TKTK)\b|\?\?\?|<placeholder>/i;
const ACTIVE_NAMING_RULES = [
  { code: "SPEC-TEMP-PRODUCT-NAME", pattern: /^#\s+AgentBase Next\b/im, message: "README must use the official AgentBase-MCP product name" },
  { code: "SPEC-TEMP-PRODUCT-NAME", pattern: /\bAgentBase Next is\b/i, message: "active documentation must not present the rebuild name as a product" },
  { code: "SPEC-TEMP-RUNTIME-PATH", pattern: /\/agentbase-next\/src\/cli\.ts\b/i, message: "active launcher examples must use AgentBase-MCP" },
  { code: "SPEC-LEGACY-HUB-IDENTITY", pattern: /AGENTBASE_HUB_REPOSITORY[^\n]*knowledger-hub/i, message: "active Hub configuration must use an admitted AgentBase-Hub identity" },
  { code: "SPEC-TEMP-SUBJECT", pattern: /repositories\/agentbase-next[^\n]*(?:default|generated|subject)/i, message: "the rebuild worktree must not become a generated OKF subject" },
];

function read(root, relative) {
  const file = path.join(root, relative);
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
}

export function checkSpecifications(root) {
  const errors = [];
  const agentGuide = read(root, "AGENTS.md");
  const current = read(root, "specs/CURRENT.md");
  const living = read(root, "docs/specs/project-foundation.md");
  const mvpLiving = read(root, "docs/specs/single-repository-okf.md");
  const graphLiving = read(root, "docs/specs/local-code-intelligence.md");
  const productLiving = read(root, "docs/specs/product-identity.md");
  const hubLiving = read(root, "docs/specs/agentbase-hub.md");
  const schemaLiving = read(root, "docs/specs/okf-schema-catalog.md");
  const installationLiving = read(root, "docs/specs/installation.md");
  const packageSource = read(root, "package.json");

  if (!agentGuide) errors.push({ code: "SPEC-GUIDE-MISSING", message: "AGENTS.md is required" });
  else {
    for (const route of [
      "docs/handoff.md", "docs/product/vision.md", "docs/ARCHITECTURE.md",
      "docs/specs/project-foundation.md", "docs/specs/local-code-intelligence.md",
      "docs/specs/single-repository-okf.md", "docs/specs/product-identity.md",
      "docs/specs/agentbase-hub.md", "docs/specs/okf-schema-catalog.md",
      "docs/specs/installation.md", "specs/CURRENT.md",
    ]) {
      if (!agentGuide.includes(route)) errors.push({ code: "SPEC-ROUTE-MISSING", message: `AGENTS.md does not route to ${route}` });
    }
  }

  for (const [label, source, requirements] of [
    ["product identity", productLiving, [...REQUIRED_PRODUCT_IDS, ...REQUIRED_MIGRATION_IDS]],
    ["local Hub", hubLiving, [...REQUIRED_LOCAL_HUB_IDS, ...REQUIRED_QUERY_IDS]],
    ["OKF schema catalog", schemaLiving, REQUIRED_SCHEMA_IDS],
    ["installation", installationLiving, REQUIRED_INSTALL_IDS],
  ]) {
    if (!source) errors.push({ code: "SPEC-PRODUCT-LIVING-MISSING", message: `${label} living contract is required` });
    else for (const requirement of requirements) {
      if (!source.includes(requirement)) errors.push({ code: "SPEC-PRODUCT-ID-MISSING", message: `${requirement} is missing from the ${label} living contract` });
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

  if (!living) errors.push({ code: "SPEC-LIVING-MISSING", message: "docs/specs/project-foundation.md is required" });
  else {
    for (const requirement of REQUIRED_IDS) {
      if (!living.includes(requirement)) errors.push({ code: "SPEC-ID-MISSING", message: `${requirement} is missing from the living foundation contract` });
    }
  }

  if (!mvpLiving) errors.push({ code: "SPEC-MVP-LIVING-MISSING", message: "docs/specs/single-repository-okf.md is required" });
  else {
    for (const requirement of REQUIRED_MVP_IDS) {
      if (!mvpLiving.includes(requirement)) errors.push({ code: "SPEC-MVP-ID-MISSING", message: `${requirement} is missing from the living OKF contract` });
    }
  }

  if (!graphLiving) errors.push({ code: "SPEC-GRAPH-LIVING-MISSING", message: "docs/specs/local-code-intelligence.md is required" });
  else {
    for (const requirement of REQUIRED_GRAPH_IDS) {
      if (!graphLiving.includes(requirement)) errors.push({ code: "SPEC-GRAPH-ID-MISSING", message: `${requirement} is missing from the living graph contract` });
    }
    for (const requirement of REQUIRED_REFRESH_IDS) {
      if (!graphLiving.includes(requirement)) errors.push({ code: "SPEC-REFRESH-ID-MISSING", message: `${requirement} is missing from the living graph contract` });
    }
    for (const requirement of REQUIRED_MCP_IDS) {
      if (!graphLiving.includes(requirement)) errors.push({ code: "SPEC-MCP-ID-MISSING", message: `${requirement} is missing from the living graph contract` });
    }
  }

  for (const relative of [
    "AGENTS.md", "docs/specs/project-foundation.md", "docs/specs/local-code-intelligence.md",
    "docs/specs/single-repository-okf.md", "specs/CURRENT.md",
    "specs/001-clean-foundation/spec.md", "specs/002-single-repo-okf-walking-skeleton/spec.md",
    "specs/003-scoped-graph-session/spec.md",
    "specs/004-graph-refresh-reuse/spec.md",
    "specs/005-codebase-memory-mcp-surface/spec.md",
  ]) {
    const source = read(root, relative);
    if (source && UNRESOLVED.test(source)) errors.push({ code: "SPEC-UNRESOLVED", message: `${relative} contains an unresolved marker` });
  }

  if (packageSource) {
    let manifest;
    try {
      manifest = JSON.parse(packageSource);
    } catch {
      manifest = null;
    }
    const dependencySources = [
      manifest?.dependencies,
      manifest?.devDependencies,
      manifest?.optionalDependencies,
      manifest?.peerDependencies,
    ].flatMap((dependencies) => Object.values(dependencies ?? {}));
    if (dependencySources.some((source) => typeof source === "string" && /agentbase-(?:mcp|docs|hub)/i.test(source))) {
      errors.push({ code: "SPEC-LEGACY-DEPENDENCY", message: "package.json must not depend on a legacy AgentBase repository" });
    }
  }

  for (const relative of ["README.md", "docs/ARCHITECTURE.md", "docs/roadmap.md", "docs/handoff.md"]) {
    const source = read(root, relative);
    if (!source) continue;
    for (const rule of ACTIVE_NAMING_RULES) {
      if (rule.pattern.test(source)) errors.push({ code: rule.code, message: `${relative}: ${rule.message}` });
    }
  }
  return errors;
}

export function main(root = path.resolve(import.meta.dirname, "..")) {
  const errors = checkSpecifications(root);
  errors.forEach((error) => console.error(`ERROR ${error.code}: ${error.message}`));
  console.log(errors.length ? `Specification check: ${errors.length} error(s).` : "Specification checks passed.");
  return errors.length ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exitCode = main();
