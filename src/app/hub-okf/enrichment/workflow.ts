import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { isDeepStrictEqual } from "node:util";

import {
  AGENTBASE_OKF_SCHEMA_CATALOG_VERSION,
  diffBundleProposal, loadOkfBundle, normalizeProviderObservedValues,
  parseQuestionDocument, prepareBundleProposal, providerObservationSourceResource, readObservedValues,
  renderConceptDocument, renderQuestionDocument, resolveQuestionFromEvidence,
  validateBundleExternalIdentities, validateBundleObservedValues, validateBundleProposal,
  validateOkfRelationships, validateProviderObservation, withExternalIdentity,
  type ConceptDocument, type OkfValue, type SharedQuestion,
} from "../../../core/knowledge/index.ts";
import {
  createHubProposal, type AdmittedLocalHubState, type AnyHubProposal,
} from "../../../core/hub/index.ts";
import { AwsCliAdapter, AwsCliError } from "../../../providers/aws-cli/index.ts";
import { attachHubInspectionContext, inspectHubProposal, type HubProposalInspection } from "../review/inspect.ts";
import { writeHubProposalState } from "../review/proposal-state.ts";
import { materializeQuestionGuidance } from "../authoring/guidance-proposal.ts";
import type { GovernedQuestion } from "../authoring/questions.ts";
import {
  buildEnrichmentManifest, readEnrichmentManifest, writeEnrichmentManifest,
  type EnrichmentCandidateInput, type EnrichmentManifest,
} from "./manifest.ts";
import {
  classifyEnrichmentDecisions, duplicateIdentityCandidateIds, reconcileEnrichmentCandidate,
  type EnrichmentDecision, type EnrichmentOutcome,
} from "./reconciliation.ts";

export type EnrichmentRunState = Readonly<{
  formatVersion: 1;
  manifestId: string;
  manifestRevision: number;
  manifestDigest: string;
  status: "ready" | "incomplete";
  outcomes: readonly EnrichmentOutcome[];
  decisions: readonly EnrichmentDecision[];
}>;

export type EnrichmentAnswer = Readonly<{
  candidateId: string;
  questionId: string;
  questionRevision: number;
  action: "answer" | "defer";
  answer?: string;
  maintainer?: string;
}>;

function mapping(value: OkfValue | undefined): Readonly<Record<string, OkfValue>> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Readonly<Record<string, OkfValue>> : undefined;
}

