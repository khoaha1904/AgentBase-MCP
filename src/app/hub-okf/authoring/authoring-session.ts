import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import type { AnyHubProposal, HubIdentity } from "../../../core/hub/index.ts";
import {
  loadOkfBundle, normalizeConfirmedDomain,
  normalizeRepositoryObservedValues,
  readObservedValues, readRepositoryIdentityRecord,
  readRepositoryRefreshCoverage, renderConceptDocument,
  validateAgentBaseInitialIngestHomePlan, validateInventoryReceipt,
  type AgentBaseInitialIngestHomePlan, type ConfirmedDomain, type HubRemovalDeclaration, type OkfAuthoringGuidance,
  type InventoryReceipt,
  type OkfValue,
  type RepositoryIdentityRecord,
} from "../../../core/knowledge/index.ts";
import {
  attachHubInspectionContext, bindHubProposalInspection, inspectHubProposal, type HubChangeEntry, type HubProposalInspection,
} from "../review/inspect.ts";
import { prepareNewHubProposal } from "./prepare.ts";
import { prepareRefreshHubProposal } from "./refresh.ts";
import {
  validateRefreshChangeAccounting,
  type RefreshChangeAccounting,
  type RefreshChangeOutcome,
  type RefreshSourceChanges,
} from "./refresh-change-accounting.ts";
import {
  writeInitialIngestSkeletons,
  type InitialIngestSkeleton,
} from "./initial-ingest-skeleton.ts";
import {
  assertQuestionAuthoringUntouched,
  materializeQuestionDeclarations, materializeReceiptQuestionPlans, questionDocumentPaths,
  validateQuestionDeclarations,
  type QuestionDeclaration,
} from "./questions.ts";

import { validateHubAuthoringBundle } from "./authoring-validation.ts";
import {
  receiptCoverage, receiptInspectionContext, restoreReceiptEmbeddedKnowledge,
  retainInitialDiscoveryDebt, validateReceiptMaterialization,
} from "./receipt-materialization.ts";

export type HubAuthoringSession = Readonly<{
  formatVersion: 1;
  id: string;
  mode: "new" | "refresh";
  refreshScope?: RefreshScope;
  hub?: HubIdentity;
  localHubId?: string;
  baseCommit: string;
  sourceRepositoryId: string;
  evidenceDigest: string;
  subjectDirectory: string;
  confirmedDomain?: ConfirmedDomain;
  homePlan?: AgentBaseInitialIngestHomePlan;
  signals: readonly string[];
  selectedSchemas: readonly string[];
  guidance?: OkfAuthoringGuidance;
  coverage?: Readonly<{ partial: boolean; limitations: readonly string[] }>;
  discoveryReceipt?: InventoryReceipt;
  sourceChanges?: RefreshSourceChanges;
  skeletons?: readonly InitialIngestSkeleton[];
  finalizeFailures?: number;
  requireObservedRevision?: boolean;
  root: string;
  bundleRoot: string;
  baseRoot: string;
  checkoutRoot: string;
  sourceRepositoryRoot: string;
  sourceState: HubAuthoringSourceState;
  createdAt: string;
}>;

export type RefreshScope = "delta" | "coverage";

export type HubAuthoringSourceState = Readonly<{
  commit: string | null;
  dirty: boolean;
  dirtyDigest: string | null;
}>;

export type BeginHubAuthoringOptions = Readonly<{
  stateRoot: string;
  mode: "new" | "refresh";
  refreshScope?: RefreshScope;
  hub?: HubIdentity;
  localHubId?: string;
  baseCommit: string;
  checkoutRoot: string;
  sourceRepositoryRoot: string;
  sourceRepositoryId: string;
  sourceState: HubAuthoringSourceState;
  evidenceDigest: string;
  subjectDirectory: string;
  confirmedDomain?: ConfirmedDomain;
  homePlan?: AgentBaseInitialIngestHomePlan;
  signals: readonly string[];
  selectedSchemas: readonly string[];
  guidance?: OkfAuthoringGuidance;
  coverage?: Readonly<{ partial: boolean; limitations: readonly string[] }>;
  discoveryReceipt?: InventoryReceipt;
  sourceChanges?: RefreshSourceChanges;
  requireObservedRevision?: boolean;
  createdAt: string;
}>;

