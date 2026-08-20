import type { TaskContextProvider, TaskContextQuery } from "../../../core/code-intelligence/index.ts";
import type { EngineIdentity, RepositoryEvidenceBundle, RepositorySourceState } from "../../../core/observations/index.ts";
import type {
  CodebaseMemoryTransport,
  ManagedCodebaseMemoryProvider,
  ProviderCleanup,
} from "../../../providers/codebase-memory/index.ts";
import { CodebaseMemoryError } from "../../../providers/codebase-memory/index.ts";
import {
  captureRepositoryIntegrity,
  prepareRepositoryEvidence,
  repositoryIntegrityMatches,
  type RepositoryIntegrityCheckpoint,
} from "../evidence/prepare-evidence.ts";
import {
  commitGraphFreshnessReceipt,
  createGraphFreshnessReceipt,
  decideGraphPreparation,
  readGraphFreshnessReceipt,
  type GraphPreparationDecision,
} from "./graph-freshness.ts";

export type GraphRoundErrorCode = "PROVIDER_FAILED" | "SOURCE_MUTATION" | "PROCESS_CLEANUP_FAILED" | "FRESHNESS_COMMIT_FAILED";

export class GraphRoundError extends Error {
  readonly code: GraphRoundErrorCode;
  readonly evidence = undefined;

  constructor(code: GraphRoundErrorCode, message: string, options?: Readonly<{ cause?: unknown }>) {
    super(message, options?.cause === undefined ? undefined : { cause: options.cause });
    this.name = "GraphRoundError";
    this.code = code;
  }
}

export type GraphRoundStages = Readonly<{
  admissionMs: number;
  indexMs: number;
  queryMs: number;
  cleanupMs: number;
  totalMs: number;
}>;

export type GraphRoundDiagnostics = Readonly<{
  transport: CodebaseMemoryTransport;
  engine: EngineIdentity;
  source: RepositorySourceState;
  stages: GraphRoundStages;
  factIds: readonly string[];
  sourcePaths: readonly string[];
  sourceUnchanged: boolean;
  processCleanup: ProviderCleanup["status"];
  preparation: GraphPreparationDecision;
  outcome: "complete";
  limitations: readonly string[];
}>;

export type GraphRoundResult = Readonly<{
  evidence: RepositoryEvidenceBundle;
  diagnostics: GraphRoundDiagnostics;
}>;

export type GraphRoundRequest = Readonly<{
  repositoryRoot: string;
  query: Omit<TaskContextQuery, "repositoryId">;
  transport: CodebaseMemoryTransport;
  workspaceScope?: string;
  refresh?: boolean;
}>;

export type GraphFreshnessLocation = Readonly<{
  receiptPath: string;
  namespaceId: string;
}>;

type ManagedGraphProvider = ManagedCodebaseMemoryProvider & Readonly<{
  freshness?: GraphFreshnessLocation;
}>;

export type GraphRoundDependencies = Readonly<{
  createProvider(request: GraphRoundRequest): Promise<ManagedGraphProvider>;
  now?: () => number;
  wallClock?: () => string;
}>;

function elapsed(now: () => number, started: number): number {
  return Math.round(Math.max(0, now() - started) * 1_000) / 1_000;
}

function milliseconds(value: number): number {
  return Math.round(Math.max(0, value) * 1_000) / 1_000;
}

function timedProvider(provider: TaskContextProvider, now: () => number, addQueryMs: (duration: number) => void): TaskContextProvider {
  return {
    async repositoryOverview(repositoryId) {
      const started = now();
      try { return await provider.repositoryOverview(repositoryId); }
      finally { addQueryMs(elapsed(now, started)); }
    },
    async relevantContext(query) {
      const started = now();
      try { return await provider.relevantContext(query); }
      finally { addQueryMs(elapsed(now, started)); }
    },
  };
}

function graphError(cause: unknown): GraphRoundError {
  if (cause instanceof GraphRoundError) return cause;
  if (cause instanceof Error && /changed repository source|source-state drift/i.test(cause.message)) {
    return new GraphRoundError("SOURCE_MUTATION", "repository source changed during the graph round", { cause });
  }
  const message = cause instanceof CodebaseMemoryError ? `${cause.code}: ${cause.message}` : "provider graph round failed";
  return new GraphRoundError("PROVIDER_FAILED", message, { cause });
}

