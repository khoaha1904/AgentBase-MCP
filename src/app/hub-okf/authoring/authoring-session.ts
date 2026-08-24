import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import type { AnyHubProposal, HubIdentity } from "../../../core/hub/index.ts";
import {
  loadOkfBundle, normalizeConfirmedDomain, normalizeRepositoryObservedValues,
  parseRepositorySourceResource, readObservedValues, readRepositoryIdentityRecord,
  renderConceptDocument, repositorySourceResources,
  type ConfirmedDomain, type HubRemovalDeclaration, type OkfAuthoringGuidance,
  type OkfValue,
} from "../../../core/knowledge/index.ts";
import {
  attachHubInspectionContext, inspectHubProposal, type HubChangeEntry, type HubProposalInspection,
} from "../review/inspect.ts";
import { prepareNewHubProposal } from "./prepare.ts";
import { prepareRefreshHubProposal } from "./refresh.ts";
import {
  assertQuestionAuthoringUntouched,
  materializeQuestionDeclarations,
  validateQuestionDeclarations,
  type QuestionDeclaration,
} from "./questions.ts";

export type HubAuthoringSession = Readonly<{
  formatVersion: 1;
  id: string;
  mode: "new" | "refresh";
  hub?: HubIdentity;
  localHubId?: string;
  baseCommit: string;
  sourceRepositoryId: string;
  evidenceDigest: string;
  subjectDirectory: string;
  confirmedDomain?: ConfirmedDomain;
  signals: readonly string[];
  selectedSchemas: readonly string[];
  guidance?: OkfAuthoringGuidance;
  coverage?: Readonly<{ partial: boolean; limitations: readonly string[] }>;
  root: string;
  bundleRoot: string;
  baseRoot: string;
  checkoutRoot: string;
  sourceRepositoryRoot: string;
  sourceState: HubAuthoringSourceState;
  createdAt: string;
}>;

export type HubAuthoringSourceState = Readonly<{
  commit: string | null;
  dirty: boolean;
  dirtyDigest: string | null;
}>;

export type BeginHubAuthoringOptions = Readonly<{
  stateRoot: string;
  mode: "new" | "refresh";
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
  signals: readonly string[];
  selectedSchemas: readonly string[];
  guidance?: OkfAuthoringGuidance;
  coverage?: Readonly<{ partial: boolean; limitations: readonly string[] }>;
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

export function beginHubAuthoringSession(options: BeginHubAuthoringOptions): HubAuthoringSession {
  const authority = options.hub?.repository ?? options.localHubId;
  if (!authority || (!options.hub && !/^[a-f0-9]{24}$/.test(options.localHubId ?? ""))) throw new Error("Hub authoring authority is invalid");
  if (!path.isAbsolute(options.sourceRepositoryRoot) || !fs.existsSync(options.sourceRepositoryRoot)
    || fs.lstatSync(options.sourceRepositoryRoot).isSymbolicLink()
    || !fs.statSync(options.sourceRepositoryRoot).isDirectory()) {
    throw new Error("Hub authoring source repository is invalid");
  }
  if (options.coverage && options.coverage.partial !== (options.coverage.limitations.length > 0)) {
    throw new Error("Hub authoring coverage is inconsistent");
  }
  const seed = [options.mode, authority, options.baseCommit, options.sourceRepositoryId,
    options.evidenceDigest, options.subjectDirectory, options.confirmedDomain?.identity ?? "",
    options.confirmedDomain?.title ?? ""].join("\0");
  const id = `hub-session-${createHash("sha256").update(seed).digest("hex").slice(0, 24)}`;
  const root = path.join(path.resolve(options.stateRoot), "sessions", id);
  if (fs.existsSync(root)) throw new Error("matching Hub authoring session already exists");
  const baseRoot = path.join(root, "base"), bundleRoot = path.join(root, "bundle");
  privateDirectory(path.dirname(root)); privateDirectory(root);
  copyCheckout(options.checkoutRoot, baseRoot);
  copyCheckout(options.checkoutRoot, bundleRoot);
  const session: HubAuthoringSession = {
    formatVersion: 1,
    id,
    mode: options.mode,
    ...(options.hub ? { hub: options.hub } : { localHubId: options.localHubId! }),
    baseCommit: options.baseCommit,
    sourceRepositoryId: options.sourceRepositoryId,
    sourceState: options.sourceState,
    evidenceDigest: options.evidenceDigest,
    subjectDirectory: options.subjectDirectory,
    ...(options.confirmedDomain ? { confirmedDomain: options.confirmedDomain } : {}),
    signals: [...options.signals],
    selectedSchemas: [...options.selectedSchemas],
    ...(options.guidance ? { guidance: options.guidance } : {}),
    ...(options.coverage ? { coverage: options.coverage } : {}),
    root,
    bundleRoot,
    baseRoot,
    checkoutRoot: options.checkoutRoot,
    sourceRepositoryRoot: path.resolve(options.sourceRepositoryRoot),
    createdAt: options.createdAt,
  };
  fs.writeFileSync(path.join(root, "session.json"), `${JSON.stringify(session, null, 2)}\n`, { mode: 0o600 });
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
    || (confirmedDomain && confirmedDomain.evidenceResource !== value.confirmedDomain?.evidenceResource)
    || (!value.hub && !/^[a-f0-9]{24}$/.test(value.localHubId ?? ""))) {
    throw new Error("Hub authoring session state is invalid");
  }
  return value;
}

