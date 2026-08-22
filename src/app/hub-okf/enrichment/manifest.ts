import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import {
  AGENTBASE_OKF_SCHEMA_CATALOG_VERSION, isCanonicalRelationshipKind, loadOkfBundle, parseQuestionDocument,
  parseRepositorySourceResource, readRepositoryIdentityRecord,
  TERRAFORM_FAMILY_DETECTOR_PROFILE,
  type CanonicalRelationshipKind, type ConceptDocument, type OkfValue,
} from "../../../core/knowledge/index.ts";
import { AWS_CLI_PROFILE_VERSIONS } from "../../../providers/aws-cli/index.ts";

export type EnrichmentCandidate = Readonly<{
  id: string;
  kind: "identity" | "relation" | "question";
  sourceConceptId: string;
  targetConceptId?: string;
  predicate?: CanonicalRelationshipKind;
  queue: Readonly<{ name: string; accountId: string; region: string }>;
  expectedArn?: string;
  identityEvidenceIds: readonly string[];
  interactionEvidenceIds: readonly string[];
  question?: Readonly<{ id: string; revision: number }>;
  evidenceDigest: string;
}>;

export type EnrichmentCandidateInput = Omit<EnrichmentCandidate, "evidenceDigest">;
export type EnrichmentManifest = Readonly<{
  formatVersion: 1;
  id: string;
  revision: number;
  baseCommit: string;
  domainId: string;
  repositoryIds: readonly string[];
  candidates: readonly EnrichmentCandidate[];
  providerScope: Readonly<{ provider: "aws"; accountId: string; regions: readonly string[] }>;
  catalogVersion: string;
  detectorVersions: Readonly<Record<string, string>>;
  profileVersions: Readonly<Record<string, number>>;
  createdAt: string;
  digest: string;
}>;

const REPOSITORY_ID = /^repository-[a-z0-9-]+-[a-f0-9]{12}$/;
const DOMAIN_ID = /^domains\/[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CONCEPT_ID = /^(?:domains|systems|components|interfaces|flows|resources|infrastructure|deployments|repositories|relationships|capabilities)\/[a-z0-9][a-z0-9./-]*$/;
const CANDIDATE_ID = /^candidate-[a-f0-9]{24}$/;
const QUESTION_ID = /^question-[a-f0-9]{24}$/;
const COMMIT = /^[a-f0-9]{40}$/;
const DIGEST = /^sha256:[a-f0-9]{64}$/;
const REGION = /^[a-z]{2}(?:-gov)?-[a-z]+-\d$/;

function mapping(value: OkfValue | undefined): Readonly<Record<string, OkfValue>> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Readonly<Record<string, OkfValue>> : undefined;
}

function sourceIds(concept: ConceptDocument): ReadonlySet<string> {
  return new Set((Array.isArray(concept.frontmatter.sources) ? concept.frontmatter.sources : []).flatMap((value) => {
    const id = mapping(value)?.id;
    return typeof id === "string" ? [id] : [];
  }));
}

function evidenceRepositoryId(concept: ConceptDocument, sourceId: string): string | undefined {
  const source = (Array.isArray(concept.frontmatter.sources) ? concept.frontmatter.sources : [])
    .map(mapping).find((value) => value?.id === sourceId);
  return typeof source?.resource === "string" ? parseRepositorySourceResource(source.resource)?.repositoryId : undefined;
}

function repositoryInDomain(concept: ConceptDocument, domainId: string): boolean {
  return Array.isArray(concept.frontmatter.relationships) && concept.frontmatter.relationships.some((value) => {
    const relation = mapping(value);
    return relation?.kind === "part-of" && relation.target === domainId;
  });
}

