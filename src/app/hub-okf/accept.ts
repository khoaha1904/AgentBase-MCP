import fs from "node:fs";
import path from "node:path";

import {
  createLocalProposal,
  HUB_PROPOSAL_TRAILERS,
  type AdmittedLocalHubState,
  type LocalProposal,
} from "../../core/hub/index.ts";
import { computeOkfTreeDigest, loadOkfBundle, readProposalMetadata } from "../../core/knowledge/index.ts";
import { runGit, type GitOutput, type GitRequest } from "../../providers/github-hub/index.ts";
import {
  acquireHubMutationLock,
  readHubProposalState,
  releaseHubMutationLock,
  writeAtomicJson,
} from "./proposal-state.ts";

export type AcceptHubOptions = Readonly<{
  stateRoot: string;
  localHub: AdmittedLocalHubState;
  proposalRoot: string;
  expectedDiffDigest: string;
  git?: (request: GitRequest) => Promise<GitOutput>;
}>;

function clearCandidate(root: string): void {
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (entry.name !== ".git") fs.rmSync(path.join(root, entry.name), { recursive: true, force: true });
  }
}

function copyReviewedTree(source: string, target: string): void {
  loadOkfBundle(source, { requireAgentBaseRootIndex: true });
  clearCandidate(target);
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) throw new Error("reviewed Hub proposal cannot contain symlinks");
    fs.cpSync(path.join(source, entry.name), path.join(target, entry.name), {
      recursive: true,
      errorOnExist: true,
      force: false,
    });
  }
}

function proposalMessage(proposal: ReturnType<typeof readHubProposalState>): string {
  return [
    `AgentBase OKF proposal ${proposal.id}`,
    "",
    `${HUB_PROPOSAL_TRAILERS.id}: ${proposal.id}`,
    `${HUB_PROPOSAL_TRAILERS.subject}: ${proposal.subject}`,
    `${HUB_PROPOSAL_TRAILERS.sourceId}: ${proposal.sourceRepositoryId}`,
    `${HUB_PROPOSAL_TRAILERS.evidenceDigest}: ${proposal.evidenceDigest}`,
    `${HUB_PROPOSAL_TRAILERS.diffDigest}: ${proposal.diffDigest}`,
    `${HUB_PROPOSAL_TRAILERS.catalog}: ${proposal.schemaVersion}`,
  ].join("\n");
}

async function exactCommit(git: (request: GitRequest) => Promise<GitOutput>, root: string, revision: string): Promise<string> {
  const output = await git({ args: ["rev-parse", "--verify", `${revision}^{commit}`], cwd: root, operation: "resolve exact Hub commit" });
  const commit = output.stdout.trim();
  if (!/^[a-f0-9]{40}$/.test(commit)) throw new Error("Hub commit did not resolve exactly");
  return commit;
}

