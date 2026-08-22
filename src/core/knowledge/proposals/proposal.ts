import fs from "node:fs";
import path from "node:path";
import { isDeepStrictEqual } from "node:util";

import { computeOkfTreeDigest, loadOkfBundle } from "../documents/okf-bundle.ts";
import { validateAgentBaseDraft, type ConceptDocument, type OkfValue } from "../documents/okf-document.ts";
import { parseQuestionDocument, validateQuestionTransition } from "../governance/questions.ts";
import { validateConceptAgainstSchema } from "../schemas/catalog.ts";

export type ProposalState = "prepared" | "generated";

export type ProposalMetadata = Readonly<{
  formatVersion: 1;
  proposalId: string;
  state: ProposalState;
  createdAt: string;
  baseTreeDigest: string;
  evidenceDigest: string;
  generatedTreeDigest?: string;
  baseConformance: Readonly<{ passed: boolean; failures: readonly string[] }>;
  producerValidation?: Readonly<{ passed: boolean; failures: readonly string[]; warnings: readonly string[] }>;
}>;

export type ProposalDiffEntry = Readonly<{
  path: string;
  change: "created" | "modified" | "preserved" | "deleted-agentbase-draft" | "prohibited-deletion";
  allowed: boolean;
  reason?: string;
}>;

export type ProposalDiff = Readonly<{
  proposalId: string;
  baseTreeDigest: string;
  proposedTreeDigest: string;
  entries: readonly ProposalDiffEntry[];
  applicable: boolean;
}>;

export type PrepareProposalOptions = Readonly<{
  currentBundleRoot: string;
  proposalRoot: string;
  proposalId: string;
  evidenceDigest: string;
  createdAt: string;
}>;
export type ValidateProposalOptions = Readonly<{
  maintainerGuidance?: Readonly<{ conceptId: string; by: string; at: string }>;
}>;

const metadataPath = (proposalRoot: string) => path.join(proposalRoot, "proposal.json");
const bundlePath = (proposalRoot: string) => path.join(proposalRoot, "bundle");

function validateProposalId(value: string): void {
  if (!/^proposal-[a-z0-9][a-z0-9-]{5,100}$/.test(value)) throw new Error("proposalId must be a normalized AgentBase proposal ID");
}

function validateDigest(value: string, label: string): void {
  if (!/^sha256:[a-f0-9]{64}$/.test(value)) throw new Error(`${label} must be a SHA-256 digest`);
}

function copyTree(source: string, target: string): void {
  fs.mkdirSync(target, { recursive: true, mode: 0o700 });
  if (!fs.existsSync(source)) return;
  for (const entry of fs.readdirSync(source, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))) {
    if (entry.isSymbolicLink()) throw new Error(`bundle symlink cannot be copied: ${entry.name}`);
    const from = path.join(source, entry.name);
    const to = path.join(target, entry.name);
    if (entry.isDirectory()) copyTree(from, to);
    else if (entry.isFile()) fs.copyFileSync(from, to, fs.constants.COPYFILE_EXCL);
  }
}

function writeMetadata(proposalRoot: string, metadata: ProposalMetadata): void {
  fs.writeFileSync(metadataPath(proposalRoot), `${JSON.stringify(metadata, null, 2)}\n`, { flag: "w", mode: 0o600 });
}

export function readProposalMetadata(proposalRoot: string): ProposalMetadata {
  const value = JSON.parse(fs.readFileSync(metadataPath(proposalRoot), "utf8")) as ProposalMetadata;
  if (value.formatVersion !== 1 || !["prepared", "generated"].includes(value.state)) throw new Error("proposal metadata is invalid");
  validateProposalId(value.proposalId);
  validateDigest(value.baseTreeDigest, "baseTreeDigest");
  validateDigest(value.evidenceDigest, "evidenceDigest");
  if (value.generatedTreeDigest !== undefined) validateDigest(value.generatedTreeDigest, "generatedTreeDigest");
  return value;
}

export function prepareBundleProposal(options: PrepareProposalOptions): ProposalMetadata {
  validateProposalId(options.proposalId);
  validateDigest(options.evidenceDigest, "evidenceDigest");
  if (fs.existsSync(options.proposalRoot)) throw new Error("proposal root already exists");
  const current = loadOkfBundle(options.currentBundleRoot);
  fs.mkdirSync(options.proposalRoot, { recursive: true, mode: 0o700 });
  copyTree(options.currentBundleRoot, bundlePath(options.proposalRoot));
  const copiedDigest = computeOkfTreeDigest(bundlePath(options.proposalRoot));
  if (copiedDigest !== current.treeDigest) throw new Error("proposal byte-copy digest does not match current bundle");
  const metadata: ProposalMetadata = {
    formatVersion: 1,
    proposalId: options.proposalId,
    state: "prepared",
    createdAt: options.createdAt,
    baseTreeDigest: current.treeDigest,
    evidenceDigest: options.evidenceDigest,
    baseConformance: { passed: true, failures: [] },
  };
  writeMetadata(options.proposalRoot, metadata);
  return metadata;
}

