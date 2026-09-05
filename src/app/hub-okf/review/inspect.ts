import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { isDeepStrictEqual } from "node:util";

import type { AnyHubProposal } from "../../../core/hub/index.ts";
import {
  buildProposalSemanticImpact,
  type ProposalDiffEntry,
  type ProposalSemanticImpact,
} from "../../../core/knowledge/index.ts";
import type { QuestionDeclaration } from "../authoring/questions.ts";
import type { RefreshChangeAccounting } from "../authoring/refresh-change-accounting.ts";

export type HubChangeEntry = Readonly<{
  path: string;
  change: ProposalDiffEntry["change"] | "conflict" | "removed-contribution" | "migration-move-source";
  allowed: boolean;
  reason?: string;
  evidenceResources?: readonly string[];
  before?: HubInspectedContent;
  after?: HubInspectedContent;
}>;

export type HubInspectedContent = Readonly<{ digest: string; content: string; truncated: boolean }>;
export type HubInspectionOptions = Readonly<{
  baseRoot: string;
  proposedRoot: string;
  maximumFileBytes?: number;
}>;

export type HubProposalInspection = Readonly<{
  entries: readonly HubChangeEntry[];
  counts: Readonly<Record<HubChangeEntry["change"], number>>;
  applicable: boolean;
  questions?: readonly QuestionDeclaration[];
  coverage?: Readonly<{ partial: boolean; limitations: readonly string[] }>;
  discovery?: Readonly<{
    sourceRevision: string;
    lanes: readonly Readonly<{ lane: string; status: string; limitation?: string }>[];
    embeddedGroups: readonly string[];
    relationsAndFlows: readonly string[];
    questions: readonly string[];
    ignoredCounts: Readonly<Record<string, number>>;
    ignoredReasons: readonly string[];
    limitations: readonly string[];
  }>;
  changeAccounting?: RefreshChangeAccounting;
  semanticImpact?: ProposalSemanticImpact;
  groups: HubInspectionGroups;
  batch?: Readonly<{
    members: readonly Readonly<{ repositoryId: string; paths: readonly string[];
      discovery?: HubProposalInspection["discovery"] }>[];
    sharedPaths: readonly string[];
  }>;
}>;

export type HubInspectionGroups = Readonly<{
  added: readonly HubChangeEntry[];
  updated: readonly HubChangeEntry[];
  removed: readonly HubChangeEntry[];
  questionsAndLimitations: Readonly<{
    questions: readonly QuestionDeclaration[];
    limitations: readonly string[];
  }>;
}>;

function groups(
  entries: readonly HubChangeEntry[],
  questions: readonly QuestionDeclaration[] = [],
  limitations: readonly string[] = [],
): HubInspectionGroups {
  return {
    added: entries.filter((entry) => entry.change === "created"),
    updated: entries.filter((entry) => ["modified", "conflict"].includes(entry.change)),
    removed: entries.filter((entry) => ["deleted-agentbase-draft", "removed-contribution", "migration-move-source"].includes(entry.change)),
    questionsAndLimitations: { questions, limitations },
  };
}

export function attachHubInspectionContext(
  inspection: HubProposalInspection,
  questions: readonly QuestionDeclaration[] = inspection.questions ?? [],
  coverage: HubProposalInspection["coverage"] = inspection.coverage,
  context: Readonly<Pick<HubProposalInspection, "discovery" | "changeAccounting">> = {},
): HubProposalInspection {
  return {
    ...inspection,
    ...(questions.length ? { questions } : {}),
    ...(coverage ? { coverage } : {}),
    ...(context.discovery ? { discovery: context.discovery } : {}),
    ...(context.changeAccounting ? { changeAccounting: context.changeAccounting } : {}),
    groups: groups(inspection.entries, questions, coverage?.limitations ?? []),
  };
}

function inspectContent(root: string, relative: string, maximum: number): HubInspectedContent | undefined {
  const target = path.join(root, ...relative.split("/"));
  if (!fs.existsSync(target)) return undefined;
  const content = fs.readFileSync(target);
  return {
    digest: `sha256:${createHash("sha256").update(content).digest("hex")}`,
    content: content.subarray(0, maximum).toString("utf8"),
    truncated: content.length > maximum,
  };
}

