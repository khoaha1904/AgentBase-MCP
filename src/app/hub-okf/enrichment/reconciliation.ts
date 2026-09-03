import {
  externalIdentityKey, loadOkfBundle, parseQuestionDocument, readExternalIdentities,
  type ExternalIdentity, type ProviderObservation, type QuestionKind,
} from "../../../core/knowledge/index.ts";
import { AwsCliAdapter, AwsCliError } from "../../../providers/aws-cli/index.ts";
import type { EnrichmentCandidate, EnrichmentManifest } from "./manifest.ts";

export type EnrichmentOutcome = Readonly<{
  candidateId: string;
  status: "confirmed" | "rejected" | "unresolved" | "failed";
  attempt: number;
  manifestRevision: number;
  evidenceDigest: string;
  identity?: ExternalIdentity;
  observation?: ProviderObservation;
  limitation?: string;
  retryable: boolean;
}>;

export type EnrichmentDecision = Readonly<{
  candidateId: string;
  tier: "automatic" | "recommended" | "manual";
  question: Readonly<{ id: string; revision: number; kind: QuestionKind }>;
  summary: string;
  options: readonly string[];
  recommended?: string;
}>;

export function duplicateIdentityCandidateIds(manifest: EnrichmentManifest,
  outcomes: readonly EnrichmentOutcome[], publishedRoot: string): ReadonlySet<string> {
  const bundle = loadOkfBundle(publishedRoot), owners = new Map<string, Set<string>>(), candidates = new Map<string, Set<string>>();
  for (const concept of bundle.concepts.values()) for (const identity of readExternalIdentities(concept)) {
    const key = externalIdentityKey(identity);
    owners.set(key, new Set([...(owners.get(key) ?? []), concept.conceptId]));
  }
  const byId = new Map(manifest.candidates.map((candidate) => [candidate.id, candidate]));
  for (const result of outcomes) {
    const candidate = byId.get(result.candidateId);
    if (!candidate || !result.identity) continue;
    const key = externalIdentityKey(result.identity), ownerId = candidate.targetConceptId ?? candidate.sourceConceptId;
    owners.set(key, new Set([...(owners.get(key) ?? []), ownerId]));
    candidates.set(key, new Set([...(candidates.get(key) ?? []), candidate.id]));
  }
  return new Set([...owners].flatMap(([key, identityOwners]) => identityOwners.size > 1 ? [...(candidates.get(key) ?? [])] : []));
}

function outcome(candidate: EnrichmentCandidate, manifest: EnrichmentManifest,
  values: Omit<EnrichmentOutcome, "candidateId" | "manifestRevision" | "evidenceDigest" | "attempt">,
  attempt = 1): EnrichmentOutcome {
  return { candidateId: candidate.id, manifestRevision: manifest.revision,
    evidenceDigest: candidate.evidenceDigest, attempt, ...values };
}

export async function reconcileEnrichmentCandidate(
  manifest: EnrichmentManifest,
  candidate: EnrichmentCandidate,
  adapter: AwsCliAdapter,
  attempt = 1,
): Promise<EnrichmentOutcome> {
  try {
    const verified = await adapter.verifySqsQueue({ ...candidate.queue, observedAt: manifest.createdAt });
    if (candidate.expectedArn && candidate.expectedArn !== verified.identity.value) {
      return outcome(candidate, manifest, { status: "rejected", retryable: false,
        identity: verified.identity, observation: verified.observation,
        limitation: "provider identity differs from the candidate's exact expected ARN" }, attempt);
    }
    return outcome(candidate, manifest, { status: "confirmed", retryable: false,
      identity: verified.identity, observation: verified.observation }, attempt);
  } catch (error) {
    if (error instanceof AwsCliError && ["unauthorized", "not-found", "missing", "unsupported"].includes(error.kind)) {
      return outcome(candidate, manifest, { status: "unresolved", retryable: false, limitation: error.message }, attempt);
    }
    const retryable = error instanceof AwsCliError && error.retryable;
    return outcome(candidate, manifest, { status: "failed", retryable,
      limitation: error instanceof Error ? error.message : "provider verification failed" }, attempt);
  }
}

export function classifyEnrichmentDecisions(
  manifest: EnrichmentManifest,
  outcomes: readonly EnrichmentOutcome[],
  publishedRoot: string,
): readonly EnrichmentDecision[] {
  const bundle = loadOkfBundle(publishedRoot), byId = new Map(outcomes.map((item) => [item.candidateId, item]));
  const duplicateCandidates = duplicateIdentityCandidateIds(manifest, outcomes, publishedRoot);
  const questions = new Map([...bundle.concepts.values()].filter((concept) => concept.type === "Question")
    .map((concept) => { const question = parseQuestionDocument(concept); return [question.id, question] as const; }));
  return manifest.candidates.flatMap((candidate): readonly EnrichmentDecision[] => {
    if (!candidate.question) return [];
    const question = questions.get(candidate.question.id), result = byId.get(candidate.id);
    if (!question || question.revision !== candidate.question.revision || !result) throw new Error(`${candidate.id}: Question decision input is stale`);
    if (duplicateCandidates.has(candidate.id)) return [{ candidateId: candidate.id, tier: "manual",
      question: { id: question.id, revision: question.revision, kind: question.kind },
      summary: "strong provider identity matches more than one concept; concept merge is outside this workflow",
      options: ["provide scoped maintainer guidance", "defer for explicit merge review"] }];
    const factual = ["identity-candidate", "relation-candidate"].includes(question.kind)
      && ["confirmed", "rejected"].includes(result.status);
    if (factual) return [{ candidateId: candidate.id, tier: "automatic",
      question: { id: question.id, revision: question.revision, kind: question.kind },
      summary: result.status === "confirmed" ? "exact provider evidence verified the candidate" : "exact provider evidence rejected the candidate",
      options: [result.status] }];
    if (["confirmed", "rejected"].includes(result.status) && question.kind !== "maintainer-decision") {
      const recommended = result.status === "confirmed" ? "accept verified evidence" : "reject candidate match";
      return [{ candidateId: candidate.id, tier: "recommended",
        question: { id: question.id, revision: question.revision, kind: question.kind },
        summary: "provider evidence is strong but the decision carries maintainer semantics",
        options: [recommended, "keep Question open"], recommended }];
    }
    return [{ candidateId: candidate.id, tier: "manual",
      question: { id: question.id, revision: question.revision, kind: question.kind },
      summary: result.limitation ?? "current evidence cannot answer this Question safely",
      options: ["provide maintainer answer", "defer"] }];
  });
}
