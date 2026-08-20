import type { OkfAuthoringGuidanceRequest } from "../../../core/knowledge/index.ts";

export type InitialIngestStage = "preflight" | "discover" | "investigate" | "author" | "validate";

export type InitialIngestCoverage = Readonly<{
  partial: boolean;
  limitations: readonly string[];
}>;

export type InitialIngestContext = Readonly<{
  repositoryRoot: string;
  sourceRepositoryId: string;
  confirmedDomain: Readonly<{ identity: string; title: string }>;
  guidance: OkfAuthoringGuidanceRequest;
  coverage: InitialIngestCoverage;
}>;

export type InitialIngestOutcome =
  | Readonly<{
      kind: "no-change";
      sourceRepositoryId: string;
      coverage: InitialIngestCoverage;
    }>
  | Readonly<{
      kind: "proposal-preview";
      sourceRepositoryId: string;
      proposalId: string;
      diffDigest: string;
      coverage: InitialIngestCoverage;
      repairs: 0 | 1;
    }>
  | Readonly<{
      kind: "incomplete";
      sourceRepositoryId?: string;
      failedStage: InitialIngestStage;
      diagnostic: string;
      retryable: boolean;
      repairs: 0 | 1;
    }>;

const REPOSITORY_ID = /^repository-[a-z0-9-]+-[a-f0-9]{12}$/;
const PROPOSAL_ID = /^[a-f0-9]{24}$/;
const DIGEST = /^sha256:[a-f0-9]{64}$/;

export function initialIngestCoverage(limitations: readonly string[]): InitialIngestCoverage {
  const normalized = [...new Set(limitations.map((item) => item.trim()).filter(Boolean))].sort();
  return { partial: normalized.length > 0, limitations: normalized };
}

export function claimInitialIngestRepair(repairs: 0 | 1): 1 {
  if (repairs === 1) throw new Error("Initial Ingest automatic repair budget is exhausted; explicit retry is required");
  return 1;
}

export function validateInitialIngestOutcome(outcome: InitialIngestOutcome): InitialIngestOutcome {
  if ("sourceRepositoryId" in outcome && outcome.sourceRepositoryId !== undefined
    && !REPOSITORY_ID.test(outcome.sourceRepositoryId)) throw new Error("Initial Ingest source Repository ID is invalid");
  if (outcome.kind === "proposal-preview" && (!PROPOSAL_ID.test(outcome.proposalId) || !DIGEST.test(outcome.diffDigest))) {
    throw new Error("Initial Ingest proposal preview identity is invalid");
  }
  if (outcome.kind === "incomplete") {
    if (!outcome.diagnostic.trim() || Buffer.byteLength(outcome.diagnostic) > 2048) {
      throw new Error("Initial Ingest incomplete diagnostic must be bounded and non-empty");
    }
    return outcome;
  }
  const normalized = initialIngestCoverage(outcome.coverage.limitations);
  if (normalized.partial !== outcome.coverage.partial
    || normalized.limitations.join("\0") !== outcome.coverage.limitations.join("\0")) {
    throw new Error("Initial Ingest coverage must be normalized and partial exactly when limitations exist");
  }
  return outcome;
}