export function inspectHubProposal(
  entries: readonly HubChangeEntry[],
  options?: HubInspectionOptions,
): HubProposalInspection {
  const maximum = options?.maximumFileBytes ?? 64 * 1024;
  if (!Number.isSafeInteger(maximum) || maximum < 1 || maximum > 1024 * 1024) {
    throw new Error("Hub inspection file limit must be between 1 byte and 1 MiB");
  }
  const ordered = [...entries].sort((left, right) => left.path.localeCompare(right.path)).map((entry) => {
    if (!options) return entry;
    const before = inspectContent(options.baseRoot, entry.path, maximum);
    const after = inspectContent(options.proposedRoot, entry.path, maximum);
    return { ...entry, ...(before ? { before } : {}), ...(after ? { after } : {}) };
  });
  const counts = {
    created: 0,
    modified: 0,
    preserved: 0,
    "deleted-agentbase-draft": 0,
    "prohibited-deletion": 0,
    conflict: 0,
    "removed-contribution": 0,
    "migration-move-source": 0,
  };
  for (const entry of ordered) counts[entry.change] += 1;
  return { entries: ordered, counts, applicable: ordered.every((entry) => entry.allowed), groups: groups(ordered) };
}

function proposalRepositoryIds(proposal: AnyHubProposal): readonly string[] {
  return proposal.mode === "enrichment" || proposal.mode === "batch-new"
    ? proposal.sourceRepositoryIds ?? [] : proposal.sourceRepositoryId ? [proposal.sourceRepositoryId] : [];
}

function semanticImpact(
  inspection: HubProposalInspection,
  baseRoot: string,
  proposedRoot: string,
  proposal: AnyHubProposal,
): ProposalSemanticImpact {
  const digest = (value: unknown) => `sha256:${createHash("sha256").update(JSON.stringify(value)).digest("hex")}`;
  const byteEntries = inspection.entries.map(({ before: _before, after: _after, ...entry }) => entry)
    .sort((left, right) => left.path < right.path ? -1 : left.path > right.path ? 1 : 0);
  if (![digest(inspection.entries), digest(byteEntries)].includes(proposal.diffDigest)) {
    throw new Error("proposal inspection byte-diff digest does not match proposal identity");
  }
  const impact = buildProposalSemanticImpact({
    baseRoot,
    proposedRoot,
    identity: {
      proposalId: proposal.id,
      mode: proposal.mode,
      baseCommit: proposal.baseCommit,
      diffDigest: proposal.diffDigest,
      sourceRepositoryIds: proposalRepositoryIds(proposal),
    },
  });
  if (impact.identity.proposedTreeDigest !== proposal.treeDigest) {
    throw new Error("proposal semantic impact does not match proposed tree digest");
  }
  return impact;
}

export function bindHubProposalInspection(
  inspection: HubProposalInspection,
  options: Readonly<{ baseRoot: string; proposedRoot: string; proposal: AnyHubProposal }>,
): HubProposalInspection {
  if (!inspection.applicable || inspection.entries.some((entry) => !entry.allowed)) {
    throw new Error("an inapplicable proposal inspection cannot be finalized");
  }
  return { ...inspection, semanticImpact: semanticImpact(inspection, options.baseRoot, options.proposedRoot, options.proposal) };
}

export function readVerifiedHubProposalInspection(
  proposalRoot: string,
  proposal: AnyHubProposal,
): HubProposalInspection {
  const value = JSON.parse(fs.readFileSync(path.join(proposalRoot, "inspection.json"), "utf8")) as HubProposalInspection;
  if (!value || typeof value !== "object" || !Array.isArray(value.entries) || value.semanticImpact?.formatVersion !== 1) {
    throw new Error("proposal semantic impact is unavailable; regenerate the prepared proposal");
  }
  if (!value.applicable || value.entries.some((entry) => !entry || typeof entry !== "object" || !entry.allowed)) {
    throw new Error("proposal inspection is not applicable");
  }
  const expected = semanticImpact(value, path.join(proposalRoot, "base"), path.join(proposalRoot, "bundle"), proposal);
  if (!isDeepStrictEqual(value.semanticImpact, expected)) {
    throw new Error("proposal semantic impact changed after finalization");
  }
  return value;
}
