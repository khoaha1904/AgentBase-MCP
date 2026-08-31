import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import type { ProposalDiffEntry } from "../../../core/knowledge/index.ts";
import type { QuestionDeclaration } from "../authoring/questions.ts";
import type { RefreshChangeAccounting } from "../authoring/refresh-change-accounting.ts";

export type HubChangeEntry = Readonly<{
  path: string;
  change: ProposalDiffEntry["change"] | "conflict" | "removed-contribution";
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
  activity?: Readonly<{ repositoryLog: string; domainLog: null }>;
  changeAccounting?: RefreshChangeAccounting;
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
    removed: entries.filter((entry) => ["deleted-agentbase-draft", "removed-contribution"].includes(entry.change)),
    questionsAndLimitations: { questions, limitations },
  };
}

export function attachHubInspectionContext(
  inspection: HubProposalInspection,
  questions: readonly QuestionDeclaration[] = inspection.questions ?? [],
  coverage: HubProposalInspection["coverage"] = inspection.coverage,
  context: Readonly<Pick<HubProposalInspection, "discovery" | "activity" | "changeAccounting">> = {},
): HubProposalInspection {
  return {
    ...inspection,
    ...(questions.length ? { questions } : {}),
    ...(coverage ? { coverage } : {}),
    ...(context.discovery ? { discovery: context.discovery } : {}),
    ...(context.activity ? { activity: context.activity } : {}),
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
  };
  for (const entry of ordered) counts[entry.change] += 1;
  return { entries: ordered, counts, applicable: ordered.every((entry) => entry.allowed), groups: groups(ordered) };
}
