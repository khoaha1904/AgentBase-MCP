import { createHash } from "node:crypto";
import type { HubIdentity } from "./identity.ts";
import { HubValidationError } from "./identity.ts";
export type HubProposalPhase = "prepared" | "committed" | "pushed" | "pr-opened";
export type LocalProposalPublicationState = "pending" | "publishing" | "published" | "conflict";
export type HubProposalMode = "new" | "refresh" | "enrichment" | "batch-new" | "migration";
export const HUB_PROPOSAL_TRAILERS = {
  id: "AgentBase-Proposal-ID",
  subject: "AgentBase-Subject",
  sourceId: "AgentBase-Source-ID",
  evidenceDigest: "AgentBase-Evidence-Digest",
  diffDigest: "AgentBase-Diff-Digest",
  catalog: "AgentBase-Schema-Catalog",
  mode: "AgentBase-Proposal-Mode",
  domainId: "AgentBase-Domain-ID",
  sourceIds: "AgentBase-Source-IDs",
  manifestDigest: "AgentBase-Manifest-Digest",
  migrationDigest: "AgentBase-Migration-Digest",
} as const;

const HUB_SUBJECT_ROOTS = [
  "shared", "domains", "systems", "components", "interfaces", "flows", "resources",
  "infrastructure", "deployments", "repositories", "relationships", "capabilities",
] as const;
export const HUB_PROPOSAL_SUBJECT_PATTERN = new RegExp(
  `^(?:${HUB_SUBJECT_ROOTS.join("|")})/[a-z0-9][a-z0-9./-]*$`,
);

export function isHubProposalSubject(value: string): boolean {
  return HUB_PROPOSAL_SUBJECT_PATTERN.test(value) && !value.includes("..");
}

export type LocalProposal = Readonly<{
  id: string;
  mode: HubProposalMode;
  subject: string;
  sourceRepositoryId?: string;
  domainId?: string;
  sourceRepositoryIds?: readonly string[];
  manifestDigest?: string;
  migrationDigest?: string;
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
type HubProposalFields = Readonly<{
  id: string;
  mode: HubProposalMode;
  subject: string;
  baseCommit: string;
  sourceRepositoryId?: string;
  domainId?: string;
  sourceRepositoryIds?: readonly string[];
  manifestDigest?: string;
  migrationDigest?: string;
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
export type HubProposal = HubProposalFields & Readonly<{ hub: HubIdentity; localHubId?: string }>;
export type LocalOnlyHubProposal = HubProposalFields & Readonly<{ localHubId: string; hub?: never }>;
export type AnyHubProposal = HubProposal | LocalOnlyHubProposal;
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
type RemoteProposalInput = Omit<HubProposal, "id" | "branch" | "phase">;
type LocalProposalInput = Omit<LocalOnlyHubProposal, "id" | "branch" | "phase">;
export function createHubProposal(input: RemoteProposalInput): HubProposal;
export function createHubProposal(input: LocalProposalInput): LocalOnlyHubProposal;
export function createHubProposal(input: RemoteProposalInput | LocalProposalInput): AnyHubProposal {
  hex(input.baseCommit, "baseCommit");
  if (input.mode === "migration") {
    if (input.sourceRepositoryId !== undefined || input.domainId !== undefined
      || input.sourceRepositoryIds !== undefined || input.manifestDigest !== undefined) {
      throw new HubValidationError("HUB_SOURCE_INVALID", "migration proposal source scope is invalid");
    }
    digest(input.migrationDigest ?? "", "migrationDigest");
  } else if (input.mode === "enrichment" || input.mode === "batch-new") {
    if (input.sourceRepositoryId !== undefined || !/^domains\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.domainId ?? "")
      || !input.sourceRepositoryIds?.length || input.sourceRepositoryIds.length > 32
      || new Set(input.sourceRepositoryIds).size !== input.sourceRepositoryIds.length
      || input.sourceRepositoryIds.some((value) => !/^repository-[a-z0-9-]+-[a-f0-9]{12}$/.test(value))
      || input.migrationDigest !== undefined) {
      throw new HubValidationError("HUB_SOURCE_INVALID", `${input.mode} requires one Domain and normalized unique Repository identities`);
    }
    digest(input.manifestDigest ?? "", "manifestDigest");
  } else if (!/^repository-[a-z0-9-]+-[a-f0-9]{12}$/.test(input.sourceRepositoryId ?? "")
    || input.domainId !== undefined || input.sourceRepositoryIds !== undefined || input.manifestDigest !== undefined
    || input.migrationDigest !== undefined) {
    throw new HubValidationError("HUB_SOURCE_INVALID", "Repository proposal source scope is invalid");
  }
  digest(input.evidenceDigest, "evidenceDigest");
  digest(input.treeDigest, "treeDigest");
  digest(input.diffDigest, "diffDigest");
  if (!isHubProposalSubject(input.subject)) {
    throw new HubValidationError("HUB_SUBJECT_INVALID", "proposal subject must be a normalized Hub path");
  }
  if (!("hub" in input) && !/^[a-f0-9]{24}$/.test(input.localHubId)) {
    throw new HubValidationError("HUB_LOCAL_ID_INVALID", "localHubId must be 24 lowercase hex");
  }
  const normalized = { ...input, selectedSchemas: [...input.selectedSchemas].sort() };
  const id = createHash("sha256").update(JSON.stringify(normalized)).digest("hex").slice(0, 24);
  return { ...normalized, id, branch: `agentbase/okf-${id}`, phase: "prepared" };
}
export function advanceHubProposal<T extends AnyHubProposal>(proposal: T, phase: HubProposalPhase, values: Partial<T> = {}): T {
  const order: HubProposalPhase[] = ["prepared", "committed", "pushed", "pr-opened"];
  const current = order.indexOf(proposal.phase), next = order.indexOf(phase);
  if (next < current || next > current + 1) throw new HubValidationError("HUB_PHASE_INVALID", "invalid Hub proposal transition");
  if (phase !== "prepared" && typeof values.commit !== "string" && !proposal.commit) {
    throw new HubValidationError("HUB_COMMIT_MISSING", "publication phase requires exact commit");
  }
  if (values.commit) hex(values.commit, "commit");
  return { ...proposal, ...values, phase } as T;
}

export function createLocalProposal(input: Omit<LocalProposal, "publicationState">): LocalProposal {
  if (!/^[a-f0-9]{24}$/.test(input.id)) throw new HubValidationError("HUB_PROPOSAL_ID_INVALID", "proposal ID must be 24 lowercase hex");
  if (!isHubProposalSubject(input.subject)) {
    throw new HubValidationError("HUB_SUBJECT_INVALID", "proposal subject must be a normalized Hub path");
  }
  hex(input.parentCommit, "parentCommit");
  hex(input.acceptedCommit, "acceptedCommit");
  digest(input.evidenceDigest, "evidenceDigest");
  digest(input.treeDigest, "treeDigest");
  digest(input.diffDigest, "diffDigest");
  if (input.mode === "migration") {
    if (input.sourceRepositoryId !== undefined || input.domainId !== undefined
      || input.sourceRepositoryIds !== undefined || input.manifestDigest !== undefined) {
      throw new HubValidationError("HUB_SOURCE_INVALID", "accepted migration source scope is invalid");
    }
    digest(input.migrationDigest ?? "", "migrationDigest");
  } else if (input.mode === "enrichment" || input.mode === "batch-new") {
    if (input.sourceRepositoryId !== undefined || !/^domains\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.domainId ?? "")
      || !input.sourceRepositoryIds?.length || input.sourceRepositoryIds.length > 32
      || new Set(input.sourceRepositoryIds).size !== input.sourceRepositoryIds.length
      || input.sourceRepositoryIds.some((value) => !/^repository-[a-z0-9-]+-[a-f0-9]{12}$/.test(value))
      || input.migrationDigest !== undefined) {
      throw new HubValidationError("HUB_SOURCE_INVALID", `accepted ${input.mode} scope is invalid`);
    }
    digest(input.manifestDigest ?? "", "manifestDigest");
  } else if (!/^repository-[a-z0-9-]+-[a-f0-9]{12}$/.test(input.sourceRepositoryId ?? "")
    || input.migrationDigest !== undefined) {
    throw new HubValidationError("HUB_SOURCE_INVALID", "accepted Repository proposal source is invalid");
  }
  if (!Number.isFinite(Date.parse(input.createdAt)) || !Number.isFinite(Date.parse(input.acceptedAt))) {
    throw new HubValidationError("HUB_PROPOSAL_TIME_INVALID", "proposal timestamps must be ISO-compatible");
  }
  return { ...input, selectedSchemas: [...input.selectedSchemas], publicationState: "pending" };
}

