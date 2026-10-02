import fs from "node:fs";
import path from "node:path";

import { resolveRepositoryIdentity, type RepositoryIdentityResolution } from "../../../core/knowledge/index.ts";
import { discoverRepositorySourceState } from "../../repository-source/index.ts";
import type { PendingHubProposal } from "../review/pending.ts";
import type { PublishedRepositoryInventoryItem } from "./query.ts";

const MAX_REPOSITORIES = 32;
const MAX_DIRECTORIES = 4096;
const SKIPPED_DIRECTORIES = new Set([".git", ".agentbase", ".codebase-memory", "node_modules"]);

export type WorkspaceRepositoryClassification =
  | "hub-unavailable"
  | "not-in-hub"
  | "published-unchanged"
  | "published-source-advanced"
  | "init-local-draft"
  | "init-in-review"
  | "refresh-local-draft"
  | "refresh-in-review"
  | "ambiguous";

export type WorkspaceRepositoryScan = Readonly<{
  path: string;
  displayName: string;
  repositoryId: string;
  identityHints: Readonly<{ remotes: readonly string[]; rootCommits: readonly string[] }>;
  currentSource: Readonly<{ commit: string | null; dirty: boolean; capturedAt: string }>;
  classification: WorkspaceRepositoryClassification;
  suggestion: "ingest" | "refresh" | "none" | "confirm";
  publishedSource?: Readonly<{ commit: string | null; observedAt: string }>;
  matchedBy?: "forge-id" | "remote" | "lineage";
  limitations: readonly string[];
}>;

export type WorkspaceScanResult = Readonly<{
  workspaceRoot: string;
  hub: "unavailable" | "published";
  repositories: readonly WorkspaceRepositoryScan[];
  truncated: boolean;
  limitations: readonly string[];
}>;

function validateWorkspaceRoot(workspaceRoot: string): string {
  if (!path.isAbsolute(workspaceRoot)) throw new Error("workspace_root must be an absolute directory");
  let root: string;
  try {
    root = fs.realpathSync(workspaceRoot);
    if (!fs.statSync(root).isDirectory()) throw new Error("not a directory");
  } catch {
    throw new Error("workspace_root must resolve to an existing directory");
  }
  return root;
}

function discoverGitRoots(workspaceRoot: string): Readonly<{
  roots: readonly string[];
  truncated: boolean;
  directoryLimitReached: boolean;
}> {
  const queue = [workspaceRoot], roots: string[] = [];
  let visited = 0, truncated = false, directoryLimitReached = false;
  while (queue.length) {
    const directory = queue.shift()!;
    visited += 1;
    if (visited > MAX_DIRECTORIES) {
      directoryLimitReached = true;
      break;
    }
    const gitMarker = path.join(directory, ".git");
    const marker = fs.existsSync(gitMarker) ? fs.lstatSync(gitMarker) : undefined;
    if (marker && !marker.isSymbolicLink() && (marker.isDirectory() || marker.isFile())) {
      roots.push(directory);
      if (roots.length === MAX_REPOSITORIES) {
        truncated = queue.length > 0;
        break;
      }
      continue;
    }
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })
      .sort((left, right) => left.name.localeCompare(right.name))) {
      if (!entry.isDirectory() || entry.isSymbolicLink() || SKIPPED_DIRECTORIES.has(entry.name)) continue;
      queue.push(path.join(directory, entry.name));
    }
  }
  return { roots, truncated, directoryLimitReached };
}

function pendingClassification(
  resolution: Exclude<RepositoryIdentityResolution, { kind: "ambiguous" }>,
  pending: readonly PendingHubProposal[],
  inReviewProposalIds: ReadonlySet<string>,
): Pick<WorkspaceRepositoryScan, "classification" | "suggestion"> | undefined {
  const proposal = pending.find((item) => item.sourceRepositoryId === resolution.repository.id
    && (item.mode === "new" || item.mode === "refresh"));
  if (!proposal) return undefined;
  const review = inReviewProposalIds.has(proposal.id);
  return proposal.mode === "new"
    ? { classification: review ? "init-in-review" : "init-local-draft", suggestion: "none" }
    : { classification: review ? "refresh-in-review" : "refresh-local-draft", suggestion: "none" };
}

