import {
  readRepositoryIdentityRecord,
  readRepositoryObservedSource,
} from "../governance/repository-identity.ts";
import type { ConceptDocument, OkfValue } from "../documents/okf-document.ts";
import type { HubGraph } from "./hub-query-graph.ts";

const COMMIT = /^[a-f0-9]{40}$/;
const DIGEST = /^sha256:[a-f0-9]{64}$/;
const REPOSITORY_ID = /^repository-[a-z0-9-]+-[a-f0-9]{12}$/;
const REPOSITORY_LIMIT = 64;

export type ContextFreshnessStatus = "fresh" | "stale" | "unknown";
export type ContextFreshnessRepositoryReason =
  | "source_revision_matches"
  | "source_revision_changed"
  | "current_source_not_verified"
  | "observed_revision_unavailable"
  | "repository_identity_unavailable";
export type ContextFreshnessReason =
  | "all_source_revisions_match"
  | "source_revision_changed"
  | "current_source_not_fully_verified"
  | "repository_context_omitted"
  | "no_repository_context";

export type PublishedRepositoryObservation = Readonly<{
  conceptId: string;
  repositoryId?: string;
  observedRevision?: string;
  observedAt?: string;
}>;

export type CurrentSourceFreshnessReceipt = Readonly<{
  repositoryId: string;
  revision: string;
}>;

export type ContextFreshnessRepository = Readonly<{
  concept_id: string;
  repository_id?: string;
  observed_revision?: string;
  observed_at?: string;
  current_source_verified: boolean;
  current_revision?: string;
  status: ContextFreshnessStatus;
  reason: ContextFreshnessRepositoryReason;
}>;

export type ContextFreshnessEnvelope = Readonly<{
  published_commit: string;
  evaluated_at: string;
  current_source_verified: boolean;
  status: ContextFreshnessStatus;
  reason: ContextFreshnessReason;
  repositories: readonly ContextFreshnessRepository[];
  omitted_repository_count: number;
}>;

export type ContextFreshnessOptions = Readonly<{
  evaluatedAt?: string;
  currentSources?: readonly CurrentSourceFreshnessReceipt[];
}>;

function mapping(value: OkfValue | undefined): Readonly<Record<string, OkfValue>> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Readonly<Record<string, OkfValue>> : undefined;
}

function validConceptId(value: string): boolean {
  return value === value.trim() && value.length > 0 && Buffer.byteLength(value) <= 256 && !/[\0-\x1f\x7f]/.test(value);
}

function validTimestamp(value: string): boolean {
  return value.length <= 64 && Number.isFinite(Date.parse(value));
}

function validRevision(value: string): boolean {
  return COMMIT.test(value) || DIGEST.test(value);
}

function normalizeObservations(
  observations: readonly PublishedRepositoryObservation[],
): readonly PublishedRepositoryObservation[] {
  const normalized = new Map<string, PublishedRepositoryObservation>();
  const strongIdentities = new Map<string, string>();
  for (const observation of observations) {
    if (!validConceptId(observation.conceptId)) throw new Error("freshness Repository concept identity is invalid");
    if (observation.repositoryId !== undefined && !REPOSITORY_ID.test(observation.repositoryId)) {
      throw new Error(`freshness Repository identity is invalid: ${observation.conceptId}`);
    }
    if (observation.observedRevision !== undefined && !validRevision(observation.observedRevision)) {
      throw new Error(`freshness observed revision is invalid: ${observation.conceptId}`);
    }
    if (observation.observedAt !== undefined && !validTimestamp(observation.observedAt)) {
      throw new Error(`freshness observation time is invalid: ${observation.conceptId}`);
    }
    const value = {
      conceptId: observation.conceptId,
      ...(observation.repositoryId ? { repositoryId: observation.repositoryId } : {}),
      ...(observation.observedRevision ? { observedRevision: observation.observedRevision } : {}),
      ...(observation.observedAt ? { observedAt: observation.observedAt } : {}),
    };
    const prior = normalized.get(value.conceptId);
    if (prior && JSON.stringify(prior) !== JSON.stringify(value)) {
      throw new Error(`freshness Repository observation conflicts: ${value.conceptId}`);
    }
    if (value.repositoryId) {
      const priorConcept = strongIdentities.get(value.repositoryId);
      if (priorConcept && priorConcept !== value.conceptId) {
        throw new Error(`freshness Repository identity conflicts: ${value.repositoryId}`);
      }
      strongIdentities.set(value.repositoryId, priorConcept ?? value.conceptId);
    }
    normalized.set(value.conceptId, prior ?? value);
  }
  return [...normalized.values()].sort((left, right) => left.conceptId.localeCompare(right.conceptId));
}

function normalizeCurrentSources(
  receipts: readonly CurrentSourceFreshnessReceipt[],
): ReadonlyMap<string, CurrentSourceFreshnessReceipt> {
  const normalized = new Map<string, CurrentSourceFreshnessReceipt>();
  for (const receipt of receipts) {
    if (!REPOSITORY_ID.test(receipt.repositoryId)) throw new Error("current-source Repository identity is invalid");
    if (!validRevision(receipt.revision)) throw new Error(`current-source revision is invalid: ${receipt.repositoryId}`);
    const prior = normalized.get(receipt.repositoryId);
    if (prior && prior.revision !== receipt.revision) {
      throw new Error(`current-source receipts conflict: ${receipt.repositoryId}`);
    }
    normalized.set(receipt.repositoryId, prior ?? receipt);
  }
  return normalized;
}