function privateDirectory(directory: string): void {
  if (fs.existsSync(directory) && fs.lstatSync(directory).isSymbolicLink()) throw new Error("Hub state cannot cross a symlink");
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  fs.chmodSync(directory, 0o700);
}

function copyCheckout(source: string, target: string): void {
  privateDirectory(target);
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    if (entry.name === ".git") continue;
    if (entry.isSymbolicLink()) throw new Error("Hub checkout content cannot contain symlinks");
    fs.cpSync(path.join(source, entry.name), path.join(target, entry.name), {
      recursive: true,
      errorOnExist: true,
      force: false,
    });
  }
}

function writeSession(session: HubAuthoringSession): void {
  const target = path.join(session.root, "session.json"), temporary = `${target}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(session, null, 2)}\n`, { mode: 0o600, flag: "wx" });
  fs.renameSync(temporary, target);
}

function receiptTerminalPath(stateRoot: string, receiptId: string): string {
  return path.join(path.resolve(stateRoot), "receipt-terminals", `${receiptId}.json`);
}

function writeReceiptTerminal(stateRoot: string, receipt: InventoryReceipt, proposalId: string): void {
  const target = receiptTerminalPath(stateRoot, receipt.id);
  privateDirectory(path.dirname(target));
  if (fs.existsSync(target)) throw new Error("discovery Receipt is already terminal");
  const temporary = `${target}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify({ receiptId: receipt.id, receiptDigest: receipt.digest,
    proposalId, state: "finalized" })}\n`, { mode: 0o600, flag: "wx" });
  fs.renameSync(temporary, target);
}

export function markInventoryReceiptFinalized(
  stateRoot: string,
  receipt: InventoryReceipt,
  proposalId: string,
): void {
  writeReceiptTerminal(stateRoot, receipt, proposalId);
}