function canonicalCandidate(input: EnrichmentCandidateInput, concepts: ReadonlyMap<string, ConceptDocument>,
  selectedRepositoryIds: ReadonlySet<string>): EnrichmentCandidate {
  if (!CANDIDATE_ID.test(input.id) || !CONCEPT_ID.test(input.sourceConceptId)
    || (input.targetConceptId !== undefined && !CONCEPT_ID.test(input.targetConceptId))
    || !concepts.has(input.sourceConceptId) || (input.targetConceptId !== undefined && !concepts.has(input.targetConceptId))) {
    throw new Error(`enrichment candidate identity is invalid: ${input.id}`);
  }
  if (input.kind === "relation" && (!input.targetConceptId || !input.predicate || !isCanonicalRelationshipKind(input.predicate)
    || !input.interactionEvidenceIds.length)) throw new Error(`${input.id}: relation candidate is incomplete`);
  if (input.kind !== "relation" && (input.predicate !== undefined || input.interactionEvidenceIds.length)) {
    throw new Error(`${input.id}: non-relation candidate cannot carry interaction intent`);
  }
  if (input.kind === "question" && !input.question) throw new Error(`${input.id}: question candidate requires an exact Question revision`);
  if (!/^[A-Za-z0-9_-]{1,80}(?:\.fifo)?$/.test(input.queue.name) || !/^\d{12}$/.test(input.queue.accountId)
    || !REGION.test(input.queue.region)) throw new Error(`${input.id}: exact SQS queue scope is invalid`);
  if (input.expectedArn !== undefined && !/^arn:aws(?:-[a-z]+)?:sqs:[a-z0-9-]+:\d{12}:[A-Za-z0-9_-]{1,80}(?:\.fifo)?$/.test(input.expectedArn)) {
    throw new Error(`${input.id}: expected ARN is invalid`);
  }
  if (!input.identityEvidenceIds.length || input.identityEvidenceIds.length > 64
    || input.interactionEvidenceIds.length > 64 || new Set(input.identityEvidenceIds).size !== input.identityEvidenceIds.length
    || new Set(input.interactionEvidenceIds).size !== input.interactionEvidenceIds.length) throw new Error(`${input.id}: evidence lists are invalid`);
  const owned = sourceIds(concepts.get(input.sourceConceptId)!);
  for (const id of input.interactionEvidenceIds) {
    if (!owned.has(id)) throw new Error(`${input.id}: interaction evidence ${id} is not owned by source concept`);
    const repositoryId = evidenceRepositoryId(concepts.get(input.sourceConceptId)!, id);
    if (!repositoryId || !selectedRepositoryIds.has(repositoryId)) throw new Error(`${input.id}: interaction evidence ${id} is outside selected Repository membership`);
  }
  const identityOwners = [concepts.get(input.sourceConceptId)!, ...(input.targetConceptId ? [concepts.get(input.targetConceptId)!] : [])];
  for (const id of input.identityEvidenceIds) {
    const owners = identityOwners.filter((concept) => sourceIds(concept).has(id));
    if (!owners.length) throw new Error(`${input.id}: identity evidence ${id} is unresolved`);
    if (!owners.some((concept) => {
      const repositoryId = evidenceRepositoryId(concept, id);
      return repositoryId !== undefined && selectedRepositoryIds.has(repositoryId);
    })) throw new Error(`${input.id}: identity evidence ${id} is outside selected Repository membership`);
  }
  if (input.question && (!QUESTION_ID.test(input.question.id) || !Number.isSafeInteger(input.question.revision) || input.question.revision < 1)) {
    throw new Error(`${input.id}: Question revision is invalid`);
  }
  const normalized = {
    ...input,
    identityEvidenceIds: [...input.identityEvidenceIds].sort(),
    interactionEvidenceIds: [...input.interactionEvidenceIds].sort(),
  };
  const evidenceDigest = `sha256:${createHash("sha256").update(JSON.stringify(normalized)).digest("hex")}`;
  return { ...normalized, evidenceDigest };
}

function validateQuestions(concepts: ReadonlyMap<string, ConceptDocument>, candidates: readonly EnrichmentCandidate[]): void {
  const questions = new Map([...concepts.values()].filter((concept) => concept.type === "Question")
    .map((concept) => { const question = parseQuestionDocument(concept); return [question.id, question] as const; }));
  const candidateQuestionIds = candidates.flatMap((candidate) => candidate.question ? [candidate.question.id] : []);
  if (new Set(candidateQuestionIds).size !== candidateQuestionIds.length) {
    throw new Error("an enrichment Question may be claimed by only one candidate");
  }
  for (const candidate of candidates) if (candidate.question) {
    const question = questions.get(candidate.question.id);
    if (!question || question.revision !== candidate.question.revision) throw new Error(`${candidate.id}: Question revision is stale or missing`);
  }
}

function manifestDigest(value: Omit<EnrichmentManifest, "digest">): string {
  return `sha256:${createHash("sha256").update(JSON.stringify(value)).digest("hex")}`;
}