function mapping(value: OkfValue | undefined): Readonly<Record<string, OkfValue>> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Readonly<Record<string, OkfValue>>
    : undefined;
}

export function isMutableAgentBaseDraft(concept: ConceptDocument): boolean {
  const generated = mapping(concept.frontmatter.generated);
  return concept.status === "draft"
    && typeof generated?.by === "string"
    && generated.by.startsWith("agentbase/")
    && !concept.verified.some((event) => event.by.startsWith("human:"));
}

function resolveSourceConcept(fromPath: string, resource: string): string | undefined {
  if (/^[a-z][a-z0-9+.-]*:/i.test(resource)) return undefined;
  const clean = resource.split("#")[0]?.split("?")[0];
  if (!clean?.endsWith(".md")) return undefined;
  return clean.startsWith("/")
    ? path.posix.normalize(clean.slice(1))
    : path.posix.normalize(path.posix.join(path.posix.dirname(fromPath), clean));
}

function continuitySourceFailures(concept: ConceptDocument, baseDraftPaths: ReadonlySet<string>): readonly string[] {
  const sources = concept.frontmatter.sources;
  if (!Array.isArray(sources)) return [];
  const failures: string[] = [];
  for (const source of sources) {
    const resource = mapping(source)?.resource;
    if (typeof resource !== "string") continue;
    const resolved = resolveSourceConcept(concept.path, resource);
    if (resolved && baseDraftPaths.has(resolved)) {
      failures.push(`${concept.path}: previous AgentBase draft ${resolved} is continuity context, not an independent source`);
    }
  }
  return failures;
}

function bytes(root: string, relative: string): Buffer {
  return fs.readFileSync(path.join(root, ...relative.split("/")));
}

function protectedModificationFailures(currentRoot: string, proposedRoot: string): readonly string[] {
  const current = loadOkfBundle(currentRoot);
  const proposed = loadOkfBundle(proposedRoot, { requireAgentBaseRootIndex: true });
  const failures: string[] = [];
  for (const relative of current.files) {
    if (!proposed.files.includes(relative)) continue;
    if (bytes(currentRoot, relative).equals(bytes(proposedRoot, relative))) continue;
    if (path.posix.basename(relative) === "index.md") continue;
    const concept = current.concepts.get(relative.endsWith(".md") ? relative.slice(0, -3) : "");
    if (!concept || !isMutableAgentBaseDraft(concept)) failures.push(`${relative}: protected existing bytes were modified`);
  }
  return failures;
}

const STANDARD_OKF_KEYS = new Set([
  "type", "title", "description", "resource", "tags", "sources", "usage_window",
  "generated", "verified", "status", "stale_after", "runtime", "parameters",
  "computation", "executor", "attester",
]);

function unknownValueFailures(base: ConceptDocument, proposed: ConceptDocument): readonly string[] {
  const failures: string[] = [];
  for (const [key, value] of Object.entries(base.frontmatter)) {
    if (key === "agentbase") {
      const previous = { ...(mapping(value) ?? {}) }, next = { ...(mapping(proposed.frontmatter[key]) ?? {}) };
      delete previous.observed_values; delete next.observed_values;
      if (base.type === "Repository" && proposed.type === "Repository") {
        const previousRepository = { ...(mapping(previous.repository) ?? {}) };
        const nextRepository = { ...(mapping(next.repository) ?? {}) };
        delete previousRepository.observed_source; delete nextRepository.observed_source;
        previous.repository = previousRepository; next.repository = nextRepository;
      }
      if (!isDeepStrictEqual(previous, next)) {
        failures.push(`${proposed.path}: unknown frontmatter value agentbase must preserve fields outside governed lifecycle fields`);
      }
      continue;
    }
    if (!STANDARD_OKF_KEYS.has(key) && !isDeepStrictEqual(proposed.frontmatter[key], value)) {
      failures.push(`${proposed.path}: unknown frontmatter value ${key} must be preserved when modifying an owned draft`);
    }
  }
  return failures;
}

function maintainerGuidanceFailures(
  concept: ConceptDocument,
  expected: NonNullable<ValidateProposalOptions["maintainerGuidance"]>,
): readonly string[] {
  const generated = mapping(concept.frontmatter.generated);
  const failures = concept.conceptId !== expected.conceptId || concept.type !== "Maintainer Guidance"
    || concept.status !== "stable" || generated?.by !== expected.by || generated.at !== expected.at
    || concept.verified.length
    ? [`${concept.path}: answer proposal must contain the exact stable human Maintainer Guidance`] : [];
  return [...failures, ...validateConceptAgainstSchema(concept)];
}

