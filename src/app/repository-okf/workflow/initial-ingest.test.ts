import assert from "node:assert/strict";
import test from "node:test";

import {
  claimInitialIngestRepair,
  initialIngestCoverage,
  validateInitialIngestOutcome,
  type InitialIngestOutcome,
} from "./initial-ingest.ts";

const repositoryId = `repository-source-${"a".repeat(12)}`;

test("[AB-INGEST-007][AB-INGEST-008] no-change and sparse partial proposal previews are valid outcomes", () => {
  assert.deepEqual(validateInitialIngestOutcome({
    kind: "no-change", sourceRepositoryId: repositoryId, coverage: initialIngestCoverage([]),
  }), { kind: "no-change", sourceRepositoryId: repositoryId, coverage: { partial: false, limitations: [] } });
  const preview: InitialIngestOutcome = {
    kind: "proposal-preview", sourceRepositoryId: repositoryId, proposalId: "b".repeat(24),
    diffDigest: `sha256:${"c".repeat(64)}`, coverage: initialIngestCoverage(["Python call graph is unsupported"]), repairs: 0,
  };
  assert.equal(validateInitialIngestOutcome(preview), preview);
  assert.equal(preview.kind === "proposal-preview" && preview.coverage.partial, true);
});

test("[AB-INGEST-007] Incomplete is distinct from a partial proposal and exposes no proposal identity", () => {
  const incomplete: InitialIngestOutcome = {
    kind: "incomplete", sourceRepositoryId: repositoryId, failedStage: "validate",
    diagnostic: "proposal integrity could not be established", retryable: true, repairs: 1,
  };
  assert.equal(validateInitialIngestOutcome(incomplete), incomplete);
  assert.equal("proposalId" in incomplete, false);
});

test("[AB-INGEST-003][AB-INGEST-007] exactly one automatic repair is allowed", () => {
  assert.equal(claimInitialIngestRepair(0), 1);
  assert.throws(() => claimInitialIngestRepair(1), /budget is exhausted; explicit retry is required/);
  assert.throws(() => validateInitialIngestOutcome({
    kind: "no-change", sourceRepositoryId: repositoryId,
    coverage: { partial: false, limitations: ["unsupported language"] },
  }), /partial exactly when limitations exist/);
});
