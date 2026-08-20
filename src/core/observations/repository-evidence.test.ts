import assert from "node:assert/strict";
import test from "node:test";

import {
  EvidenceValidationError,
  createRepositoryEvidenceBundle,
  type RepositoryEvidenceBundleInput,
} from "./index.ts";

function evidenceFixture(): RepositoryEvidenceBundleInput {
  return {
    formatVersion: 1,
    engine: {
      provider: "codebase-memory-mcp",
      packageName: "codebase-memory-mcp",
      providerVersion: "0.10.1",
      packageIntegrity: "sha512-package",
      executableSha256: "3380cf3b868d749c63f564e7c6b81381a140942ec42253f785e158ab5144064f",
      adapterVersion: 1,
      invocationMode: "one-shot-cli",
    },
    source: {
      repositoryId: "fixture:typescript-modular-monolith",
      displayName: "TypeScript Modular Monolith Fixture",
      identityHints: { remotes: [], rootCommits: [] },
      commit: "0123456789abcdef0123456789abcdef01234567",
      dirty: true,
      dirtyDigest: "sha256:dirty",
      capturedAt: "2026-08-12T02:00:00.000Z",
      limitations: [],
    },
    queries: [
      {
        queryId: "query:trace",
        kind: "trace",
        input: { functionName: "inspectWorkspace", direction: "outbound", depth: 1 },
        facts: [
          {
            id: "fact:workspace-call",
            statement: "inspectWorkspace calls resolveWorkspace at hop 1",
            sources: [{ path: "src/workspace/paths.ts", startLine: 3, endLine: 6 }],
          },
        ],
        sourceReferences: [{ path: "src/workspace/paths.ts", startLine: 3, endLine: 6 }],
        completeness: "complete",
        limitations: [],
      },
      {
        queryId: "query:search",
        kind: "search",
        input: { query: "inspectWorkspace", limit: 10 },
        facts: [
          {
            id: "fact:inspect-entry",
            statement: "inspectWorkspace is defined at lines 4-6",
            sources: [{ path: "src/app/inspect.ts", startLine: 4, endLine: 6 }],
          },
        ],
        sourceReferences: [{ path: "src/app/inspect.ts", startLine: 4, endLine: 6 }],
        completeness: "complete",
        limitations: [],
      },
    ],
    generatedAt: "2026-08-12T02:01:00.000Z",
  };
}

test("[AB-MVP-006] repository evidence has a deterministic digest and ordering", () => {
  const first = evidenceFixture();
  const second = { ...first, queries: [...first.queries].reverse() };
  const firstBundle = createRepositoryEvidenceBundle(first);
  const secondBundle = createRepositoryEvidenceBundle(second);
  assert.equal(firstBundle.bundleDigest, secondBundle.bundleDigest);
  assert.match(firstBundle.bundleDigest, /^sha256:[a-f0-9]{64}$/);
  assert.deepEqual(firstBundle.queries.map((query) => query.queryId), ["query:search", "query:trace"]);
});

test("[AB-MVP-006] repository evidence rejects machine-local and escaping paths", () => {
  for (const invalidPath of ["/home/user/repo/src/app.ts", "../secret", "src\\app.ts", "src/./app.ts"] as const) {
    const fixture = evidenceFixture();
    const query = fixture.queries[0];
    assert.ok(query);
    const sourceReferences = [{ path: invalidPath, startLine: 1, endLine: 1 }];
    assert.throws(
      () => createRepositoryEvidenceBundle({ ...fixture, queries: [{ ...query, sourceReferences }, ...fixture.queries.slice(1)] }),
      EvidenceValidationError,
    );
  }
});

test("[AB-MVP-006] dirty state requires a digest and clean state cannot claim one", () => {
  const fixture = evidenceFixture();
  assert.throws(
    () => createRepositoryEvidenceBundle({ ...fixture, source: { ...fixture.source, dirtyDigest: null } }),
    /dirty source state requires dirtyDigest/,
  );
  assert.throws(
    () => createRepositoryEvidenceBundle({ ...fixture, source: { ...fixture.source, dirty: false } }),
    /clean source state cannot carry dirtyDigest/,
  );
});

test("[AB-MVP-006] digest changes with source state or evidence content", () => {
  const fixture = evidenceFixture();
  const original = createRepositoryEvidenceBundle(fixture);
  const changedState = createRepositoryEvidenceBundle({
    ...fixture,
    source: { ...fixture.source, dirtyDigest: "sha256:different" },
  });
  const firstQuery = fixture.queries[0];
  assert.ok(firstQuery);
  const firstFact = firstQuery.facts[0];
  assert.ok(firstFact);
  const changedEvidence = createRepositoryEvidenceBundle({
    ...fixture,
    queries: [{ ...firstQuery, facts: [{ ...firstFact, statement: `${firstFact.statement}.` }] }, ...fixture.queries.slice(1)],
  });
  assert.notEqual(original.bundleDigest, changedState.bundleDigest);
  assert.notEqual(original.bundleDigest, changedEvidence.bundleDigest);
});
