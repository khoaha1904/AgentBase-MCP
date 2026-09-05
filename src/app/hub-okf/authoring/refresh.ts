import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import {
  createHubProposal, isHubProposalSubject, type AnyHubProposal, type HubIdentity,
  type HubProposal, type LocalOnlyHubProposal,
} from "../../../core/hub/index.ts";
import {
  AGENTBASE_OKF_SCHEMA_CATALOG_VERSION,
  classifyAgentBaseHubProfile,
  conceptIdentityFromPath,
  conceptReferencesRepository,
  diffBundleProposal,
  isMutableAgentBaseDraft,
  loadOkfBundle,
  normalizeHubRemovalDeclarations,
  prepareBundleProposal,
  repositorySourceResources,
  renderConceptDocument,
  readObservedValues,
  readRepositoryIdentityRecord,
  selectOkfConceptSchemas,
  validateConceptAgainstSchema,
  assertConfirmedDomainAssignment,
  validatePublishableAgentBaseDraft,
  validateOkfRelationships,
  validateBundleProposal,
  validateBundleObservedValues,
  type ConceptDocument,
  type ConfirmedDomain,
  type HubRemovalDeclaration,
  type OkfFrontmatter,
  type OkfValue,
} from "../../../core/knowledge/index.ts";
import { inspectHubProposal, type HubChangeEntry, type HubProposalInspection } from "../review/inspect.ts";
import { writeHubProposalState } from "../review/proposal-state.ts";
export type PrepareRefreshHubOptions = Readonly<{
  hub: HubIdentity;
  baseCommit: string;
  sourceRepositoryId: string;
  hubBundleRoot: string;
  authoredBundleRoot: string;
  proposalRoot: string;
  subjectDirectory: string;
  confirmedDomain?: ConfirmedDomain;
  evidenceDigest: string;
  signals: readonly string[];
  selectedSchemas?: readonly string[];
  questionPaths?: readonly string[];
  removals?: readonly HubRemovalDeclaration[];
  createdAt: string;
}>;
export type PrepareRefreshLocalHubOptions = Omit<PrepareRefreshHubOptions, "hub"> & Readonly<{ localHubId: string }>;
export type PreparedRefreshHubProposal = Readonly<{
  proposal: HubProposal;
  inspection: HubProposalInspection;
  bundleRoot: string;
}>;
export type PreparedRefreshLocalHubProposal = Omit<PreparedRefreshHubProposal, "proposal"> & Readonly<{ proposal: LocalOnlyHubProposal }>;
type AnyRefreshOptions = PrepareRefreshHubOptions | PrepareRefreshLocalHubOptions;
function bytes(root: string, relative: string): Buffer { return fs.readFileSync(path.join(root, ...relative.split("/"))); }
function writeBytes(root: string, relative: string, content: Buffer): void {
  const target = path.join(root, ...relative.split("/"));
  fs.mkdirSync(path.dirname(target), { recursive: true, mode: 0o700 });
  fs.writeFileSync(target, content, { mode: 0o600 });
}
function copyAuthored(source: string, target: string): void {
  fs.rmSync(target, { recursive: true, force: true });
  fs.cpSync(source, target, { recursive: true, errorOnExist: true, force: false });
}
function subjectExists(root: string, subject: string): boolean {
  return fs.existsSync(path.join(root, subject)) || fs.existsSync(path.join(root, `${subject}.md`));
}
function withinSubject(relative: string, subject: string): boolean {
  return relative === `${subject}.md` || relative.startsWith(`${subject}/`);
}
function preservesLines(previous: Buffer, proposed: Buffer): boolean {
  const retained = previous.toString("utf8").split(/\r?\n/).filter((line) => line.trim());
  const next = proposed.toString("utf8").split(/\r?\n/).filter((line) => line.trim());
  let cursor = 0;
  for (const line of next) if (line === retained[cursor]) cursor += 1;
  return cursor === retained.length;
}
function preservesObservedValueIdentities(previous: ConceptDocument, proposed: ConceptDocument): boolean {
  const next = new Set(readObservedValues(proposed).map((value) => value.id));
  return readObservedValues(previous).every((value) => next.has(value.id));
}
function mapping(value: OkfValue | undefined): Readonly<Record<string, OkfValue>> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Readonly<Record<string, OkfValue>> : undefined;
}
const OBSERVED_START = "<!-- agentbase:observed-values:start -->";
const OBSERVED_END = "<!-- agentbase:observed-values:end -->";
function replaceObservedSection(previousBody: string, proposedBody: string): string {
  const sectionStart = proposedBody.indexOf(OBSERVED_START);
  const sectionEnd = proposedBody.indexOf(OBSERVED_END);
  const section = sectionStart >= 0 && sectionEnd >= sectionStart
    ? proposedBody.slice(sectionStart, sectionEnd + OBSERVED_END.length) : "";
  const previousStart = previousBody.indexOf(OBSERVED_START);
  const previousEnd = previousBody.indexOf(OBSERVED_END);
  const without = previousStart >= 0 && previousEnd >= previousStart
    ? `${previousBody.slice(0, previousStart)}${previousBody.slice(previousEnd + OBSERVED_END.length)}`.trimEnd()
    : previousBody.trimEnd();
  return `${without}${section ? `${without ? "\n\n" : ""}${section}` : ""}\n`;
}
function preserveSharedConcept(
  previous: ConceptDocument,
  proposed: ConceptDocument,
  sourceRepositoryId: string,
  bundleRoot: string,
  removeCurrentContribution: boolean,
): boolean {
  const prefix = `repository://${sourceRepositoryId}/`;
  const previousSources = Array.isArray(previous.frontmatter.sources) ? previous.frontmatter.sources : [];
  if (!repositorySourceResources(previous).some((resource) => !resource.startsWith(prefix))) return false;
  const currentSources = (Array.isArray(proposed.frontmatter.sources) ? proposed.frontmatter.sources : [])
    .filter((source) => String(mapping(source)?.resource ?? "").startsWith(prefix));
  const sources = removeCurrentContribution
    ? previousSources.filter((source) => !String(mapping(source)?.resource ?? "").startsWith(prefix))
    : [...previousSources];
  for (const source of currentSources) {
    if (!sources.some((existing) => JSON.stringify(existing) === JSON.stringify(source))) sources.push(source);
  }
  const previousAgentbase = { ...(mapping(previous.frontmatter.agentbase) ?? {}) };
  const proposedAgentbase = mapping(proposed.frontmatter.agentbase) ?? {};
  if (proposedAgentbase.observed_values === undefined) delete previousAgentbase.observed_values;
  else previousAgentbase.observed_values = proposedAgentbase.observed_values;
  let frontmatter: OkfFrontmatter = { ...previous.frontmatter, sources };
  if (Object.keys(previousAgentbase).length) frontmatter = { ...frontmatter, agentbase: previousAgentbase };
  else delete (frontmatter as Record<string, OkfValue>).agentbase;
  if (readRepositoryIdentityRecord(previous)?.id === sourceRepositoryId
    && readRepositoryIdentityRecord(proposed)?.id === sourceRepositoryId) {
    const previousRepository = mapping(previousAgentbase.repository) ?? {};
    const proposedRepository = mapping(proposedAgentbase.repository) ?? {};
    const repository = { ...previousRepository };
    if (proposedRepository.observed_source !== undefined) repository.observed_source = proposedRepository.observed_source;
    if (proposedRepository.refresh_coverage === undefined) delete repository.refresh_coverage;
    else repository.refresh_coverage = proposedRepository.refresh_coverage;
    frontmatter = { ...frontmatter, agentbase: { ...previousAgentbase, repository } };
  }
  writeBytes(bundleRoot, previous.path, Buffer.from(renderConceptDocument({
    ...previous, frontmatter, body: replaceObservedSection(previous.body, proposed.body),
  })));
  return true;
}
function protectBase(
  options: AnyRefreshOptions,
  bundleRoot: string,
): HubChangeEntry[] {
  const base = loadOkfBundle(options.hubBundleRoot);
  const authored = loadOkfBundle(bundleRoot, { requireAgentBaseRootIndex: true });
  const conflicts: HubChangeEntry[] = [];
  const removals = new Map((options.removals ?? []).map((removal) => [removal.conceptId, removal]));
  for (const relative of base.files) {
    const inSubject = withinSubject(relative, options.subjectDirectory);
    const conceptId = relative.endsWith(".md") ? conceptIdentityFromPath(relative) : "";
    const concept = base.concepts.get(conceptId);
    const mutable = Boolean(concept && isMutableAgentBaseDraft(concept));
    let proposed = authored.files.includes(relative) ? bytes(bundleRoot, relative) : undefined;
    const changed = !proposed || !bytes(options.hubBundleRoot, relative).equals(proposed);
    const index = path.posix.basename(relative) === "index.md";
    const proposedConcept = authored.concepts.get(conceptId);
    const removal = removals.get(conceptId);
    const sharedNormalized = Boolean(changed && concept && proposedConcept && mutable
      && preserveSharedConcept(concept, proposedConcept, options.sourceRepositoryId, bundleRoot,
        removal?.kind === "repository-contribution"));
    if (sharedNormalized) proposed = bytes(bundleRoot, relative);
    const previousSources = concept ? repositorySourceResources(concept) : [];
    const currentPrefix = `repository://${options.sourceRepositoryId}/`;
    const currentSourceContribution = Boolean(
      concept && proposedConcept
      && previousSources.length > 0
      && (sharedNormalized || previousSources.every((resource) => resource.startsWith(currentPrefix)))
      && conceptReferencesRepository(proposedConcept, options.sourceRepositoryId)
      && preservesObservedValueIdentities(concept, proposedConcept)
    );
    const additiveIndex = Boolean(index && proposed && preservesLines(bytes(options.hubBundleRoot, relative), proposed));
    const governedQuestion = (options.questionPaths ?? []).includes(relative);
    const explicitOwnedDeletion = Boolean(mutable && !proposed && removal?.kind === "concept"
      && previousSources.length && previousSources.every((resource) => resource.startsWith(currentPrefix)));
    const explicitContributionRemoval = Boolean(sharedNormalized && removal?.kind === "repository-contribution"
      && proposedConcept && !conceptReferencesRepository(proposedConcept, options.sourceRepositoryId));
    if (!changed || governedQuestion || explicitOwnedDeletion || explicitContributionRemoval || (mutable && currentSourceContribution)
      || (index && additiveIndex)) continue;
    writeBytes(bundleRoot, relative, bytes(options.hubBundleRoot, relative));
    if (changed) conflicts.push({
      path: relative,
      change: "conflict",
      allowed: true,
      reason: "authored refresh contradicted protected or foreign-source Hub bytes; existing bytes were preserved",
    });
  }
  return conflicts;
}
function restoreUnknownFieldConflicts(
  options: AnyRefreshOptions,
  bundleRoot: string,
  failures: readonly string[],
): HubChangeEntry[] {
  const paths = new Set(failures.flatMap((failure) => {
    const match = failure.match(/^(.+\.md): unknown frontmatter value /);
    return match?.[1] ? [match[1]] : [];
  }));
  return [...paths].sort().map((relative) => {
    writeBytes(bundleRoot, relative, bytes(options.hubBundleRoot, relative));
    return {
      path: relative,
      change: "conflict" as const,
      allowed: true,
      reason: "authored refresh changed an unknown extension value; existing bytes were preserved",
    };
  });
}
function removalEntries(
  options: AnyRefreshOptions,
  bundleRoot: string,
): HubChangeEntry[] {
  const base = loadOkfBundle(options.hubBundleRoot);
  const proposed = loadOkfBundle(bundleRoot, { requireAgentBaseRootIndex: true });
  return (options.removals ?? []).map((removal) => {
    const previous = base.concepts.get(removal.conceptId);
    if (!previous) throw new Error(`removal concept is not in Hub base: ${removal.conceptId}`);
    if (previous.type === "Repository" && readRepositoryIdentityRecord(previous)?.id === options.sourceRepositoryId) {
      throw new Error("normal Refresh cannot remove or retire its canonical Repository identity");
    }
    const currentResources = new Set(repositorySourceResources(previous)
      .filter((resource) => resource.startsWith(`repository://${options.sourceRepositoryId}/`)));
    if (!removal.reason.trim() || removal.reason.length > 512 || !removal.evidenceResources.length
      || removal.evidenceResources.some((resource) => !currentResources.has(resource))) {
      throw new Error(`removal lacks exact current-repository evidence: ${removal.conceptId}`);
    }
    if (removal.kind === "concept") {
      if (proposed.concepts.has(removal.conceptId) || repositorySourceResources(previous).some((resource) => !currentResources.has(resource))) {
        throw new Error(`whole-concept removal is not exclusively owned: ${removal.conceptId}`);
      }
      return { path: previous.path, change: "deleted-agentbase-draft" as const, allowed: true,
        reason: removal.reason, evidenceResources: removal.evidenceResources };
    }
    const next = proposed.concepts.get(removal.conceptId);
    if (!next) throw new Error(`removal concept is absent from refresh: ${removal.conceptId}`);
    if (conceptReferencesRepository(next, options.sourceRepositoryId)) {
      throw new Error(`removed contribution still cites current repository: ${removal.conceptId}`);
    }
    return {
      path: next.path,
      change: "removed-contribution" as const,
      allowed: true,
      reason: removal.reason,
      evidenceResources: removal.evidenceResources,
    };
  });
}
function classifyChanges(
  baseEntries: readonly HubChangeEntry[],
  annotations: readonly HubChangeEntry[],
): readonly HubChangeEntry[] {
  const byPath = new Map(baseEntries.map((entry) => [entry.path, entry]));
  for (const annotation of annotations) byPath.set(annotation.path, annotation);
  return [...byPath.values()];
}