export function buildEnrichmentManifest(input: Readonly<{
  publishedRoot: string;
  baseCommit: string;
  domainId: string;
  repositoryIds: readonly string[];
  candidates: readonly EnrichmentCandidateInput[];
  accountId: string;
  regions: readonly string[];
  createdAt: string;
  prior?: EnrichmentManifest;
}>): EnrichmentManifest {
  if (!path.isAbsolute(input.publishedRoot) || !COMMIT.test(input.baseCommit) || !DOMAIN_ID.test(input.domainId)
    || !/^\d{12}$/.test(input.accountId) || !Number.isFinite(Date.parse(input.createdAt))) throw new Error("enrichment manifest scope is invalid");
  const repositoryIds = [...new Set(input.repositoryIds)].sort(), regions = [...new Set(input.regions)].sort();
  if (!repositoryIds.length || repositoryIds.length > 32 || repositoryIds.some((id) => !REPOSITORY_ID.test(id))
    || !regions.length || regions.length > 16 || regions.some((region) => !REGION.test(region))) {
    throw new Error("enrichment membership or region scope is invalid");
  }
  if (input.prior && (input.prior.baseCommit !== input.baseCommit || input.prior.domainId !== input.domainId
    || input.prior.providerScope.accountId !== input.accountId
    || JSON.stringify(input.prior.providerScope.regions) !== JSON.stringify(regions))) {
    throw new Error("membership revision cannot change Published base, Domain or provider scope");
  }
  const bundle = loadOkfBundle(input.publishedRoot, { requireAgentBaseRootIndex: true });
  if (!bundle.concepts.has(input.domainId)) throw new Error("confirmed enrichment Domain is absent from Published Hub");
  for (const repositoryId of repositoryIds) {
    const repository = [...bundle.concepts.values()].find((concept) => readRepositoryIdentityRecord(concept)?.id === repositoryId);
    if (!repository || !repositoryInDomain(repository, input.domainId)) throw new Error(`Repository is not Published in confirmed Domain: ${repositoryId}`);
  }
  const selectedRepositoryIds = new Set(repositoryIds);
  const candidates = input.candidates.map((candidate) => canonicalCandidate(candidate, bundle.concepts, selectedRepositoryIds))
    .sort((left, right) => left.id.localeCompare(right.id));
  if (!candidates.length || candidates.length > 64 || new Set(candidates.map((candidate) => candidate.id)).size !== candidates.length) {
    throw new Error("enrichment candidates must contain 1-64 unique entries");
  }
  for (const candidate of candidates) if (candidate.queue.accountId !== input.accountId || !regions.includes(candidate.queue.region)) {
    throw new Error(`${candidate.id}: candidate is outside confirmed provider scope`);
  }
  validateQuestions(bundle.concepts, candidates);
  const revision = input.prior ? input.prior.revision + 1 : 1;
  const id = input.prior?.id ?? `enrichment-${createHash("sha256").update(JSON.stringify([
    input.baseCommit, input.domainId, input.accountId, input.createdAt,
  ])).digest("hex").slice(0, 24)}`;
  const value: Omit<EnrichmentManifest, "digest"> = {
    formatVersion: 1, id, revision, baseCommit: input.baseCommit, domainId: input.domainId,
    repositoryIds, candidates, providerScope: { provider: "aws", accountId: input.accountId, regions },
    catalogVersion: AGENTBASE_OKF_SCHEMA_CATALOG_VERSION,
    detectorVersions: { [TERRAFORM_FAMILY_DETECTOR_PROFILE.id]: TERRAFORM_FAMILY_DETECTOR_PROFILE.version },
    profileVersions: AWS_CLI_PROFILE_VERSIONS, createdAt: input.createdAt,
  };
  return { ...value, digest: manifestDigest(value) };
}

export function writeEnrichmentManifest(stateRoot: string, manifest: EnrichmentManifest): void {
  const root = path.join(path.resolve(stateRoot), "enrichments", manifest.id);
  fs.mkdirSync(root, { recursive: true, mode: 0o700 });
  const target = path.join(root, `manifest-${manifest.revision}.json`), temporary = `${target}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(manifest, null, 2)}\n`, { mode: 0o600, flag: "wx" });
  fs.renameSync(temporary, target);
}

export function readEnrichmentManifest(stateRoot: string, id: string, revision: number): EnrichmentManifest {
  if (!/^enrichment-[a-f0-9]{24}$/.test(id) || !Number.isSafeInteger(revision) || revision < 1) throw new Error("enrichment manifest identity is invalid");
  const target = path.join(path.resolve(stateRoot), "enrichments", id, `manifest-${revision}.json`);
  const value = JSON.parse(fs.readFileSync(target, "utf8")) as EnrichmentManifest;
  const { digest, ...unsigned } = value;
  if (value.formatVersion !== 1 || value.id !== id || value.revision !== revision || !DIGEST.test(digest)
    || value.catalogVersion !== AGENTBASE_OKF_SCHEMA_CATALOG_VERSION
    || value.detectorVersions?.[TERRAFORM_FAMILY_DETECTOR_PROFILE.id] !== TERRAFORM_FAMILY_DETECTOR_PROFILE.version
    || manifestDigest(unsigned) !== digest) throw new Error("enrichment manifest state is invalid");
  return value;
}