export function validateBundleProposal(
  currentBundleRoot: string,
  proposalRoot: string,
  options: ValidateProposalOptions = {},
): ProposalMetadata {
  const metadata = readProposalMetadata(proposalRoot);
  const current = loadOkfBundle(currentBundleRoot);
  if (current.treeDigest !== metadata.baseTreeDigest) throw new Error("proposal base tree is stale");
  const proposedRoot = bundlePath(proposalRoot);
  const proposed = loadOkfBundle(proposedRoot, { requireAgentBaseRootIndex: true });
  const baseDraftPaths = new Set([...current.concepts.values()].filter(isMutableAgentBaseDraft).map((concept) => concept.path));
  const failures = [...protectedModificationFailures(currentBundleRoot, proposedRoot)];
  for (const concept of proposed.concepts.values()) {
    const base = current.concepts.get(concept.conceptId);
    const changed = !base || !bytes(currentBundleRoot, base.path).equals(bytes(proposedRoot, concept.path));
    if (changed && concept.type === "Question") {
      try {
        const nextQuestion = parseQuestionDocument(concept);
        const previousQuestion = base?.type === "Question" ? parseQuestionDocument(base) : undefined;
        failures.push(...validateQuestionTransition(previousQuestion, nextQuestion)
          .map((failure) => `${concept.path}: ${failure}`));
      } catch (error) {
        failures.push(error instanceof Error ? error.message : `${concept.path}: Question validation failed`);
      }
    } else if (changed && (!base || isMutableAgentBaseDraft(base))) {
      failures.push(...(!base && options.maintainerGuidance?.conceptId === concept.conceptId
        ? maintainerGuidanceFailures(concept, options.maintainerGuidance)
        : validateAgentBaseDraft(concept)));
    }
    if (changed && base && isMutableAgentBaseDraft(base) && concept.type !== "Question") {
      failures.push(...unknownValueFailures(base, concept));
    }
    failures.push(...continuitySourceFailures(concept, baseDraftPaths));
  }
  const producerValidation = { passed: failures.length === 0, failures: failures.sort(), warnings: proposed.warnings };
  const next: ProposalMetadata = {
    ...metadata,
    state: failures.length ? "prepared" : "generated",
    ...(failures.length ? {} : { generatedTreeDigest: proposed.treeDigest }),
    producerValidation,
  };
  writeMetadata(proposalRoot, next);
  return next;
}

export function diffBundleProposal(currentBundleRoot: string, proposalRoot: string): ProposalDiff {
  const metadata = readProposalMetadata(proposalRoot);
  if (metadata.state !== "generated" || !metadata.generatedTreeDigest || !metadata.producerValidation?.passed) {
    throw new Error("proposal must pass validation before diff");
  }
  const current = loadOkfBundle(currentBundleRoot);
  if (current.treeDigest !== metadata.baseTreeDigest) throw new Error("proposal base tree is stale");
  const proposedRoot = bundlePath(proposalRoot);
  const proposed = loadOkfBundle(proposedRoot, { requireAgentBaseRootIndex: true });
  if (proposed.treeDigest !== metadata.generatedTreeDigest) throw new Error("proposal changed after validation");
  const paths = [...new Set([...current.files, ...proposed.files])].sort();
  const entries: ProposalDiffEntry[] = paths.map((relative) => {
    const inCurrent = current.files.includes(relative);
    const inProposed = proposed.files.includes(relative);
    if (!inCurrent) return { path: relative, change: "created", allowed: true };
    if (inProposed && bytes(currentBundleRoot, relative).equals(bytes(proposedRoot, relative))) {
      return { path: relative, change: "preserved", allowed: true };
    }
    if (inProposed) return { path: relative, change: "modified", allowed: true };
    const concept = current.concepts.get(relative.endsWith(".md") ? relative.slice(0, -3) : "");
    if (concept?.type === "Question") return { path: relative, change: "prohibited-deletion", allowed: false,
      reason: "Question documents require a dedicated governed transition" };
    if (concept && isMutableAgentBaseDraft(concept)) return { path: relative, change: "deleted-agentbase-draft", allowed: true };
    return { path: relative, change: "prohibited-deletion", allowed: false, reason: "existing content is protected by default" };
  });
  return {
    proposalId: metadata.proposalId,
    baseTreeDigest: metadata.baseTreeDigest,
    proposedTreeDigest: proposed.treeDigest,
    entries,
    applicable: entries.every((entry) => entry.allowed),
  };
}