function writeAtomic(target: string, value: unknown): void {
  fs.mkdirSync(path.dirname(target), { recursive: true, mode: 0o700 });
  const temporary = `${target}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600, flag: "w" });
  fs.renameSync(temporary, target);
}

function statePath(stateRoot: string, manifest: Pick<EnrichmentManifest, "id" | "revision">): string {
  return path.join(path.resolve(stateRoot), "enrichments", manifest.id, `outcomes-${manifest.revision}.json`);
}

function readRunState(stateRoot: string, manifest: EnrichmentManifest): EnrichmentRunState | undefined {
  const target = statePath(stateRoot, manifest);
  if (!fs.existsSync(target)) return undefined;
  const value = JSON.parse(fs.readFileSync(target, "utf8")) as EnrichmentRunState;
  if (value.formatVersion !== 1 || value.manifestId !== manifest.id || value.manifestRevision !== manifest.revision
    || value.manifestDigest !== manifest.digest || !["ready", "incomplete"].includes(value.status)) {
    throw new Error("enrichment outcome state is invalid");
  }
  const candidates = new Map(manifest.candidates.map((candidate) => [candidate.id, candidate]));
  if (!Array.isArray(value.outcomes) || value.outcomes.length !== manifest.candidates.length
    || new Set(value.outcomes.map((outcome) => outcome.candidateId)).size !== value.outcomes.length) {
    throw new Error("enrichment outcome membership is invalid");
  }
  for (const outcome of value.outcomes) {
    const candidate = candidates.get(outcome.candidateId);
    const trusted = outcome.status === "confirmed" || outcome.status === "rejected";
    if (!candidate || outcome.manifestRevision !== manifest.revision || outcome.evidenceDigest !== candidate.evidenceDigest
      || !Number.isSafeInteger(outcome.attempt) || outcome.attempt < 1
      || !["confirmed", "rejected", "unresolved", "failed"].includes(outcome.status)
      || trusted !== Boolean(outcome.identity && outcome.observation)
      || (!trusted && (outcome.identity !== undefined || outcome.observation !== undefined))
      || (trusted && (validateProviderObservation(outcome.observation!).length
        || outcome.identity!.value !== outcome.observation!.nativeIdentity
        || outcome.identity!.provider !== "aws" || outcome.identity!.identityType !== "arn"
        || outcome.identity!.service !== "sqs" || outcome.identity!.resourceType !== "queue"
        || outcome.identity!.scope.account_id !== candidate.queue.accountId
        || outcome.identity!.scope.region !== candidate.queue.region
        || outcome.observation!.authority !== candidate.queue.accountId
        || outcome.observation!.location !== candidate.queue.region
        || !outcome.identity!.value.endsWith(`:${candidate.queue.name}`)))
      || ((outcome.status === "unresolved" || outcome.status === "failed" || outcome.status === "rejected") && !outcome.limitation)) {
      throw new Error(`enrichment outcome integrity is invalid: ${outcome.candidateId}`);
    }
  }
  if ((value.status === "incomplete") !== value.outcomes.some((outcome) => outcome.status === "failed")) {
    throw new Error("enrichment run status conflicts with candidate outcomes");
  }
  return value;
}

export function prepareDomainEnrichment(options: Readonly<{
  stateRoot: string;
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
  const manifest = buildEnrichmentManifest(options);
  writeEnrichmentManifest(options.stateRoot, manifest);
  return manifest;
}

export async function runDomainEnrichment(options: Readonly<{
  stateRoot: string;
  publishedRoot: string;
  manifestId: string;
  manifestRevision: number;
  providerSessionConfirmed: boolean;
  retryCandidateIds?: readonly string[];
  adapter?: AwsCliAdapter;
}>): Promise<EnrichmentRunState> {
  if (!options.providerSessionConfirmed) throw new Error("provider session confirmation is required");
  const manifest = readEnrichmentManifest(options.stateRoot, options.manifestId, options.manifestRevision);
  const adapter = options.adapter ?? new AwsCliAdapter();
  const previous = readRunState(options.stateRoot, manifest);
  const retries = new Set(options.retryCandidateIds ?? []);
  if (previous && !retries.size) throw new Error("enrichment already ran; retry must name failed candidates explicitly");
  if (retries.size && (!previous || [...retries].some((id) => !previous.outcomes.some((item) => item.candidateId === id && item.status === "failed")))) {
    throw new Error("retry selection must contain only failed candidates from the exact manifest revision");
  }
  let inherited = new Map<string, EnrichmentOutcome>();
  if (!previous && manifest.revision > 1) {
    const priorManifest = readEnrichmentManifest(options.stateRoot, manifest.id, manifest.revision - 1);
    const priorState = readRunState(options.stateRoot, priorManifest);
    if (priorState && JSON.stringify(priorManifest.profileVersions) === JSON.stringify(manifest.profileVersions)) {
      const priorCandidates = new Map(priorManifest.candidates.map((candidate) => [candidate.id, candidate]));
      inherited = new Map(priorState.outcomes.flatMap((item) => {
        const current = manifest.candidates.find((candidate) => candidate.id === item.candidateId);
        const prior = priorCandidates.get(item.candidateId);
        return current && prior && current.evidenceDigest === prior.evidenceDigest && item.status !== "failed"
          ? [[item.candidateId, { ...item, manifestRevision: manifest.revision } as EnrichmentOutcome] as const] : [];
      }));
    }
  }
  if (!previous && inherited.size === manifest.candidates.length) {
    const outcomes = manifest.candidates.map((candidate) => inherited.get(candidate.id)!);
    const state: EnrichmentRunState = { formatVersion: 1, manifestId: manifest.id,
      manifestRevision: manifest.revision, manifestDigest: manifest.digest, status: "ready", outcomes,
      decisions: classifyEnrichmentDecisions(manifest, outcomes, options.publishedRoot) };
    writeAtomic(statePath(options.stateRoot, manifest), state); return state;
  }
  try { await adapter.preflight(manifest.providerScope.accountId); }
  catch (error) {
    if (error instanceof AwsCliError && error.kind === "account-mismatch") throw error;
    if (!(error instanceof AwsCliError) || !["missing", "unsupported", "unauthorized"].includes(error.kind)) throw error;
    const outcomes = manifest.candidates.map((candidate) => ({
      candidateId: candidate.id, status: "unresolved" as const, attempt: 1,
      manifestRevision: manifest.revision, evidenceDigest: candidate.evidenceDigest,
      limitation: error.message, retryable: false,
    }));
    const state: EnrichmentRunState = { formatVersion: 1, manifestId: manifest.id,
      manifestRevision: manifest.revision, manifestDigest: manifest.digest, status: "ready", outcomes,
      decisions: classifyEnrichmentDecisions(manifest, outcomes, options.publishedRoot) };
    writeAtomic(statePath(options.stateRoot, manifest), state); return state;
  }
  const prior = previous ? new Map(previous.outcomes.map((item) => [item.candidateId, item])) : inherited;
  const outcomes: EnrichmentOutcome[] = [];
  for (const candidate of manifest.candidates) {
    const retained = prior.get(candidate.id);
    if (retained && !retries.has(candidate.id)) { outcomes.push(retained); continue; }
    outcomes.push(await reconcileEnrichmentCandidate(manifest, candidate, adapter, (retained?.attempt ?? 0) + 1));
  }
  const state: EnrichmentRunState = { formatVersion: 1, manifestId: manifest.id,
    manifestRevision: manifest.revision, manifestDigest: manifest.digest,
    status: outcomes.some((item) => item.status === "failed") ? "incomplete" : "ready",
    outcomes, decisions: classifyEnrichmentDecisions(manifest, outcomes, options.publishedRoot) };
  writeAtomic(statePath(options.stateRoot, manifest), state);
  return state;
}

function providerSourceId(outcome: EnrichmentOutcome): string {
  if (!outcome.observation) throw new Error(`${outcome.candidateId}: provider observation is unavailable`);
  return `aws-sqs-${outcome.observation.evidenceDigest.slice(-24)}`;
}

function applyProviderEvidence(concept: ConceptDocument, outcome: EnrichmentOutcome): ConceptDocument {
  if (!outcome.identity || !outcome.observation) return concept;
  const observation = outcome.observation, sourceId = providerSourceId(outcome);
  const observed = normalizeProviderObservedValues(concept, {
    sourceId,
    sourceResource: providerObservationSourceResource(observation),
    provider: observation.provider,
    profileFamily: observation.profileFamily,
    profileVersion: observation.profileVersion,
    authority: observation.authority,
    location: observation.location,
    nativeIdentity: observation.nativeIdentity,
    evidenceDigest: observation.evidenceDigest,
    observedAt: observation.observedAt,
    values: observation.values,
  });
  return withExternalIdentity(observed, { ...outcome.identity, evidence: [sourceId] });
}

function linkTo(source: ConceptDocument, target: ConceptDocument): string {
  const relative = path.posix.relative(path.posix.dirname(source.path), target.path);
  return `[${target.frontmatter.title ?? target.conceptId}](${relative})`;
}

function addRelation(source: ConceptDocument, target: ConceptDocument, kind: string, evidence: readonly string[]): ConceptDocument {
  const relationships = Array.isArray(source.frontmatter.relationships) ? [...source.frontmatter.relationships] : [];
  const exists = relationships.some((value) => mapping(value)?.kind === kind && mapping(value)?.target === target.conceptId);
  if (!exists) relationships.push({ kind, target: target.conceptId, evidence });
  const link = linkTo(source, target), body = source.body.includes(`](${path.posix.relative(path.posix.dirname(source.path), target.path)})`)
    ? source.body : `${source.body.trimEnd()}\n\n## Related concepts\n\n- ${link}\n`;
  return { ...source, frontmatter: { ...source.frontmatter, relationships }, body };
}