function validateChangedSchemas(options: AnyRefreshOptions, bundleRoot: string): void {
  const base = loadOkfBundle(options.hubBundleRoot);
  const proposed = loadOkfBundle(bundleRoot, { requireAgentBaseRootIndex: true });
  const selected = new Set(options.selectedSchemas
    ?? selectOkfConceptSchemas(options.signals).map((item) => item.type));
  const changedIdentities = new Set<string>();
  const failures = [...validateBundleObservedValues(proposed.concepts.values()), ...[...proposed.concepts.values()].flatMap((concept) => {
    const previous = base.concepts.get(concept.conceptId);
    if (previous && bytes(options.hubBundleRoot, previous.path).equals(bytes(bundleRoot, concept.path))) return [];
    if (concept.type === "Question") return (options.questionPaths ?? []).includes(concept.path)
      ? [] : [`${concept.path}: Question change was not produced by the dedicated renderer`];
    changedIdentities.add(concept.conceptId);
    const removesContribution = options.removals?.some((removal) =>
      removal.kind === "repository-contribution" && removal.conceptId === concept.conceptId);
    const sourceFailure = !removesContribution && !conceptReferencesRepository(concept, options.sourceRepositoryId)
      ? [`${concept.path}: changed concept must cite proposal source repository ${options.sourceRepositoryId}`]
      : [];
    const selectionFailure = !previous && !selected.has(concept.type)
      ? [`${concept.path}: authored concept requires unselected schema ${concept.type}`]
      : [];
    return [...sourceFailure, ...selectionFailure, ...validatePublishableAgentBaseDraft(concept),
      ...validateConceptAgainstSchema(concept)];
  })];
  if (changedIdentities.size) failures.push(...validateOkfRelationships(
    [...proposed.concepts].map(([identity, concept]) => ({ identity, concept })), {
      sourceIdentities: changedIdentities, strictSourceIdentities: changedIdentities,
    }).failures);
  if (failures.length) throw new Error(`Hub refresh failed schema validation: ${failures.join("; ")}`);
}
export function prepareRefreshHubProposal(options: PrepareRefreshHubOptions): PreparedRefreshHubProposal;
export function prepareRefreshHubProposal(options: PrepareRefreshLocalHubOptions): PreparedRefreshLocalHubProposal;
export function prepareRefreshHubProposal(
  options: PrepareRefreshHubOptions | PrepareRefreshLocalHubOptions,
): Omit<PreparedRefreshHubProposal, "proposal"> & Readonly<{ proposal: AnyHubProposal }> {
  if (!isHubProposalSubject(options.subjectDirectory)) throw new Error("invalid Hub subject");
  if (!subjectExists(options.hubBundleRoot, options.subjectDirectory)) throw new Error("refresh subject is absent; use new");
  const baseProfile = classifyAgentBaseHubProfile(loadOkfBundle(options.hubBundleRoot));
  if (baseProfile.kind === "unsupported") {
    throw new Error(`Hub Profile is unsupported: ${baseProfile.failures.join("; ")}`);
  }
  const normalizedRemovals = normalizeHubRemovalDeclarations(options.removals ?? []);
  options = { ...options, removals: normalizedRemovals };
  const selected = [...(options.selectedSchemas
    ?? selectOkfConceptSchemas(options.signals).map((item) => item.type))];
  const seed = `${options.baseCommit}\0${options.evidenceDigest}\0${options.subjectDirectory}\0refresh`;
  const proposalId = `proposal-${createHash("sha256").update(seed).digest("hex").slice(0, 24)}`;
  prepareBundleProposal({ currentBundleRoot: options.hubBundleRoot, proposalRoot: options.proposalRoot,
    proposalId, evidenceDigest: options.evidenceDigest, createdAt: options.createdAt });
  const bundleRoot = path.join(options.proposalRoot, "bundle");
  copyAuthored(options.authoredBundleRoot, bundleRoot);
  const conflicts = protectBase(options, bundleRoot);
  let validation = validateBundleProposal(options.hubBundleRoot, options.proposalRoot);
  const unknownConflicts = restoreUnknownFieldConflicts(options, bundleRoot,
    validation.producerValidation?.failures ?? []);
  if (unknownConflicts.length) validation = validateBundleProposal(options.hubBundleRoot, options.proposalRoot);
  if (!validation.producerValidation?.passed) {
    throw new Error(`Hub refresh failed validation: ${validation.producerValidation?.failures.join("; ")}`);
  }
  if (baseProfile.kind === "profile-1.0") {
    const proposedProfile = classifyAgentBaseHubProfile(loadOkfBundle(bundleRoot, { requireAgentBaseRootIndex: true }));
    if (proposedProfile.kind !== "profile-1.0") {
      throw new Error(`refreshed Profile layout failed validation: ${proposedProfile.kind === "unsupported"
        ? proposedProfile.failures.join("; ") : "Profile declaration disappeared"}`);
    }
  }
  validateChangedSchemas(options, bundleRoot);
  assertConfirmedDomainAssignment(
    loadOkfBundle(bundleRoot, { requireAgentBaseRootIndex: true }).concepts,
    loadOkfBundle(options.hubBundleRoot).concepts, options.confirmedDomain, options.sourceRepositoryId,
  );
  const diff = diffBundleProposal(options.hubBundleRoot, options.proposalRoot);
  const changes = classifyChanges(
    diff.entries,
    [...conflicts, ...unknownConflicts, ...removalEntries(options, bundleRoot)],
  );
  const inspection = inspectHubProposal(changes, { baseRoot: options.hubBundleRoot, proposedRoot: bundleRoot });
  const digestHex = createHash("sha256").update(JSON.stringify(inspection.entries)).digest("hex");
  const diffDigest = `sha256:${digestHex}`;
  const common = {
    mode: "refresh" as const,
    subject: options.subjectDirectory,
    baseCommit: options.baseCommit,
    sourceRepositoryId: options.sourceRepositoryId,
    evidenceDigest: options.evidenceDigest,
    schemaVersion: AGENTBASE_OKF_SCHEMA_CATALOG_VERSION,
    selectedSchemas: selected,
    treeDigest: diff.proposedTreeDigest,
    diffDigest,
  };
  const proposal = "hub" in options
    ? createHubProposal({ ...common, hub: options.hub })
    : createHubProposal({ ...common, localHubId: options.localHubId });
  writeHubProposalState(options.proposalRoot, proposal);
  return { proposal, inspection, bundleRoot };
}
