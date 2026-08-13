import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import type { TaskContextProvider } from "../../core/code-intelligence/index.ts";
import type { EngineIdentity } from "../../core/observations/index.ts";
import { prepareRepositoryEvidence } from "./prepare-evidence.ts";

const engine: EngineIdentity = {
  provider: "codebase-memory-mcp",
  packageName: "codebase-memory-mcp",
  providerVersion: "0.10.1",
  packageIntegrity: "sha512-package",
  executableSha256: "3380cf3b868d749c63f564e7c6b81381a140942ec42253f785e158ab5144064f",
  adapterVersion: 1,
  invocationMode: "one-shot-cli",
};

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-evidence-app-"));
  fs.mkdirSync(path.join(root, "src", "app"), { recursive: true });
  fs.mkdirSync(path.join(root, "src", "catalog"), { recursive: true });
  fs.mkdirSync(path.join(root, "src", "workspace"), { recursive: true });
  fs.writeFileSync(path.join(root, "src", "app", "inspect.ts"), "inspectWorkspace();\n");
  fs.writeFileSync(path.join(root, "src", "catalog", "repository.ts"), "listModules();\n");
  fs.writeFileSync(path.join(root, "src", "workspace", "paths.ts"), "resolveWorkspace();\n");
  return { root, cleanup: () => fs.rmSync(root, { recursive: true, force: true }) };
}

function provider(events: string[]): TaskContextProvider {
  return {
    async repositoryOverview(repositoryId) {
      events.push("overview");
      return {
        status: "found",
        overview: {
          repositoryId,
          summary: "TypeScript repository with app, catalog and workspace packages.",
          languages: [{ name: "TypeScript", fileCount: 3 }],
          packages: ["app", "catalog", "workspace"],
          entryPoints: [],
          boundaries: [{ from: "app", to: "catalog", calls: 1 }, { from: "app", to: "workspace", calls: 1 }],
          completeness: "complete",
          limitations: [],
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
            id: "search:fixture.inspectWorkspace",
            kind: "search",
            statement: "inspectWorkspace is an entry point",
            sources: [{ path: "src/app/inspect.ts", startLine: 1, endLine: 1 }],
            providerReferences: ["search:fixture.inspectWorkspace"],
          },
          {
            id: "trace:inspectWorkspace:fixture.listModules",
            kind: "trace",
            statement: "inspectWorkspace calls listModules",
            sources: [{ path: "src/catalog/repository.ts", startLine: 1, endLine: 1 }],
            providerReferences: ["trace:fixture.listModules"],
          },
          {
            id: "trace:inspectWorkspace:fixture.resolveWorkspace",
            kind: "trace",
            statement: "inspectWorkspace calls resolveWorkspace",
            sources: [{ path: "src/workspace/paths.ts", startLine: 1, endLine: 1 }],
            providerReferences: ["trace:fixture.resolveWorkspace"],
          },
        ],
        completeness: "complete",
        limitations: [],
      };
    },
  };
}

const task = {
  task: "Trace inspectWorkspace",
  focus: [{ search: "inspectWorkspace", trace: { functionName: "inspectWorkspace", direction: "outbound" as const, depth: 1 } }],
  maximumFiles: 3,
  maximumFacts: 5,
} as const;

test("[AB-MVP-006] prepares one deterministic local evidence bundle after indexing", async () => {
  const current = fixture();
  const events: string[] = [];
  try {
    const times = ["2026-08-12T04:00:00.000Z", "2026-08-12T04:01:00.000Z"];
    const bundle = await prepareRepositoryEvidence(current.root, task, {
      provider: provider(events),
      engine,
      async indexRepository() { events.push("index"); },
      now: () => times.shift() ?? "2026-08-12T04:01:00.000Z",
    });
    assert.deepEqual(events, ["index", "overview", "context"]);
    assert.deepEqual(bundle.queries.map((query) => query.kind), ["architecture", "search", "snippet", "trace"]);
    assert.match(bundle.bundleDigest, /^sha256:[a-f0-9]{64}$/);
    assert.equal(bundle.queries.flatMap((query) => query.sourceReferences).length, 6);
    assert.equal(JSON.stringify(bundle).includes(current.root), false);
  } finally {
    current.cleanup();
  }
});

test("[AB-MVP-003][AB-MVP-006] rejects provider indexing that changes repository control files", async () => {
  const current = fixture();
  try {
    await assert.rejects(prepareRepositoryEvidence(current.root, task, {
      provider: provider([]),
      engine,
      async indexRepository() { fs.writeFileSync(path.join(current.root, ".gitattributes"), "provider mutation\n"); },
      now: () => "2026-08-12T04:00:00.000Z",
    }), /changed repository source/);
  } finally {
    current.cleanup();
  }
});
