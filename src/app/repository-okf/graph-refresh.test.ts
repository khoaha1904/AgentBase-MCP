import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import type { TaskContextProvider } from "../../core/code-intelligence/index.ts";
import type { EngineIdentity } from "../../core/observations/index.ts";
import type { ManagedCodebaseMemoryProvider, ProviderCleanup } from "../../providers/codebase-memory/index.ts";
import { GraphRoundError, runGraphRound, type GraphFreshnessLocation } from "./graph-round.ts";

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-graph-refresh-"));
  fs.mkdirSync(path.join(root, "src", "app"), { recursive: true });
  fs.mkdirSync(path.join(root, "src", "catalog"), { recursive: true });
  fs.mkdirSync(path.join(root, "src", "workspace"), { recursive: true });
  fs.writeFileSync(path.join(root, "src", "app", "inspect.ts"), "inspectWorkspace();\n");
  fs.writeFileSync(path.join(root, "src", "catalog", "repository.ts"), "listModules();\n");
  fs.writeFileSync(path.join(root, "src", "workspace", "paths.ts"), "resolveWorkspace();\n");
  const metadata = `${root}-metadata`;
  fs.mkdirSync(metadata, { recursive: true, mode: 0o700 });
  const freshness = { receiptPath: path.join(metadata, "freshness.json"), namespaceId: "b".repeat(64) };
  return {
    root, freshness,
    cleanup: () => {
      fs.rmSync(metadata, { recursive: true, force: true });
      fs.rmSync(root, { recursive: true, force: true });
    },
  };
}

function engine(): EngineIdentity {
  return {
    provider: "codebase-memory-mcp", packageName: "codebase-memory-mcp", providerVersion: "0.10.1",
    packageIntegrity: "sha512-package", executableSha256: "3".repeat(64), adapterVersion: 1,
    invocationMode: "scoped-session",
  };
}

function taskProvider(events: string[]): TaskContextProvider {
  return {
    async repositoryOverview(repositoryId) {
      events.push("overview");
      return {
        status: "found",
        overview: {
          repositoryId, summary: "fixture", languages: [{ name: "TypeScript", fileCount: 3 }],
          packages: ["app", "catalog", "workspace"], entryPoints: [],
          boundaries: [{ from: "app", to: "catalog", calls: 1 }], completeness: "complete", limitations: [],
        },
      };
    },
    async relevantContext(query) {
      events.push("context");
      return {
        status: "found", repositoryId: query.repositoryId, task: query.task,
        facts: [{
          id: "search:inspectWorkspace", kind: "search", statement: "inspectWorkspace entry",
          sources: [{ path: "src/app/inspect.ts", startLine: 1, endLine: 1 }], providerReferences: [],
        }],
        completeness: "complete", limitations: [],
      };
    },
  };
}

function managed(
  events: string[],
  freshness: GraphFreshnessLocation,
  cleanup: ProviderCleanup = { status: "clean", pid: 42, graceful: true, forced: false, stderrBytes: 0 },
): ManagedCodebaseMemoryProvider & { freshness: GraphFreshnessLocation } {
  return {
    provider: taskProvider(events), identity: engine(), transport: "scoped-session", freshness,
    async indexRepository() { events.push("index"); },
    async close() { events.push("close"); return cleanup; },
  };
}

const query = {
  task: "Trace inspectWorkspace",
  focus: [{ search: "inspectWorkspace", trace: { functionName: "inspectWorkspace", direction: "outbound" as const, depth: 1 } }],
  maximumFiles: 3, maximumFacts: 5,
} as const;

test("[AB-REFRESH-004][AB-REFRESH-007][AB-REFRESH-010] exact accepted graph skips index and retains queries", async () => {
  const current = fixture();
  const firstEvents: string[] = [];
  const secondEvents: string[] = [];
  try {
    const first = await runGraphRound({ repositoryRoot: current.root, query, transport: "scoped-session" }, {
      createProvider: async () => managed(firstEvents, current.freshness),
      wallClock: () => "2026-08-12T00:00:00.000Z",
    });
    assert.deepEqual(firstEvents, ["index", "overview", "context", "close"]);
    assert.deepEqual(first.diagnostics.preparation, { mode: "refreshed", reason: "missing-receipt" });

    const second = await runGraphRound({ repositoryRoot: current.root, query, transport: "scoped-session" }, {
      createProvider: async () => managed(secondEvents, current.freshness),
      wallClock: () => "2026-08-12T00:01:00.000Z",
    });
    assert.deepEqual(secondEvents, ["overview", "context", "close"]);
    assert.deepEqual(second.diagnostics.preparation, { mode: "reused", reason: "exact-match" });
    assert.deepEqual(second.diagnostics.factIds, first.diagnostics.factIds);
    assert.deepEqual(second.diagnostics.sourcePaths, first.diagnostics.sourcePaths);
    assert.equal(second.diagnostics.stages.indexMs, 0);
    assert.equal(JSON.stringify(second.evidence).includes("preparation"), false);
    assert.equal(JSON.stringify(second.diagnostics).includes(current.freshness.receiptPath), false);
  } finally { current.cleanup(); }
});

