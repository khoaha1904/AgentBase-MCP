import assert from "node:assert/strict";
import test from "node:test";

import {
  reachableDocumentation,
  checkArchitectureContractEntries,
  checkCapabilityContractEntries,
  checkCurrentDocumentationPathEntries,
  checkProductContractEntries,
  checkRepositoryLanguageEntries,
  checkRequirementDefinitionEntries,
} from "./check-contracts.mjs";

test("documentation routes through layer indexes without requiring flat startup context", () => {
  const pages = {
    "docs/README.md": "[Product](product/README.md)",
    "docs/product/README.md": "[Scope](scope.md#outcome) [Root](../README.md)",
    "docs/product/scope.md": "[Missing](missing.md) [External](https://example.com/docs.md)",
    "docs/orphan.md": "Not linked",
  };
  assert.deepEqual([...reachableDocumentation((file) => pages[file])].sort(),
    ["docs/README.md", "docs/product/README.md", "docs/product/scope.md"]);
});

test("normative requirement IDs have one definition owner", () => {
  assert.deepEqual(checkRequirementDefinitionEntries([
    { relative: "a-requirements.md", source: "- **AB-A-001, AB-A-002** — First.\n" },
    { relative: "b-requirements.md", source: "See `AB-A-001`; do not redefine it.\n- **AB-B-001** — Second.\n" },
  ]), []);

  assert.deepEqual(checkRequirementDefinitionEntries([
    { relative: "a-requirements.md", source: "- **AB-A-001** — First.\n" },
    { relative: "b-requirements.md", source: "- **AB-A-001** — Duplicate.\n" },
  ]), [{
    code: "CONTRACT-REQUIREMENT-DUPLICATE",
    message: "AB-A-001 is defined in both a-requirements.md and b-requirements.md",
  }]);
});

