import assert from "node:assert/strict";
import test from "node:test";

import { observationFactCount, scoreClaims } from "./benchmark-okf.mjs";

test("OKF benchmark counts normalized facts across queries", () => {
  assert.equal(observationFactCount({ queries: [{ facts: [{ id: "a" }] }, { facts: [{ id: "b" }, { id: "c" }] }] }), 3);
  assert.equal(observationFactCount({ queries: [] }), 0);
});

test("OKF benchmark separates semantic coverage from observation-backed coverage", () => {
  const entry = { expectedClaims: [{ id: "a" }, { id: "b" }] };
  const claims = { claims: [
    { id: "a", status: "supported", concept: "concepts/a", evidence: "observation" },
    { id: "b", status: "supported", concept: "concepts/b", evidence: "direct-source" },
  ] };
  const bundle = { concepts: new Map([["concepts/a", {}], ["concepts/b", {}]]) };
  assert.deepEqual(scoreClaims(entry, claims, bundle, true), {
    expectedClaims: 2,
    supportedClaims: 2,
    missingClaims: 0,
    incorrectClaims: 0,
    semanticCoveragePercent: 100,
    observationBackedCoveragePercent: 50,
    failures: [],
  });
});