function repositoryFreshness(
  observation: PublishedRepositoryObservation,
  currentSources: ReadonlyMap<string, CurrentSourceFreshnessReceipt>,
): ContextFreshnessRepository {
  const common = {
    concept_id: observation.conceptId,
    ...(observation.repositoryId ? { repository_id: observation.repositoryId } : {}),
    ...(observation.observedRevision ? { observed_revision: observation.observedRevision } : {}),
    ...(observation.observedAt ? { observed_at: observation.observedAt } : {}),
  };
  if (!observation.observedRevision) return {
    ...common,
    current_source_verified: false,
    status: "unknown",
    reason: "observed_revision_unavailable",
  };
  if (!observation.repositoryId) return {
    ...common,
    current_source_verified: false,
    status: "unknown",
    reason: "repository_identity_unavailable",
  };
  const current = currentSources.get(observation.repositoryId);
  if (!current) return {
    ...common,
    current_source_verified: false,
    status: "unknown",
    reason: "current_source_not_verified",
  };
  const matches = current.revision === observation.observedRevision;
  return {
    ...common,
    current_source_verified: true,
    current_revision: current.revision,
    status: matches ? "fresh" : "stale",
    reason: matches ? "source_revision_matches" : "source_revision_changed",
  };
}

export function buildContextFreshnessEnvelope(input: Readonly<{
  publishedCommit: string;
  repositories: readonly PublishedRepositoryObservation[];
}> & ContextFreshnessOptions): ContextFreshnessEnvelope {
  if (!COMMIT.test(input.publishedCommit)) throw new Error("freshness Published commit is invalid");
  const evaluatedAt = input.evaluatedAt ?? new Date().toISOString();
  if (!validTimestamp(evaluatedAt)) throw new Error("freshness evaluation time is invalid");
  const observations = normalizeObservations(input.repositories);
  const currentSources = normalizeCurrentSources(input.currentSources ?? []);
  const allRepositories = observations.map((observation) => repositoryFreshness(observation, currentSources));
  const repositories = allRepositories.slice(0, REPOSITORY_LIMIT);
  const omittedRepositoryCount = allRepositories.length - repositories.length;
  const stale = allRepositories.some((repository) => repository.status === "stale");
  const allVerified = allRepositories.length > 0
    && allRepositories.every((repository) => repository.current_source_verified)
    && omittedRepositoryCount === 0;
  const allFresh = allRepositories.length > 0
    && allRepositories.every((repository) => repository.status === "fresh")
    && omittedRepositoryCount === 0;
  const status: ContextFreshnessStatus = stale ? "stale" : allFresh ? "fresh" : "unknown";
  const reason: ContextFreshnessReason = stale
    ? "source_revision_changed"
    : allFresh
      ? "all_source_revisions_match"
      : omittedRepositoryCount
        ? "repository_context_omitted"
        : allRepositories.length
          ? "current_source_not_fully_verified"
          : "no_repository_context";
  return {
    published_commit: input.publishedCommit,
    evaluated_at: evaluatedAt,
    current_source_verified: allVerified,
    status,
    reason,
    repositories,
    omitted_repository_count: omittedRepositoryCount,
  };
}

function observationFromRepositoryConcept(conceptId: string, concept: ConceptDocument): PublishedRepositoryObservation {
  const agentbase = mapping(concept.frontmatter.agentbase);
  const rawRepositoryValue = agentbase?.repository;
  const rawRepository = mapping(rawRepositoryValue);
  const identity = readRepositoryIdentityRecord(concept);
  const observed = readRepositoryObservedSource(concept);
  if (rawRepositoryValue !== undefined && (!rawRepository || !identity)) {
    throw new Error(`freshness Repository identity is malformed: ${conceptId}`);
  }
  if (rawRepository?.observed_source !== undefined && !observed) {
    throw new Error(`freshness Repository observation is malformed: ${conceptId}`);
  }
  const observedRevision = observed?.dirty ? observed.dirtyDigest : observed?.commit;
  return {
    conceptId,
    ...(identity ? { repositoryId: identity.id } : {}),
    ...(observedRevision ? { observedRevision } : {}),
    ...(observed ? { observedAt: observed.observedAt } : {}),
  };
}

export function buildHubContextFreshness(
  graph: HubGraph,
  conceptIds: readonly string[],
  options: ContextFreshnessOptions = {},
): ContextFreshnessEnvelope {
  const repositoryConceptIds = [...new Set(conceptIds.flatMap((identity) => graph.repositoryScopes.get(identity) ?? []))].sort();
  const observations = repositoryConceptIds.map((identity) => {
    const concept = graph.concepts.get(identity)?.document;
    if (!concept || concept.type !== "Repository") throw new Error(`freshness Repository concept is unavailable: ${identity}`);
    return observationFromRepositoryConcept(identity, concept);
  });
  return buildContextFreshnessEnvelope({
    publishedCommit: graph.commit,
    repositories: observations,
    ...options,
  });
}

export function buildExactConceptFreshness(
  publishedCommit: string,
  concept: ConceptDocument,
  options: ContextFreshnessOptions = {},
): ContextFreshnessEnvelope {
  const repositories = concept.type === "Repository"
    ? [observationFromRepositoryConcept(concept.conceptId, concept)]
    : [];
  return buildContextFreshnessEnvelope({ publishedCommit, repositories, ...options });
}