export function beginHubAuthoringSession(options: BeginHubAuthoringOptions): HubAuthoringSession {
  if (options.discoveryReceipt) {
    validateInventoryReceipt(options.discoveryReceipt);
    options = { ...options, coverage: receiptCoverage(options.discoveryReceipt) };
  }
  const authority = options.hub?.repository ?? options.localHubId;
  if (!authority || (!options.hub && !/^[a-f0-9]{24}$/.test(options.localHubId ?? ""))) throw new Error("Hub authoring authority is invalid");
  if (!path.isAbsolute(options.sourceRepositoryRoot) || !fs.existsSync(options.sourceRepositoryRoot)
    || fs.lstatSync(options.sourceRepositoryRoot).isSymbolicLink()
    || !fs.statSync(options.sourceRepositoryRoot).isDirectory()) {
    throw new Error("Hub authoring source repository is invalid");
  }
  if (options.coverage && (options.coverage.partial !== (options.coverage.limitations.length > 0)
    || options.coverage.limitations.length > 64
    || options.coverage.limitations.some((item) => !item.trim() || item !== item.trim() || item.length > 512)
    || new Set(options.coverage.limitations).size !== options.coverage.limitations.length)) {
    throw new Error("Hub authoring coverage is inconsistent");
  }
  if (options.homePlan && options.confirmedDomain) {
    throw new Error("Initial Ingest cannot capture both a home plan and confirmed Domain");
  }
  if (options.mode === "new" && options.sourceChanges) throw new Error("Initial Ingest cannot capture Refresh source changes");
  if (options.mode === "new" && options.refreshScope !== undefined) throw new Error("Initial Ingest cannot capture Refresh scope");
  if (options.mode === "refresh" && options.homePlan) throw new Error("Refresh cannot capture an Initial Ingest home plan");
  const refreshScope = options.mode === "refresh" ? options.refreshScope ?? "delta" : undefined;
  if (refreshScope === "coverage" && !options.coverage) throw new Error("Coverage Refresh requires a coverage account");
  const homePlan = options.homePlan ? validateAgentBaseInitialIngestHomePlan(options.homePlan) : undefined;
  if (options.sourceChanges && (!Number.isSafeInteger(options.sourceChanges.omitted) || options.sourceChanges.omitted < 0
    || options.sourceChanges.paths.length > 128 || new Set(options.sourceChanges.paths).size !== options.sourceChanges.paths.length
    || options.sourceChanges.paths.some((item) => !item || item.length > 512)
    || options.sourceChanges.limitations.length > 64
    || options.sourceChanges.limitations.some((item) => !item || item.length > 512))) {
    throw new Error("Refresh source changes are invalid");
  }
  if (options.discoveryReceipt && fs.existsSync(receiptTerminalPath(options.stateRoot, options.discoveryReceipt.id))) {
    throw new Error("discovery Receipt already finalized and cannot create another session");
  }
  const seed = [options.mode, refreshScope ?? "", authority, options.baseCommit, options.sourceRepositoryId,
    options.evidenceDigest, options.subjectDirectory, options.confirmedDomain?.identity ?? "",
    options.confirmedDomain?.title ?? "", options.discoveryReceipt?.id ?? "",
    JSON.stringify(homePlan ?? null), JSON.stringify(options.sourceChanges ?? null)].join("\0");
  const id = `hub-session-${createHash("sha256").update(seed).digest("hex").slice(0, 24)}`;
  const root = path.join(path.resolve(options.stateRoot), "sessions", id);
  if (fs.existsSync(root)) {
    if (!fs.existsSync(path.join(root, "session.json"))) fs.rmSync(root, { recursive: true, force: true });
    else {
    const existing = readHubAuthoringSession(options.stateRoot, id, options.checkoutRoot);
    const matches = existing.mode === options.mode && (existing.refreshScope ?? (existing.mode === "refresh" ? "delta" : undefined)) === refreshScope
      && existing.baseCommit === options.baseCommit
      && existing.sourceRepositoryId === options.sourceRepositoryId && existing.evidenceDigest === options.evidenceDigest
      && existing.subjectDirectory === options.subjectDirectory
      && JSON.stringify(existing.confirmedDomain) === JSON.stringify(options.confirmedDomain)
      && JSON.stringify(existing.homePlan) === JSON.stringify(homePlan)
      && existing.discoveryReceipt?.digest === options.discoveryReceipt?.digest
      && JSON.stringify(existing.sourceChanges) === JSON.stringify(options.sourceChanges)
      && JSON.stringify(existing.sourceState) === JSON.stringify(options.sourceState);
      if (!matches) throw new Error("matching Hub authoring session exists with different authority");
      return existing;
    }
  }
  const baseRoot = path.join(root, "base"), bundleRoot = path.join(root, "bundle");
  privateDirectory(path.dirname(root)); privateDirectory(root);
  copyCheckout(options.checkoutRoot, baseRoot);
  copyCheckout(options.checkoutRoot, bundleRoot);
  const session: HubAuthoringSession = {
    formatVersion: 1,
    id,
    mode: options.mode,
    ...(refreshScope ? { refreshScope } : {}),
    ...(options.hub ? { hub: options.hub } : { localHubId: options.localHubId! }),
    baseCommit: options.baseCommit,
    sourceRepositoryId: options.sourceRepositoryId,
    sourceState: options.sourceState,
    evidenceDigest: options.evidenceDigest,
    subjectDirectory: options.subjectDirectory,
    ...(options.confirmedDomain ? { confirmedDomain: options.confirmedDomain } : {}),
    ...(homePlan ? { homePlan } : {}),
    signals: [...options.signals],
    selectedSchemas: [...options.selectedSchemas],
    ...(options.guidance ? { guidance: options.guidance } : {}),
    ...(options.coverage ? { coverage: options.coverage } : {}),
    ...(options.discoveryReceipt ? { discoveryReceipt: options.discoveryReceipt } : {}),
    ...(options.sourceChanges ? { sourceChanges: options.sourceChanges } : {}),
    ...(options.requireObservedRevision ? { requireObservedRevision: true } : {}),
    root,
    bundleRoot,
    baseRoot,
    checkoutRoot: options.checkoutRoot,
    sourceRepositoryRoot: path.resolve(options.sourceRepositoryRoot),
    createdAt: options.createdAt,
  };
  writeSession(session);
  return session;
}

