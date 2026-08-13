import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { createHubProposal, type AnyHubProposal, type HubIdentity, type HubProposal, type LocalOnlyHubProposal } from "../../core/hub/index.ts";
import {
  AGENTBASE_OKF_SCHEMA_CATALOG_VERSION,
  diffBundleProposal,
  loadOkfBundle,
  prepareBundleProposal,
  selectOkfConceptSchemas,
  validateConceptAgainstSchema,
  validateBundleProposal,
  type ProposalDiff,
} from "../../core/knowledge/index.ts";
import { writeHubProposalState } from "./proposal-state.ts";

export type PrepareNewHubOptions = Readonly<{
  hub: HubIdentity;
  baseCommit: string;
  sourceRepositoryId: string;
  hubBundleRoot: string;
  authoredBundleRoot: string;
  proposalRoot: string;
  subjectDirectory: string;
  evidenceDigest: string;
  signals: readonly string[];
  createdAt: string;
}>;
export type PrepareNewLocalHubOptions = Omit<PrepareNewHubOptions, "hub"> & Readonly<{ localHubId: string }>;
export type PreparedHubProposal = Readonly<{ proposal: HubProposal; diff: ProposalDiff; bundleRoot: string }>;
export type PreparedLocalHubProposal = Readonly<{ proposal: LocalOnlyHubProposal; diff: ProposalDiff; bundleRoot: string }>;

function safeSubject(value: string): void {
  if (!/^repositories\/[a-z0-9][a-z0-9-]{0,99}$/.test(value)) throw new Error("new Hub subject must be a normalized repositories/<slug> directory");
}

function copyBundle(source: string, target: string): void {
  fs.rmSync(target, { recursive: true, force: true });
  fs.cpSync(source, target, { recursive: true, errorOnExist: true, force: false });
}

export function prepareNewHubProposal(options: PrepareNewHubOptions): PreparedHubProposal;
export function prepareNewHubProposal(options: PrepareNewLocalHubOptions): PreparedLocalHubProposal;
export function prepareNewHubProposal(
  options: PrepareNewHubOptions | PrepareNewLocalHubOptions,
): Readonly<{ proposal: AnyHubProposal; diff: ProposalDiff; bundleRoot: string }> {
  safeSubject(options.subjectDirectory);
  if (fs.existsSync(path.join(options.hubBundleRoot, options.subjectDirectory))) throw new Error("new Hub subject already exists; use refresh");
  const selected = selectOkfConceptSchemas(options.signals).map((item) => item.type);
  const authored = loadOkfBundle(options.authoredBundleRoot, { requireAgentBaseRootIndex: true });
  const base = loadOkfBundle(options.hubBundleRoot);
  for (const concept of authored.concepts.values()) {
    if (!base.concepts.has(concept.conceptId) && !selected.includes(concept.type)) {
      throw new Error(`authored concept requires unselected schema: ${concept.type}`);
    }
    if (!base.concepts.has(concept.conceptId)) {
      const failures = validateConceptAgainstSchema(concept);
      if (failures.length) throw new Error(`authored concept failed schema validation: ${failures.join("; ")}`);
    }
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
      return !isIndex && !authored.concepts.has(entry.path.slice(0, -3));
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
