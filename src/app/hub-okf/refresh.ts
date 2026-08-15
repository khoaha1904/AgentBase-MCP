import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import {
  createHubProposal, isHubProposalSubject, type AnyHubProposal, type HubIdentity,
  type HubProposal, type LocalOnlyHubProposal,
} from "../../core/hub/index.ts";
import {
  AGENTBASE_OKF_SCHEMA_CATALOG_VERSION,
  conceptReferencesRepository,
  diffBundleProposal,
  isMutableAgentBaseDraft,
  loadOkfBundle,
  prepareBundleProposal,
  repositorySourceResources,
  selectOkfConceptSchemas,
  validateConceptAgainstSchema,
  validatePublishableAgentBaseDraft,
  validateOkfRelationships,
  validateBundleProposal,
  type ConceptDocument,
} from "../../core/knowledge/index.ts";
import { inspectHubProposal, type HubLifecycleEntry, type HubProposalInspection } from "./inspect.ts";
import { writeHubProposalState } from "./proposal-state.ts";
export type HubSupersession = Readonly<{ previousConceptId: string; replacementConceptId: string }>;
export type PrepareRefreshHubOptions = Readonly<{
  hub: HubIdentity;
  baseCommit: string;
  sourceRepositoryId: string;
  hubBundleRoot: string;
  authoredBundleRoot: string;
  proposalRoot: string;
  subjectDirectory: string;
  evidenceDigest: string;
  signals: readonly string[];
  supersessions?: readonly HubSupersession[];
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
function bytes(root: string, relative: string): Buffer {
  return fs.readFileSync(path.join(root, ...relative.split("/")));
}
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
function preservesForeignSources(
  previous: ConceptDocument,
  proposed: ConceptDocument,
  sourceRepositoryId: string,
): boolean {
  const currentPrefix = `repository://${sourceRepositoryId}/`;
  const next = new Set(repositorySourceResources(proposed));
  return repositorySourceResources(previous)
    .filter((resource) => !resource.startsWith(currentPrefix))
    .every((resource) => next.has(resource));
}
function rootIndexWithoutSubject(source: string, subjectDirectory: string): string {
  let removed = 0;
  const lines = source.split("\n").filter((line) => {
    const target = line.match(/^\s*\*\s+\[[^\]]+\]\(([^)\s]+)(?:\s+"[^"]*")?\)(?:\s+-\s+.+)?\s*$/)?.[1];
    if (!target) return true;
    const clean = target.split("#")[0]?.split("?")[0];
    const resolved = clean?.endsWith("/") ? `${path.posix.normalize(clean)}index.md` : path.posix.normalize(clean ?? "");
    if (resolved !== `${subjectDirectory}/index.md`) return true;
    removed += 1;
    return false;
  });
  if (!removed) throw new Error("whole-subject refresh requires an exact root index link to the subject");
  return lines.join("\n").replace(/\n{2,}$/, "\n");
}
function subjectRemovalEntries(
  options: AnyRefreshOptions,
  bundleRoot: string,
): readonly HubLifecycleEntry[] | undefined {
  const authored = loadOkfBundle(bundleRoot, { requireAgentBaseRootIndex: true });
  if (authored.files.some((relative) => withinSubject(relative, options.subjectDirectory))) return undefined;
  const base = loadOkfBundle(options.hubBundleRoot);
  const subjectFiles = base.files.filter((relative) => relative.startsWith(`${options.subjectDirectory}/`));
  if (!subjectFiles.length) return undefined;
  for (const relative of subjectFiles) {
    if (path.posix.basename(relative) === "index.md") continue;
    const concept = base.concepts.get(relative.endsWith(".md") ? relative.slice(0, -3) : "");
    if (!concept || !isMutableAgentBaseDraft(concept)) {
      throw new Error(`whole-subject refresh cannot delete protected content: ${relative}`);
    }
  }
  const expectedRootIndex = rootIndexWithoutSubject(
    fs.readFileSync(path.join(options.hubBundleRoot, "index.md"), "utf8"),
    options.subjectDirectory,
  );
  if (fs.readFileSync(path.join(bundleRoot, "index.md"), "utf8") !== expectedRootIndex) {
    throw new Error("whole-subject refresh may only remove its exact root index link");
  }
  return subjectFiles
    .filter((relative) => path.posix.basename(relative) === "index.md")
    .map((relative) => ({
      path: relative,
      change: "deleted-agentbase-index" as const,
      allowed: true,
      reason: "reserved index removed with an explicitly authored AgentBase-owned subject deletion",
    }));
}
function protectBase(
  options: AnyRefreshOptions,
  bundleRoot: string,
  removal: readonly HubLifecycleEntry[] | undefined,
): HubLifecycleEntry[] {
  const base = loadOkfBundle(options.hubBundleRoot);
  const authored = loadOkfBundle(bundleRoot, { requireAgentBaseRootIndex: true });
  const conflicts: HubLifecycleEntry[] = [];
  for (const relative of base.files) {
    const inSubject = withinSubject(relative, options.subjectDirectory);
    const conceptId = relative.endsWith(".md") ? relative.slice(0, -3) : "";
    const concept = base.concepts.get(conceptId);
    const mutable = Boolean(concept && isMutableAgentBaseDraft(concept));
    const proposed = authored.files.includes(relative) ? bytes(bundleRoot, relative) : undefined;
    const changed = !proposed || !bytes(options.hubBundleRoot, relative).equals(proposed);
    const index = path.posix.basename(relative) === "index.md";
    const rootIndexRemoval = Boolean(removal && relative === "index.md");
    const proposedConcept = authored.concepts.get(conceptId);
    const currentSourceContribution = Boolean(
      concept && proposedConcept
      && conceptReferencesRepository(proposedConcept, options.sourceRepositoryId)
      && preservesForeignSources(concept, proposedConcept, options.sourceRepositoryId),
    );
    const additiveIndex = Boolean(index && proposed && preservesLines(bytes(options.hubBundleRoot, relative), proposed));
    const ownedDeletion = Boolean(mutable && !proposed && inSubject);
    if (!changed || rootIndexRemoval || ownedDeletion || (mutable && currentSourceContribution)
      || (index && (inSubject || additiveIndex))) continue;
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
): HubLifecycleEntry[] {
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
function supersessionEntries(
  options: AnyRefreshOptions,
  bundleRoot: string,
): HubLifecycleEntry[] {
  const base = loadOkfBundle(options.hubBundleRoot);
  const proposed = loadOkfBundle(bundleRoot, { requireAgentBaseRootIndex: true });
  return (options.supersessions ?? []).map(({ previousConceptId, replacementConceptId }) => {
    if (!base.concepts.has(previousConceptId)) throw new Error(`superseded concept is not in Hub base: ${previousConceptId}`);
    const replacement = proposed.concepts.get(replacementConceptId);
    if (!replacement) throw new Error(`replacement concept is not in refresh: ${replacementConceptId}`);
    return {
      path: replacement.path,
      change: "supersession" as const,
      allowed: true,
      previousConceptId,
      reason: `explicitly supersedes ${previousConceptId}`,
    };
  });
}

function classifyLifecycle(
  baseEntries: readonly HubLifecycleEntry[],
  annotations: readonly HubLifecycleEntry[],
): readonly HubLifecycleEntry[] {
  const byPath = new Map(baseEntries.map((entry) => [entry.path, entry]));
  for (const annotation of annotations) byPath.set(annotation.path, annotation);
  return [...byPath.values()];
}

function validateChangedSchemas(options: AnyRefreshOptions, bundleRoot: string): void {
  const base = loadOkfBundle(options.hubBundleRoot);
  const proposed = loadOkfBundle(bundleRoot, { requireAgentBaseRootIndex: true });
  const selected = new Set(selectOkfConceptSchemas(options.signals).map((item) => item.type));
  const changedIdentities = new Set<string>();
  const failures = [...proposed.concepts.values()].flatMap((concept) => {
    const previous = base.concepts.get(concept.conceptId);
    if (previous && bytes(options.hubBundleRoot, previous.path).equals(bytes(bundleRoot, concept.path))) return [];
    changedIdentities.add(concept.conceptId);
    const sourceFailure = !conceptReferencesRepository(concept, options.sourceRepositoryId)
      ? [`${concept.path}: changed concept must cite proposal source repository ${options.sourceRepositoryId}`]
      : [];
    const selectionFailure = !previous && !selected.has(concept.type)
      ? [`${concept.path}: authored concept requires unselected schema ${concept.type}`]
      : [];
    return [...sourceFailure, ...selectionFailure, ...validatePublishableAgentBaseDraft(concept),
      ...validateConceptAgainstSchema(concept)];
  });
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
  const selected = selectOkfConceptSchemas(options.signals).map((item) => item.type);
  const seed = `${options.baseCommit}\0${options.evidenceDigest}\0${options.subjectDirectory}\0refresh`;
  const proposalId = `proposal-${createHash("sha256").update(seed).digest("hex").slice(0, 24)}`;
  const removal = subjectRemovalEntries(options, options.authoredBundleRoot);
  prepareBundleProposal({
    currentBundleRoot: options.hubBundleRoot,
    proposalRoot: options.proposalRoot,
    proposalId,
    evidenceDigest: options.evidenceDigest,
    createdAt: options.createdAt,
  });
  const bundleRoot = path.join(options.proposalRoot, "bundle");
  copyAuthored(options.authoredBundleRoot, bundleRoot);
  const conflicts = protectBase(options, bundleRoot, removal);
  let validation = validateBundleProposal(options.hubBundleRoot, options.proposalRoot);
  const unknownConflicts = restoreUnknownFieldConflicts(
    options,
    bundleRoot,
    validation.producerValidation?.failures ?? [],
  );
  if (unknownConflicts.length) validation = validateBundleProposal(options.hubBundleRoot, options.proposalRoot);
  if (!validation.producerValidation?.passed) {
    throw new Error(`Hub refresh failed validation: ${validation.producerValidation?.failures.join("; ")}`);
  }
  validateChangedSchemas(options, bundleRoot);
  const diff = diffBundleProposal(options.hubBundleRoot, options.proposalRoot);
  const lifecycle = classifyLifecycle(
    diff.entries,
    [...conflicts, ...unknownConflicts, ...(removal ?? []), ...supersessionEntries(options, bundleRoot)],
  );
  const inspection = inspectHubProposal(lifecycle, {
    baseRoot: options.hubBundleRoot,
    proposedRoot: bundleRoot,
  });
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
