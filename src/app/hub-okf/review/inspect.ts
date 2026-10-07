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
import { buildHubRefreshSuggestions, type HubRefreshSuggestions } from "./refresh-suggestions.ts";
import { contextualDiff } from "./context-diff.ts";

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
  refreshSuggestions?: HubRefreshSuggestions;
  groups: HubInspectionGroups;
  batch?: Readonly<{
    members: readonly Readonly<{ repositoryId: string; paths: readonly string[];
      discovery?: HubProposalInspection["discovery"] }>[];
    sharedPaths: readonly string[];
  }>;
}>;

export type HubInspectionGroups = Readonly<{
  added: readonly HubGroupedChangeEntry[];
  updated: readonly HubGroupedChangeEntry[];
  removed: readonly HubGroupedChangeEntry[];
  questionsAndLimitations: Readonly<{
    questions: readonly QuestionDeclaration[];
    limitations: readonly string[];
  }>;
}>;

type HubGroupedChangeEntry = Omit<HubChangeEntry, "before" | "after">;

function groupedEntry(entry: HubChangeEntry): HubGroupedChangeEntry {
  const { before: _before, after: _after, ...summary } = entry;
  return summary;
}

function groups(
  entries: readonly HubChangeEntry[],
  questions: readonly QuestionDeclaration[] = [],
  limitations: readonly string[] = [],
): HubInspectionGroups {
  return {
    added: entries.filter((entry) => entry.change === "created").map(groupedEntry),
    updated: entries.filter((entry) => ["modified", "conflict"].includes(entry.change)).map(groupedEntry),
    removed: entries.filter((entry) => ["deleted-agentbase-draft", "removed-contribution", "migration-move-source"].includes(entry.change)).map(groupedEntry),
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
    return {
      ...entry,
      ...(entry.change === "preserved" ? {} : before ? { before } : {}),
      ...(entry.change === "preserved" ? {} : after ? { after } : {}),
    };
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
  return {
    ...inspection,
    semanticImpact: semanticImpact(inspection, options.baseRoot, options.proposedRoot, options.proposal),
    refreshSuggestions: buildHubRefreshSuggestions(options.baseRoot, options.proposedRoot, proposalRepositoryIds(options.proposal)),
  };
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
  const refreshSuggestions = buildHubRefreshSuggestions(path.join(proposalRoot, "base"),
    path.join(proposalRoot, "bundle"), proposalRepositoryIds(proposal));
  if (value.refreshSuggestions !== undefined && !isDeepStrictEqual(value.refreshSuggestions, refreshSuggestions)) {
    throw new Error("proposal Refresh suggestions changed after finalization");
  }
  return { ...attachHubInspectionContext(value), refreshSuggestions };
}

export function projectHubProposalInspection(inspection: HubProposalInspection, proposalRoot: string, includeContent = false): unknown {
  if (includeContent) return inspection;
  return {
    ...inspection,
    entries: inspection.entries.map(({ before, after, ...entry }) => {
      const metadata = (side: "base" | "bundle", content: HubInspectedContent | undefined) => content ? {
        digest: content.digest,
        bytes: fs.statSync(path.join(proposalRoot, side, entry.path)).size,
        file: path.join(proposalRoot, side, entry.path),
      } : undefined;
      return {
        ...entry,
        ...(before ? { before: metadata("base", before) } : {}),
        ...(after ? { after: metadata("bundle", after) } : {}),
        ...(before || after ? { diff: {
          ...contextualDiff(before?.content ?? "", after?.content ?? ""),
          ...(before?.truncated || after?.truncated ? { truncated: true } : {}),
        } } : {}),
      };
    }),
  };
}

// Lifecycle callers retain full inspection privately; CLI/MCP Finalize exposes only review routing.
export function summarizeHubFinalization(value: unknown): unknown {
  const finalized = value as Readonly<{
    proposal?: AnyHubProposal;
    result?: string;
    inspection?: HubProposalInspection;
    source_head?: unknown;
  }>;
  if (!finalized?.inspection) return value;
  const inspection = finalized.inspection;
  return {
    ...(finalized.result ? { result: finalized.result } : {}),
    ...(finalized.proposal ? { proposal_id: finalized.proposal.id, proposal_digest: finalized.proposal.diffDigest } : {}),
    counts: inspection.counts,
    questions: inspection.questions ?? inspection.discovery?.questions ?? [],
    limitations: [...new Set([
      ...inspection.groups.questionsAndLimitations.limitations,
      ...inspection.discovery?.limitations ?? [],
      ...inspection.changeAccounting?.limitations ?? [],
    ])],
    ...(inspection.coverage ? { coverage: { partial: inspection.coverage.partial } } : {}),
    ...(inspection.changeAccounting ? { changeAccounting: {
      partial: inspection.changeAccounting.partial,
      omitted: inspection.changeAccounting.omitted,
    } } : {}),
    refreshSuggestions: inspection.refreshSuggestions ?? { items: [], omitted: 0 },
    ...(finalized.source_head ? { source_head: finalized.source_head } : {}),
  };
}
