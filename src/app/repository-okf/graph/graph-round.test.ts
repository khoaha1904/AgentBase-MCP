import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import type { TaskContextProvider } from "../../../core/code-intelligence/index.ts";
import type { EngineIdentity } from "../../../core/observations/index.ts";
import type { ManagedCodebaseMemoryProvider, ProviderCleanup } from "../../../providers/codebase-memory/index.ts";
import {
  GraphRoundError,
  runGraphRound,
} from "./graph-round.ts";

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-graph-round-"));
  fs.mkdirSync(path.join(root, "src", "app"), { recursive: true });
  fs.mkdirSync(path.join(root, "src", "catalog"), { recursive: true });
  fs.mkdirSync(path.join(root, "src", "workspace"), { recursive: true });
  fs.writeFileSync(path.join(root, "src", "app", "inspect.ts"), "inspectWorkspace();\n");
  fs.writeFileSync(path.join(root, "src", "catalog", "repository.ts"), "listModules();\n");
  fs.writeFileSync(path.join(root, "src", "workspace", "paths.ts"), "resolveWorkspace();\n");
  return { root, cleanup: () => fs.rmSync(root, { recursive: true, force: true }) };
}

function engine(invocationMode: EngineIdentity["invocationMode"]): EngineIdentity {
  return {
    provider: "codebase-memory-mcp",
    packageName: "codebase-memory-mcp",
    providerVersion: "0.10.1",
    packageIntegrity: "sha512-package",
    executableSha256: "3".repeat(64),
    adapterVersion: 1,
    invocationMode,
  };
}

function taskProvider(events: string[], completeness: "complete" | "partial" = "complete"): TaskContextProvider {
  return {
    async repositoryOverview(repositoryId) {
      events.push("overview");
      return {
        status: "found",
        overview: {
          repositoryId,
          summary: "fixture",
          languages: [{ name: "TypeScript", fileCount: 3 }],
          packages: ["app", "catalog", "workspace"],
          entryPoints: [],
          boundaries: [{ from: "app", to: "catalog", calls: 1 }],
          completeness,
          limitations: completeness === "partial" ? ["language coverage is partial"] : [],
        },
      };
    },
    async relevantContext(query) {
      events.push("context");
      return {
        status: "found",
        repositoryId: query.repositoryId,
        task: query.task,
        facts: [
          {
            id: "search:inspectWorkspace", kind: "search", statement: "inspectWorkspace entry",
            sources: [{ path: "src/app/inspect.ts", startLine: 1, endLine: 1 }], providerReferences: [],
          },
          {
            id: "trace:listModules", kind: "trace", statement: "calls listModules",
            sources: [{ path: "src/catalog/repository.ts", startLine: 1, endLine: 1 }], providerReferences: [],
          },
          {
            id: "trace:resolveWorkspace", kind: "trace", statement: "calls resolveWorkspace",
            sources: [{ path: "src/workspace/paths.ts", startLine: 1, endLine: 1 }], providerReferences: [],
          },
        ],
        completeness,
        limitations: completeness === "partial" ? ["language coverage is partial"] : [],
      };
    },
  };
}

function managed(
  events: string[],
  cleanup: ProviderCleanup = { status: "clean", pid: 42, graceful: true, forced: false, stderrBytes: 0 },
  completeness: "complete" | "partial" = "complete",
): ManagedCodebaseMemoryProvider {
  return {
    provider: taskProvider(events, completeness),
    identity: engine("scoped-session"),
    transport: "scoped-session",
    async indexRepository() { events.push("index"); },
    async close() { events.push("close"); return cleanup; },
  };
}


const query = {
  task: "Trace inspectWorkspace",
  focus: [{ search: "inspectWorkspace", trace: { functionName: "inspectWorkspace", direction: "outbound" as const, depth: 1 } }],
  maximumFiles: 3,
  maximumFacts: 5,
} as const;

function clock() {
  let value = 0;
  return () => { value += 10; return value; };
}

test("[AB-GRAPH-002][AB-GRAPH-006][AB-GRAPH-010] one graph round emits complete diagnostics outside the evidence digest", async () => {
  const current = fixture();
  const events: string[] = [];
  try {
    const result = await runGraphRound({ repositoryRoot: current.root, query, transport: "scoped-session" }, {
      createProvider: async () => managed(events),
      now: clock(),
    });
    assert.deepEqual(events, ["index", "overview", "context", "close"]);
    assert.equal(result.diagnostics.transport, "scoped-session");
    assert.deepEqual(result.diagnostics.factIds, [
      "architecture:boundary:app:catalog", "search:inspectWorkspace", "snippet:search:inspectWorkspace",
      "snippet:trace:listModules", "snippet:trace:resolveWorkspace", "trace:listModules", "trace:resolveWorkspace",
    ]);
    assert.deepEqual(result.diagnostics.sourcePaths, ["src/app/inspect.ts", "src/catalog/repository.ts", "src/workspace/paths.ts"]);
    assert.deepEqual(result.diagnostics.stages, { admissionMs: 10, indexMs: 10, queryMs: 20, cleanupMs: 10, totalMs: 110 });
    assert.equal(result.diagnostics.sourceUnchanged, true);
    assert.equal(result.diagnostics.processCleanup, "clean");
    assert.equal(JSON.stringify(result.evidence).includes("stages"), false);
  } finally {
    current.cleanup();
  }
});