export function readHubAuthoringSession(
  stateRoot: string,
  sessionId: string,
  expectedCheckoutRoot: string,
): HubAuthoringSession {
  if (!/^hub-session-[a-f0-9]{24}$/.test(sessionId)) throw new Error("Hub authoring session ID is invalid");
  const root = path.join(path.resolve(stateRoot), "sessions", sessionId);
  const value = JSON.parse(fs.readFileSync(path.join(root, "session.json"), "utf8")) as HubAuthoringSession;
  const checkoutRoot = path.resolve(value.checkoutRoot);
  const sourceRepositoryRoot = typeof value.sourceRepositoryRoot === "string"
    ? path.resolve(value.sourceRepositoryRoot) : "";
  const expected = path.resolve(expectedCheckoutRoot);
  const confirmedDomain = value.confirmedDomain
    ? normalizeConfirmedDomain({ identity: value.confirmedDomain.identity, title: value.confirmedDomain.title }) : undefined;
  const homePlan = value.homePlan ? validateAgentBaseInitialIngestHomePlan(value.homePlan) : undefined;
  if (value.discoveryReceipt) validateInventoryReceipt(value.discoveryReceipt);
  if (value.formatVersion !== 1 || value.id !== sessionId || path.resolve(value.root) !== root
    || path.resolve(value.baseRoot) !== path.join(root, "base")
    || path.resolve(value.bundleRoot) !== path.join(root, "bundle")
    || !path.isAbsolute(value.checkoutRoot) || checkoutRoot !== expected
    || !fs.existsSync(checkoutRoot) || fs.lstatSync(checkoutRoot).isSymbolicLink()
    || !fs.statSync(checkoutRoot).isDirectory()
    || typeof value.sourceRepositoryRoot !== "string" || !path.isAbsolute(value.sourceRepositoryRoot)
    || !fs.existsSync(sourceRepositoryRoot) || fs.lstatSync(sourceRepositoryRoot).isSymbolicLink()
    || !fs.statSync(sourceRepositoryRoot).isDirectory()
    || typeof value.sourceState?.dirty !== "boolean"
    || (value.coverage !== undefined && (typeof value.coverage.partial !== "boolean"
      || !Array.isArray(value.coverage.limitations)
      || value.coverage.partial !== (value.coverage.limitations.length > 0)
      || value.coverage.limitations.length > 64
      || value.coverage.limitations.some((item) => typeof item !== "string"
        || !item.trim() || item !== item.trim() || item.length > 512)
      || new Set(value.coverage.limitations).size !== value.coverage.limitations.length))
    || (value.mode === "new" && value.refreshScope !== undefined)
    || (value.mode === "refresh" && value.refreshScope !== undefined
      && value.refreshScope !== "delta" && value.refreshScope !== "coverage")
    || (value.mode === "refresh" && value.refreshScope === "coverage" && !value.coverage)
    || (confirmedDomain && confirmedDomain.evidenceResource !== value.confirmedDomain?.evidenceResource)
    || (homePlan && JSON.stringify(homePlan) !== JSON.stringify(value.homePlan))
    || (!value.hub && !/^[a-f0-9]{24}$/.test(value.localHubId ?? ""))) {
    throw new Error("Hub authoring session state is invalid");
  }
  if (value.skeletons && (value.mode !== "new" || !value.discoveryReceipt
    || value.skeletons.some((skeleton) => !skeleton.identity || !skeleton.path.endsWith(".md") || !skeleton.type))) {
    throw new Error("Hub authoring skeleton state is invalid");
  }
  if (value.finalizeFailures !== undefined
    && (!Number.isSafeInteger(value.finalizeFailures) || value.finalizeFailures < 0 || value.finalizeFailures > 2)) {
    throw new Error("Hub authoring repair state is invalid");
  }
  return value;
}