function sourceLineCount(file: string): number {
  const content = fs.readFileSync(file, "utf8");
  if (!content.length) return 0;
  const lines = content.split("\n").length;
  return content.endsWith("\n") ? lines - 1 : lines;
}

function validateCurrentRepositorySources(session: HubAuthoringSession, bundleRoot: string): void {
  const authored = loadOkfBundle(bundleRoot, { requireAgentBaseRootIndex: true });
  const base = loadOkfBundle(session.baseRoot);
  const repositoryRoot = fs.realpathSync(session.sourceRepositoryRoot);
  const repositoryPrefix = `repository://${session.sourceRepositoryId}/`;
  const failures: string[] = [];
  for (const concept of authored.concepts.values()) {
    const previous = base.concepts.get(concept.conceptId);
    if (previous && fs.readFileSync(path.join(session.baseRoot, previous.path)).equals(
      fs.readFileSync(path.join(session.bundleRoot, concept.path)))) continue;
    for (const resource of repositorySourceResources(concept)) {
      if (!resource.startsWith(repositoryPrefix)) continue;
      const parsed = parseRepositorySourceResource(resource);
      if (!parsed || parsed.repositoryId !== session.sourceRepositoryId) {
        failures.push(`${concept.path}: repository source is not normalized`);
        continue;
      }
      let relativePath: string;
      try {
        relativePath = parsed.relativePath.split("/").join(path.sep);
      } catch {
        failures.push(`${concept.path}: repository source path is not decodable`);
        continue;
      }
      const target = path.resolve(repositoryRoot, relativePath);
      try {
        const realTarget = fs.realpathSync(target);
        if (realTarget !== repositoryRoot && !realTarget.startsWith(`${repositoryRoot}${path.sep}`)) {
          failures.push(`${concept.path}: repository source escapes the authorized checkout: ${relativePath}`);
          continue;
        }
        if (!fs.statSync(realTarget).isFile()) {
          failures.push(`${concept.path}: repository source is not a regular file: ${relativePath}`);
          continue;
        }
        const lineCount = sourceLineCount(realTarget);
        if (parsed.endLine !== undefined && parsed.endLine > lineCount) {
          failures.push(`${concept.path}: source span exceeds ${relativePath} (${lineCount} lines)`);
        }
      } catch {
        failures.push(`${concept.path}: repository source does not exist: ${relativePath}`);
      }
    }
  }
  if (failures.length) throw new Error(`authored repository sources failed validation: ${failures.join("; ")}`);
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

function recordSuccessfulObservation(session: HubAuthoringSession): void {
  const bundle = loadOkfBundle(session.bundleRoot, { requireAgentBaseRootIndex: true });
  const repository = [...bundle.concepts.values()].find((concept) =>
    readRepositoryIdentityRecord(concept)?.id === session.sourceRepositoryId);
  // Runtime Refresh already requires a canonical Repository. Legacy direct
  // authoring fixtures may not have one, so they cannot carry this checkpoint.
  if (!repository) return;
  const agentbase = mapping(repository.frontmatter.agentbase);
  const repositoryMetadata = mapping(agentbase.repository);
  const frontmatter = {
    ...repository.frontmatter,
    agentbase: {
      ...agentbase,
      repository: {
        ...repositoryMetadata,
        observed_source: {
          commit: session.sourceState.commit,
          dirty: session.sourceState.dirty,
          dirty_digest: session.sourceState.dirtyDigest,
          observed_at: session.createdAt,
        },
      },
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
): Readonly<{ result: "no_change"; inspection: HubProposalInspection; observedSource: HubAuthoringSourceState & Readonly<{ observedAt: string }> }
  | { proposal: AnyHubProposal; inspection: HubProposalInspection; observedSource: HubAuthoringSourceState & Readonly<{ observedAt: string }> }> {
  const session = readHubAuthoringSession(stateRoot, sessionId, expectedCheckoutRoot);
  if (currentHubHead !== undefined && currentHubHead !== session.baseCommit) {
    throw new Error("Hub authoring base changed after Prepare");
  }
  if (!currentSourceState) throw new Error("current source state is required at Finalize");
  if (currentSourceState.commit !== session.sourceState.commit
    || currentSourceState.dirty !== session.sourceState.dirty
    || currentSourceState.dirtyDigest !== session.sourceState.dirtyDigest) {
    throw new Error("source repository changed after Prepare");
  }
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
  try {
    assertQuestionAuthoringUntouched(session.baseRoot, session.bundleRoot);
    if (session.mode === "refresh"
      && (loadOkfBundle(session.baseRoot).treeDigest !== loadOkfBundle(session.bundleRoot).treeDigest
        || questions.length > 0 || removals.length > 0)) {
      recordSuccessfulObservation(session);
    }
    normalizeAuthoredObservations(session, normalizedRoot, removals);
    validateCurrentRepositorySources(session, normalizedRoot);
    const observations = [...loadOkfBundle(normalizedRoot).concepts.values()]
      .flatMap((concept) => readObservedValues(concept));
    const declarations = validateQuestionDeclarations(questions, observations, session.sourceRepositoryId);
    const materializedQuestions = materializeQuestionDeclarations(
      session.baseRoot, normalizedRoot, declarations, observations, session.createdAt,
    );
    const questionPaths = declarations.length ? ["questions/index.md",
      ...materializedQuestions.map((question) => `questions/${question.id}.md`)] : [];
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
      ...(session.confirmedDomain ? { confirmedDomain: session.confirmedDomain } : {}),
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
    throw error;
  }
  fs.rmSync(normalizedRoot, { recursive: true, force: true });
  const inspection = finalized.inspection
    ?? inspectHubProposal(finalized.diff!.entries, { baseRoot: session.baseRoot, proposedRoot: finalized.bundleRoot });
  if (session.mode === "refresh" && !questions.length
    && inspection.entries.every((entry) => entry.change === "preserved")) {
    fs.rmSync(staging, { recursive: true, force: true });
    fs.rmSync(session.root, { recursive: true, force: true });
    return { result: "no_change", inspection: attachHubInspectionContext(inspection, [], session.coverage),
      observedSource: { ...session.sourceState, observedAt: session.createdAt } };
  }
  const reviewed = { proposal: finalized.proposal,
    inspection: attachHubInspectionContext(inspection, questions, session.coverage) };
  fs.cpSync(session.baseRoot, path.join(staging, "base"), { recursive: true, errorOnExist: true, force: false });
  fs.writeFileSync(path.join(staging, "inspection.json"), `${JSON.stringify(reviewed.inspection, null, 2)}\n`, { mode: 0o600 });
  fs.writeFileSync(path.join(staging, "runtime.json"), `${JSON.stringify({ checkoutRoot: session.checkoutRoot })}\n`, { mode: 0o600 });
  const proposalRoot = path.join(path.resolve(stateRoot), "proposals", reviewed.proposal.id);
  if (fs.existsSync(proposalRoot)) throw new Error("finalized Hub proposal already exists");
  fs.renameSync(staging, proposalRoot);
  fs.rmSync(session.root, { recursive: true, force: true });
  return { ...reviewed, observedSource: { ...session.sourceState, observedAt: session.createdAt } };
}