test("[AB-INGEST-007] partial graph coverage preserves exact evidence and limitations", async () => {
  const current = fixture();
  try {
    const result = await runGraphRound({ repositoryRoot: current.root, query, transport: "scoped-session" }, {
      createProvider: async () => managed([], undefined, "partial"),
      now: clock(),
    });
    assert.equal(result.diagnostics.outcome, "partial");
    assert.deepEqual(result.diagnostics.limitations, ["language coverage is partial"]);
    assert.ok(result.evidence.queries.some((item) => item.completeness === "partial"));
  } finally { current.cleanup(); }
});

test("[AB-GRAPH-009][AB-GRAPH-011][AB-GRAPH-012] mutation and cleanup failure reject the whole round after close", async () => {
  const mutated = fixture();
  const mutationEvents: string[] = [];
  try {
    const mutating = managed(mutationEvents);
    await assert.rejects(runGraphRound({ repositoryRoot: mutated.root, query, transport: "scoped-session" }, {
      createProvider: async () => ({ ...mutating, async indexRepository() {
        mutationEvents.push("index");
        fs.writeFileSync(path.join(mutated.root, ".gitattributes"), "changed\n");
      } }),
      now: clock(),
    }), (error) => error instanceof GraphRoundError && error.code === "SOURCE_MUTATION" && error.evidence === undefined);
    assert.equal(mutationEvents.at(-1), "close");
  } finally {
    mutated.cleanup();
  }

  const unclean = fixture();
  const cleanupEvents: string[] = [];
  try {
    await assert.rejects(runGraphRound({ repositoryRoot: unclean.root, query, transport: "scoped-session" }, {
      createProvider: async () => managed(cleanupEvents, { status: "failed", pid: 42, graceful: false, forced: true, stderrBytes: 0 }),
      now: clock(),
    }), (error) => error instanceof GraphRoundError && error.code === "PROCESS_CLEANUP_FAILED" && error.evidence === undefined);
  } finally {
    unclean.cleanup();
  }
});

test("[AB-GRAPH-011] source drift during graph queries rejects finalized evidence after close", async () => {
  const current = fixture();
  const events: string[] = [];
  try {
    const base = managed(events);
    const provider: TaskContextProvider = {
      ...base.provider,
      async relevantContext(queryValue) {
        const result = await base.provider.relevantContext(queryValue);
        fs.writeFileSync(path.join(current.root, "src", "app", "inspect.ts"), "changed during query\n");
        return result;
      },
    };
    await assert.rejects(runGraphRound({ repositoryRoot: current.root, query, transport: "scoped-session" }, {
      createProvider: async () => ({ ...base, provider }),
      now: clock(),
    }), (error) => error instanceof GraphRoundError && error.code === "SOURCE_MUTATION");
    assert.equal(events.at(-1), "close");
  } finally {
    current.cleanup();
  }
});

test("[AB-GRAPH-009][AB-GRAPH-011] cleanup-time control mutation rejects finalized evidence", async () => {
  const current = fixture();
  const events: string[] = [];
  try {
    const base = managed(events);
    await assert.rejects(runGraphRound({ repositoryRoot: current.root, query, transport: "scoped-session" }, {
      createProvider: async () => ({
        ...base,
        async close() {
          const cleanup = await base.close();
          fs.mkdirSync(path.join(current.root, ".codebase-memory"));
          fs.writeFileSync(path.join(current.root, ".codebase-memory", "state"), "unexpected\n");
          return cleanup;
        },
      }),
      now: clock(),
    }), (error) => error instanceof GraphRoundError && error.code === "SOURCE_MUTATION");
    assert.equal(events.at(-1), "close");
  } finally {
    current.cleanup();
  }
});

test("[AB-GRAPH-012][AB-GRAPH-013] provider failure closes once and performs no hidden fallback", async () => {
  const current = fixture();
  const events: string[] = [];
  let factories = 0;
  try {
    await assert.rejects(runGraphRound({ repositoryRoot: current.root, query, transport: "scoped-session" }, {
      createProvider: async () => {
        factories += 1;
        const value = managed(events);
        return { ...value, async indexRepository() { events.push("index"); throw new Error("provider failed"); } };
      },
      now: clock(),
    }), (error) => error instanceof GraphRoundError && error.code === "PROVIDER_FAILED");
    assert.equal(factories, 1);
    assert.deepEqual(events, ["index", "close"]);
  } finally {
    current.cleanup();
  }
});
