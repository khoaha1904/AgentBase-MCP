import fs from "node:fs";
import path from "node:path";

import { loadOkfBundle, parseRepositorySourceResource, repositorySourceResources } from "../../../core/knowledge/index.ts";

export const REFRESH_CHANGE_OUTCOME_KINDS = ["updated", "new", "embedded", "question", "ignored"] as const;

export type RefreshChangeOutcomeKind = typeof REFRESH_CHANGE_OUTCOME_KINDS[number];

export type RefreshSourceChanges = Readonly<{
  paths: readonly string[];
  omitted: number;
  limitations: readonly string[];
}>;

export type RefreshChangeOutcome = Readonly<{
  path: string;
  outcome: RefreshChangeOutcomeKind;
  reason: string;
}>;

export type RefreshChangeAccounting = Readonly<{
  outcomes: readonly RefreshChangeOutcome[];
  partial: boolean;
  omitted: number;
  limitations: readonly string[];
}>;

type ValidationOptions = Readonly<{
  sourceRepositoryId: string;
  sourceChanges: RefreshSourceChanges;
  baseRoot: string;
  authoredRoot: string;
  outcomes: readonly RefreshChangeOutcome[];
}>;

function conceptBytes(root: string, relativePath: string): Buffer {
  return fs.readFileSync(path.join(root, ...relativePath.split("/")));
}

export function validateRefreshChangeAccounting(options: ValidationOptions): RefreshChangeAccounting {
  const expected = new Set(options.sourceChanges.paths);
  const failures: string[] = [];
  const normalized = options.outcomes.map((item) => ({
    path: typeof item.path === "string" ? item.path : "",
    outcome: item.outcome,
    reason: typeof item.reason === "string" ? item.reason.trim() : "",
  }));
  const declared = new Map<string, RefreshChangeOutcome>();

  if (normalized.length > 128) failures.push("change accounting exceeds 128 outcomes");
  for (const item of normalized) {
    if (!item.path || item.path.length > 512) failures.push("change accounting path must be 1..512 characters");
    if (!REFRESH_CHANGE_OUTCOME_KINDS.includes(item.outcome)) failures.push(`invalid outcome for ${item.path || "<empty>"}`);
    if (!item.reason || item.reason.length > 512) failures.push(`outcome reason must be 1..512 characters for ${item.path || "<empty>"}`);
    if (declared.has(item.path)) failures.push(`duplicate outcome for ${item.path}`);
    else declared.set(item.path, item);
    if (!expected.has(item.path)) failures.push(`unexpected outcome for ${item.path}`);
  }
  for (const expectedPath of expected) {
    if (!declared.has(expectedPath)) failures.push(`missing outcome for ${expectedPath}`);
  }

  if (!failures.length) {
    const base = loadOkfBundle(options.baseRoot);
    const authored = loadOkfBundle(options.authoredRoot, { requireAgentBaseRootIndex: true });
    const changed = [...authored.concepts.values()].flatMap((concept) => {
      const previous = base.concepts.get(concept.conceptId);
      const differs = !previous || !conceptBytes(options.baseRoot, previous.path)
        .equals(conceptBytes(options.authoredRoot, concept.path));
      return differs ? [{ concept, previous }] : [];
    });
    for (const item of normalized) {
      if (item.outcome === "question" || item.outcome === "ignored") continue;
      const matches = changed.filter(({ concept }) => repositorySourceResources(concept).some((resource) => {
        const parsed = parseRepositorySourceResource(resource);
        return parsed?.repositoryId === options.sourceRepositoryId && parsed.relativePath === item.path;
      }));
      const supported = item.outcome === "new"
        ? matches.some(({ previous }) => previous === undefined)
        : item.outcome === "updated"
          ? matches.some(({ previous }) => previous !== undefined)
          : matches.length > 0;
      if (!supported) failures.push(`unsupported ${item.outcome} outcome for ${item.path}`);
    }
  }

  if (failures.length) throw new Error(`Refresh change accounting failed: ${failures.join("; ")}`);
  return {
    outcomes: normalized.sort((left, right) => left.path.localeCompare(right.path)),
    partial: options.sourceChanges.omitted > 0 || options.sourceChanges.limitations.length > 0,
    omitted: options.sourceChanges.omitted,
    limitations: [...options.sourceChanges.limitations],
  };
}
