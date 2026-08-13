import { createHash } from "node:crypto";
import type { HubIdentity } from "./identity.ts";
import { HubValidationError } from "./identity.ts";
export type HubProposalPhase = "prepared" | "committed" | "pushed" | "pr-opened";
export type LocalProposalPublicationState = "pending" | "publishing" | "published" | "conflict";
export const HUB_PROPOSAL_TRAILERS = {
  id: "AgentBase-Proposal-ID",
  subject: "AgentBase-Subject",
  sourceId: "AgentBase-Source-ID",
  evidenceDigest: "AgentBase-Evidence-Digest",
  diffDigest: "AgentBase-Diff-Digest",
  catalog: "AgentBase-Schema-Catalog",
} as const;

export type LocalProposal = Readonly<{
  id: string;
  mode: "new" | "refresh";
  subject: string;
  sourceRepositoryId: string;
  evidenceDigest: string;
  schemaVersion: string;
  selectedSchemas: readonly string[];
  parentCommit: string;
  acceptedCommit: string;
  treeDigest: string;
  diffDigest: string;
  createdAt: string;
  acceptedAt: string;
  publicationState: LocalProposalPublicationState;
}>;
export type HubProposal = Readonly<{
  id: string;
  mode: "new" | "refresh";
  subject: string;
  hub: HubIdentity;
  baseCommit: string;
  sourceRepositoryId: string;
  evidenceDigest: string;
  schemaVersion: string;
  selectedSchemas: readonly string[];
  treeDigest: string;
  diffDigest: string;
  branch: string;
  phase: HubProposalPhase;
  commit?: string;
  pullRequest?: Readonly<{ number: number; url: string }>;
}>;
function hex(value: string, label: string): void {
  if (!/^[a-f0-9]{40}$/.test(value)) {
    throw new HubValidationError("HUB_IDENTITY_INVALID", `${label} must be 40 lowercase hex`);
  }
}
function digest(value: string, label: string): void {
  if (!/^sha256:[a-f0-9]{64}$/.test(value)) {
    throw new HubValidationError("HUB_DIGEST_INVALID", `${label} must be a SHA-256 digest`);
  }
}
export function createHubProposal(input: Omit<HubProposal, "id" | "branch" | "phase">): HubProposal {
  hex(input.baseCommit, "baseCommit");
  if (!/^repository-[a-z0-9-]+-[a-f0-9]{12}$/.test(input.sourceRepositoryId)) {
    throw new HubValidationError("HUB_SOURCE_INVALID", "sourceRepositoryId must be a normalized AgentBase repository identity");
  }
  digest(input.evidenceDigest, "evidenceDigest");
  digest(input.treeDigest, "treeDigest");
  digest(input.diffDigest, "diffDigest");
  if (!/^(?:repositories|relationships|capabilities)\/[a-z0-9][a-z0-9./-]*$/.test(input.subject) || input.subject.includes("..")) {
    throw new HubValidationError("HUB_SUBJECT_INVALID", "proposal subject must be a normalized Hub path");
  }
  const normalized = { ...input, selectedSchemas: [...input.selectedSchemas].sort() };
  const id = createHash("sha256").update(JSON.stringify(normalized)).digest("hex").slice(0, 24);
  return { ...normalized, id, branch: `agentbase/okf-${id}`, phase: "prepared" };
}
export function advanceHubProposal(proposal: HubProposal, phase: HubProposalPhase, values: Partial<HubProposal> = {}): HubProposal {
  const order: HubProposalPhase[] = ["prepared", "committed", "pushed", "pr-opened"];
  const current = order.indexOf(proposal.phase), next = order.indexOf(phase);
  if (next < current || next > current + 1) throw new HubValidationError("HUB_PHASE_INVALID", "invalid Hub proposal transition");
  if (phase !== "prepared" && typeof values.commit !== "string" && !proposal.commit) {
    throw new HubValidationError("HUB_COMMIT_MISSING", "publication phase requires exact commit");
  }
  if (values.commit) hex(values.commit, "commit");
  return { ...proposal, ...values, phase };
}

export function createLocalProposal(input: Omit<LocalProposal, "publicationState">): LocalProposal {
  if (!/^[a-f0-9]{24}$/.test(input.id)) throw new HubValidationError("HUB_PROPOSAL_ID_INVALID", "proposal ID must be 24 lowercase hex");
  if (!/^(?:repositories|relationships|capabilities)\/[a-z0-9][a-z0-9./-]*$/.test(input.subject) || input.subject.includes("..")) {
    throw new HubValidationError("HUB_SUBJECT_INVALID", "proposal subject must be a normalized Hub path");
  }
  hex(input.parentCommit, "parentCommit");
  hex(input.acceptedCommit, "acceptedCommit");
  digest(input.evidenceDigest, "evidenceDigest");
  digest(input.treeDigest, "treeDigest");
  digest(input.diffDigest, "diffDigest");
  if (!Number.isFinite(Date.parse(input.createdAt)) || !Number.isFinite(Date.parse(input.acceptedAt))) {
    throw new HubValidationError("HUB_PROPOSAL_TIME_INVALID", "proposal timestamps must be ISO-compatible");
  }
  return { ...input, selectedSchemas: [...input.selectedSchemas], publicationState: "pending" };
}

export function renderLocalProposalTrailers(proposal: LocalProposal): string {
  return [
    `${HUB_PROPOSAL_TRAILERS.id}: ${proposal.id}`,
    `${HUB_PROPOSAL_TRAILERS.subject}: ${proposal.subject}`,
    `${HUB_PROPOSAL_TRAILERS.sourceId}: ${proposal.sourceRepositoryId}`,
    `${HUB_PROPOSAL_TRAILERS.evidenceDigest}: ${proposal.evidenceDigest}`,
    `${HUB_PROPOSAL_TRAILERS.diffDigest}: ${proposal.diffDigest}`,
    `${HUB_PROPOSAL_TRAILERS.catalog}: ${proposal.schemaVersion}`,
  ].join("\n");
}

export function assertDependencySafePrefix(
  pending: readonly LocalProposal[],
  selectedIds: readonly string[],
): readonly LocalProposal[] {
  if (!selectedIds.length) throw new HubValidationError("HUB_SELECTION_EMPTY", "publication selection cannot be empty");
  const selected = pending.slice(0, selectedIds.length);
  if (selected.some((proposal, index) => proposal.id !== selectedIds[index])) {
    throw new HubValidationError("HUB_SELECTION_UNSAFE", "publication selection must be a contiguous pending prefix");
  }
  return selected;
}
