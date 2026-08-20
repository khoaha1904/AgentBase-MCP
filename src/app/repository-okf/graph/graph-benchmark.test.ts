import assert from "node:assert/strict";
import test from "node:test";

import type { EngineIdentity, RepositoryEvidenceBundle } from "../../../core/observations/index.ts";
import { CodebaseMemoryError } from "../../../providers/codebase-memory/index.ts";
import { benchmarkGraphLifecycle } from "./graph-benchmark.ts";
import { GraphRoundError, type GraphRoundDiagnostics, type GraphRoundResult } from "./graph-round.ts";

function engine(invocationMode: EngineIdentity["invocationMode"]): EngineIdentity {
  return {
    provider: "codebase-memory-mcp", packageName: "codebase-memory-mcp", providerVersion: "0.10.1",
    packageIntegrity: "sha512-package", executableSha256: "3".repeat(64), adapterVersion: 1,
    invocationMode,
  };
}

function benchmarkResult(
  transport: "one-shot" | "scoped-session",
  totalMs: number,
  facts = ["fact:a"],
  sourcePaths = ["src/a.ts"],
): GraphRoundResult {
  const diagnostics: GraphRoundDiagnostics = {
    transport,
    engine: engine(transport === "one-shot" ? "one-shot-cli" : "scoped-session"),
    source: {
      repositoryId: "repository-fixture-123456789abc", displayName: "fixture", commit: "a".repeat(40),
      dirty: false, dirtyDigest: null, capturedAt: "2026-08-12T00:00:00.000Z", limitations: [],
    },
    stages: { admissionMs: 1, indexMs: 2, queryMs: totalMs - 4, cleanupMs: 1, totalMs },
    factIds: facts, sourcePaths, sourceUnchanged: true, processCleanup: "clean",
    preparation: { mode: "refreshed", reason: "missing-receipt" },
    outcome: "complete", limitations: [],
  };
  const digit = transport === "one-shot" ? "1" : "2";
  const evidence = { bundleDigest: `sha256:${digit.repeat(64)}` } as RepositoryEvidenceBundle;
  return { evidence, diagnostics };
}

const acceptance = { criticalFacts: [{ exact: "fact:a" }], maximumSourceFiles: 1 } as const;

test("[AB-GRAPH-001..004] alternates order and promotes equivalent twofold-faster sessions", async () => {
  const calls: string[] = [];
  const totals = { "one-shot": [100, 120, 110], "scoped-session": [40, 50, 45] };
  const report = await benchmarkGraphLifecycle(async (transport, pair, order) => {
    calls.push(`${pair}:${order}:${transport}`);
    return benchmarkResult(transport, totals[transport].shift()!);
  }, acceptance);
  assert.deepEqual(calls, [
    "1:1:one-shot", "1:2:scoped-session", "2:1:scoped-session",
    "2:2:one-shot", "3:1:one-shot", "3:2:scoped-session",
  ]);
  assert.equal(report.oneShotMedianMs, 110);
  assert.equal(report.scopedSessionMedianMs, 45);
  assert.equal(report.speedRatio, 110 / 45);
  assert.equal(report.parity, true);
  assert.equal(report.promotionEligible, true);
});

test("[AB-GRAPH-003][AB-GRAPH-004] speed or normalized mismatch prevents promotion", async () => {
  const slow = await benchmarkGraphLifecycle(
    async (transport) => benchmarkResult(transport, transport === "one-shot" ? 100 : 60), acceptance,
  );
  assert.equal(slow.promotionEligible, false);
  assert.match(slow.limitations.join(" "), /speed/);

  const mismatch = await benchmarkGraphLifecycle(async (transport) => benchmarkResult(
    transport, 40, transport === "one-shot" ? ["fact:a"] : ["fact:b"],
  ), acceptance);
  assert.equal(mismatch.parity, false);
  assert.equal(mismatch.promotionEligible, false);
  assert.match(mismatch.limitations.join(" "), /parity/);
});

test("[AB-GRAPH-003] equal but incomplete or over-broad arms cannot pass parity", async () => {
  const incomplete = await benchmarkGraphLifecycle(
    async (transport) => benchmarkResult(transport, 40),
    { criticalFacts: [{ exact: "fact:required" }], maximumSourceFiles: 1 },
  );
  assert.equal(incomplete.parity, false);
  assert.match(incomplete.limitations.join(" "), /critical fact/);

  const overBroad = await benchmarkGraphLifecycle(
    async (transport) => benchmarkResult(transport, 40, ["fact:a"], ["src/a.ts", "src/b.ts"]), acceptance,
  );
  assert.equal(overBroad.parity, false);
  assert.match(overBroad.limitations.join(" "), /source-file/);
});

test("[AB-GRAPH-002][AB-GRAPH-012] records typed failure and continues without partial evidence", async () => {
  const calls: string[] = [];
  const report = await benchmarkGraphLifecycle(async (transport, pair, order) => {
    calls.push(`${pair}:${order}:${transport}`);
    if (pair === 1 && transport === "scoped-session") {
      throw new GraphRoundError("PROVIDER_FAILED", "session tool failed", {
        cause: new CodebaseMemoryError("SESSION_TOOL_FAILED", "search_graph", "tool failed"),
      });
    }
    return benchmarkResult(transport, transport === "one-shot" ? 100 : 40);
  }, acceptance);
  assert.equal(calls.length, 6);
  const failed = report.arms.find((arm) => arm.outcome === "failed");
  assert.deepEqual(failed, {
    pair: 1, order: 2, transport: "scoped-session", outcome: "failed",
    failure: { code: "SESSION_TOOL_FAILED" },
  });
  assert.equal("evidenceDigest" in failed!, false);
  assert.equal(report.scopedSessionMedianMs, null);
  assert.equal(report.speedRatio, null);
  assert.equal(report.parity, false);
  assert.equal(report.promotionEligible, false);
});