test("every capability routes to its product outcome and normative requirements", () => {
  const areas = [
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
  const entries = Object.fromEntries(areas.map(([area, productFile, requirementsFile]) => [area, {
    index: `../../product/${productFile}\n${requirementsFile}\n`,
    requirements: "AB-EXAMPLE-001\n",
  }]));
  const rootIndex = areas.map(([area]) => `${area}/README.md`).join("\n");
  assert.deepEqual(checkCapabilityContractEntries({ rootIndex, entries }), []);

  entries["03-concept-discovery"].requirements = null;
  assert.deepEqual(checkCapabilityContractEntries({ rootIndex, entries }), [{
    code: "CONTRACT-CAPABILITY-REQUIREMENTS-MISSING",
    message: "docs/capabilities/03-concept-discovery/06-capability-requirements.md must route or define AB-* requirements",
  }]);
});

test("product contract index routes every outcome to all owned capabilities", () => {
  const productFiles = [
    "00-scope-and-authority.md",
    "01-repository-understanding.md",
    "02-knowledge-model-and-relations.md",
    "03-knowledge-lifecycle.md",
    "04-trust-conflicts-and-freshness.md",
    "05-query-and-context.md",
    "06-visualization.md",
    "07-ai-sdlc-context.md",
  ];
  const capabilityIndexes = [
    "12-version-scope/README.md", "01-repository-reading/README.md",
    "02-hub-domain-repository-model/README.md", "03-concept-discovery/README.md",
    "04-schema-selection/README.md", "05-knowledge-entry/README.md",
    "06-cross-repository-relations/README.md", "07-conflicts-and-questions/README.md",
    "08-live-references/README.md", "09-ingest-and-refresh/README.md",
    "10-query-routing/README.md", "11-review-and-publish/README.md",
    "13-visualization/README.md",
    "14-ai-sdlc-context/README.md",
  ];
  const documents = Object.fromEntries(productFiles.map((file) => [
    `docs/product/${file}`,
    "# Product\n\n> Status: Implemented.\n",
  ]));
  const index = [...productFiles, ...capabilityIndexes].join("\n");
  assert.deepEqual(checkProductContractEntries({ index, documents }), []);

  documents["docs/product/06-visualization.md"] = "# Product\n";
  assert.deepEqual(checkProductContractEntries({ index, documents }), [{
    code: "CONTRACT-PRODUCT-STATUS-MISSING",
    message: "docs/product/06-visualization.md must declare its synchronization status",
  }]);
});

test("architecture contract index must route to every required system document", () => {
  const documents = {
    "docs/architecture/ownership.md": "# Ownership\n\n> Status: Accepted.\n",
    "docs/architecture/dependencies.md": "# Dependencies\n\n> Status: Accepted.\n",
    "docs/architecture/flows.md": "# Flows\n\n> Status: Accepted.\n",
    "docs/architecture/state-and-trust.md": "# State\n\n> Status: Accepted.\n",
    "docs/architecture/runtime.md": "# Runtime\n\n> Status: Accepted.\n",
  };
  const index = Object.keys(documents).map((relative) => relative.split("/").at(-1)).join("\n");
  assert.deepEqual(checkArchitectureContractEntries({ index, documents }), []);

  assert.deepEqual(checkArchitectureContractEntries({
    index: index.replace("flows.md", ""),
    documents: { ...documents, "docs/architecture/flows.md": null },
  }), [
    { code: "CONTRACT-ARCHITECTURE-DOC-MISSING", message: "docs/architecture/flows.md is required" },
    { code: "CONTRACT-ARCHITECTURE-ROUTE-MISSING", message: "docs/architecture/README.md does not route to docs/architecture/flows.md" },
  ]);

  assert.deepEqual(checkArchitectureContractEntries({
    index,
    documents: { ...documents, "docs/architecture/runtime.md": "# Runtime\n" },
  }), [
    { code: "CONTRACT-ARCHITECTURE-STATUS-MISSING", message: "docs/architecture/runtime.md must declare its synchronization status" },
  ]);
});

test("[AB-LANG-006] repository language check rejects Vietnamese prose and allows other Unicode", () => {
  assert.deepEqual(checkRepositoryLanguageEntries([
    { relative: "docs/example.md", source: "English with café and Bézier.\n" },
    { relative: "presentation/vi/slide.md", source: "N\u1ed9i dung thuy\u1ebft tr\u00ecnh ti\u1ebfng Vi\u1ec7t.\n" },
    { relative: "presentation/preview.html", source: "<p>N\u1ed9i dung thuy\u1ebft tr\u00ecnh ti\u1ebfng Vi\u1ec7t.</p>\n" },
  ]), []);

  assert.deepEqual(checkRepositoryLanguageEntries([
    { relative: "docs/example.md", source: "English first.\nKh\u00f4ng \u0111\u01b0\u1ee3c ghi ti\u1ebfng Vi\u1ec7t.\n" },
  ]), [{
    code: "CONTRACT-NON-ENGLISH",
    message: "docs/example.md:2 contains Vietnamese text",
  }]);

  assert.deepEqual(checkRepositoryLanguageEntries([
    { relative: "vendor/example.md", source: "Kh\u00f4ng \u0111\u01b0\u1ee3c ghi ti\u1ebfng Vi\u1ec7t.\n" },
  ]), []);

  assert.deepEqual(checkRepositoryLanguageEntries([
    { relative: "presentation/preview-copy.html", source: "N\u1ed9i dung thuy\u1ebft tr\u00ecnh ti\u1ebfng Vi\u1ec7t.\n" },
  ]), [{
    code: "CONTRACT-NON-ENGLISH",
    message: "presentation/preview-copy.html:1 contains Vietnamese text",
  }]);
});

test("[AB-DOC-006] current authority rejects old routes while source text is ignored", () => {
  assert.deepEqual(checkCurrentDocumentationPathEntries([
    { relative: "docs/README.md", source: "Read docs/design/README.md.\n" },
  ]), [{
    code: "CONTRACT-OBSOLETE-DOC-ROUTE",
    message: "docs/README.md references a compatibility-only documentation path",
  }]);

  assert.deepEqual(checkCurrentDocumentationPathEntries([
    { relative: "src/example.ts", source: "const route = 'docs/present/example.md';\n" },
  ]), []);
});
