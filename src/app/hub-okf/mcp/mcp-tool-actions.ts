import type { ConfirmedDomain, HubSearchOptions, HubTraversalOptions } from "../../../core/knowledge/index.ts";
import type { BootstrapMode } from "../workspace/bootstrap.ts";
import type { LiveSourceBinding } from "../query/query.ts";
import type { QuestionDeclaration } from "../authoring/questions.ts";

export type HubToolActions = Readonly<{
  status(): Promise<unknown>;
  configure(input: Readonly<{ mode: "existing" | "new"; repositoryUrl?: string }>): Promise<unknown>;
  previewBootstrap(repositoryUrl: string, mode: BootstrapMode): Promise<unknown>;
  bootstrap(repositoryUrl: string, mode: BootstrapMode): Promise<unknown>;
  prepare(input: Readonly<{
    mode: "new" | "refresh";
    sourceRepository: string;
    evidenceDigest: string;
    subjectDirectory: string;
    confirmedDomain?: ConfirmedDomain;
    signals: readonly string[];
  }>): Promise<unknown>;
  finalize(sessionId: string, questions?: readonly QuestionDeclaration[]): Promise<unknown>;
  inspect(proposalId: string): Promise<unknown>;
  accept(proposalId: string, proposalDigest: string): Promise<unknown>;
  search(query: string, options?: HubSearchOptions): Promise<unknown>;
  traverse(start: string, options?: HubTraversalOptions): Promise<unknown>;
  read(relativePath: string): Promise<unknown>;
  readLiveEvidence(relativePath: string, source?: LiveSourceBinding): Promise<unknown>;
  listQuestions(options: Readonly<{ status?: "pending" | "resolved"; limit?: number }>): Promise<unknown>;
  answerQuestion(input: Readonly<{
    questionId: string; revision: number; answer: string; maintainer: string;
  }>): Promise<unknown>;
  listPending(): Promise<unknown>;
  submitMany(proposalIds: readonly string[]): Promise<unknown>;
  synchronize(): Promise<unknown>;
  recover(proposalId: string): Promise<unknown>;
}>;

export type HubToolContext = Readonly<{ liveSource?: LiveSourceBinding }>;
