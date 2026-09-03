export const REPOSITORY_OKF_COMMANDS = ["prepare", "validate", "diff", "apply", "recover"] as const;
export type RepositoryOkfCommand = typeof REPOSITORY_OKF_COMMANDS[number];
export { prepareRepositoryEvidence, type EvidencePreparation } from "./evidence/prepare-evidence.ts";
export { prepareProviderWorkspace, type ProviderWorkspace } from "./provider/provider-workspace.ts";
export {
  discoverRepositorySourceChanges,
  discoverRepositorySourceState,
  resolveRepositorySourceRoot,
  type RepositorySourceChanges,
} from "./evidence/source-state.ts";
export {
  benchmarkRealGraphLifecycle,
  executeGraphBenchmarkCli,
  executeObservationCli,
  executeRealEvidenceCli,
  prepareRealRepositoryEvidence,
} from "./evidence/real-evidence.ts";
export {
  GraphRoundError,
  runGraphRound,
  type GraphFreshnessLocation,
  type GraphRoundDiagnostics,
  type GraphRoundResult,
} from "./graph/graph-round.ts";
export {
  commitGraphFreshnessReceipt,
  createGraphFreshnessReceipt,
  decideGraphPreparation,
  readGraphFreshnessReceipt,
  type GraphFreshnessReceipt,
  type GraphPreparationDecision,
} from "./graph/graph-freshness.ts";
export {
  benchmarkGraphLifecycle,
  type CriticalFactRequirement,
  type GraphBenchmarkAcceptance,
  type GraphBenchmarkArm,
  type GraphLifecycleBenchmark,
} from "./graph/graph-benchmark.ts";
export { executeOkfCli } from "./cli.ts";
export {
  diffRepositoryProposal,
  applyRepositoryProposal,
  prepareRepositoryProposal,
  validateRepositoryProposal,
  type PreparedRepositoryProposal,
} from "./workflow/workflow.ts";
export type {
  InitialIngestContext,
  InitialIngestCoverage,
  InitialIngestOutcome,
  InitialIngestStage,
} from "./workflow/initial-ingest.ts";
export {
  claimInitialIngestRepair,
  initialIngestCoverage,
  validateInitialIngestOutcome,
} from "./workflow/initial-ingest.ts";
export { recoverRepositoryOkf } from "./workflow/recovery.ts";
