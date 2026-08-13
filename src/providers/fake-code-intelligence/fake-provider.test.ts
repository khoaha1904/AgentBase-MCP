import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import { evaluateConformance, evaluateTaskContextConformance, stableSerialize } from "../../core/code-intelligence/index.ts";
import { createFixtureFakeProvider, fixtureExpectation, fixtureTaskContextExpectation } from "./index.ts";

const manifest = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, "../../../fixtures/typescript-modular-monolith/fixture.json"), "utf8"));

test("[AB-FND-004][AB-FND-006] returns a complete map for all 12 authored fixture files", async () => {
  const provider = createFixtureFakeProvider();
  const result = await provider.repositoryMap(manifest.repository.repositoryId);
  assert.equal(result.status, "found");
  if (result.status !== "found") return;
  const files = new Set(result.map.nodes.filter((node) => node.kind === "file").map((node) => node.file));
  assert.equal(files.size, 12);
  assert.deepEqual([...files].sort(), manifest.authoredFiles);
  assert.equal((await provider.repositoryMap("missing-repository")).status, "repository-not-found");
});

test("[AB-FND-007][AB-FND-008][AB-FND-017] passes reusable conformance and the three-file quality boundary", async () => {
  const report = await evaluateConformance(createFixtureFakeProvider(), fixtureExpectation);
  assert.equal(report.passed, true, report.failures.join("\n"));
  assert.equal(report.distinctFiles, 3);
  assert.equal(new Set(report.serializations).size, 1);
  assert.equal(report.serializations.length, 5);
});

test("[AB-FND-009] distinguishes missing snapshots, unknown subjects, isolated subjects and invalid queries", async () => {
  const provider = createFixtureFakeProvider();
  assert.equal((await provider.relevantNeighborhood({ snapshotId: "missing", subjectId: "node", maxDepth: 1 })).status, "snapshot-not-found");
  assert.equal((await provider.relevantNeighborhood({ snapshotId: manifest.repository.snapshotId, subjectId: "missing", maxDepth: 1 })).status, "subject-not-found");
  const isolated = await provider.relevantNeighborhood({ snapshotId: manifest.repository.snapshotId, subjectId: manifest.isolatedSubjectId, maxDepth: 1 });
  assert.equal(isolated.status, "found");
  if (isolated.status === "found") {
    assert.equal(isolated.nodes.length, 1);
    assert.equal(isolated.edges.length, 0);
  }
  const invalid = await provider.relevantNeighborhood({
    snapshotId: manifest.repository.snapshotId,
    subjectId: manifest.acceptedQuery.subjectId,
    maxDepth: -1,
  });
  assert.equal(invalid.status, "invalid-query");
});

test("[AB-FND-009] applies depth zero and relationship-kind filters deterministically", async () => {
  const provider = createFixtureFakeProvider();
  const query = {
    snapshotId: manifest.repository.snapshotId,
    subjectId: manifest.acceptedQuery.subjectId,
    maxDepth: 0,
  } as const;
  const depthZero = await provider.relevantNeighborhood(query);
  assert.equal(depthZero.status, "found");
  if (depthZero.status === "found") {
    assert.deepEqual(depthZero.nodes.map((node) => node.id), [query.subjectId]);
    assert.deepEqual(depthZero.edges, []);
  }

  const callsOnly = await provider.relevantNeighborhood({ ...query, maxDepth: 1, relationshipKinds: ["calls"] });
  assert.equal(callsOnly.status, "found");
  if (callsOnly.status === "found") {
    assert.equal(callsOnly.edges.length, 2);
    assert.ok(callsOnly.edges.every((edge) => edge.kind === "calls"));
    assert.equal(new Set(callsOnly.nodes.map((node) => node.file)).size, 3);
  }
});

test("[AB-FND-008] map and neighborhood values have stable normalized serialization", async () => {
  const provider = createFixtureFakeProvider();
  const first = await provider.repositoryMap(manifest.repository.repositoryId);
  const second = await provider.repositoryMap(manifest.repository.repositoryId);
  assert.equal(stableSerialize(first), stableSerialize(second));
});

test("[AB-MVP-004..007] fake provider matches captured task-context coverage within three files", async () => {
  const provider = createFixtureFakeProvider();
  const report = await evaluateTaskContextConformance(provider, fixtureTaskContextExpectation);
  assert.equal(report.passed, true, report.failures.join("\n"));
  assert.equal(report.distinctFiles, 3);
  assert.equal(report.missingFactIds.length, 0);
  assert.equal(new Set(report.serializations).size, 1);

  assert.equal((await provider.repositoryOverview("missing-repository")).status, "repository-not-found");
  assert.equal((await provider.relevantContext({ ...fixtureTaskContextExpectation.query, maximumFiles: 0 })).status, "invalid-query");
});
