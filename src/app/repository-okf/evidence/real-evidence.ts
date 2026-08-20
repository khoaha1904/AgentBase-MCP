import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  createCodebaseMemoryProvider,
  createScopedCodebaseMemoryProvider,
  type CodebaseMemoryTransport,
  type ManagedCodebaseMemoryProvider,
} from "../../../providers/codebase-memory/index.ts";
import { benchmarkGraphLifecycle } from "../graph/graph-benchmark.ts";
import { runGraphRound, type GraphFreshnessLocation, type GraphRoundRequest } from "../graph/graph-round.ts";
import { prepareProviderWorkspace } from "../provider/provider-workspace.ts";
import { discoverRepositorySourceState } from "./source-state.ts";

const agentBaseRoot = path.resolve(import.meta.dirname, "../../../..");
const fixtureRoot = path.join(agentBaseRoot, "fixtures", "typescript-modular-monolith");

function task(symbol: string) {
  return {
    task: `Trace ${symbol} across its structural call boundaries`,
    focus: [{ search: symbol, trace: { functionName: symbol, direction: "outbound" as const, depth: 1 } }],
    maximumFiles: 3,
    maximumFacts: 5,
  };
}

async function realProvider(
  request: GraphRoundRequest,
): Promise<ManagedCodebaseMemoryProvider & { freshness: GraphFreshnessLocation }> {
  const absoluteRoot = path.resolve(request.repositoryRoot);
  const source = discoverRepositorySourceState(absoluteRoot);
  const workspace = prepareProviderWorkspace(absoluteRoot, source.repositoryId, undefined, request.workspaceScope ?? "default");
  const options = {
    repositoryId: source.repositoryId,
    repositoryRoot: workspace.allowedRoot,
    project: workspace.project,
    cacheRoot: workspace.cacheRoot,
    managedPackage: { projectRoot: agentBaseRoot, allowRecovery: true },
    timeoutMs: 120_000,
  };
  const provider = await (request.transport === "scoped-session"
    ? createScopedCodebaseMemoryProvider(options)
    : createCodebaseMemoryProvider(options));
  return {
    provider: provider.provider,
    identity: provider.identity,
    transport: provider.transport,
    indexRepository: () => provider.indexRepository(),
    close: () => provider.close(),
    freshness: { receiptPath: workspace.receiptPath, namespaceId: workspace.namespaceId },
  };
}

export async function prepareRealRepositoryEvidence(
  repositoryRoot: string,
  symbol: string,
  transport: CodebaseMemoryTransport = "scoped-session",
  workspaceScope = "default",
  refresh = false,
) {
  const absoluteRoot = path.resolve(repositoryRoot);
  return runGraphRound({ repositoryRoot: absoluteRoot, query: task(symbol), transport, workspaceScope, refresh }, {
    createProvider: realProvider,
  });
}