export function scanWorkspaceRepositories(options: Readonly<{
  workspaceRoot: string;
  published?: readonly PublishedRepositoryInventoryItem[];
  pending?: readonly PendingHubProposal[];
  inReviewProposalIds?: ReadonlySet<string>;
  capturedAt?: string;
}>): WorkspaceScanResult {
  const workspaceRoot = validateWorkspaceRoot(options.workspaceRoot);
  const discovery = discoverGitRoots(workspaceRoot);
  const published = options.published;
  const records = published?.map((item) => item.identity) ?? [];
  const pending = options.pending ?? [];
  const inReview = options.inReviewProposalIds ?? new Set<string>();
  const repositories = discovery.roots.map((root): WorkspaceRepositoryScan => {
    const source = discoverRepositorySourceState(root, options.capturedAt);
    const common = {
      path: root,
      displayName: source.displayName,
      repositoryId: source.repositoryId,
      identityHints: source.identityHints,
      currentSource: { commit: source.commit, dirty: source.dirty, capturedAt: source.capturedAt },
      limitations: source.limitations,
    };
    if (!published) return { ...common, classification: "hub-unavailable", suggestion: "none" };
    const resolution = resolveRepositoryIdentity({ displayName: source.displayName, ...source.identityHints }, records);
    if (resolution.kind === "ambiguous") {
      return { ...common, classification: "ambiguous", suggestion: "confirm",
        limitations: [...source.limitations, resolution.reason] };
    }
    const localState = pendingClassification(resolution, pending, inReview);
    if (localState) return { ...common, repositoryId: resolution.repository.id, ...localState };
    if (resolution.kind === "new") return { ...common, repositoryId: resolution.repository.id,
      classification: "not-in-hub", suggestion: "ingest" };
    const item = published.find((candidate) => candidate.identity.id === resolution.repository.id)!;
    const observed = item.observedSource;
    const unchanged = observed !== undefined && observed.commit === source.commit && !source.dirty;
    return {
      ...common,
      repositoryId: resolution.repository.id,
      classification: unchanged ? "published-unchanged" : "published-source-advanced",
      suggestion: unchanged ? "none" : "refresh",
      ...(observed ? { publishedSource: { commit: observed.commit, observedAt: observed.observedAt } } : {}),
      matchedBy: resolution.matchedBy,
      ...(!observed ? { limitations: [...source.limitations, "Published Repository has no valid observed source metadata"] } : {}),
    };
  });
  const limitations = [
    ...(discovery.truncated ? [`repository inventory is limited to ${MAX_REPOSITORIES} Git roots`] : []),
    ...(discovery.directoryLimitReached ? [`directory inventory stopped after ${MAX_DIRECTORIES} directories`] : []),
  ];
  return { workspaceRoot, hub: published ? "published" : "unavailable", repositories,
    truncated: discovery.truncated || discovery.directoryLimitReached, limitations };
}

export function readInReviewProposalIds(stateRoot: string): ReadonlySet<string> {
  const root = path.join(path.resolve(stateRoot), "publications");
  if (!fs.existsSync(root)) return new Set();
  const ids = new Set<string>();
  for (const entry of fs.readdirSync(root, { withFileTypes: true }).filter((item) => item.isFile()).slice(0, 256)) {
    if (!/^[a-f0-9]{24}\.json$/.test(entry.name)) continue;
    try {
      const receipt = JSON.parse(fs.readFileSync(path.join(root, entry.name), "utf8")) as Record<string, unknown>;
      if (Array.isArray(receipt.proposalIds)) {
        for (const id of receipt.proposalIds) if (typeof id === "string") ids.add(id);
      }
    } catch { /* malformed local receipt is ignored; pending state remains authoritative */ }
  }
  return ids;
}
