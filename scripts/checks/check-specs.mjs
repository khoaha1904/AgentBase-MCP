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
  "docs/product/README.md",
  "docs/product/00-scope-and-authority.md",
  "docs/capabilities/README.md",
  "docs/architecture/README.md",
  "docs/capabilities/01-repository-reading/05-runtime-requirements.md",
  "docs/capabilities/05-knowledge-entry/06-runtime-requirements.md",
  "docs/capabilities/10-query-routing/07-runtime-requirements.md",
  "docs/capabilities/11-review-and-publish/01-runtime-requirements.md",
  "docs/capabilities/12-version-scope/01-foundation-requirements.md",
  "docs/capabilities/12-version-scope/02-installation-requirements.md",
  "docs/capabilities/12-version-scope/03-benchmark-requirements.md",
  "docs/capabilities/12-version-scope/09-mcp-protocol-requirements.md",
];

const ARCHITECTURE_DOCUMENTS = [
  "docs/architecture/ownership.md",
  "docs/architecture/dependencies.md",
  "docs/architecture/flows.md",
  "docs/architecture/state-and-trust.md",
  "docs/architecture/runtime.md",
];

const PRODUCT_SECTIONS = [
  ["00-scope-and-authority.md", ["12-version-scope/README.md"]],
  ["01-repository-understanding.md", ["01-repository-reading/README.md", "03-concept-discovery/README.md", "04-schema-selection/README.md"]],
  ["02-knowledge-model-and-relations.md", ["02-hub-domain-repository-model/README.md", "06-cross-repository-relations/README.md"]],
  ["03-knowledge-lifecycle.md", ["05-knowledge-entry/README.md", "09-ingest-and-refresh/README.md", "11-review-and-publish/README.md"]],
  ["04-trust-conflicts-and-freshness.md", ["07-conflicts-and-questions/README.md", "08-live-references/README.md"]],
  ["05-query-and-context.md", ["10-query-routing/README.md"]],
  ["06-visualization.md", ["13-visualization/README.md"]],
  ["07-ai-sdlc-context.md", ["14-ai-sdlc-context/README.md"]],
];

const CAPABILITY_SECTIONS = [
  ["01-repository-reading", "01-repository-understanding.md", "05-runtime-requirements.md"],
  ["02-hub-domain-repository-model", "02-knowledge-model-and-relations.md", "06-capability-requirements.md"],
  ["03-concept-discovery", "01-repository-understanding.md", "06-capability-requirements.md"],
  ["04-schema-selection", "01-repository-understanding.md", "07-capability-requirements.md"],
  ["05-knowledge-entry", "03-knowledge-lifecycle.md", "06-runtime-requirements.md"],
  ["06-cross-repository-relations", "02-knowledge-model-and-relations.md", "07-runtime-requirements.md"],
  ["07-conflicts-and-questions", "04-trust-conflicts-and-freshness.md", "07-capability-requirements.md"],
  ["08-live-references", "04-trust-conflicts-and-freshness.md", "07-capability-requirements.md"],
  ["09-ingest-and-refresh", "03-knowledge-lifecycle.md", "09-runtime-requirements.md"],
  ["10-query-routing", "05-query-and-context.md", "07-runtime-requirements.md"],
  ["11-review-and-publish", "03-knowledge-lifecycle.md", "01-runtime-requirements.md"],
  ["12-version-scope", "00-scope-and-authority.md", "01-foundation-requirements.md"],
  ["13-visualization", "06-visualization.md", "04-runtime-requirements.md"],
  ["14-ai-sdlc-context", "07-ai-sdlc-context.md", "02-runtime-requirements.md"],
];