export function materializeInitialIngestSessionSkeletons(
  stateRoot: string,
  sessionId: string,
  expectedCheckoutRoot: string,
  repository: RepositoryIdentityRecord,
): readonly InitialIngestSkeleton[] {
  const session = readHubAuthoringSession(stateRoot, sessionId, expectedCheckoutRoot);
  if (session.skeletons) return session.skeletons;
  if (session.mode !== "new" || !session.discoveryReceipt) {
    throw new Error("only receipt-bound Initial Ingest can materialize initial skeletons");
  }
  fs.rmSync(session.bundleRoot, { recursive: true, force: true });
  copyCheckout(session.baseRoot, session.bundleRoot);
  try {
    const skeletons = writeInitialIngestSkeletons({
      bundleRoot: session.bundleRoot,
      subjectDirectory: session.subjectDirectory,
      sourceRepositoryId: session.sourceRepositoryId,
      repository,
      ...(session.confirmedDomain ? { confirmedDomain: session.confirmedDomain } : {}),
      ...(session.homePlan ? { homePlan: session.homePlan } : {}),
      request: session.discoveryReceipt.guidanceRequest,
      guidance: session.discoveryReceipt.guidance,
      createdAt: session.createdAt,
      sourceState: session.sourceState,
    });
    const persisted = { ...session, skeletons };
    writeSession(persisted);
    return skeletons;
  } catch (error) {
    fs.rmSync(session.bundleRoot, { recursive: true, force: true });
    copyCheckout(session.baseRoot, session.bundleRoot);
    throw error;
  }
}

export function validateHubAuthoringSession(
  stateRoot: string,
  sessionId: string,
  expectedCheckoutRoot: string,
): Readonly<{ valid: true; sessionId: string; mode: "new" | "refresh" }> {
  const session = readHubAuthoringSession(stateRoot, sessionId, expectedCheckoutRoot);
  validateHubAuthoringBundle(session, session.bundleRoot);
  return { valid: true, sessionId: session.id, mode: session.mode };
}

function normalizeAuthoredObservations(
  session: HubAuthoringSession,
  targetRoot: string,
  removals: readonly HubRemovalDeclaration[],
): void {
  copyCheckout(session.bundleRoot, targetRoot);
  const authored = loadOkfBundle(targetRoot, { requireAgentBaseRootIndex: true });
  const base = loadOkfBundle(session.baseRoot);
  const removalByConcept = new Map(removals.map((removal) => [removal.conceptId, removal]));
  for (const concept of authored.concepts.values()) {
    const previous = base.concepts.get(concept.conceptId);
    const hasAuthoredValues = Array.isArray(mapping(concept.frontmatter.agentbase).observed_values);
    const hasPreviousValues = previous
      ? Array.isArray(mapping(previous.frontmatter.agentbase).observed_values) : false;
    const removesContribution = removalByConcept.get(concept.conceptId)?.kind === "repository-contribution";
    if (!hasAuthoredValues && !hasPreviousValues && !removesContribution) continue;
    const normalized = normalizeRepositoryObservedValues(concept, {
      repositoryId: session.sourceRepositoryId,
      sourceState: session.sourceState,
      observedAt: session.createdAt,
      ...(previous ? { previous } : {}),
      removeRepositoryContribution: removesContribution,
    });
    fs.writeFileSync(path.join(targetRoot, normalized.path), renderConceptDocument(normalized), { mode: 0o600 });
  }
}

function mapping(value: OkfValue | undefined): Readonly<Record<string, OkfValue>> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Readonly<Record<string, OkfValue>> : {};
}

function hasRepositoryCoverageDebt(session: HubAuthoringSession): boolean {
  return [...loadOkfBundle(session.baseRoot).concepts.values()].some((concept) =>
    readRepositoryIdentityRecord(concept)?.id === session.sourceRepositoryId
    && readRepositoryRefreshCoverage(concept) !== undefined);
}

