import assert from "node:assert/strict";
import test from "node:test";

import {
  checkArchitectureContractEntries,
  checkCapabilityContractEntries,
  checkCurrentDocumentationPathEntries,
  checkImplementationPlanEntry,
  checkProductContractEntries,
  checkRepositoryLanguageEntries,
  checkTemplateContractEntry,
} from "./check-specs.mjs";

test("Spec Kit templates retain the contract delta and validation handoff", () => {
  assert.deepEqual(checkTemplateContractEntry({
    relative: ".specify/templates/spec-template.md",
    source: "## Contract Delta\n**Product Contract**\n",
    markers: ["## Contract Delta", "**Product Contract**"],
  }), []);

  assert.deepEqual(checkTemplateContractEntry({
    relative: ".specify/templates/tasks-template.md",
    source: "Validation Evidence\n",
    markers: ["Validation Evidence", "repository verification gate"],
  }), [{
    code: "SPEC-TEMPLATE-CONTRACT-MISSING",
    message: ".specify/templates/tasks-template.md is missing repository verification gate",
  }]);
});

test("every capability routes to its product outcome and normative requirements", () => {
  const areas = [
    ["01-repository-reading", "01-how-mcp-reads-a-repository.md", "05-runtime-requirements.md"],
    ["02-hub-domain-repository-model", "02-hub-domains-and-repositories.md", "06-capability-requirements.md"],
    ["03-concept-discovery", "03-how-concepts-are-identified.md", "06-capability-requirements.md"],
    ["04-schema-selection", "04-how-concept-schemas-are-selected.md", "07-capability-requirements.md"],
    ["05-knowledge-entry", "05-how-repository-knowledge-enters-the-hub.md", "06-runtime-requirements.md"],
    ["06-cross-repository-relations", "06-cross-repository-and-cross-domain-relationships.md", "07-runtime-requirements.md"],
    ["07-conflicts-and-questions", "07-conflicts-questions-and-maintainer-guidance.md", "07-capability-requirements.md"],
    ["08-live-references", "08-live-references-for-change-prone-values.md", "07-capability-requirements.md"],
    ["09-ingest-and-refresh", "09-ingest-and-refresh.md", "09-runtime-requirements.md"],
    ["10-query-routing", "10-querying-code-graph-and-hub.md", "07-runtime-requirements.md"],
    ["11-review-and-publish", "11-review-accept-and-publish.md", "01-runtime-requirements.md"],
    ["12-version-scope", "12-current-limits-and-open-decisions.md", "01-foundation-requirements.md"],
    ["13-visualization", "13-visualizing-published-knowledge.md", "04-runtime-requirements.md"],
    ["14-ai-sdlc-context", "14-context-for-ai-sdlc-workflows.md", "02-runtime-requirements.md"],
  ];
  const entries = Object.fromEntries(areas.map(([area, productFile, requirementsFile]) => [area, {
    index: `../../product/${productFile}\n${requirementsFile}\n`,
    requirements: "AB-EXAMPLE-001\n",
  }]));
  const rootIndex = areas.map(([area]) => `${area}/README.md`).join("\n");
  assert.deepEqual(checkCapabilityContractEntries({ rootIndex, entries }), []);

  entries["03-concept-discovery"].requirements = null;
  assert.deepEqual(checkCapabilityContractEntries({ rootIndex, entries }), [{
    code: "SPEC-CAPABILITY-REQUIREMENTS-MISSING",
    message: "docs/capabilities/03-concept-discovery/06-capability-requirements.md must route or define AB-* requirements",
  }]);
});

test("product contract index routes every outcome to a capability and status", () => {
  const productFiles = [
    "00-product-scope-and-authority.md",
    "01-how-mcp-reads-a-repository.md",
    "02-hub-domains-and-repositories.md",
    "03-how-concepts-are-identified.md",
    "04-how-concept-schemas-are-selected.md",
    "05-how-repository-knowledge-enters-the-hub.md",
    "06-cross-repository-and-cross-domain-relationships.md",
    "07-conflicts-questions-and-maintainer-guidance.md",
    "08-live-references-for-change-prone-values.md",
    "09-ingest-and-refresh.md",
    "10-querying-code-graph-and-hub.md",
    "11-review-accept-and-publish.md",
    "12-current-limits-and-open-decisions.md",
    "13-visualizing-published-knowledge.md",
    "14-context-for-ai-sdlc-workflows.md",
  ];
  const capabilityIndexes = [
    "12-version-scope/README.md", "01-repository-reading/README.md",
    "02-hub-domain-repository-model/README.md", "03-concept-discovery/README.md",
    "04-schema-selection/README.md", "05-knowledge-entry/README.md",
    "06-cross-repository-relations/README.md", "07-conflicts-and-questions/README.md",
    "08-live-references/README.md", "09-ingest-and-refresh/README.md",
    "10-query-routing/README.md", "11-review-and-publish/README.md",
    "12-version-scope/README.md", "13-visualization/README.md",
    "14-ai-sdlc-context/README.md",
  ];
  const documents = Object.fromEntries(productFiles.map((file) => [
    `docs/product/${file}`,
    file.startsWith("00-") ? "# Product\n" : "# Product\n\n> Status: Implemented.\n",
  ]));
  const index = [...productFiles, ...capabilityIndexes].join("\n");
  assert.deepEqual(checkProductContractEntries({ index, documents }), []);

  documents["docs/product/13-visualizing-published-knowledge.md"] = "# Product\n";
  assert.deepEqual(checkProductContractEntries({ index, documents }), [{
    code: "SPEC-PRODUCT-STATUS-MISSING",
    message: "docs/product/13-visualizing-published-knowledge.md must declare its synchronization status",
  }]);
});

