import type {
  AgentBaseInitialIngestHomePlan,
  ConfirmedDomain,
  HubSearchOptions,
  OkfAuthoringGuidanceRequest,
} from "../../../core/knowledge/index.ts";
import type { QuestionDeclaration } from "../authoring/questions.ts";
import type { HubRemovalDeclaration } from "../../../core/knowledge/index.ts";
import type { EnrichmentAnswer, EnrichmentCandidateInput } from "../enrichment/index.ts";
import type { RefreshChangeOutcome } from "../authoring/refresh-change-accounting.ts";
import type { ConfirmedDomain as BatchDomain } from "../../../core/knowledge/index.ts";
import type { ProfileMigrationMove } from "../migration/profile-migration.ts";

export type HubToolActions = Readonly<{
  publish(input: Readonly<{ proposalId: string; diffDigest: string; mode: "direct" | "pr" }>): Promise<import("../publication/direct-publish.ts").DirectPublicationResult>;
  status(): Promise<unknown>;
  configure(input: Readonly<{ repositoryUrl: string; targetBranch: string }>): Promise<unknown>;
  previewBootstrap(repositoryUrl: string, targetBranch: string): Promise<unknown>;
  bootstrap(repositoryUrl: string, targetBranch: string): Promise<unknown>;
  scan(workspaceRoot: string): Promise<unknown>;
  preflight(sourceRepository: string): Promise<unknown>;
  prepareMigration(): Promise<unknown>;
  finalizeMigration(input: Readonly<{ sessionId: string; moves: readonly ProfileMigrationMove[] }>): Promise<unknown>;
  prepare(input: Readonly<{
    mode: "new" | "refresh";
    refreshScope?: "delta" | "coverage";
    restart?: boolean;
    sourceRepository: string;
    subjectDirectory: string;
    confirmedDomain?: ConfirmedDomain;
    homePlan?: AgentBaseInitialIngestHomePlan;
    signals?: readonly string[];
    guidanceRequest?: OkfAuthoringGuidanceRequest;
    coverage?: Readonly<{ partial: boolean; limitations: readonly string[] }>;
    discoveryReceiptId?: string;
  }>): Promise<unknown>;
  validate(sessionId: string, referencedIdentities?: readonly string[]): Promise<unknown>;
  finalize(sessionId: string, questions?: readonly QuestionDeclaration[], removals?: readonly HubRemovalDeclaration[],
    changeAccounting?: readonly RefreshChangeOutcome[]): Promise<unknown>;
  prepareBatch(input: Readonly<{ sourceRepositories: readonly string[]; proposedDomain: BatchDomain }>): Promise<unknown>;
  confirmBatch(input: Readonly<{ manifestId: string; manifestRevision: number; assessments: readonly Readonly<{
    memberId: string; decision: "match" | "override"; evidencePath: string;
  }>[] }>): Promise<unknown>;
  recordBatchMember(input: Readonly<{ manifestId: string; manifestRevision: number; memberId: string;
    sessionId: string; questions?: readonly QuestionDeclaration[] }>): Promise<unknown>;
  retryBatchMember(input: Readonly<{ manifestId: string; manifestRevision: number; memberId: string }>): Promise<unknown>;
  reviseBatch(input: Readonly<{ manifestId: string; manifestRevision: number; memberIds: readonly string[] }>): Promise<unknown>;
  finalizeBatch(input: Readonly<{ manifestId: string; manifestRevision: number }>): Promise<unknown>;
  prepareEnrichment(input: Readonly<{
    domainId: string; repositoryIds: readonly string[]; candidates: readonly EnrichmentCandidateInput[];
    accountId: string; regions: readonly string[];
  }>): Promise<unknown>;
  reviseEnrichment(input: Readonly<{
    manifestId: string; manifestRevision: number; repositoryIds: readonly string[];
    candidates: readonly EnrichmentCandidateInput[];
  }>): Promise<unknown>;
  runEnrichment(input: Readonly<{
    manifestId: string; manifestRevision: number; providerSessionConfirmed: boolean;
    retryCandidateIds?: readonly string[];
  }>): Promise<unknown>;
  finalizeEnrichment(input: Readonly<{
    manifestId: string; manifestRevision: number; answers: readonly EnrichmentAnswer[];
  }>): Promise<unknown>;
  inspect(proposalId: string, includeContent?: boolean): Promise<unknown>;
  search(query: string, options?: HubSearchOptions): Promise<unknown>;
  read(relativePath: string): Promise<unknown>;
  visualize(input: Readonly<{
    mode: "diagram";
    domain: string;
    diagramType: "architecture" | "dependency" | "sequence";
    conceptIds: readonly string[];
  }> | Readonly<{
    mode: "domain-site";
    domain: string;
    outputDirectory: string;
    visibilityAcknowledged: true;
  }>): Promise<unknown>;
  previewHubInitialization(): Promise<unknown>;
  initializeHub(input: Readonly<{ expectedBase: string; expectedInitializationDigest: string }>): Promise<unknown>;
  listQuestions(options: Readonly<{ status?: "open" | "resolved" | "needs-review"; limit?: number }>): Promise<unknown>;
  answerQuestion(input: Readonly<{
    questionId: string; revision: number; answer: string; maintainer: string;
  }>): Promise<unknown>;
  synchronize(): Promise<unknown>;
  recover(transactionId: string): Promise<unknown>;
}>;