export async function acceptHubProposal(options: AcceptHubOptions): Promise<LocalProposal> {
  const git = options.git ?? runGit;
  const proposal = readHubProposalState(options.proposalRoot);
  if (options.localHub.kind === "local-only") {
    if (!("localHubId" in proposal) || proposal.localHubId !== options.localHub.localHubId || "hub" in proposal) {
      throw new Error("reviewed proposal does not belong to the active local-only Hub");
    }
  } else if (!("hub" in proposal) || !proposal.hub || proposal.hub.repository !== options.localHub.hub.repository
    || proposal.hub.targetBranch !== options.localHub.hub.targetBranch) {
    throw new Error("reviewed proposal does not belong to the active remote Hub");
  }
  if (proposal.phase !== "prepared") throw new Error("only a prepared reviewed proposal can be accepted locally");
  if (proposal.diffDigest !== options.expectedDiffDigest) throw new Error("review confirmation does not match proposal diff");
  if (proposal.baseCommit !== options.localHub.activeHead) throw new Error("local Hub advanced after proposal review");
  const bundleRoot = path.join(options.proposalRoot, "bundle");
  if (computeOkfTreeDigest(bundleRoot) !== proposal.treeDigest) throw new Error("reviewed proposal bytes changed after inspection");
  const lock = acquireHubMutationLock(options.stateRoot, `accept:${proposal.id}`);
  const transactionRoot = path.join(path.resolve(options.stateRoot), "transactions", `accept-${proposal.id}`);
  const candidateRoot = path.join(transactionRoot, "candidate");
  const transactionPath = path.join(transactionRoot, "transaction.json");
  try {
    if (fs.existsSync(transactionRoot)) throw new Error("an acceptance transaction already exists for this proposal");
    fs.mkdirSync(transactionRoot, { recursive: true, mode: 0o700 });
    const status = await git({
      args: ["status", "--porcelain=v1", "--untracked-files=all"],
      cwd: options.localHub.root,
      operation: "inspect local Hub before accept",
    });
    if (status.stdout.length) throw new Error("AgentBase-Hub local tree must be clean before accept");
    const branch = await git({ args: ["symbolic-ref", "--quiet", "--short", "HEAD"], cwd: options.localHub.root, operation: "verify local Hub main" });
    if (branch.stdout.trim() !== "main") throw new Error("AgentBase-Hub local checkout must be on main");
    const current = await exactCommit(git, options.localHub.root, "refs/heads/main");
    if (current !== proposal.baseCommit) throw new Error("local Hub main no longer matches the reviewed base");
    writeAtomicJson(transactionPath, { phase: "prepared", proposalId: proposal.id, originalHead: current, candidateRoot });
    await git({ args: ["worktree", "add", "--detach", candidateRoot, current], cwd: options.localHub.root, operation: "create accept candidate" });
    copyReviewedTree(bundleRoot, candidateRoot);
    await git({ args: ["add", "--all"], cwd: candidateRoot, operation: "stage reviewed local proposal" });
    const createdAt = readProposalMetadata(options.proposalRoot).createdAt;
    if (!createdAt || Number.isNaN(Date.parse(createdAt))) throw new Error("Hub proposal creation timestamp is invalid");
    await git({
      args: [
        "-c", "user.name=AgentBase",
        "-c", "user.email=agentbase@localhost",
        "commit", "--no-gpg-sign", "--no-verify", "-m", proposalMessage(proposal),
      ],
      cwd: candidateRoot,
      operation: "commit accepted local proposal",
      commitTimestamp: createdAt,
    });
    const acceptedCommit = await exactCommit(git, candidateRoot, "HEAD");
    const parentCommit = await exactCommit(git, candidateRoot, "HEAD^");
    if (parentCommit !== current) throw new Error("accepted proposal commit has an unexpected parent");
    writeAtomicJson(transactionPath, { phase: "committed", proposalId: proposal.id, originalHead: current, acceptedCommit, candidateRoot });
    await git({ args: ["merge", "--ff-only", acceptedCommit], cwd: options.localHub.root, operation: "advance local Hub main" });
    if (await exactCommit(git, options.localHub.root, "refs/heads/main") !== acceptedCommit) {
      throw new Error("local Hub main did not advance to the accepted commit");
    }
    const acceptedAt = createdAt;
    const accepted = createLocalProposal({
      id: proposal.id,
      mode: proposal.mode,
      subject: proposal.subject,
      sourceRepositoryId: proposal.sourceRepositoryId,
      evidenceDigest: proposal.evidenceDigest,
      schemaVersion: proposal.schemaVersion,
      selectedSchemas: proposal.selectedSchemas,
      parentCommit,
      acceptedCommit,
      treeDigest: proposal.treeDigest,
      diffDigest: proposal.diffDigest,
      createdAt,
      acceptedAt,
    });
    writeAtomicJson(path.join(options.proposalRoot, "accepted.json"), accepted);
    writeAtomicJson(transactionPath, { phase: "advanced", proposalId: proposal.id, originalHead: current, acceptedCommit, candidateRoot });
    await git({ args: ["worktree", "remove", "--force", candidateRoot], cwd: options.localHub.root, operation: "remove accept candidate" });
    fs.rmSync(transactionRoot, { recursive: true, force: true });
    return accepted;
  } finally {
    releaseHubMutationLock(lock);
  }
}
