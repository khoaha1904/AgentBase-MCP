import assert from "node:assert/strict";
import test from "node:test";

import { deriveReleaseEvidence, expandRequirementReference } from "./check-release-evidence.mjs";

test("[AB-RELEASE-CI-003..004][AB-RELEASE-CI-012] derives active coverage from contracts and compact test-title references", () => {
  assert.deepEqual(expandRequirementReference("AB-EXAMPLE-008..010"), [
    "AB-EXAMPLE-008",
    "AB-EXAMPLE-009",
    "AB-EXAMPLE-010",
  ]);
  const result = deriveReleaseEvidence({
    requirementEntries: [
      {
        relative: "active-requirements.md",
        source: "> Release evidence: Required\n\n- **AB-EXAMPLE-001** — First.\n- **AB-EXAMPLE-002** — Second.\n",
      },
      {
        relative: "inactive-requirements.md",
        source: "- **AB-INACTIVE-001** — Not released.\n",
      },
    ],
    testEntries: [{
      relative: "behavior.test.mjs",
      source: "test(\"[AB-EXAMPLE-001..002] verifies behavior\", () => {});\n",
    }],
  });
  assert.deepEqual(result, { activeRequirements: 2, referencedRequirements: 2, testFiles: 1, errors: [] });
});

test("[AB-RELEASE-CI-004][AB-RELEASE-CI-012] rejects duplicate, missing and unknown release evidence", () => {
  const result = deriveReleaseEvidence({
    requirementEntries: [
      {
        relative: "first-requirements.md",
        source: "> Release evidence: Required\n\n- **AB-EXAMPLE-001** — First.\n- **AB-EXAMPLE-002** — Missing.\n",
      },
      {
        relative: "second-requirements.md",
        source: "> Release evidence: Required\n\n- **AB-EXAMPLE-001** — Duplicate.\n",
      },
    ],
    testEntries: [{
      relative: "behavior.test.ts",
      source: "test(\"[AB-EXAMPLE-001][AB-EXAMPLE-999] verifies one behavior\", () => {});\n",
    }],
  });
  assert.deepEqual(result.errors, [
    {
      code: "RELEASE-EVIDENCE-DUPLICATE",
      message: "AB-EXAMPLE-001 is active in both first-requirements.md and second-requirements.md",
    },
    {
      code: "RELEASE-EVIDENCE-UNKNOWN",
      message: "AB-EXAMPLE-999 is referenced by a test but has no Capability Contract definition",
    },
    {
      code: "RELEASE-EVIDENCE-MISSING",
      message: "AB-EXAMPLE-002 from first-requirements.md has no requirement-linked test",
    },
  ]);
});