const REQUIREMENT_GROUPS = [
  ["foundation", "docs/capabilities/12-version-scope/01-foundation-requirements.md", ids("AB-FND", 19), "SPEC-LIVING-MISSING", "SPEC-ID-MISSING"],
  ["managed graph", "docs/capabilities/01-repository-reading/05-runtime-requirements.md", ids("AB-MVP", 7), "SPEC-MVP-LIVING-MISSING", "SPEC-MVP-ID-MISSING"],
  ["graph lifecycle", "docs/capabilities/01-repository-reading/05-runtime-requirements.md", ids("AB-GRAPH", 14), "SPEC-GRAPH-LIVING-MISSING", "SPEC-GRAPH-ID-MISSING"],
  ["graph freshness", "docs/capabilities/01-repository-reading/05-runtime-requirements.md", ids("AB-GRAPH-REFRESH", 12), "SPEC-GRAPH-LIVING-MISSING", "SPEC-GRAPH-REFRESH-ID-MISSING"],
  ["MCP surface", "docs/capabilities/01-repository-reading/05-runtime-requirements.md", ids("AB-MCP", 26), "SPEC-GRAPH-LIVING-MISSING", "SPEC-MCP-ID-MISSING"],
  ["OKF proposal", "docs/capabilities/05-knowledge-entry/06-runtime-requirements.md", ids("AB-MVP", 16, 8), "SPEC-OKF-LIVING-MISSING", "SPEC-MVP-ID-MISSING"],
  ["observations", "docs/capabilities/05-knowledge-entry/06-runtime-requirements.md", ids("AB-OBS", 7), "SPEC-OKF-LIVING-MISSING", "SPEC-OBS-ID-MISSING"],
  ["schema catalog", "docs/capabilities/05-knowledge-entry/06-runtime-requirements.md", ids("AB-SCHEMA", 36), "SPEC-OKF-LIVING-MISSING", "SPEC-SCHEMA-ID-MISSING"],
  ["live claims", "docs/capabilities/05-knowledge-entry/06-runtime-requirements.md", ids("AB-CLAIM", 5), "SPEC-OKF-LIVING-MISSING", "SPEC-CLAIM-ID-MISSING"],
  ["initial ingest", "docs/capabilities/05-knowledge-entry/06-runtime-requirements.md", ids("AB-INGEST", 21), "SPEC-OKF-LIVING-MISSING", "SPEC-INGEST-ID-MISSING"],
  ["product", "docs/product/00-scope-and-authority.md", [...ids("AB-PRODUCT", 5), ...ids("AB-MIGRATION", 6)], "SPEC-PRODUCT-LIVING-MISSING", "SPEC-PRODUCT-ID-MISSING"],
  ["query", "docs/capabilities/10-query-routing/07-runtime-requirements.md", ids("AB-QUERY", 18), "SPEC-QUERY-LIVING-MISSING", "SPEC-QUERY-ID-MISSING"],
  ["local Hub", "docs/capabilities/11-review-and-publish/01-runtime-requirements.md", [...ids("AB-LOCAL-HUB", 16), ...ids("AB-PUBLISH", 10), ...ids("AB-HUB-SETUP", 17)], "SPEC-HUB-LIVING-MISSING", "SPEC-HUB-ID-MISSING"],
  ["installation", "docs/capabilities/12-version-scope/02-installation-requirements.md", ids("AB-INSTALL", 31), "SPEC-INSTALL-LIVING-MISSING", "SPEC-INSTALL-ID-MISSING"],
  ["benchmark", "docs/capabilities/12-version-scope/03-benchmark-requirements.md", ids("AB-BENCH", 90), "SPEC-BENCH-LIVING-MISSING", "SPEC-BENCH-ID-MISSING"],
  ["MCP protocol", "docs/capabilities/12-version-scope/09-mcp-protocol-requirements.md", ids("AB-MCPMOD", 6), "SPEC-MCPMOD-LIVING-MISSING", "SPEC-MCPMOD-ID-MISSING"],
];

const CURRENT_DOCUMENTS = [
  "AGENTS.md",
  "README.md",
  "docs/README.md",
  ...DOCUMENT_ROUTES,
  "specs/CURRENT.md",
];

