import assert from "node:assert/strict";
import test from "node:test";

import {
  ContractValidationError,
  evaluateConformance,
  evaluateTaskContextConformance,
  normalizeNeighborhood,
  normalizeRepositoryMap,
  normalizeRepositoryOverview,
  normalizeTaskContext,
  stableSerialize,
  validateNeighborhoodQuery,
  type NeighborhoodFound,
  type CodeIntelligenceProvider,
  type ConformanceExpectation,
  type RepositoryMap,
  type RepositoryOverview,
  type TaskContextFound,
  type TaskContextProvider,
} from "./index.ts";

function mapFixture(): RepositoryMap {
  return {
    repository: {
      repositoryId: "repository:1",
      displayName: "Repository One",
      revision: "revision:1",
    },
    snapshot: {
      snapshotId: "snapshot:1",
      repositoryId: "repository:1",
      revision: "revision:1",
      completeness: "complete",
      limitations: [],
    },
    nodes: [
      { id: "node:b", kind: "symbol", name: "b", file: "src/b.ts" },
      { id: "node:a", kind: "symbol", name: "a", file: "src/a.ts" },
    ],
    edges: [
      { id: "edge:1", kind: "calls", source: "node:a", target: "node:b", evidenceFile: "src/a.ts" },
    ],
    diagnostics: [],
  };
}

test("[AB-FND-008][AB-FND-016] normalizes provider-neutral maps deterministically", () => {
  const normalized = normalizeRepositoryMap(mapFixture());
  assert.deepEqual(normalized.nodes.map((node) => node.id), ["node:a", "node:b"]);
  assert.equal(stableSerialize(normalized), stableSerialize(normalizeRepositoryMap(mapFixture())));
});

test("[AB-FND-009][AB-FND-018] rejects duplicate IDs, dangling edges and escaping paths", () => {
  const current = mapFixture();
  const firstNode = current.nodes[0];
  const firstEdge = current.edges[0];
  assert.ok(firstNode);
  assert.ok(firstEdge);
  const duplicate: RepositoryMap = { ...current, nodes: [firstNode, firstNode] };
  assert.throws(() => normalizeRepositoryMap(duplicate), ContractValidationError);

  const duplicateEdge: RepositoryMap = { ...current, edges: [firstEdge, firstEdge] };
  assert.throws(() => normalizeRepositoryMap(duplicateEdge), /duplicate edge id/);

  const dangling: RepositoryMap = { ...current, edges: [{ ...firstEdge, target: "node:missing" }] };
  assert.throws(() => normalizeRepositoryMap(dangling), /unknown target/);

  const escaping: RepositoryMap = { ...current, nodes: [{ ...firstNode, file: "../secret.ts" }] };
  assert.throws(() => normalizeRepositoryMap(escaping), /repository-relative/);
});

test("[AB-FND-009] accepts a complete empty repository map", () => {
  const empty = normalizeRepositoryMap({ ...mapFixture(), nodes: [], edges: [] });
  assert.equal(empty.snapshot.completeness, "complete");
  assert.deepEqual(empty.nodes, []);
  assert.deepEqual(empty.edges, []);
});

test("[AB-FND-009] validates bounded neighborhood queries", () => {
  assert.deepEqual(validateNeighborhoodQuery({ snapshotId: "snapshot:1", subjectId: "node:a", maxDepth: 1 }), { valid: true });
  const invalidDepth = validateNeighborhoodQuery({ snapshotId: "snapshot:1", subjectId: "node:a", maxDepth: -1 });
  const invalidSnapshot = validateNeighborhoodQuery({ snapshotId: "", subjectId: "node:a", maxDepth: 1 });
  assert.equal(invalidDepth.valid, false);
  assert.equal(invalidSnapshot.valid, false);
  if (!invalidDepth.valid) assert.match(invalidDepth.message, /maxDepth/);
  if (!invalidSnapshot.valid) assert.match(invalidSnapshot.message, /snapshotId/);
});

test("[AB-FND-008] normalizes neighborhoods independently of insertion order", () => {
  const map = mapFixture();
  const input: NeighborhoodFound = {
    status: "found",
    snapshot: map.snapshot,
    subjectId: "node:a",
    completeness: "complete",
    nodes: map.nodes,
    edges: map.edges,
    diagnostics: [],
  };
  const reversed = { ...input, nodes: [...input.nodes].reverse(), edges: [...input.edges].reverse() };
  assert.equal(stableSerialize(normalizeNeighborhood(input)), stableSerialize(normalizeNeighborhood(reversed)));
});

test("[AB-FND-005][AB-FND-017] conformance rejects partial fixture results", async () => {
  const current = mapFixture();
  const partialMap: RepositoryMap = {
    ...current,
    snapshot: { ...current.snapshot, completeness: "partial" },
  };
  const subjectNode = current.nodes.find((node) => node.id === "node:a");
  assert.ok(subjectNode);
  const partialNeighborhood: NeighborhoodFound = {
    status: "found",
    snapshot: partialMap.snapshot,
    subjectId: "node:a",
    completeness: "partial",
    nodes: [subjectNode],
    edges: [],
    diagnostics: ["fixture partial"],
  };
  const provider: CodeIntelligenceProvider = {
    async repositoryMap() { return { status: "found", map: partialMap }; },
    async relevantNeighborhood() { return partialNeighborhood; },
  };
  const expectation: ConformanceExpectation = {
    repositoryId: current.repository.repositoryId,
    query: { snapshotId: current.snapshot.snapshotId, subjectId: "node:a", maxDepth: 1 },
    expectedNodeIds: ["node:a"],
    expectedEdgeIds: [],
    maximumFiles: 1,
    runs: 1,
  };
  const report = await evaluateConformance(provider, expectation);
  assert.equal(report.passed, false);
  assert.ok(report.failures.some((failure) => failure.includes("repository map is partial")));
  assert.ok(report.failures.some((failure) => failure.includes("neighborhood run 1 is partial")));
});

