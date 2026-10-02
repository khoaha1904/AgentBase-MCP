#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const ids = (prefix, count, start = 1) => Array.from(
  { length: count },
  (_, index) => `${prefix}-${String(index + start).padStart(3, "0")}`,
);

export function reachableDocumentation(readDocument, start = "docs/README.md") {
  const seen = new Set();
  const queue = [start];
  while (queue.length) {
    const current = queue.shift();
    if (seen.has(current)) continue;
    const source = readDocument(current);
    if (source === null || source === undefined) continue;
    seen.add(current);
    for (const match of source.matchAll(/\]\(([^\s)]+)\)/g)) {
      const target = match[1].split("#")[0];
      if (!target || /^[a-z]+:/i.test(target)) continue;
      const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(current), target));
      if (resolved.startsWith("docs/") && resolved.endsWith(".md")) queue.push(resolved);
    }
  }
  return seen;
}

const DOCUMENT_ROUTES = [
  "docs/product/README.md",
  "docs/product/00-scope-and-authority.md",
  "docs/capabilities/README.md",
  "docs/architecture/README.md",
  "docs/capabilities/01-repository-reading/05-runtime-requirements.md",
  "docs/capabilities/05-knowledge-entry/06-runtime-requirements.md",
  "docs/capabilities/06-cross-repository-relations/09-profile-enrichment-requirements.md",
  "docs/capabilities/02-hub-domain-repository-model/07-profile-layout-requirements.md",
  "docs/capabilities/02-hub-domain-repository-model/08-profile-bootstrap-home-plan-requirements.md",
  "docs/capabilities/02-hub-domain-repository-model/09-profile-refresh-guidance-requirements.md",
  "docs/capabilities/02-hub-domain-repository-model/10-compact-profile-layout-requirements.md",
  "docs/capabilities/08-live-references/08-freshness-envelope-requirements.md",
  "docs/capabilities/10-query-routing/07-runtime-requirements.md",
  "docs/capabilities/10-query-routing/08-profile-domain-projection-requirements.md",
  "docs/capabilities/11-review-and-publish/01-runtime-requirements.md",
  "docs/capabilities/11-review-and-publish/10-concurrency-requirements.md",
  "docs/capabilities/11-review-and-publish/11-proposal-impact-requirements.md",
  "docs/capabilities/12-version-scope/01-foundation-requirements.md",
  "docs/capabilities/12-version-scope/02-installation-requirements.md",
  "docs/capabilities/12-version-scope/03-benchmark-requirements.md",
  "docs/capabilities/12-version-scope/09-mcp-protocol-requirements.md",
  "docs/capabilities/12-version-scope/10-release-artifact-requirements.md",
  "docs/capabilities/12-version-scope/11-application-lifecycle-requirements.md",
  "docs/capabilities/12-version-scope/12-client-and-skill-integration-requirements.md",
  "docs/capabilities/12-version-scope/13-release-ci-requirements.md",
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
  ["source discovery", "docs/capabilities/01-repository-reading/05-runtime-requirements.md", ids("AB-DISC", 8), "CONTRACT-DISC-LIVING-MISSING", "CONTRACT-DISC-ID-MISSING"],
  ["foundation", "docs/capabilities/12-version-scope/01-foundation-requirements.md", [...ids("AB-FND", 3), ...ids("AB-FND", 6, 10), ...ids("AB-FND", 4, 19)], "CONTRACT-LIVING-MISSING", "CONTRACT-ID-MISSING"],
  ["OKF proposal", "docs/capabilities/05-knowledge-entry/06-runtime-requirements.md", ids("AB-MVP", 16, 8), "CONTRACT-OKF-LIVING-MISSING", "CONTRACT-MVP-ID-MISSING"],
  ["context freshness", "docs/capabilities/08-live-references/08-freshness-envelope-requirements.md", ids("AB-FRESH", 12), "CONTRACT-FRESH-LIVING-MISSING", "CONTRACT-FRESH-ID-MISSING"],
  ["schema catalog", "docs/capabilities/05-knowledge-entry/06-runtime-requirements.md", ids("AB-SCHEMA", 36), "CONTRACT-OKF-LIVING-MISSING", "CONTRACT-SCHEMA-ID-MISSING"],
  ["live claims", "docs/capabilities/05-knowledge-entry/06-runtime-requirements.md", ids("AB-CLAIM", 5), "CONTRACT-OKF-LIVING-MISSING", "CONTRACT-CLAIM-ID-MISSING"],
  ["initial ingest", "docs/capabilities/05-knowledge-entry/06-runtime-requirements.md", ids("AB-INGEST", 21), "CONTRACT-OKF-LIVING-MISSING", "CONTRACT-INGEST-ID-MISSING"],
  ["product", "docs/product/00-scope-and-authority.md", [...ids("AB-PRODUCT", 5), ...ids("AB-MIGRATION", 6)], "CONTRACT-PRODUCT-LIVING-MISSING", "CONTRACT-PRODUCT-ID-MISSING"],
  ["query", "docs/capabilities/10-query-routing/07-runtime-requirements.md", ids("AB-QUERY", 18), "CONTRACT-QUERY-LIVING-MISSING", "CONTRACT-QUERY-ID-MISSING"],
  ["local Hub", "docs/capabilities/11-review-and-publish/01-runtime-requirements.md", [...ids("AB-LOCAL-HUB", 16), ...ids("AB-PUBLISH", 10), ...ids("AB-HUB-SETUP", 17)], "CONTRACT-HUB-LIVING-MISSING", "CONTRACT-HUB-ID-MISSING"],
  ["installation", "docs/capabilities/12-version-scope/02-installation-requirements.md", ids("AB-INSTALL", 31), "CONTRACT-INSTALL-LIVING-MISSING", "CONTRACT-INSTALL-ID-MISSING"],
  ["MCP protocol", "docs/capabilities/12-version-scope/09-mcp-protocol-requirements.md", ids("AB-MCPMOD", 6), "CONTRACT-MCPMOD-LIVING-MISSING", "CONTRACT-MCPMOD-ID-MISSING"],
  ["release artifact", "docs/capabilities/12-version-scope/10-release-artifact-requirements.md", ids("AB-RELEASE", 11), "CONTRACT-RELEASE-LIVING-MISSING", "CONTRACT-RELEASE-ID-MISSING"],
  ["application lifecycle", "docs/capabilities/12-version-scope/11-application-lifecycle-requirements.md", ids("AB-LIFECYCLE", 12), "CONTRACT-LIFECYCLE-LIVING-MISSING", "CONTRACT-LIFECYCLE-ID-MISSING"],
  ["client and skill integration", "docs/capabilities/12-version-scope/12-client-and-skill-integration-requirements.md", ids("AB-INTEGRATION", 14), "CONTRACT-INTEGRATION-LIVING-MISSING", "CONTRACT-INTEGRATION-ID-MISSING"],
  ["release CI", "docs/capabilities/12-version-scope/13-release-ci-requirements.md", ids("AB-RELEASE-CI", 12), "CONTRACT-RELEASE-CI-LIVING-MISSING", "CONTRACT-RELEASE-CI-ID-MISSING"],
  ["local writer concurrency", "docs/capabilities/11-review-and-publish/10-concurrency-requirements.md", ids("AB-CONCURRENCY", 12), "CONTRACT-CONCURRENCY-LIVING-MISSING", "CONTRACT-CONCURRENCY-ID-MISSING"],
  ["proposal semantic impact", "docs/capabilities/11-review-and-publish/11-proposal-impact-requirements.md", ids("AB-IMPACT", 18), "CONTRACT-IMPACT-LIVING-MISSING", "CONTRACT-IMPACT-ID-MISSING"],
  ["AgentBase OKF profile", "docs/capabilities/02-hub-domain-repository-model/07-profile-layout-requirements.md", ids("AB-PROFILE", 10), "CONTRACT-PROFILE-LIVING-MISSING", "CONTRACT-PROFILE-ID-MISSING"],
  ["AgentBase grouped home", "docs/capabilities/02-hub-domain-repository-model/08-profile-bootstrap-home-plan-requirements.md", ids("AB-HOME", 12), "CONTRACT-HOME-LIVING-MISSING", "CONTRACT-HOME-ID-MISSING"],
  ["AgentBase Profile lifecycle", "docs/capabilities/02-hub-domain-repository-model/09-profile-refresh-guidance-requirements.md", ids("AB-PROFILE-LIFECYCLE", 10), "CONTRACT-PROFILE-LIFECYCLE-LIVING-MISSING", "CONTRACT-PROFILE-LIFECYCLE-ID-MISSING"],
  ["AgentBase compact Profile", "docs/capabilities/02-hub-domain-repository-model/10-compact-profile-layout-requirements.md", ids("AB-COMPACT", 15), "CONTRACT-COMPACT-LIVING-MISSING", "CONTRACT-COMPACT-ID-MISSING"],
  ["AgentBase Profile read projection", "docs/capabilities/10-query-routing/08-profile-domain-projection-requirements.md", ids("AB-PROFILE-READ", 10), "CONTRACT-PROFILE-READ-LIVING-MISSING", "CONTRACT-PROFILE-READ-ID-MISSING"],
  ["AgentBase Profile Enrichment", "docs/capabilities/06-cross-repository-relations/09-profile-enrichment-requirements.md", ids("AB-PROFILE-ENRICH", 10), "CONTRACT-PROFILE-ENRICH-LIVING-MISSING", "CONTRACT-PROFILE-ENRICH-ID-MISSING"],
];

