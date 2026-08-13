import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import {
  applyBundleProposal,
  diffBundleProposal,
  prepareBundleProposal,
  validateBundleProposal,
  type ProposalDiff,
  type ProposalMetadata,
  type SwitchManifest,
} from "../../core/knowledge/index.ts";

export type PreparedRepositoryProposal = Readonly<{
  proposalRoot: string;
  bundleRoot: string;
  metadata: ProposalMetadata;
}>;

function privateDirectory(directory: string): void {
  if (fs.existsSync(directory) && fs.lstatSync(directory).isSymbolicLink()) throw new Error(`AgentBase local state cannot cross symlink: ${directory}`);
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  fs.chmodSync(directory, 0o700);
}

function defaultProposalId(now: string): string {
  const time = now.replace(/[^0-9]/g, "").slice(0, 14);
  return `proposal-${time}-${randomUUID().replaceAll("-", "")}`;
}

function repositoryPaths(repositoryRoot: string, proposalId?: string) {
  const root = fs.realpathSync(repositoryRoot);
  const localState = path.join(root, ".agentbase");
  const proposals = path.join(localState, "proposals");
  privateDirectory(localState);
  privateDirectory(proposals);
  const proposalRoot = proposalId === undefined ? undefined : path.join(proposals, proposalId);
  return { root, currentBundleRoot: path.join(root, "okf"), proposals, proposalRoot };
}

function requireProposalId(value: string): void {
  if (!/^proposal-[a-z0-9][a-z0-9-]{5,100}$/.test(value)) throw new Error("proposal ID is invalid");
}

export function prepareRepositoryProposal(
  repositoryRoot: string,
  evidenceDigest: string,
  options: Readonly<{ proposalId?: string; now?: string }> = {},
): PreparedRepositoryProposal {
  const now = options.now ?? new Date().toISOString();
  const proposalId = options.proposalId ?? defaultProposalId(now);
  requireProposalId(proposalId);
  const paths = repositoryPaths(repositoryRoot);
  const proposalRoot = path.join(paths.proposals, proposalId);
  const metadata = prepareBundleProposal({
    currentBundleRoot: paths.currentBundleRoot,
    proposalRoot,
    proposalId,
    evidenceDigest,
    createdAt: now,
  });
  return { proposalRoot, bundleRoot: path.join(proposalRoot, "bundle"), metadata };
}

export function validateRepositoryProposal(repositoryRoot: string, proposalId: string): ProposalMetadata {
  requireProposalId(proposalId);
  const paths = repositoryPaths(repositoryRoot, proposalId);
  if (!paths.proposalRoot) throw new Error("proposal path is unavailable");
  return validateBundleProposal(paths.currentBundleRoot, paths.proposalRoot);
}

export function diffRepositoryProposal(repositoryRoot: string, proposalId: string): ProposalDiff {
  requireProposalId(proposalId);
  const paths = repositoryPaths(repositoryRoot, proposalId);
  if (!paths.proposalRoot) throw new Error("proposal path is unavailable");
  return diffBundleProposal(paths.currentBundleRoot, paths.proposalRoot);
}

export function applyRepositoryProposal(repositoryRoot: string, proposalId: string, owner: string): SwitchManifest {
  requireProposalId(proposalId);
  const paths = repositoryPaths(repositoryRoot, proposalId);
  if (!paths.proposalRoot) throw new Error("proposal path is unavailable");
  return applyBundleProposal({ repositoryRoot: paths.root, proposalRoot: paths.proposalRoot, owner });
}
