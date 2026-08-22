import type { AdmittedLocalHubState } from "../../../core/hub/index.ts";
import { HUB_PROPOSAL_TRAILERS } from "../../../core/hub/index.ts";
import { runGit, type GitOutput, type GitRequest } from "../../../providers/github-hub/index.ts";

export type PendingHubProposal = Readonly<{
  id: string;
  subject: string;
  sourceRepositoryId?: string;
  domainId?: string;
  sourceRepositoryIds?: readonly string[];
  manifestDigest?: string;
  evidenceDigest: string;
  diffDigest: string;
  schemaVersion: string;
  mode?: "new" | "refresh" | "enrichment" | "batch-new";
  parentCommit: string;
  commit: string;
  diffSummary: string;
  publicationState: "pending";
}>;

export type PendingGit = (request: GitRequest) => Promise<GitOutput>;

function trailers(message: string): ReadonlyMap<string, string> {
  const values = new Map<string, string>();
  for (const line of message.split("\n")) {
    const match = line.match(/^([A-Za-z][A-Za-z0-9-]+):\s*(.+)$/);
    if (match?.[1] && match[2]) values.set(match[1], match[2].trim());
  }
  return values;
}

function required(values: ReadonlyMap<string, string>, key: string, commit: string): string {
  const value = values.get(key);
  if (!value) throw new Error(`pending commit ${commit} is missing ${key}`);
  return value;
}

function optionalMode(values: ReadonlyMap<string, string>, commit: string): "new" | "refresh" | "enrichment" | "batch-new" | undefined {
  const value = values.get(HUB_PROPOSAL_TRAILERS.mode);
  if (value === undefined) return undefined;
  if (!new Set(["new", "refresh", "enrichment", "batch-new"]).has(value)) throw new Error(`pending commit ${commit} has an invalid proposal mode`);
  return value as "new" | "refresh" | "enrichment" | "batch-new";
}

export async function listPendingHubProposals(
  localHub: AdmittedLocalHubState,
  git: PendingGit = runGit,
): Promise<readonly PendingHubProposal[]> {
  const ancestry = await git({
    args: ["rev-list", "--first-parent", "--reverse", `${localHub.remoteBase}..${localHub.activeHead}`],
    cwd: localHub.root,
    operation: "list pending ancestry",
    maximumOutputBytes: 1024 * 1024,
  });
  const commits = ancestry.stdout.trim().split("\n").filter(Boolean);
  const pending: PendingHubProposal[] = [];
  let expectedParent = localHub.remoteBase;
  for (const commit of commits) {
    if (!/^[a-f0-9]{40}$/.test(commit)) throw new Error("pending ancestry contains an invalid commit");
    const commitMessage = await git({
      args: ["show", "-s", "--format=%B", commit],
      cwd: localHub.root,
      operation: "read pending proposal trailers",
      maximumOutputBytes: 64 * 1024,
    });
    const message = trailers(commitMessage.stdout);
    const parent = await git({
      args: ["rev-parse", "--verify", `${commit}^`],
      cwd: localHub.root,
      operation: "resolve pending proposal parent",
      maximumOutputBytes: 256,
    });
    const parentCommit = parent.stdout.trim();
    if (parentCommit !== expectedParent) throw new Error("pending proposal ancestry is not a contiguous first-parent chain");
    const mode = optionalMode(message, commit);
    const summary = await git({
      args: ["diff-tree", "--no-commit-id", "--stat", "--format=", commit],
      cwd: localHub.root,
      operation: "summarize pending proposal",
      maximumOutputBytes: 64 * 1024,
    });
    const multiRepository = mode === "enrichment" || mode === "batch-new";
    const scope = multiRepository ? {
      domainId: required(message, HUB_PROPOSAL_TRAILERS.domainId, commit),
      sourceRepositoryIds: required(message, HUB_PROPOSAL_TRAILERS.sourceIds, commit).split(",").filter(Boolean),
      manifestDigest: required(message, HUB_PROPOSAL_TRAILERS.manifestDigest, commit),
    } : { sourceRepositoryId: required(message, HUB_PROPOSAL_TRAILERS.sourceId, commit) };
    if (multiRepository && (!scope.sourceRepositoryIds?.length
      || new Set(scope.sourceRepositoryIds).size !== scope.sourceRepositoryIds.length)) {
      throw new Error(`pending commit ${commit} has an invalid multi-Repository scope`);
    }
    pending.push({
      id: required(message, HUB_PROPOSAL_TRAILERS.id, commit),
      subject: required(message, HUB_PROPOSAL_TRAILERS.subject, commit),
      ...scope,
      evidenceDigest: required(message, HUB_PROPOSAL_TRAILERS.evidenceDigest, commit),
      diffDigest: required(message, HUB_PROPOSAL_TRAILERS.diffDigest, commit),
      schemaVersion: required(message, HUB_PROPOSAL_TRAILERS.catalog, commit),
      ...(mode ? { mode } : {}),
      parentCommit,
      commit,
      diffSummary: summary.stdout.trim(),
      publicationState: "pending",
    });
    expectedParent = commit;
  }
  return pending;
}

export function selectPendingPrefix(
  pending: readonly PendingHubProposal[],
  selectedIds: readonly string[],
): readonly PendingHubProposal[] {
  if (!selectedIds.length) throw new Error("pending publication selection cannot be empty");
  const selected = pending.slice(0, selectedIds.length);
  if (selected.some((proposal, index) => proposal.id !== selectedIds[index])) {
    throw new Error("pending publication selection must be one contiguous prefix");
  }
  return selected;
}

export function selectPendingProposals(
  pending: readonly PendingHubProposal[],
  selectedIds: readonly string[],
): readonly PendingHubProposal[] {
  if (!selectedIds.length) throw new Error("pending publication selection cannot be empty");
  if (new Set(selectedIds).size !== selectedIds.length) throw new Error("pending publication selection contains duplicate IDs");
  const wanted = new Set(selectedIds);
  const selected = pending.filter((proposal) => wanted.has(proposal.id));
  if (selected.length !== selectedIds.length) throw new Error("pending publication selection contains an unknown proposal ID");
  return selected;
}