function recordSuccessfulObservation(
  session: HubAuthoringSession,
  knowledgeChanged: boolean,
  refreshAccounting?: RefreshChangeAccounting,
): void {
  const bundle = loadOkfBundle(session.bundleRoot, { requireAgentBaseRootIndex: true });
  const baseBundle = loadOkfBundle(session.baseRoot);
  const repository = [...bundle.concepts.values()].find((concept) =>
    readRepositoryIdentityRecord(concept)?.id === session.sourceRepositoryId);
  // Runtime Refresh already requires a canonical Repository. Legacy direct
  // authoring fixtures may not have one, so they cannot carry this checkpoint.
  if (!repository) return;
  const agentbase = mapping(repository.frontmatter.agentbase);
  const repositoryMetadata = mapping(agentbase.repository);
  const refreshScope = session.refreshScope ?? "delta";
  const existingCoverage = [...baseBundle.concepts.values()]
    .filter((concept) => readRepositoryIdentityRecord(concept)?.id === session.sourceRepositoryId)
    .map(readRepositoryRefreshCoverage)
    .find((coverage) => coverage !== undefined);
  const partialCoverage = refreshScope === "coverage"
    && (session.coverage?.partial === true || refreshAccounting?.partial === true);
  const partialDelta = refreshAccounting?.partial === true;
  const nextRepository: Record<string, OkfValue> = {
    ...repositoryMetadata,
    observed_source: {
      commit: session.sourceState.commit,
      dirty: session.sourceState.dirty,
      dirty_digest: session.sourceState.dirtyDigest,
      observed_at: session.createdAt,
    },
  };
  if (refreshScope === "delta" && existingCoverage) nextRepository.refresh_coverage = {
    status: existingCoverage.status,
    omitted_changed_paths: existingCoverage.omittedChangedPaths,
    coverage_passes: existingCoverage.coveragePasses,
    limitations: existingCoverage.limitations,
    observed_at: existingCoverage.observedAt,
  };
  if (refreshScope === "delta" && partialDelta) {
    nextRepository.refresh_coverage = {
      status: "partial",
      omitted_changed_paths: Math.max(existingCoverage?.omittedChangedPaths ?? 0, refreshAccounting?.omitted ?? 0),
      coverage_passes: existingCoverage?.coveragePasses ?? 0,
      limitations: [...new Set([
        ...(refreshAccounting?.limitations ?? []),
        ...(existingCoverage?.limitations ?? []),
      ])].slice(0, 64),
      observed_at: session.createdAt,
    };
  } else if (refreshScope === "coverage") {
    if (!partialCoverage && !knowledgeChanged) {
      delete nextRepository.refresh_coverage;
    } else {
      const coveragePasses = Math.min(3, (existingCoverage?.coveragePasses ?? 0) + 1);
      const convergenceLimitation = "Coverage Refresh found new knowledge; another bounded convergence pass is required.";
      const capLimitation = "Coverage Refresh reached the three-pass convergence cap; remaining debt requires owner review.";
      nextRepository.refresh_coverage = {
        status: "partial",
        omitted_changed_paths: partialCoverage
          ? Math.max(existingCoverage?.omittedChangedPaths ?? 0, refreshAccounting?.omitted ?? 0)
          : refreshAccounting?.omitted ?? 0,
        coverage_passes: coveragePasses,
        limitations: [...new Set([
          ...(coveragePasses === 3 ? [capLimitation] : []),
          ...(knowledgeChanged ? [convergenceLimitation] : []),
          ...(refreshAccounting?.limitations ?? []),
          ...(session.coverage?.limitations ?? []),
          ...(partialCoverage ? existingCoverage?.limitations ?? [] : []),
        ])].slice(0, 64),
        observed_at: session.createdAt,
      };
    }
  }
  const frontmatter = {
    ...repository.frontmatter,
    agentbase: {
      ...agentbase,
      repository: nextRepository,
    },
  };
  fs.writeFileSync(path.join(session.bundleRoot, repository.path), renderConceptDocument({ ...repository, frontmatter }));
}

