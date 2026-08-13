import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import { evaluateTaskContextConformance } from "../../core/code-intelligence/index.ts";
import { CodebaseMemoryAdapter, indexRepository, type ProviderInvoker } from "./adapter.ts";
import { CodebaseMemoryError } from "./errors.ts";
import { parseSearch } from "./response-parser.ts";

const repositoryRoot = path.resolve(import.meta.dirname, "../../../fixtures/typescript-modular-monolith");
const responseRoot = path.resolve(import.meta.dirname, "../../../fixtures/codebase-memory-v0.10.1/responses");
const accepted = JSON.parse(fs.readFileSync(path.resolve(responseRoot, "../fixture.json"), "utf8"));

function response(name: string): unknown {
  return JSON.parse(fs.readFileSync(path.join(responseRoot, name), "utf8")) as unknown;
}

function capturedInvoker(overrides: Readonly<Record<string, unknown>> = {}): ProviderInvoker {
  return async (tool, argumentsValue) => {
    if (tool in overrides) return overrides[tool];
    if (tool === "get_architecture") return response("architecture.json");
    if (tool === "search_graph") return response("search-inspect-workspace.json");
    if (tool === "trace_path") return response("trace-inspect-workspace.json");
    if (tool === "get_code_snippet") {
      const qualifiedName = String(argumentsValue.qualified_name);
      if (qualifiedName.endsWith("inspectWorkspace")) return response("snippet-inspect-workspace.json");
      if (qualifiedName.endsWith("resolveWorkspace")) return response("snippet-resolve-workspace.json");
      if (qualifiedName.endsWith("listModules")) return response("snippet-list-modules.json");
    }
    if (tool === "index_repository") return response("index.json");
    throw new Error(`unexpected captured invocation: ${tool}`);
  };
}

test("[AB-MVP-004][AB-MVP-005] requests all architecture aspects so boundaries are not summary-dependent", async () => {
  let architectureArguments: Readonly<Record<string, unknown>> | undefined;
  const invoke: ProviderInvoker = async (tool, argumentsValue) => {
    if (tool === "get_architecture") architectureArguments = argumentsValue;
    return capturedInvoker()(tool, argumentsValue);
  };
  await adapter(invoke).repositoryOverview(taskQuery.repositoryId);
  assert.deepEqual(architectureArguments, { project: "agentbase-typescript-fixture", aspects: ["all"] });
});

function adapter(invoke = capturedInvoker()): CodebaseMemoryAdapter {
  return new CodebaseMemoryAdapter({
    repositoryId: "fixture:typescript-modular-monolith",
    repositoryRoot,
    project: "agentbase-typescript-fixture",
    invoke,
  });
}

const taskQuery = {
  repositoryId: "fixture:typescript-modular-monolith",
  task: accepted.acceptedTask.task as string,
  focus: [{ search: "inspectWorkspace", trace: { functionName: "inspectWorkspace", direction: "outbound" as const, depth: 1 } }],
  maximumFiles: 3,
  maximumFacts: 5,
} as const;

test("[AB-MVP-004][AB-MVP-005] maps captured v0.10.1 architecture text into a provider-neutral overview", async () => {
  const result = await adapter().repositoryOverview(taskQuery.repositoryId);
  assert.equal(result.status, "found");
  if (result.status !== "found") return;
  assert.deepEqual(result.overview.languages, [{ name: "TypeScript", fileCount: 12 }]);
  assert.deepEqual(result.overview.packages, ["app", "catalog", "workspace"]);
  assert.deepEqual(result.overview.boundaries.map(({ from, to }) => `${from}->${to}`), ["app->catalog", "app->workspace"]);
  assert.equal(result.overview.entryPoints.length, 6);
});

test("[AB-MVP-004..007] captured adapter finds all manifest facts in exactly three source files", async () => {
  const report = await evaluateTaskContextConformance(adapter(), {
    query: taskQuery,
    expectedFactIds: accepted.acceptedTask.criticalFacts.map((fact: { id: string }) => fact.id),
    runs: 3,
  });
  assert.equal(report.passed, true, report.failures.join("\n"));
  assert.equal(report.distinctFiles, 3);
  assert.deepEqual(report.missingFactIds, []);
  assert.equal(new Set(report.serializations).size, 1);
});

test("[AB-MVP-005] applies requested fact bounds visibly", async () => {
  const result = await adapter().relevantContext({ ...taskQuery, maximumFacts: 3 });
  assert.equal(result.status, "found");
  if (result.status !== "found") return;
  assert.equal(result.facts.length, 3);
  assert.equal(result.completeness, "partial");
  assert.match(result.limitations.join(" "), /truncated/);
});

test("[AB-MVP-004][AB-MVP-007] rejects malformed row models and unsafe snippet paths", async () => {
  const malformed = response("search-inspect-workspace.json") as { structuredContent: { rows: unknown[][] } };
  malformed.structuredContent.rows[0]?.pop();
  assert.throws(() => parseSearch(malformed), (error) => error instanceof CodebaseMemoryError && error.code === "PROVIDER_MALFORMED_OUTPUT");

  const unsafeSnippet = response("snippet-inspect-workspace.json") as { file_path: string };
  unsafeSnippet.file_path = "/outside/repository/inspect.ts";
  await assert.rejects(
    adapter(capturedInvoker({ get_code_snippet: unsafeSnippet })).relevantContext(taskQuery),
    (error) => error instanceof CodebaseMemoryError && error.code === "UNSAFE_SOURCE_PATH",
  );
});

test("[AB-MVP-003][AB-MVP-004] indexing uses only the accepted non-persistent direct-index arguments", async () => {
  let captured: Readonly<Record<string, unknown>> | undefined;
  const invoke: ProviderInvoker = async (_tool, argumentsValue) => {
    captured = argumentsValue;
    return response("index.json");
  };
  await indexRepository("agentbase-typescript-fixture", repositoryRoot, invoke);
  assert.deepEqual(captured, { repo_path: repositoryRoot, mode: "fast", name: "agentbase-typescript-fixture", persistence: false });
});

test("[AB-MVP-004] captured adapter leaves authored fixture bytes unchanged", async () => {
  const source = path.join(repositoryRoot, "src/app/inspect.ts");
  const before = createHash("sha256").update(fs.readFileSync(source)).digest("hex");
  await adapter().relevantContext(taskQuery);
  const after = createHash("sha256").update(fs.readFileSync(source)).digest("hex");
  assert.equal(after, before);
});

test("[AB-GRAPH-010] one-shot and session invokers normalize captured responses identically", async () => {
  const oneShot = await adapter(capturedInvoker()).relevantContext(taskQuery);
  const session = await adapter(capturedInvoker()).relevantContext(taskQuery);
  assert.deepEqual(session, oneShot);
});
