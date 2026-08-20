import { createHash } from "node:crypto";
import type { ConceptDocument, OkfValue } from "../documents/okf-document.ts";

export type RepositoryIdentityHints = Readonly<{
  displayName: string;
  remotes: readonly string[];
  rootCommits: readonly string[];
  forgeId?: string;
}>;

export type RepositoryIdentityRecord = Readonly<{
  id: string;
  displayName: string;
  remotes: readonly string[];
  rootCommits: readonly string[];
  forgeId?: string;
}>;

export type RepositoryIdentityResolution =
  | Readonly<{ kind: "existing"; repository: RepositoryIdentityRecord; matchedBy: "forge-id" | "remote" | "lineage" }>
  | Readonly<{ kind: "new"; repository: RepositoryIdentityRecord }>
  | Readonly<{ kind: "ambiguous"; candidates: readonly RepositoryIdentityRecord[]; reason: string }>;

function mapping(value: OkfValue | undefined): Readonly<Record<string, OkfValue>> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Readonly<Record<string, OkfValue>> : undefined;
}

function stringList(value: OkfValue | undefined): readonly string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string") ? value as string[] : [];
}

export function readRepositoryIdentityRecord(concept: ConceptDocument): RepositoryIdentityRecord | undefined {
  if (concept.type !== "Repository") return undefined;
  const agentbase = mapping(concept.frontmatter.agentbase);
  const repository = mapping(agentbase?.repository);
  if (!repository || typeof repository.id !== "string" || typeof repository.display_name !== "string"
    || !/^repository-[a-z0-9-]+-[a-f0-9]{12}$/.test(repository.id)) return undefined;
  const aliases = mapping(repository.aliases);
  return normalizeRecord({
    id: repository.id,
    displayName: repository.display_name,
    remotes: stringList(aliases?.remotes),
    rootCommits: stringList(aliases?.root_commits),
    ...(typeof repository.forge_id === "string" ? { forgeId: repository.forge_id } : {}),
  });
}

function unique(values: readonly string[]): readonly string[] {
  return [...new Set(values.map((value) => value.trim().toLowerCase()).filter(Boolean))].sort();
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "repository";
}

function normalizeRecord(record: RepositoryIdentityRecord): RepositoryIdentityRecord {
  return { ...record, remotes: unique(record.remotes), rootCommits: unique(record.rootCommits) };
}

function assignedRepository(hints: RepositoryIdentityHints): RepositoryIdentityRecord {
  const remotes = unique(hints.remotes), roots = unique(hints.rootCommits);
  const seed = hints.forgeId ? `forge:${hints.forgeId}`
    : remotes[0] ? `remote:${remotes[0]}`
      : roots[0] ? `root:${roots[0]}:${hints.displayName.toLowerCase()}`
        : `local:${hints.displayName.toLowerCase()}`;
  const digest = createHash("sha256").update(seed).digest("hex").slice(0, 12);
  return {
    id: `repository-${slug(hints.displayName)}-${digest}`,
    displayName: hints.displayName,
    remotes,
    rootCommits: roots,
    ...(hints.forgeId ? { forgeId: hints.forgeId } : {}),
  };
}

function enrich(record: RepositoryIdentityRecord, hints: RepositoryIdentityHints): RepositoryIdentityRecord {
  return normalizeRecord({
    ...record,
    displayName: hints.displayName,
    remotes: [...record.remotes, ...hints.remotes],
    rootCommits: [...record.rootCommits, ...hints.rootCommits],
    ...(record.forgeId || hints.forgeId ? { forgeId: record.forgeId ?? hints.forgeId } : {}),
  });
}

export function resolveRepositoryIdentity(
  hints: RepositoryIdentityHints,
  existing: readonly RepositoryIdentityRecord[],
): RepositoryIdentityResolution {
  const records = existing.map(normalizeRecord);
  if (hints.forgeId) {
    const matches = records.filter((record) => record.forgeId === hints.forgeId);
    if (matches.length === 1) return { kind: "existing", repository: enrich(matches[0]!, hints), matchedBy: "forge-id" };
    if (matches.length > 1) return { kind: "ambiguous", candidates: matches, reason: "forge identity matches multiple Hub repositories" };
  }
  const remotes = new Set(unique(hints.remotes));
  const remoteMatches = records.filter((record) => record.remotes.some((remote) => remotes.has(remote)));
  if (remoteMatches.length === 1) return { kind: "existing", repository: enrich(remoteMatches[0]!, hints), matchedBy: "remote" };
  if (remoteMatches.length > 1) return { kind: "ambiguous", candidates: remoteMatches, reason: "remote alias matches multiple Hub repositories" };
  const roots = new Set(unique(hints.rootCommits));
  const lineageMatches = records.filter((record) => record.rootCommits.some((root) => roots.has(root)));
  if (lineageMatches.length === 1) return { kind: "existing", repository: enrich(lineageMatches[0]!, hints), matchedBy: "lineage" };
  if (lineageMatches.length > 1) return {
    kind: "ambiguous",
    candidates: lineageMatches,
    reason: "shared Git lineage may represent a fork or mirror",
  };
  return { kind: "new", repository: assignedRepository(hints) };
}