export function finalizeHubAuthoringSession(
  stateRoot: string,
  sessionId: string,
  expectedCheckoutRoot: string,
  questions: readonly QuestionDeclaration[] = [],
  removals: readonly HubRemovalDeclaration[] = [],
  currentSourceState?: HubAuthoringSourceState,
  currentHubHead?: string,
  terminalizeReceipt = true,
  changeAccounting: readonly RefreshChangeOutcome[] = [],
): Readonly<{ result: "no_change"; inspection: HubProposalInspection; observedSource: HubAuthoringSourceState & Readonly<{ observedAt: string }> }
  | { proposal: AnyHubProposal; inspection: HubProposalInspection; observedSource: HubAuthoringSourceState & Readonly<{ observedAt: string }> }> {
  const session = readHubAuthoringSession(stateRoot, sessionId, expectedCheckoutRoot);
  if ((session.finalizeFailures ?? 0) >= 2) {
    throw new Error("Initial Ingest is incomplete after its one repair attempt; start a new authoring session");
  }
  if (currentHubHead !== undefined && currentHubHead !== session.baseCommit) {
    throw new Error("Hub authoring base changed after Prepare");
  }
  if (!currentSourceState) throw new Error("current source state is required at Finalize");
  if (currentSourceState.commit !== session.sourceState.commit
    || currentSourceState.dirty !== session.sourceState.dirty
    || currentSourceState.dirtyDigest !== session.sourceState.dirtyDigest) {
    throw new Error("source repository changed after Prepare");
  }
  if (session.mode !== "refresh" && changeAccounting.length) {
    throw new Error("Initial Ingest does not accept Refresh change accounting");
  }
  const refreshAccounting = session.mode === "refresh" && session.sourceChanges
    ? validateRefreshChangeAccounting({
      sourceRepositoryId: session.sourceRepositoryId,
      sourceChanges: session.sourceChanges,
      baseRoot: session.baseRoot,
      authoredRoot: session.bundleRoot,
      outcomes: changeAccounting,
    }) : undefined;
  const staging = path.join(path.resolve(stateRoot), "proposals", `.staging-${session.id}`);
  const normalizedRoot = path.join(path.resolve(stateRoot), "proposals", `.normalized-${session.id}`);
  privateDirectory(path.dirname(staging));
  if (fs.existsSync(staging)) fs.rmSync(staging, { recursive: true, force: true });
  if (fs.existsSync(normalizedRoot)) fs.rmSync(normalizedRoot, { recursive: true, force: true });
  let finalized: Readonly<{
    proposal: AnyHubProposal;
    bundleRoot: string;
    inspection?: HubProposalInspection;
    diff?: Readonly<{ entries: readonly HubChangeEntry[] }>;
  }>;
  let receiptQuestionIds: readonly string[] = [];
  try {
    assertQuestionAuthoringUntouched(session.baseRoot, session.bundleRoot);
    const knowledgeChanged = loadOkfBundle(session.baseRoot).treeDigest !== loadOkfBundle(session.bundleRoot).treeDigest
      || questions.length > 0 || removals.length > 0;
    if (session.mode === "refresh"
      && (knowledgeChanged || Boolean(refreshAccounting?.outcomes.length)
        || refreshAccounting?.partial === true
        || (session.refreshScope === "coverage" && hasRepositoryCoverageDebt(session)))) {
      recordSuccessfulObservation(session, knowledgeChanged, refreshAccounting);
    }
    normalizeAuthoredObservations(session, normalizedRoot, removals);
    restoreReceiptEmbeddedKnowledge(session, normalizedRoot);
    retainInitialDiscoveryDebt(session, normalizedRoot);
    validateHubAuthoringBundle(session, normalizedRoot);
    const observations = [...loadOkfBundle(normalizedRoot).concepts.values()]
      .flatMap((concept) => readObservedValues(concept));
    if (session.discoveryReceipt && (questions.length || removals.length)) {
      throw new Error("receipt-bound Initial Ingest derives Questions and does not accept caller Questions or removals");
    }
    if (session.discoveryReceipt) validateReceiptMaterialization(session, normalizedRoot);
    const declarations = session.discoveryReceipt ? []
      : validateQuestionDeclarations(questions, observations, session.sourceRepositoryId);
    const materializedQuestions = session.discoveryReceipt
      ? materializeReceiptQuestionPlans(normalizedRoot, session.discoveryReceipt, session.skeletons ?? [], session.createdAt)
      : materializeQuestionDeclarations(session.baseRoot, normalizedRoot, declarations, observations, session.createdAt);
    const questionPaths = questionDocumentPaths(normalizedRoot, materializedQuestions);
    receiptQuestionIds = session.discoveryReceipt ? materializedQuestions.map((question) => question.id) : [];
    const common = {
      baseCommit: session.baseCommit,
      sourceRepositoryId: session.sourceRepositoryId,
      hubBundleRoot: session.baseRoot,
      authoredBundleRoot: normalizedRoot,
      proposalRoot: staging,
      subjectDirectory: session.subjectDirectory,
      evidenceDigest: session.evidenceDigest,
      signals: session.signals,
      selectedSchemas: session.selectedSchemas,
      questionPaths,
      ...(session.confirmedDomain && !session.homePlan ? { confirmedDomain: session.confirmedDomain } : {}),
      createdAt: session.createdAt,
    };
    if (session.hub) {
      finalized = session.mode === "new"
        ? prepareNewHubProposal({ ...common, hub: session.hub })
        : prepareRefreshHubProposal({ ...common, hub: session.hub, removals });
    } else {
      const localHubId = session.localHubId!;
      finalized = session.mode === "new"
        ? prepareNewHubProposal({ ...common, localHubId })
        : prepareRefreshHubProposal({ ...common, localHubId, removals });
    }
  } catch (error) {
    fs.rmSync(staging, { recursive: true, force: true });
    fs.rmSync(normalizedRoot, { recursive: true, force: true });
    if (session.discoveryReceipt) {
      const finalizeFailures = Math.min(2, (session.finalizeFailures ?? 0) + 1);
      writeSession({ ...session, finalizeFailures });
      if (finalizeFailures >= 2) {
        throw new Error(`Initial Ingest remains incomplete after one repair: ${error instanceof Error ? error.message : "validation failed"}`);
      }
      throw new Error(`${error instanceof Error ? error.message : "Initial Ingest validation failed"}; one repair attempt remains`);
    }
    throw error;
  }
  fs.rmSync(normalizedRoot, { recursive: true, force: true });
  const inspection = finalized.inspection
    ?? inspectHubProposal(finalized.diff!.entries, { baseRoot: session.baseRoot, proposedRoot: finalized.bundleRoot });
  if (session.mode === "refresh" && !questions.length
    && inspection.entries.every((entry) => entry.change === "preserved")) {
    fs.rmSync(staging, { recursive: true, force: true });
    fs.rmSync(session.root, { recursive: true, force: true });
    return { result: "no_change", inspection: attachHubInspectionContext(inspection, [], session.coverage,
      refreshAccounting ? { changeAccounting: refreshAccounting } : {}),
      observedSource: { ...session.sourceState, observedAt: session.createdAt } };
  }
  const contextualInspection = attachHubInspectionContext(inspection, questions, session.coverage,
    {
        ...(session.discoveryReceipt ? {
          discovery: receiptInspectionContext(session, finalized.bundleRoot, receiptQuestionIds),
        } : {}),
        ...(refreshAccounting ? { changeAccounting: refreshAccounting } : {}),
      });
  const reviewed = { proposal: finalized.proposal,
    inspection: bindHubProposalInspection(contextualInspection, {
      baseRoot: session.baseRoot, proposedRoot: finalized.bundleRoot, proposal: finalized.proposal,
    }) };
  fs.cpSync(session.baseRoot, path.join(staging, "base"), { recursive: true, errorOnExist: true, force: false });
  fs.writeFileSync(path.join(staging, "inspection.json"), `${JSON.stringify(reviewed.inspection, null, 2)}\n`, { mode: 0o600 });
  fs.writeFileSync(path.join(staging, "runtime.json"), `${JSON.stringify({ checkoutRoot: session.checkoutRoot })}\n`, { mode: 0o600 });
  const proposalRoot = path.join(path.resolve(stateRoot), "proposals", reviewed.proposal.id);
  if (fs.existsSync(proposalRoot)) throw new Error("finalized Hub proposal already exists");
  fs.renameSync(staging, proposalRoot);
  if (session.discoveryReceipt && terminalizeReceipt) {
    writeReceiptTerminal(stateRoot, session.discoveryReceipt, reviewed.proposal.id);
  }
  fs.rmSync(session.root, { recursive: true, force: true });
  return { ...reviewed, observedSource: { ...session.sourceState, observedAt: session.createdAt } };
}