export async function benchmarkRealGraphLifecycle() {
  const runId = `${process.pid}-${Date.now().toString(36)}`.toLowerCase();
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-graph-benchmark-"));
  const repository = path.join(temporaryRoot, "typescript-modular-monolith");
  fs.cpSync(fixtureRoot, repository, { recursive: true });
  try {
    return await benchmarkGraphLifecycle(
      (transport, pair, order) => prepareRealRepositoryEvidence(
        repository,
        "inspectWorkspace",
        transport,
        `benchmark-${runId}-${pair}-${order}-${transport}`,
      ),
      {
        criticalFacts: [
          { exact: "architecture:boundary:app:catalog" },
          { exact: "architecture:boundary:app:workspace" },
          { prefix: "search:", suffix: ".src.app.inspect.inspectWorkspace" },
          { prefix: "trace:inspectWorkspace:", suffix: ".src.catalog.repository.listModules" },
          { prefix: "trace:inspectWorkspace:", suffix: ".src.workspace.paths.resolveWorkspace" },
        ],
        maximumSourceFiles: 3,
      },
    );
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
}

function parseIntegrationArgs(args: readonly string[]): Readonly<{
  repositoryRoot: string;
  symbol: string;
  transport: CodebaseMemoryTransport;
  refresh: boolean;
}> | null {
  const [repositoryRoot, symbol, ...flags] = args;
  if (!repositoryRoot || !symbol) return null;
  let transport: CodebaseMemoryTransport = "scoped-session";
  let refresh = false;
  for (let index = 0; index < flags.length;) {
    if (flags[index] === "--refresh") {
      if (refresh) return null;
      refresh = true;
      index += 1;
      continue;
    }
    if (flags[index] !== "--transport" || (flags[index + 1] !== "one-shot" && flags[index + 1] !== "scoped-session")) return null;
    transport = flags[index + 1] as CodebaseMemoryTransport;
    index += 2;
  }
  return { repositoryRoot, symbol, transport, refresh };
}

export async function executeRealEvidenceCli(
  args: readonly string[],
  writeOutput: (value: string) => void = (value) => process.stdout.write(value),
  writeError: (value: string) => void = (value) => process.stderr.write(value),
  prepare: typeof prepareRealRepositoryEvidence = prepareRealRepositoryEvidence,
): Promise<number> {
  const parsed = parseIntegrationArgs(args);
  if (!parsed) {
    writeError("Usage: npm run integration:codebase-memory -- <repository-root> <function-name> [--transport one-shot|scoped-session] [--refresh]\n");
    return 2;
  }
  try {
    const result = await prepare(parsed.repositoryRoot, parsed.symbol, parsed.transport, "default", parsed.refresh);
    writeOutput(`${JSON.stringify(result, null, 2)}\n`);
    return 0;
  } catch (error) {
    const message = error instanceof Error ? messageWithoutLocalRoot(error.message, path.resolve(parsed.repositoryRoot)) : "unknown provider failure";
    writeError(`Codebase Memory integration failed: ${message}\n`);
    return 1;
  }
}

export async function executeObservationCli(
  args: readonly string[],
  writeOutput: (value: string) => void = (value) => process.stdout.write(value),
  writeError: (value: string) => void = (value) => process.stderr.write(value),
  prepare: typeof prepareRealRepositoryEvidence = prepareRealRepositoryEvidence,
): Promise<number> {
  const parsed = parseIntegrationArgs(args);
  if (!parsed) {
    writeError("Usage: node src/cli.ts observe <repository-root> <symbol> [--transport one-shot|scoped-session] [--refresh]\n");
    return 2;
  }
  try {
    const result = await prepare(parsed.repositoryRoot, parsed.symbol, parsed.transport, "observe", parsed.refresh);
    writeOutput(`${JSON.stringify(result.evidence, null, 2)}\n`);
    return 0;
  } catch (error) {
    const message = error instanceof Error ? messageWithoutLocalRoot(error.message, path.resolve(parsed.repositoryRoot)) : "unknown provider failure";
    writeError(`Observation failed: ${message}\n`);
    return 1;
  }
}

export async function executeGraphBenchmarkCli(
  args: readonly string[],
  writeOutput: (value: string) => void = (value) => process.stdout.write(value),
  writeError: (value: string) => void = (value) => process.stderr.write(value),
  benchmark: typeof benchmarkRealGraphLifecycle = benchmarkRealGraphLifecycle,
): Promise<number> {
  if (args.length) {
    writeError("Usage: npm run benchmark:codebase-memory\n");
    return 2;
  }
  try {
    const result = await benchmark();
    writeOutput(`${JSON.stringify(result, null, 2)}\n`);
    return result.arms.some((arm) => arm.outcome === "failed") || !result.parity ? 1 : 0;
  } catch (error) {
    const message = error instanceof Error
      ? messageWithoutLocalRoot(error.message, fixtureRoot)
      : "unknown provider failure";
    writeError(`Codebase Memory benchmark failed: ${message}\n`);
    return 1;
  }
}

function messageWithoutLocalRoot(message: string, repositoryRoot: string): string {
  return message.split(repositoryRoot).join("<repository>");
}