export async function runGraphRound(request: GraphRoundRequest, dependencies: GraphRoundDependencies): Promise<GraphRoundResult> {
  const now = dependencies.now ?? (() => performance.now());
  const totalStarted = now();
  let admissionMs = 0;
  let indexMs = 0;
  let queryMs = 0;
  let cleanupMs = 0;
  let provider: ManagedGraphProvider | undefined;
  let evidence: RepositoryEvidenceBundle | undefined;
  let integrityBefore: RepositoryIntegrityCheckpoint | undefined;
  let failure: GraphRoundError | undefined;
  let preparation: GraphPreparationDecision = { mode: "refreshed", reason: "missing-receipt" };
  let cleanup: ProviderCleanup = { status: "clean", pid: null, graceful: true, forced: false, stderrBytes: 0 };

  try {
    integrityBefore = captureRepositoryIntegrity(request.repositoryRoot);
    const admissionStarted = now();
    provider = await dependencies.createProvider(request);
    admissionMs = elapsed(now, admissionStarted);
    if (provider.freshness) {
      preparation = decideGraphPreparation({
        receipt: readGraphFreshnessReceipt(provider.freshness.receiptPath),
        source: integrityBefore.source,
        engine: provider.identity,
        namespaceId: provider.freshness.namespaceId,
        forced: request.refresh === true,
      });
    }
    const measuredProvider = timedProvider(provider.provider, now, (duration) => { queryMs += duration; });
    evidence = await prepareRepositoryEvidence(request.repositoryRoot, request.query, {
      provider: measuredProvider,
      engine: provider.identity,
      async indexRepository() {
        if (preparation.mode === "reused") return;
        const indexStarted = now();
        try { return await provider!.indexRepository(); }
        finally { indexMs += elapsed(now, indexStarted); }
      },
      ...(dependencies.wallClock ? { now: dependencies.wallClock } : {}),
    });
  } catch (cause) {
    failure = graphError(cause);
    if (preparation.mode === "reused" && failure.code === "PROVIDER_FAILED") {
      failure = new GraphRoundError(
        "PROVIDER_FAILED",
        `${failure.message}; retry explicitly with --refresh`,
        { cause: failure },
      );
    }
  } finally {
    if (provider) {
      const cleanupStarted = now();
      try { cleanup = await provider.close(); }
      catch (cause) {
        cleanup = { status: "failed", pid: null, graceful: false, forced: true, stderrBytes: 0 };
        failure = new GraphRoundError("PROCESS_CLEANUP_FAILED", "provider cleanup threw an error", { cause });
      } finally {
        cleanupMs = elapsed(now, cleanupStarted);
      }
    }
    if (integrityBefore) {
      try {
        const integrityAfter = captureRepositoryIntegrity(
          request.repositoryRoot,
          integrityBefore.source.capturedAt,
        );
        if (!repositoryIntegrityMatches(integrityBefore, integrityAfter)) {
          failure = new GraphRoundError(
            "SOURCE_MUTATION",
            "repository source changed before provider cleanup completed",
            { cause: failure },
          );
        }
      } catch (cause) {
        failure = new GraphRoundError(
          "SOURCE_MUTATION",
          "repository integrity could not be confirmed after provider cleanup",
          { cause },
        );
      }
    }
  }
  if (cleanup.status !== "clean") throw new GraphRoundError("PROCESS_CLEANUP_FAILED", "provider process cleanup could not be established", { cause: failure });
  if (failure) throw failure;
  if (!provider || !evidence) throw new GraphRoundError("PROVIDER_FAILED", "provider returned no complete evidence");

  if (provider.freshness) {
    try {
      commitGraphFreshnessReceipt(provider.freshness.receiptPath, createGraphFreshnessReceipt({
        source: evidence.source,
        engine: provider.identity,
        namespaceId: provider.freshness.namespaceId,
        evidenceDigest: evidence.bundleDigest,
        acceptedAt: evidence.generatedAt,
      }));
    } catch (cause) {
      throw new GraphRoundError(
        "FRESHNESS_COMMIT_FAILED",
        "graph evidence completed but its freshness receipt could not be committed",
        { cause },
      );
    }
  }

  const factIds = evidence.queries.flatMap((query) => query.facts.map((fact) => fact.id));
  const sourcePaths = [...new Set(evidence.queries.flatMap((query) => query.sourceReferences.map((source) => source.path)))].sort();
  const limitations = [...new Set(evidence.queries.flatMap((query) => query.limitations))].sort();
  return {
    evidence,
    diagnostics: {
      transport: request.transport,
      engine: provider.identity,
      source: evidence.source,
      stages: {
        admissionMs, indexMs, queryMs: milliseconds(queryMs), cleanupMs,
        totalMs: elapsed(now, totalStarted),
      },
      factIds,
      sourcePaths,
      sourceUnchanged: true,
      processCleanup: cleanup.status,
      preparation,
      outcome: "complete",
      limitations,
    },
  };
}