const UNRESOLVED = /\b(?:NEEDS CLARIFICATION|TODO|TKTK)\b|\?\?\?|<placeholder>/i;
const IMPLEMENTATION_PLAN_MARKERS = [
  "## Upstream Contracts",
  "## Implementation Decisions",
  "## Validation Mapping",
];
const SPECIFICATION_CONTRACT_MARKERS = [
  "## Contract Delta",
  "**Product Contract**",
  "**Architecture Contract**",
  "**Capability Contract**",
  "**Stable requirements**",
];
const TASK_CONTRACT_MARKERS = [
  "Product, Architecture and Capability Contract deltas",
  "Validation Evidence",
  "repository verification gate",
];
const ACTIVE_NAMING_RULES = [
  { code: "SPEC-TEMP-PRODUCT-NAME", pattern: /^#\s+AgentBase Next\b/im, message: "current docs must use AgentBase-MCP" },
  { code: "SPEC-TEMP-PRODUCT-NAME", pattern: /\bAgentBase Next is\b/i, message: "current docs must not present the rebuild name as product identity" },
  { code: "SPEC-TEMP-RUNTIME-PATH", pattern: /\/agentbase-next\/src\/cli\.ts\b/i, message: "launcher examples must use AgentBase-MCP" },
  { code: "SPEC-LEGACY-HUB-IDENTITY", pattern: /AGENTBASE_HUB_REPOSITORY[^\n]*knowledger-hub/i, message: "Hub examples must use an admitted AgentBase-Hub identity" },
  { code: "SPEC-TEMP-SUBJECT", pattern: /repositories\/agentbase-next[^\n]*(?:default|generated|subject)/i, message: "a rebuild worktree must not become a generated subject" },
];
const LANGUAGE_EXCLUSIONS = ["assets/hub-ci/", "fixtures/", "vendor/"];
const VIETNAMESE_TEXT = /[\u0102\u0103\u0110\u0111\u01A0\u01A1\u01AF\u01B0\u1EA0-\u1EF9]|\b(?:c\u00f3|c\u1ee7a|\u0111\u01b0\u1ee3c|kh\u00f4ng|m\u1ed9t|nh\u1eefng|ph\u1ea3i|tr\u006fng|v\u00e0|v\u1edbi)\b/iu;
const CURRENT_AUTHORITY = /^(?:AGENTS\.md|README\.md|docs\/(?:README\.md|architecture\/|product\/|capabilities\/))/;
const OBSOLETE_DOCUMENTATION_ROUTE = /docs\/(?:present|design)\//;

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

export function checkCurrentDocumentationPathEntries(entries) {
  return entries.flatMap(({ relative, source }) => (
    CURRENT_AUTHORITY.test(relative) && OBSOLETE_DOCUMENTATION_ROUTE.test(source)
      ? [{ code: "SPEC-OBSOLETE-DOC-ROUTE", message: `${relative} references a compatibility-only documentation path` }]
      : []
  ));
}

export function checkImplementationPlanEntry({ relative, source, active = false }) {
  if (source === null) {
    const purpose = active ? " for the active capability" : "";
    return [{ code: "SPEC-PLAN-MISSING", message: `${relative} is required${purpose}` }];
  }
  const errors = IMPLEMENTATION_PLAN_MARKERS.flatMap((marker) => (
    source.includes(marker)
      ? []
      : [{ code: "SPEC-PLAN-CONTRACT-MISSING", message: `${relative} is missing ${marker}` }]
  ));
  if (active && UNRESOLVED.test(source)) {
    errors.push({ code: "SPEC-PLAN-UNRESOLVED", message: `${relative} contains an unresolved implementation decision` });
  }
  return errors;
}

export function checkTemplateContractEntry({ relative, source, markers }) {
  if (source === null) return [{ code: "SPEC-TEMPLATE-MISSING", message: `${relative} is required` }];
  return markers.flatMap((marker) => source.includes(marker)
    ? []
    : [{ code: "SPEC-TEMPLATE-CONTRACT-MISSING", message: `${relative} is missing ${marker}` }]);
}

export function checkArchitectureContractEntries({ index, documents }) {
  const errors = [];
  for (const relative of ARCHITECTURE_DOCUMENTS) {
    const source = documents[relative];
    if (source === null) {
      errors.push({ code: "SPEC-ARCHITECTURE-DOC-MISSING", message: `${relative} is required` });
    } else if (!/^> Status:/m.test(source)) {
      errors.push({ code: "SPEC-ARCHITECTURE-STATUS-MISSING", message: `${relative} must declare its synchronization status` });
    }
    if (index !== null && !index.includes(path.posix.basename(relative))) {
      errors.push({ code: "SPEC-ARCHITECTURE-ROUTE-MISSING", message: `docs/architecture/README.md does not route to ${relative}` });
    }
  }
  return errors;
}

export function checkProductContractEntries({ index, documents }) {
  const errors = [];
  for (const [productFile, capabilityIndexes] of PRODUCT_SECTIONS) {
    const relative = `docs/product/${productFile}`;
    const source = documents[relative];
    if (source === null) {
      errors.push({ code: "SPEC-PRODUCT-DOC-MISSING", message: `${relative} is required` });
    } else if (!/^> Status:/m.test(source)) {
      errors.push({ code: "SPEC-PRODUCT-STATUS-MISSING", message: `${relative} must declare its synchronization status` });
    }
    const missingCapability = capabilityIndexes.find((capabilityIndex) => !index?.includes(capabilityIndex));
    if (index !== null && (!index.includes(productFile) || missingCapability)) {
      errors.push({ code: "SPEC-PRODUCT-ROUTE-MISSING", message: `docs/product/README.md must route ${relative} to every owned Capability Contract` });
    }
  }
  return errors;
}

export function checkCapabilityContractEntries({ rootIndex, entries }) {
  const errors = [];
  for (const [area, productFile, requirementsFile] of CAPABILITY_SECTIONS) {
    const entry = entries[area];
    if (!entry?.index) {
      errors.push({ code: "SPEC-CAPABILITY-INDEX-MISSING", message: `docs/capabilities/${area}/README.md is required` });
    } else {
      if (!entry.index.includes(`../../product/${productFile}`)) {
        errors.push({ code: "SPEC-CAPABILITY-PRODUCT-ROUTE-MISSING", message: `docs/capabilities/${area}/README.md must route to docs/product/${productFile}` });
      }
      if (!entry.index.includes(requirementsFile)) {
        errors.push({ code: "SPEC-CAPABILITY-REQUIREMENTS-ROUTE-MISSING", message: `docs/capabilities/${area}/README.md must route to ${requirementsFile}` });
      }
    }
    if (!entry?.requirements || !/AB-[A-Z0-9-]+-[0-9]{3}/.test(entry.requirements)) {
      errors.push({ code: "SPEC-CAPABILITY-REQUIREMENTS-MISSING", message: `docs/capabilities/${area}/${requirementsFile} must route or define AB-* requirements` });
    }
    if (rootIndex !== null && !rootIndex.includes(`${area}/README.md`)) {
      errors.push({ code: "SPEC-CAPABILITY-ROOT-ROUTE-MISSING", message: `docs/capabilities/README.md must route to docs/capabilities/${area}/README.md` });
    }
  }
  return errors;
}

export function checkRequirementDefinitionEntries(entries) {
  const owners = new Map();
  for (const { relative, source } of entries) {
    for (const line of source.split("\n")) {
      const declaration = line.match(/^- \*\*(.+?)\*\*/)?.[1];
      if (!declaration) continue;
      for (const requirement of declaration.match(/AB-[A-Z0-9-]+-[0-9]{3}/g) ?? []) {
        const prior = owners.get(requirement);
        if (prior && prior !== relative) {
          return [{ code: "SPEC-REQUIREMENT-DUPLICATE", message: `${requirement} is defined in both ${prior} and ${relative}` }];
        }
        owners.set(requirement, relative);
      }
    }
  }
  return [];
}

function checkRepositoryLanguage(root) {
  const files = execFileSync("git", ["ls-files", "-z"], { cwd: root, encoding: "utf8" })
    .split("\0")
    .filter((relative) => relative && fs.existsSync(path.join(root, relative)));
  return checkRepositoryLanguageEntries(files.map((relative) => ({
    relative,
    source: fs.readFileSync(path.join(root, relative), "utf8"),
  })));
}

function checkCurrentDocumentationPaths(root) {
  const files = execFileSync("git", ["ls-files", "-z"], { cwd: root, encoding: "utf8" })
    .split("\0")
    .filter((relative) => relative && fs.existsSync(path.join(root, relative)));
  return checkCurrentDocumentationPathEntries(files.map((relative) => ({
    relative,
    source: fs.readFileSync(path.join(root, relative), "utf8"),
  })));
}

export function checkSpecifications(root) {
  const errors = [...checkRepositoryLanguage(root), ...checkCurrentDocumentationPaths(root)];
  for (const relative of ["docs/present", "docs/design"]) {
    if (fs.existsSync(path.join(root, relative))) {
      errors.push({ code: "SPEC-LEGACY-DOC-ROOT", message: `${relative} must not be recreated; use the canonical contract directories` });
    }
  }
  const requirementFiles = execFileSync("git", ["ls-files", "-z", "docs/capabilities/**/*requirements.md"], { cwd: root, encoding: "utf8" })
    .split("\0")
    .filter((relative) => relative && fs.existsSync(path.join(root, relative)));
  errors.push(...checkRequirementDefinitionEntries(requirementFiles.map((relative) => ({
    relative,
    source: fs.readFileSync(path.join(root, relative), "utf8"),
  }))));
  const agentGuide = read(root, "AGENTS.md");
  const docsIndex = read(root, "docs/README.md");
  const current = read(root, "specs/CURRENT.md");
  const architectureIndex = read(root, "docs/architecture/README.md");
  errors.push(...checkArchitectureContractEntries({
    index: architectureIndex,
    documents: Object.fromEntries(ARCHITECTURE_DOCUMENTS.map((relative) => [relative, read(root, relative)])),
  }));
  const productIndex = read(root, "docs/product/README.md");
  errors.push(...checkProductContractEntries({
    index: productIndex,
    documents: Object.fromEntries(PRODUCT_SECTIONS.map(([productFile]) => {
      const relative = `docs/product/${productFile}`;
      return [relative, read(root, relative)];
    })),
  }));
  errors.push(...checkCapabilityContractEntries({
    rootIndex: read(root, "docs/capabilities/README.md"),
    entries: Object.fromEntries(CAPABILITY_SECTIONS.map(([area, , requirementsFile]) => [area, {
      index: read(root, `docs/capabilities/${area}/README.md`),
      requirements: read(root, `docs/capabilities/${area}/${requirementsFile}`),
    }])),
  }));
  errors.push(...checkImplementationPlanEntry({
    relative: ".specify/templates/plan-template.md",
    source: read(root, ".specify/templates/plan-template.md"),
  }));
  errors.push(...checkTemplateContractEntry({
    relative: ".specify/templates/spec-template.md",
    source: read(root, ".specify/templates/spec-template.md"),
    markers: SPECIFICATION_CONTRACT_MARKERS,
  }));
  errors.push(...checkTemplateContractEntry({
    relative: ".specify/templates/tasks-template.md",
    source: read(root, ".specify/templates/tasks-template.md"),
    markers: TASK_CONTRACT_MARKERS,
  }));

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
    if (!activeNone && target) {
      errors.push(...checkTemplateContractEntry({
        relative: path.posix.join("specs", target),
        source: read(root, path.posix.join("specs", target)),
        markers: SPECIFICATION_CONTRACT_MARKERS,
      }));
      const planRelative = path.posix.join("specs", path.posix.dirname(target), "plan.md");
      errors.push(...checkImplementationPlanEntry({
        relative: planRelative,
        source: read(root, planRelative),
        active: true,
      }));
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