test("architecture contract index must route to every required system document", () => {
  const documents = {
    "docs/architecture/ownership.md": "# Ownership\n",
    "docs/architecture/dependencies.md": "# Dependencies\n",
    "docs/architecture/flows.md": "# Flows\n",
    "docs/architecture/state-and-trust.md": "# State\n",
    "docs/architecture/runtime.md": "# Runtime\n",
  };
  const index = Object.keys(documents).map((relative) => relative.split("/").at(-1)).join("\n");
  assert.deepEqual(checkArchitectureContractEntries({ index, documents }), []);

  assert.deepEqual(checkArchitectureContractEntries({
    index: index.replace("flows.md", ""),
    documents: { ...documents, "docs/architecture/flows.md": null },
  }), [
    { code: "SPEC-ARCHITECTURE-DOC-MISSING", message: "docs/architecture/flows.md is required" },
    { code: "SPEC-ARCHITECTURE-ROUTE-MISSING", message: "docs/architecture/README.md does not route to docs/architecture/flows.md" },
  ]);
});

test("[AB-LANG-006] repository language check rejects Vietnamese prose and allows other Unicode", () => {
  assert.deepEqual(checkRepositoryLanguageEntries([
    { relative: "docs/example.md", source: "English with café and Bézier.\n" },
  ]), []);

  assert.deepEqual(checkRepositoryLanguageEntries([
    { relative: "docs/example.md", source: "English first.\nKh\u00f4ng \u0111\u01b0\u1ee3c ghi ti\u1ebfng Vi\u1ec7t.\n" },
  ]), [{
    code: "SPEC-NON-ENGLISH",
    message: "docs/example.md:2 contains Vietnamese text",
  }]);

  assert.deepEqual(checkRepositoryLanguageEntries([
    { relative: "vendor/example.md", source: "Kh\u00f4ng \u0111\u01b0\u1ee3c ghi ti\u1ebfng Vi\u1ec7t.\n" },
  ]), []);
});

test("[AB-DOC-006] current authority rejects old routes while compatibility and history retain them", () => {
  assert.deepEqual(checkCurrentDocumentationPathEntries([
    { relative: "docs/README.md", source: "Read docs/design/README.md.\n" },
  ]), [{
    code: "SPEC-OBSOLETE-DOC-ROUTE",
    message: "docs/README.md references a compatibility-only documentation path",
  }]);

  assert.deepEqual(checkCurrentDocumentationPathEntries([
    { relative: "docs/design/README.md", source: "docs/design/<area> maps to docs/capabilities/<area>.\n" },
    { relative: "specs/062-example/spec.md", source: "Baseline: docs/present/example.md\n" },
  ]), []);
});

test("active implementation plans must contain the contract sections and resolve decisions", () => {
  const valid = [
    "## Upstream Contracts",
    "## Implementation Decisions",
    "## Validation Mapping",
  ].join("\n");
  assert.deepEqual(checkImplementationPlanEntry({ relative: "specs/064-example/plan.md", source: valid, active: true }), []);

  assert.deepEqual(checkImplementationPlanEntry({
    relative: "specs/064-example/plan.md",
    source: `${valid}\nNEEDS CLARIFICATION`,
    active: true,
  }), [{
    code: "SPEC-PLAN-UNRESOLVED",
    message: "specs/064-example/plan.md contains an unresolved implementation decision",
  }]);

  assert.deepEqual(checkImplementationPlanEntry({
    relative: "specs/064-example/plan.md",
    source: "## Upstream Contracts\n## Implementation Decisions\n",
  }), [{
    code: "SPEC-PLAN-CONTRACT-MISSING",
    message: "specs/064-example/plan.md is missing ## Validation Mapping",
  }]);
});