export function renderLocalProposalTrailers(proposal: LocalProposal): string {
  return [
    `${HUB_PROPOSAL_TRAILERS.id}: ${proposal.id}`,
    `${HUB_PROPOSAL_TRAILERS.subject}: ${proposal.subject}`,
    ...(proposal.mode === "migration"
      ? [`${HUB_PROPOSAL_TRAILERS.migrationDigest}: ${proposal.migrationDigest}`]
      : ["enrichment", "batch-new"].includes(proposal.mode) ? [
      `${HUB_PROPOSAL_TRAILERS.domainId}: ${proposal.domainId}`,
      `${HUB_PROPOSAL_TRAILERS.sourceIds}: ${proposal.sourceRepositoryIds?.join(",")}`,
      `${HUB_PROPOSAL_TRAILERS.manifestDigest}: ${proposal.manifestDigest}`,
    ] : [`${HUB_PROPOSAL_TRAILERS.sourceId}: ${proposal.sourceRepositoryId}`]),
    `${HUB_PROPOSAL_TRAILERS.evidenceDigest}: ${proposal.evidenceDigest}`,
    `${HUB_PROPOSAL_TRAILERS.diffDigest}: ${proposal.diffDigest}`,
    `${HUB_PROPOSAL_TRAILERS.catalog}: ${proposal.schemaVersion}`,
    `${HUB_PROPOSAL_TRAILERS.mode}: ${proposal.mode}`,
  ].join("\n");
}

export function proposalRepositoryIds(proposal: Pick<LocalProposal, "mode" | "sourceRepositoryId" | "sourceRepositoryIds">): readonly string[] {
  if (proposal.mode === "migration") return [];
  return proposal.mode === "enrichment" || proposal.mode === "batch-new"
    ? [...(proposal.sourceRepositoryIds ?? [])] : proposal.sourceRepositoryId ? [proposal.sourceRepositoryId] : [];
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