test("[AB-REFRESH-005][AB-REFRESH-006] source change and forced refresh delegate exactly one index", async () => {
  const current = fixture();
  try {
    await runGraphRound({ repositoryRoot: current.root, query, transport: "scoped-session" }, {
      createProvider: async () => managed([], current.freshness), wallClock: () => "2026-08-12T00:00:00.000Z",
    });
    fs.writeFileSync(path.join(current.root, "src", "app", "inspect.ts"), "inspectWorkspace();\nchanged();\n");
    const changedEvents: string[] = [];
    const changed = await runGraphRound({ repositoryRoot: current.root, query, transport: "scoped-session" }, {
      createProvider: async () => managed(changedEvents, current.freshness),
      wallClock: () => "2026-08-12T00:01:00.000Z",
    });
    assert.equal(changedEvents.filter((event) => event === "index").length, 1);
    assert.deepEqual(changed.diagnostics.preparation, { mode: "refreshed", reason: "source-changed" });

    const forcedEvents: string[] = [];
    const forced = await runGraphRound({
      repositoryRoot: current.root, query, transport: "scoped-session", refresh: true,
    }, {
      createProvider: async () => managed(forcedEvents, current.freshness),
      wallClock: () => "2026-08-12T00:02:00.000Z",
    });
    assert.equal(forcedEvents.filter((event) => event === "index").length, 1);
    assert.deepEqual(forced.diagnostics.preparation, { mode: "refreshed", reason: "forced" });
  } finally { current.cleanup(); }
});

test("[AB-REFRESH-008][AB-REFRESH-009] failed reuse preserves receipt and does not retry index", async () => {
  const current = fixture();
  try {
    await runGraphRound({ repositoryRoot: current.root, query, transport: "scoped-session" }, {
      createProvider: async () => managed([], current.freshness), wallClock: () => "2026-08-12T00:00:00.000Z",
    });
    const accepted = fs.readFileSync(current.freshness.receiptPath);
    const events: string[] = [];
    const base = managed(events, current.freshness);
    await assert.rejects(runGraphRound({ repositoryRoot: current.root, query, transport: "scoped-session" }, {
      createProvider: async () => ({
        ...base,
        provider: {
          ...base.provider,
          async repositoryOverview() { events.push("overview"); throw new Error("cache unavailable"); },
        },
      }),
    }), (error) => error instanceof GraphRoundError
      && error.code === "PROVIDER_FAILED" && /--refresh/.test(error.message));
    assert.deepEqual(events, ["overview", "close"]);
    assert.deepEqual(fs.readFileSync(current.freshness.receiptPath), accepted);
  } finally { current.cleanup(); }
});

test("[AB-REFRESH-003][AB-REFRESH-005][AB-REFRESH-008] malformed state refreshes and failed refresh preserves bytes", async () => {
  const current = fixture();
  try {
    fs.writeFileSync(current.freshness.receiptPath, "malformed\n", { mode: 0o600 });
    const recoveredEvents: string[] = [];
    const recovered = await runGraphRound({ repositoryRoot: current.root, query, transport: "scoped-session" }, {
      createProvider: async () => managed(recoveredEvents, current.freshness),
      wallClock: () => "2026-08-12T00:00:00.000Z",
    });
    assert.deepEqual(recovered.diagnostics.preparation, { mode: "refreshed", reason: "missing-receipt" });
    const accepted = fs.readFileSync(current.freshness.receiptPath);
    fs.writeFileSync(path.join(current.root, "src", "app", "inspect.ts"), "changed();\n");
    const failedEvents: string[] = [];
    const failing = managed(failedEvents, current.freshness);
    await assert.rejects(runGraphRound({ repositoryRoot: current.root, query, transport: "scoped-session" }, {
      createProvider: async () => ({
        ...failing,
        async indexRepository() { failedEvents.push("index"); throw new Error("refresh failed"); },
      }),
    }), (error) => error instanceof GraphRoundError && error.code === "PROVIDER_FAILED");
    assert.deepEqual(failedEvents, ["index", "close"]);
    assert.deepEqual(fs.readFileSync(current.freshness.receiptPath), accepted);
  } finally { current.cleanup(); }
});

test("[AB-REFRESH-007][AB-REFRESH-008] receipt advances only after clean shutdown", async () => {
  const current = fixture();
  const events: string[] = [];
  try {
    const base = managed(events, current.freshness);
    await runGraphRound({ repositoryRoot: current.root, query, transport: "scoped-session" }, {
      createProvider: async () => ({
        ...base,
        async close() {
          assert.equal(fs.existsSync(current.freshness.receiptPath), false);
          return base.close();
        },
      }),
      wallClock: () => "2026-08-12T00:00:00.000Z",
    });
    const accepted = fs.readFileSync(current.freshness.receiptPath);
    await assert.rejects(runGraphRound({
      repositoryRoot: current.root, query, transport: "scoped-session", refresh: true,
    }, {
      createProvider: async () => managed(
        [], current.freshness,
        { status: "failed", pid: 42, graceful: false, forced: true, stderrBytes: 0 },
      ),
    }), (error) => error instanceof GraphRoundError && error.code === "PROCESS_CLEANUP_FAILED");
    assert.deepEqual(fs.readFileSync(current.freshness.receiptPath), accepted);
  } finally { current.cleanup(); }
});
