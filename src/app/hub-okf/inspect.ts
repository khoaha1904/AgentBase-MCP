import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import type { ProposalDiffEntry } from "../../core/knowledge/index.ts";

export type HubLifecycleEntry = Readonly<{
  path: string;
  change: ProposalDiffEntry["change"] | "conflict" | "supersession";
  allowed: boolean;
  reason?: string;
  previousConceptId?: string;
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
  entries: readonly HubLifecycleEntry[];
  counts: Readonly<Record<HubLifecycleEntry["change"], number>>;
  applicable: boolean;
}>;

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
  entries: readonly HubLifecycleEntry[],
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
    supersession: 0,
  };
  for (const entry of ordered) counts[entry.change] += 1;
  return { entries: ordered, counts, applicable: ordered.every((entry) => entry.allowed) };
}