const CURRENT_DOCUMENTS = [
  "AGENTS.md",
  "README.md",
  "docs/README.md",
  ...DOCUMENT_ROUTES,
];

const UNRESOLVED = /\b(?:NEEDS CLARIFICATION|TODO|TKTK)\b|\?\?\?|<placeholder>/i;
const ACTIVE_NAMING_RULES = [
  { code: "CONTRACT-TEMP-PRODUCT-NAME", pattern: /^#\s+AgentBase Next\b/im, message: "current docs must use AgentBase-MCP" },
  { code: "CONTRACT-TEMP-PRODUCT-NAME", pattern: /\bAgentBase Next is\b/i, message: "current docs must not present the rebuild name as product identity" },
  { code: "CONTRACT-TEMP-RUNTIME-PATH", pattern: /\/agentbase-next\/src\/cli\.ts\b/i, message: "launcher examples must use AgentBase-MCP" },
  { code: "CONTRACT-LEGACY-HUB-IDENTITY", pattern: /AGENTBASE_HUB_REPOSITORY[^\n]*knowledger-hub/i, message: "Hub examples must use an admitted AgentBase-Hub identity" },
  { code: "CONTRACT-TEMP-SUBJECT", pattern: /repositories\/agentbase-next[^\n]*(?:default|generated|subject)/i, message: "a rebuild worktree must not become a generated subject" },
];
const LANGUAGE_EXCLUSIONS = ["assets/hub-ci/", "presentation/vi/", "handoff/"];
const LANGUAGE_FILE_EXCLUSIONS = new Set(["presentation/preview.html"]);
const VIETNAMESE_TEXT = /[\u0102\u0103\u0110\u0111\u01A0\u01A1\u01AF\u01B0\u1EA0-\u1EF9]|\b(?:c\u00f3|c\u1ee7a|\u0111\u01b0\u1ee3c|kh\u00f4ng|m\u1ed9t|nh\u1eefng|ph\u1ea3i|tr\u006fng|v\u00e0|v\u1edbi)\b/iu;
const CURRENT_AUTHORITY = /^(?:AGENTS\.md|README\.md|docs\/(?:README\.md|architecture\/|product\/|capabilities\/))/;
const OBSOLETE_DOCUMENTATION_ROUTE = /docs\/(?:present|design)\//;

function read(root, relative) {
  const file = path.join(root, relative);
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
}

export function checkRepositoryLanguageEntries(entries) {
  return entries.flatMap(({ relative, source }) => {
    if (LANGUAGE_FILE_EXCLUSIONS.has(relative) || LANGUAGE_EXCLUSIONS.some((prefix) => relative.startsWith(prefix)) || source.includes("\0")) return [];
    const match = VIETNAMESE_TEXT.exec(source);
    if (!match) return [];
    const line = source.slice(0, match.index).split("\n").length;
    return [{ code: "CONTRACT-NON-ENGLISH", message: `${relative}:${line} contains Vietnamese text` }];
  });
}

export function checkCurrentDocumentationPathEntries(entries) {
  return entries.flatMap(({ relative, source }) => (
    CURRENT_AUTHORITY.test(relative) && OBSOLETE_DOCUMENTATION_ROUTE.test(source)
      ? [{ code: "CONTRACT-OBSOLETE-DOC-ROUTE", message: `${relative} references a compatibility-only documentation path` }]
      : []
  ));
}

export function checkArchitectureContractEntries({ index, documents }) {
  const errors = [];
  for (const relative of ARCHITECTURE_DOCUMENTS) {
    const source = documents[relative];
    if (source === null) {
      errors.push({ code: "CONTRACT-ARCHITECTURE-DOC-MISSING", message: `${relative} is required` });
    } else if (!/^> Status:/m.test(source)) {
      errors.push({ code: "CONTRACT-ARCHITECTURE-STATUS-MISSING", message: `${relative} must declare its synchronization status` });
    }
    if (index !== null && !index.includes(path.posix.basename(relative))) {
      errors.push({ code: "CONTRACT-ARCHITECTURE-ROUTE-MISSING", message: `docs/architecture/README.md does not route to ${relative}` });
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
      errors.push({ code: "CONTRACT-PRODUCT-DOC-MISSING", message: `${relative} is required` });
    } else if (!/^> Status:/m.test(source)) {
      errors.push({ code: "CONTRACT-PRODUCT-STATUS-MISSING", message: `${relative} must declare its synchronization status` });
    }
    const missingCapability = capabilityIndexes.find((capabilityIndex) => !index?.includes(capabilityIndex));
    if (index !== null && (!index.includes(productFile) || missingCapability)) {
      errors.push({ code: "CONTRACT-PRODUCT-ROUTE-MISSING", message: `docs/product/README.md must route ${relative} to every owned Capability Contract` });
    }
  }
  return errors;
}

export function checkCapabilityContractEntries({ rootIndex, entries }) {
  const errors = [];
  for (const [area, productFile, requirementsFile] of CAPABILITY_SECTIONS) {
    const entry = entries[area];
    if (!entry?.index) {
      errors.push({ code: "CONTRACT-CAPABILITY-INDEX-MISSING", message: `docs/capabilities/${area}/README.md is required` });
    } else {
      if (!entry.index.includes(`../../product/${productFile}`)) {
        errors.push({ code: "CONTRACT-CAPABILITY-PRODUCT-ROUTE-MISSING", message: `docs/capabilities/${area}/README.md must route to docs/product/${productFile}` });
      }
      if (!entry.index.includes(requirementsFile)) {
        errors.push({ code: "CONTRACT-CAPABILITY-REQUIREMENTS-ROUTE-MISSING", message: `docs/capabilities/${area}/README.md must route to ${requirementsFile}` });
      }
    }
    if (!entry?.requirements || !/AB-[A-Z0-9-]+-[0-9]{3}/.test(entry.requirements)) {
      errors.push({ code: "CONTRACT-CAPABILITY-REQUIREMENTS-MISSING", message: `docs/capabilities/${area}/${requirementsFile} must route or define AB-* requirements` });
    }
    if (rootIndex !== null && !rootIndex.includes(`${area}/README.md`)) {
      errors.push({ code: "CONTRACT-CAPABILITY-ROOT-ROUTE-MISSING", message: `docs/capabilities/README.md must route to docs/capabilities/${area}/README.md` });
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
          return [{ code: "CONTRACT-REQUIREMENT-DUPLICATE", message: `${requirement} is defined in both ${prior} and ${relative}` }];
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

export function checkContracts(root) {
  const errors = [...checkRepositoryLanguage(root), ...checkCurrentDocumentationPaths(root)];
  for (const relative of ["docs/present", "docs/design"]) {
    if (fs.existsSync(path.join(root, relative))) {
      errors.push({ code: "CONTRACT-LEGACY-DOC-ROOT", message: `${relative} must not be recreated; use the canonical contract directories` });
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
  if (!agentGuide) errors.push({ code: "CONTRACT-GUIDE-MISSING", message: "AGENTS.md is required" });
  else for (const route of ["docs/README.md"]) {
    if (!agentGuide.includes(route)) errors.push({ code: "CONTRACT-ROUTE-MISSING", message: `AGENTS.md does not route to ${route}` });
  }
  if (agentGuide) for (const marker of [
    "## Mandatory change lifecycle",
    "### Before implementation",
    "### During implementation",
    "### Completion gate",
  ]) {
    if (!agentGuide.includes(marker)) {
      errors.push({ code: "CONTRACT-LIFECYCLE-MISSING", message: `AGENTS.md is missing the canonical lifecycle section: ${marker}` });
    }
  }

  const documentationRoutes = reachableDocumentation((file) => read(root, file));
  if (!docsIndex) errors.push({ code: "CONTRACT-DOCS-INDEX-MISSING", message: "docs/README.md is required" });
  else for (const route of DOCUMENT_ROUTES) {
    if (!documentationRoutes.has(route)) errors.push({ code: "CONTRACT-ROUTE-MISSING", message: `docs/README.md has no linked route to ${route}` });
    if (!read(root, route)) errors.push({ code: "CONTRACT-CURRENT-DOC-MISSING", message: `${route} is required` });
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

  for (const relative of CURRENT_DOCUMENTS) {
    const source = read(root, relative);
    if (source && UNRESOLVED.test(source)) errors.push({ code: "CONTRACT-UNRESOLVED", message: `${relative} contains an unresolved marker` });
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
      errors.push({ code: "CONTRACT-LEGACY-DEPENDENCY", message: "package.json must not depend on a legacy AgentBase repository" });
    }
  }

  const ignore = read(root, ".gitignore");
  return errors;
}

export function main(root = path.resolve(import.meta.dirname, "../..")) {
  const errors = checkContracts(root);
  errors.forEach((error) => console.error(`ERROR ${error.code}: ${error.message}`));
  console.log(errors.length ? `Contract check: ${errors.length} error(s).` : "Contract checks passed.");
  return errors.length ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exitCode = main();
