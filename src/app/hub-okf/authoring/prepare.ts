import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import {
  createHubProposal, isHubProposalSubject, type AnyHubProposal, type HubIdentity,
  type HubProposal, type LocalOnlyHubProposal,
} from "../../../core/hub/index.ts";
import {
  AGENTBASE_OKF_SCHEMA_CATALOG_VERSION,
  conceptReferencesRepository,
  diffBundleProposal,
  loadOkfBundle,
  prepareBundleProposal,
  selectOkfConceptSchemas,
  validateConceptAgainstSchema,
  assertConfirmedDomainAssignment,
  validateOkfRelationships,
  validatePublishableAgentBaseDraft,
  validateBundleObservedValues,
  validateBundleProposal,
  type ProposalDiff,
  type ConfirmedDomain,
} from "../../../core/knowledge/index.ts";
import { writeHubProposalState } from "../review/proposal-state.ts";

export type PrepareNewHubOptions = Readonly<{
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
  activityPaths?: readonly string[];
  createdAt: string;
}>;
export type PrepareNewLocalHubOptions = Omit<PrepareNewHubOptions, "hub"> & Readonly<{ localHubId: string }>;
export type PreparedHubProposal = Readonly<{ proposal: HubProposal; diff: ProposalDiff; bundleRoot: string }>;
export type PreparedLocalHubProposal = Readonly<{ proposal: LocalOnlyHubProposal; diff: ProposalDiff; bundleRoot: string }>;

function safeSubject(value: string): void {
  if (!isHubProposalSubject(value)) throw new Error("new Hub subject must be a normalized canonical concept path");
}

function subjectExists(root: string, subject: string): boolean {
  return fs.existsSync(path.join(root, subject)) || fs.existsSync(path.join(root, `${subject}.md`));
}

function copyBundle(source: string, target: string): void {
  fs.rmSync(target, { recursive: true, force: true });
  fs.cpSync(source, target, { recursive: true, errorOnExist: true, force: false });
}

function preservesNonblankLines(previous: string, proposed: string): boolean {
  const retained = previous.split("\n").filter((line) => line.trim());
  const next = proposed.split("\n").filter((line) => line.trim());
  let cursor = 0;
  for (const line of next) if (line === retained[cursor]) cursor += 1;
  return cursor === retained.length;
}

export function prepareNewHubProposal(options: PrepareNewHubOptions): PreparedHubProposal;
export function prepareNewHubProposal(options: PrepareNewLocalHubOptions): PreparedLocalHubProposal;
export function prepareNewHubProposal(
  options: PrepareNewHubOptions | PrepareNewLocalHubOptions,
): Readonly<{ proposal: AnyHubProposal; diff: ProposalDiff; bundleRoot: string }> {
  safeSubject(options.subjectDirectory);
  if (subjectExists(options.hubBundleRoot, options.subjectDirectory)) throw new Error("new Hub subject already exists; use refresh");
  const selected = options.selectedSchemas
    ? [...new Set(options.selectedSchemas)].sort()
    : selectOkfConceptSchemas(options.signals).map((item) => item.type);
  const authored = loadOkfBundle(options.authoredBundleRoot, { requireAgentBaseRootIndex: true });
  const base = loadOkfBundle(options.hubBundleRoot);
  const observedValueFailures = validateBundleObservedValues(authored.concepts.values());
  if (observedValueFailures.length) throw new Error(`authored observed values failed validation: ${observedValueFailures.join("; ")}`);
  for (const relative of base.files.filter((item) => path.posix.basename(item) === "index.md")) {
    const target = path.join(options.authoredBundleRoot, ...relative.split("/"));
    if (!fs.existsSync(target) || !preservesNonblankLines(
      fs.readFileSync(path.join(options.hubBundleRoot, ...relative.split("/")), "utf8"),
      fs.readFileSync(target, "utf8"),
    )) throw new Error(`new Hub proposal must preserve existing index lines: ${relative}`);
  }
  const createdIdentities = new Set<string>();
  const questionPaths = new Set(options.questionPaths ?? []);
  const activityPaths = new Set(options.activityPaths ?? []);
  for (const concept of authored.concepts.values()) {
    if (concept.type === "Question") {
      const previous = base.concepts.get(concept.conceptId);
      const changed = !previous || !fs.readFileSync(path.join(options.hubBundleRoot, previous.path))
        .equals(fs.readFileSync(path.join(options.authoredBundleRoot, concept.path)));
      if (changed && !questionPaths.has(concept.path)) {
        throw new Error(`Question document change was not produced by the dedicated renderer: ${concept.path}`);
      }
      continue;
    }
    if (!base.concepts.has(concept.conceptId) && !selected.includes(concept.type)) {
      throw new Error(`authored concept requires unselected schema: ${concept.type}`);
    }
    if (!base.concepts.has(concept.conceptId)) {
      createdIdentities.add(concept.conceptId);
      if (!conceptReferencesRepository(concept, options.sourceRepositoryId)) {
        throw new Error(`authored concept does not cite the proposal source repository: ${concept.path}`);
      }
      const failures = [...validatePublishableAgentBaseDraft(concept), ...validateConceptAgainstSchema(concept)];
      if (failures.length) throw new Error(`authored concept failed schema validation: ${failures.join("; ")}`);
    }
  }
  assertConfirmedDomainAssignment(authored.concepts, base.concepts, options.confirmedDomain, options.sourceRepositoryId);
  const relationships = validateOkfRelationships(
    [...authored.concepts].map(([identity, concept]) => ({ identity, concept })),
    { sourceIdentities: createdIdentities, strictSourceIdentities: createdIdentities },
  );
  if (relationships.failures.length) {
    throw new Error(`authored concept relationship validation failed: ${relationships.failures.join("; ")}`);
  }
  const seed = `${options.baseCommit}\0${options.evidenceDigest}\0${options.subjectDirectory}`;
  const provisionalId = `proposal-${createHash("sha256").update(seed).digest("hex").slice(0, 24)}`;
  prepareBundleProposal({
    currentBundleRoot: options.hubBundleRoot,
    proposalRoot: options.proposalRoot,
    proposalId: provisionalId,
    evidenceDigest: options.evidenceDigest,
    createdAt: options.createdAt,
  });
  const bundleRoot = path.join(options.proposalRoot, "bundle");
  copyBundle(options.authoredBundleRoot, bundleRoot);
  const validated = validateBundleProposal(options.hubBundleRoot, options.proposalRoot);
  if (!validated.producerValidation?.passed) throw new Error(`Hub proposal failed validation: ${validated.producerValidation?.failures.join("; ")}`);
  const diff = diffBundleProposal(options.hubBundleRoot, options.proposalRoot);
  const invalid = diff.entries.find((entry) => {
    if (entry.change === "preserved") return false;
    if (entry.change === "modified") return path.posix.basename(entry.path) !== "index.md";
    if (entry.change === "created") {
      const isIndex = path.posix.basename(entry.path) === "index.md";
      return !isIndex && !authored.concepts.has(entry.path.slice(0, -3)) && !activityPaths.has(entry.path);
    }
    return true;
  });
  if (!diff.applicable || invalid) throw new Error(`new Hub proposal contains an out-of-scope change${invalid ? `: ${invalid.path}` : ""}`);
  const diffDigest = `sha256:${createHash("sha256").update(JSON.stringify(diff.entries)).digest("hex")}`;
  const common = {
    mode: "new" as const,
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
  return { proposal, diff, bundleRoot };
}