function governedQuestion(root: string, id: string): GovernedQuestion {
  const bundle = loadOkfBundle(root), concept = [...bundle.concepts.values()].find((item) => item.type === "Question" && item.conceptId === `questions/${id}`);
  if (!concept) throw new Error(`Question is unavailable: ${id}`);
  const question = parseQuestionDocument(concept);
  const observations = question.references.flatMap((reference) => {
    if (reference.referenceKind !== "owned-item" || reference.itemKind !== "observed-value") return [];
    const owner = bundle.concepts.get(reference.owner);
    return owner ? readObservedValues(owner).filter((value) => value.id === reference.itemKey) : [];
  });
  return { ...question, status: question.state, observationIds: observations.map((value) => value.id), observations };
}

function copyBaseToProposal(baseRoot: string, staging: string, evidenceDigest: string, createdAt: string): string {
  prepareBundleProposal({ currentBundleRoot: baseRoot, proposalRoot: staging,
    proposalId: `proposal-enrichment-${evidenceDigest.slice(-24)}`, evidenceDigest, createdAt });
  return path.join(staging, "bundle");
}

function copyBundleSnapshot(sourceRoot: string, targetRoot: string): void {
  const bundle = loadOkfBundle(sourceRoot, { requireAgentBaseRootIndex: true });
  for (const relative of bundle.files.filter((file) => file !== ".git" && !file.startsWith(".git/"))) {
    const target = path.join(targetRoot, ...relative.split("/"));
    fs.mkdirSync(path.dirname(target), { recursive: true, mode: 0o700 });
    fs.copyFileSync(path.join(sourceRoot, ...relative.split("/")), target, fs.constants.COPYFILE_EXCL);
  }
}

