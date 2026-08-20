import type { CodebaseMemoryTransport } from "../../../providers/codebase-memory/index.ts";
import { CodebaseMemoryError } from "../../../providers/codebase-memory/index.ts";
import { GraphRoundError, type GraphRoundDiagnostics, type GraphRoundResult } from "./graph-round.ts";

export type CriticalFactRequirement =
  | Readonly<{ exact: string }>
  | Readonly<{ prefix: string; suffix: string }>;

export type GraphBenchmarkAcceptance = Readonly<{
  criticalFacts: readonly CriticalFactRequirement[];
  maximumSourceFiles: number;
}>;

export type GraphBenchmarkArm = Readonly<{
  pair: number;
  order: number;
  transport: CodebaseMemoryTransport;
}> & (
  | Readonly<{
    outcome: "complete";
    evidenceDigest: string;
    diagnostics: GraphRoundDiagnostics;
  }>
  | Readonly<{
    outcome: "failed";
    failure: Readonly<{ code: string }>;
  }>
);

export type GraphLifecycleBenchmark = Readonly<{
  arms: readonly GraphBenchmarkArm[];
  oneShotMedianMs: number | null;
  scopedSessionMedianMs: number | null;
  speedRatio: number | null;
  parity: boolean;
  promotionEligible: boolean;
  limitations: readonly string[];
}>;

type CompletedArm = Readonly<{
  pair: number;
  order: number;
  transport: CodebaseMemoryTransport;
  result: GraphRoundResult;
}>;

type FailedArm = Readonly<{
  pair: number;
  order: number;
  transport: CodebaseMemoryTransport;
  failureCode: string;
}>;

function median(values: readonly number[]): number | null {
  if (values.length !== 3 || values.some((value) => !Number.isFinite(value) || value <= 0)) return null;
  return [...values].sort((left, right) => left - right)[1] ?? null;
}

function parityKey(result: GraphRoundResult): string {
  const { engine, source, factIds, sourcePaths } = result.diagnostics;
  return JSON.stringify({
    engine: {
      provider: engine.provider, packageName: engine.packageName, providerVersion: engine.providerVersion,
      packageIntegrity: engine.packageIntegrity, executableSha256: engine.executableSha256,
      adapterVersion: engine.adapterVersion,
    },
    source: {
      repositoryId: source.repositoryId, commit: source.commit, dirty: source.dirty,
      dirtyDigest: source.dirtyDigest,
    },
    facts: factIds,
    sources: sourcePaths,
  });
}

function matchesFact(factId: string, requirement: CriticalFactRequirement): boolean {
  return "exact" in requirement
    ? factId === requirement.exact
    : factId.startsWith(requirement.prefix) && factId.endsWith(requirement.suffix);
}

function meetsAcceptance(result: GraphRoundResult, acceptance: GraphBenchmarkAcceptance): boolean {
  return result.diagnostics.sourcePaths.length <= acceptance.maximumSourceFiles
    && acceptance.criticalFacts.every((required) => result.diagnostics.factIds
      .some((factId) => matchesFact(factId, required)));
}

function failureCode(cause: unknown): string {
  let current = cause;
  const visited = new Set<unknown>();
  while (current instanceof Error && !visited.has(current)) {
    visited.add(current);
    if (current instanceof CodebaseMemoryError) return current.code;
    if (current instanceof GraphRoundError && current.code !== "PROVIDER_FAILED") return current.code;
    current = current.cause;
  }
  return cause instanceof GraphRoundError ? cause.code : "PROVIDER_FAILED";
}

export async function benchmarkGraphLifecycle(
  runArm: (
    transport: CodebaseMemoryTransport,
    pair: number,
    order: number,
  ) => Promise<GraphRoundResult>,
  acceptance: GraphBenchmarkAcceptance,
): Promise<GraphLifecycleBenchmark> {
  const orders: readonly (readonly CodebaseMemoryTransport[])[] = [
    ["one-shot", "scoped-session"], ["scoped-session", "one-shot"], ["one-shot", "scoped-session"],
  ];
  const results: (CompletedArm | FailedArm)[] = [];
  for (let pairIndex = 0; pairIndex < orders.length; pairIndex += 1) {
    for (let orderIndex = 0; orderIndex < orders[pairIndex]!.length; orderIndex += 1) {
      const transport = orders[pairIndex]![orderIndex]!;
      const arm = { pair: pairIndex + 1, order: orderIndex + 1, transport };
      try { results.push({ ...arm, result: await runArm(transport, arm.pair, arm.order) }); }
      catch (cause) { results.push({ ...arm, failureCode: failureCode(cause) }); }
    }
  }
  const completed = results.filter((arm): arm is CompletedArm => "result" in arm);
  const failed = results.filter((arm): arm is FailedArm => "failureCode" in arm);
  const totals = (transport: CodebaseMemoryTransport) => completed
    .filter((arm) => arm.transport === transport)
    .map((arm) => arm.result.diagnostics.stages.totalMs);
  const oneShotMedianMs = median(totals("one-shot"));
  const scopedSessionMedianMs = median(totals("scoped-session"));
  const speedRatio = oneShotMedianMs !== null && scopedSessionMedianMs !== null
    ? oneShotMedianMs / scopedSessionMedianMs
    : null;
  const keys = completed.map((arm) => parityKey(arm.result));
  const normalizedParity = completed.length === 6 && keys.every((key) => key === keys[0]);
  const accepted = completed.length === 6
    && completed.every((arm) => meetsAcceptance(arm.result, acceptance));
  const safe = completed.length === 6 && completed.every((arm) => (
    arm.result.diagnostics.sourceUnchanged && arm.result.diagnostics.processCleanup === "clean"
  ));
  const parity = normalizedParity && accepted && safe;
  const speedPassed = speedRatio !== null && speedRatio >= 2;
  const limitations = [
    ...(failed.length ? ["one or more benchmark arms failed"] : []),
    ...(normalizedParity ? [] : ["normalized provider/source/fact/path parity gate failed"]),
    ...(accepted ? [] : ["critical fact or maximum source-file acceptance gate failed"]),
    ...(safe ? [] : ["source or process safety gate failed"]),
    ...(speedPassed ? [] : ["scoped-session speed gate did not reach twofold improvement"]),
    "paired result is specific to the accepted fixture and host",
  ];
  const arms: GraphBenchmarkArm[] = results.map((arm) => "result" in arm
    ? {
      pair: arm.pair, order: arm.order, transport: arm.transport, outcome: "complete",
      evidenceDigest: arm.result.evidence.bundleDigest, diagnostics: arm.result.diagnostics,
    }
    : {
      pair: arm.pair, order: arm.order, transport: arm.transport, outcome: "failed",
      failure: { code: arm.failureCode },
    });
  return {
    arms, oneShotMedianMs, scopedSessionMedianMs, speedRatio, parity,
    promotionEligible: parity && speedPassed, limitations,
  };
}