function overviewFixture(): RepositoryOverview {
  return {
    repositoryId: "fixture:typescript-modular-monolith",
    summary: "TypeScript repository with app, catalog and workspace packages.",
    languages: [{ name: "TypeScript", fileCount: 12 }],
    packages: ["workspace", "catalog", "app"],
    entryPoints: [
      { qualifiedName: "fixture.src.app.inspect.inspectWorkspace", path: "src/app/inspect.ts", startLine: 4, endLine: 6 },
    ],
    boundaries: [
      { from: "app", to: "workspace", calls: 1 },
      { from: "app", to: "catalog", calls: 1 },
    ],
    completeness: "complete",
    limitations: ["architecture is provider-derived"],
  };
}

function taskContextFixture(): TaskContextFound {
  return {
    status: "found",
    repositoryId: "fixture:typescript-modular-monolith",
    task: "Trace inspectWorkspace across public boundaries",
    facts: [
      {
        id: "fact:workspace-call",
        kind: "trace",
        statement: "inspectWorkspace calls resolveWorkspace at hop 1",
        sources: [{ path: "src/workspace/paths.ts", startLine: 3, endLine: 6 }],
        providerReferences: ["trace:inspectWorkspace:resolveWorkspace", "snippet:resolveWorkspace"],
      },
      {
        id: "fact:catalog-call",
        kind: "trace",
        statement: "inspectWorkspace calls listModules at hop 1",
        sources: [{ path: "src/catalog/repository.ts", startLine: 3, endLine: 5 }],
        providerReferences: ["snippet:listModules", "trace:inspectWorkspace:listModules"],
      },
      {
        id: "fact:inspect-entry",
        kind: "search",
        statement: "inspectWorkspace is defined at lines 4-6",
        sources: [{ path: "src/app/inspect.ts", startLine: 4, endLine: 6 }],
        providerReferences: ["search:inspectWorkspace", "snippet:inspectWorkspace"],
      },
    ],
    completeness: "complete",
    limitations: [],
  };
}

test("[AB-MVP-004][AB-MVP-005] normalizes the captured architecture and bounded task context", () => {
  const overview = normalizeRepositoryOverview(overviewFixture());
  assert.deepEqual(overview.packages, ["app", "catalog", "workspace"]);
  assert.deepEqual(overview.boundaries.map(({ from, to }) => `${from}->${to}`), ["app->catalog", "app->workspace"]);

  const context = normalizeTaskContext(taskContextFixture(), { maximumFiles: 3, maximumFacts: 5 });
  assert.deepEqual(context.facts.map((fact) => fact.id), ["fact:catalog-call", "fact:inspect-entry", "fact:workspace-call"]);
  assert.equal(new Set(context.facts.flatMap((fact) => fact.sources.map((source) => source.path))).size, 3);
});

test("[AB-MVP-006] rejects absolute, escaping and invalid source spans", () => {
  const current = taskContextFixture();
  for (const source of [
    { path: "/tmp/repo/src/app/inspect.ts", startLine: 4, endLine: 6 },
    { path: "../secret.ts", startLine: 1, endLine: 1 },
    { path: "src/app/inspect.ts", startLine: 6, endLine: 4 },
  ]) {
    const facts = current.facts.map((fact, index) => index === 0 ? { ...fact, sources: [source] } : fact);
    assert.throws(() => normalizeTaskContext({ ...current, facts }, { maximumFiles: 3, maximumFacts: 5 }), ContractValidationError);
  }
});

test("[AB-MVP-005][AB-MVP-007] reusable task-context conformance enforces coverage, bounds and determinism", async () => {
  const overview = overviewFixture();
  const context = taskContextFixture();
  const provider: TaskContextProvider = {
    async repositoryOverview(repositoryId) {
      return repositoryId === overview.repositoryId
        ? { status: "found", overview }
        : { status: "repository-not-found", repositoryId };
    },
    async relevantContext(query) {
      return query.repositoryId === context.repositoryId
        ? context
        : { status: "repository-not-found", repositoryId: query.repositoryId };
    },
  };
  const report = await evaluateTaskContextConformance(provider, {
    query: {
      repositoryId: context.repositoryId,
      task: context.task,
      focus: [{ search: "inspectWorkspace", trace: { functionName: "inspectWorkspace", direction: "outbound", depth: 1 } }],
      maximumFiles: 3,
      maximumFacts: 5,
    },
    expectedFactIds: context.facts.map((fact) => fact.id),
    runs: 3,
  });
  assert.equal(report.passed, true, report.failures.join("\n"));
  assert.equal(report.distinctFiles, 3);
  assert.equal(new Set(report.serializations).size, 1);
});