function assertNoLocalOverlap(publishedRoot: string, localRoot: string, manifest: EnrichmentManifest): void {
  const published = loadOkfBundle(publishedRoot, { requireAgentBaseRootIndex: true });
  const local = loadOkfBundle(localRoot, { requireAgentBaseRootIndex: true });
  const affected = new Set(manifest.candidates.flatMap((candidate) => [candidate.sourceConceptId,
    ...(candidate.targetConceptId ? [candidate.targetConceptId] : []),
    ...(candidate.question ? [`questions/${candidate.question.id}`] : [])]));
  for (const conceptId of affected) {
    const before = published.concepts.get(conceptId), current = local.concepts.get(conceptId);
    if (!before || !current || before.path !== current.path
      || !fs.readFileSync(path.join(publishedRoot, before.path)).equals(fs.readFileSync(path.join(localRoot, current.path)))) {
      throw new Error(`Local Draft overlaps enrichment subject ${conceptId}; resolve or publish it before Finalize`);
    }
  }
}

export function finalizeDomainEnrichment(options: Readonly<{
  stateRoot: string;
  publishedRoot: string;
  localHub: AdmittedLocalHubState;
  manifestId: string;
  manifestRevision: number;
  answers: readonly EnrichmentAnswer[];
}>): Readonly<{ proposal: AnyHubProposal; inspection: HubProposalInspection }> {
  const manifest = readEnrichmentManifest(options.stateRoot, options.manifestId, options.manifestRevision);
  const state = readRunState(options.stateRoot, manifest);
  if (!state || state.status !== "ready") throw new Error("enrichment requires trusted terminal outcomes before Finalize");
  const expectedDecisions = classifyEnrichmentDecisions(manifest, state.outcomes, options.publishedRoot);
  if (!isDeepStrictEqual(state.decisions, expectedDecisions)) throw new Error("enrichment decision packet integrity is invalid");
  if (options.localHub.remoteBase !== manifest.baseCommit) throw new Error("Published Hub base changed after enrichment Prepare");
  const answerByCandidate = new Map(options.answers.map((answer) => [answer.candidateId, answer]));
  if (answerByCandidate.size !== options.answers.length) throw new Error("enrichment answers contain duplicate candidate IDs");
  for (const answer of options.answers) {
    const decision = state.decisions.find((item) => item.candidateId === answer.candidateId && item.tier !== "automatic");
    if (!decision || decision.question.id !== answer.questionId || decision.question.revision !== answer.questionRevision) {
      throw new Error(`answer does not target the exact pending Question revision: ${answer.candidateId}`);
    }
  }
  const evidenceDigest = `sha256:${createHash("sha256").update(JSON.stringify({ manifest: manifest.digest,
    outcomes: state.outcomes, answers: options.answers })).digest("hex")}`;
  const staging = path.join(path.resolve(options.stateRoot), "proposals", `.staging-${manifest.id}-r${manifest.revision}`);
  const baseSnapshot = `${staging}-base`;
  fs.rmSync(staging, { recursive: true, force: true });
  fs.rmSync(baseSnapshot, { recursive: true, force: true });
  try {
    assertNoLocalOverlap(options.publishedRoot, options.localHub.root, manifest);
    copyBundleSnapshot(options.localHub.root, baseSnapshot);
    const bundleRoot = copyBaseToProposal(baseSnapshot, staging, evidenceDigest, manifest.createdAt);
    const outcomes = new Map(state.outcomes.map((item) => [item.candidateId, item]));
    const duplicateCandidates = duplicateIdentityCandidateIds(manifest, state.outcomes, bundleRoot);
    for (const candidate of manifest.candidates) {
      const result = outcomes.get(candidate.id)!;
      if (!["confirmed", "rejected"].includes(result.status) || !result.observation || duplicateCandidates.has(candidate.id)) continue;
      const bundle = loadOkfBundle(bundleRoot), ownerId = candidate.targetConceptId ?? candidate.sourceConceptId;
      const owner = bundle.concepts.get(ownerId)!;
      fs.writeFileSync(path.join(bundleRoot, owner.path), renderConceptDocument(applyProviderEvidence(owner, result)), { mode: 0o600 });
      if (result.status === "confirmed" && candidate.kind === "relation" && candidate.targetConceptId && candidate.predicate) {
        const nextBundle = loadOkfBundle(bundleRoot), source = nextBundle.concepts.get(candidate.sourceConceptId)!, target = nextBundle.concepts.get(candidate.targetConceptId)!;
        fs.writeFileSync(path.join(bundleRoot, source.path), renderConceptDocument(addRelation(source, target,
          candidate.predicate, candidate.interactionEvidenceIds)), { mode: 0o600 });
      }
    }
    const guidance: Readonly<{ conceptId: string; by: string; at: string }>[] = [];
    for (const decision of state.decisions) {
      const candidate = manifest.candidates.find((item) => item.id === decision.candidateId)!, result = outcomes.get(candidate.id)!;
      const question = governedQuestion(bundleRoot, decision.question.id);
      if (question.revision !== decision.question.revision) throw new Error(`${candidate.id}: Question revision changed before Finalize`);
      if (decision.tier === "automatic") {
        const ownerId = candidate.targetConceptId ?? candidate.sourceConceptId;
        const owner = loadOkfBundle(bundleRoot).concepts.get(ownerId)!;
        const observed = readObservedValues(owner).find((value) => value.sourceId === providerSourceId(result));
        if (!observed) throw new Error(`${candidate.id}: automatic Question evidence is unavailable`);
        const resolved = resolveQuestionFromEvidence(question, { referenceKind: "owned-item", owner: ownerId,
          itemKind: "observed-value", itemKey: observed.id, sourceId: observed.sourceId,
          ...(observed.observed.evidenceDigest ? { observedRevision: observed.observed.evidenceDigest } : {}) });
        fs.writeFileSync(path.join(bundleRoot, "questions", `${question.id}.md`), renderQuestionDocument(resolved), { mode: 0o600 });
        continue;
      }
      const answer = answerByCandidate.get(candidate.id);
      if (!answer || answer.action === "defer") continue;
      if (!answer.answer || !answer.maintainer) throw new Error(`${candidate.id}: maintainer answer and identity are required`);
      const materialized = materializeQuestionGuidance({ targetRoot: bundleRoot, question,
        answer: answer.answer, by: answer.maintainer, at: manifest.createdAt });
      guidance.push({ conceptId: materialized.concept.conceptId, by: answer.maintainer, at: manifest.createdAt });
    }
    const proposed = loadOkfBundle(bundleRoot, { requireAgentBaseRootIndex: true });
    const failures = [...validateBundleExternalIdentities(proposed.concepts.values()),
      ...validateBundleObservedValues(proposed.concepts.values()),
      ...validateOkfRelationships([...proposed.concepts].map(([identity, concept]) => ({ identity, concept }))).failures];
    if (failures.length) throw new Error(`enrichment bundle validation failed: ${failures.join("; ")}`);
    const validated = validateBundleProposal(baseSnapshot, staging, { maintainerGuidance: guidance });
    if (!validated.producerValidation?.passed) throw new Error(`enrichment proposal failed validation: ${validated.producerValidation?.failures.join("; ")}`);
    const diff = diffBundleProposal(baseSnapshot, staging);
    if (!diff.applicable) throw new Error("enrichment proposal contains an inapplicable change");
    const inspection = attachHubInspectionContext(inspectHubProposal(diff.entries,
      { baseRoot: baseSnapshot, proposedRoot: bundleRoot }), [], {
      partial: state.outcomes.some((item) => item.status === "unresolved"),
      limitations: [...state.outcomes.flatMap((item) => item.limitation ? [item.limitation] : []),
        ...(duplicateCandidates.size ? [`Strong provider identity matches multiple concepts for candidates ${[...duplicateCandidates].sort().join(", ")}; duplicate identity changes and automatic Question transitions were withheld for explicit merge review.`] : [])],
    });
    const diffDigest = `sha256:${createHash("sha256").update(JSON.stringify(inspection.entries)).digest("hex")}`;
    const common = { mode: "enrichment" as const, subject: manifest.domainId, baseCommit: options.localHub.activeHead,
      domainId: manifest.domainId, sourceRepositoryIds: manifest.repositoryIds, manifestDigest: manifest.digest,
      evidenceDigest, schemaVersion: AGENTBASE_OKF_SCHEMA_CATALOG_VERSION,
      selectedSchemas: [...new Set([...proposed.concepts.values()].map((concept) => concept.type))].sort(),
      treeDigest: diff.proposedTreeDigest, diffDigest };
    const proposal = options.localHub.kind === "local-only"
      ? createHubProposal({ ...common, localHubId: options.localHub.localHubId })
      : createHubProposal({ ...common, hub: options.localHub.hub });
    writeHubProposalState(staging, proposal);
    copyBundleSnapshot(baseSnapshot, path.join(staging, "base"));
    fs.writeFileSync(path.join(staging, "inspection.json"), `${JSON.stringify(inspection, null, 2)}\n`, { mode: 0o600 });
    fs.writeFileSync(path.join(staging, "enrichment-summary.json"), `${JSON.stringify({
      manifestId: manifest.id, manifestRevision: manifest.revision, manifestDigest: manifest.digest,
      domainId: manifest.domainId, repositoryIds: manifest.repositoryIds,
      providerScope: manifest.providerScope, catalogVersion: manifest.catalogVersion,
      detectorVersions: manifest.detectorVersions, profileVersions: manifest.profileVersions,
      candidates: manifest.candidates.map((candidate) => ({ id: candidate.id, kind: candidate.kind,
        ...(candidate.question ? { question: candidate.question } : {}) })),
      outcomes: state.outcomes.map((outcome) => ({ candidateId: outcome.candidateId, status: outcome.status,
        ...(outcome.limitation ? { limitation: outcome.limitation } : {}) })),
    }, null, 2)}\n`, { mode: 0o600 });
    fs.writeFileSync(path.join(staging, "runtime.json"), `${JSON.stringify({ checkoutRoot: options.localHub.root })}\n`, { mode: 0o600 });
    const target = path.join(path.resolve(options.stateRoot), "proposals", proposal.id);
    if (fs.existsSync(target)) throw new Error("matching enrichment proposal already exists");
    fs.renameSync(staging, target);
    return { proposal, inspection };
  } finally {
    if (fs.existsSync(staging)) fs.rmSync(staging, { recursive: true, force: true });
    if (fs.existsSync(baseSnapshot)) fs.rmSync(baseSnapshot, { recursive: true, force: true });
  }
}
