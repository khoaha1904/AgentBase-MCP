import assert from "node:assert/strict";
import test from "node:test";

import {
  checkArchitectureContractEntries,
  checkCurrentDocumentationPathEntries,
  checkImplementationPlanEntry,
  checkRepositoryLanguageEntries,
} from "./check-specs.mjs";

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
