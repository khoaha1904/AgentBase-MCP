import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { createHubIdentity, type LocalHubState } from "../../../core/hub/index.ts";
import { computeOkfTreeDigest, loadOkfBundle, readProposalMetadata } from "../../../core/knowledge/index.ts";
import { runGit, type GitOutput, type GitRequest } from "../../../providers/github-hub/index.ts";
import { readVerifiedHubProposalInspection } from "../review/inspect.ts";
import { admitHubKnowledgeMutation } from "../review/mutation-admission.ts";
import { acquireHubMutationLock, hubMutationProfileId, readHubProposalState,
  releaseHubMutationLock, writeAtomicJson } from "../review/proposal-state.ts";
import { HUB_PUBLISHED_REF } from "../workspace/local-hub.ts";
import { publishPreparedPullRequest, type PreparedPrApi } from "./prepared-pr.ts";

type DirectGit = (request: GitRequest) => Promise<GitOutput>;
export type DirectPublishOptions = Readonly<{
  stateRoot: string;
  localHub: LocalHubState;
  proposalRoot: string;
  expectedDiffDigest: string;
  authorization: "direct" | "pr";
  github?: PreparedPrApi;
  token: string;
  git?: DirectGit;
}>;
export type DirectPublicationResult = Readonly<{
  proposalId: string;
  commit: string;
  remote: "published" | "in-review" | "unknown";
  pullRequest?: Readonly<{ number: number; url: string }>;
  local: "recognized" | "pending";
  cleanup?: "pending";
}>;
type Receipt = Readonly<{
  formatVersion: 1;
  profileId: string;
  proposalId: string;
  baseCommit: string;
  diffDigest: string;
  treeDigest: string;
  commit: string;
}>;

async function exactCommit(git: DirectGit, root: string, ref: string): Promise<string> {
  const value = (await git({ args: ["rev-parse", "--verify", `${ref}^{commit}`], cwd: root,
    operation: "resolve direct publication commit" })).stdout.trim();
  if (!/^[a-f0-9]{40}$/.test(value)) throw new Error("direct publication commit is invalid");
  return value;
}

async function cleanMain(git: DirectGit, root: string): Promise<string> {
  const status = await git({ args: ["status", "--porcelain=v1", "--untracked-files=all"], cwd: root,
    operation: "inspect direct publication checkout" });
  const branch = await git({ args: ["symbolic-ref", "--quiet", "--short", "HEAD"], cwd: root,
    operation: "inspect direct publication branch" });
  if (status.stdout.length || branch.stdout.trim() !== "main") throw new Error("direct publication requires clean local main");
  return exactCommit(git, root, "refs/heads/main");
}

// Compare Git blobs, not worktree bytes: attributes/filters must not change the
// reviewed content when Git stages it. Also bind retained review base to Git.
async function verifyTree(git: DirectGit, root: string, commit: string, bundleRoot: string): Promise<void> {
  const bundle = loadOkfBundle(bundleRoot, { requireAgentBaseRootIndex: true });
  const entries = (await git({ args: ["ls-tree", "-rz", commit], cwd: root,
    operation: "verify exact direct publication tree" })).stdout.split("\0").filter(Boolean);
  if (entries.length !== bundle.files.length) throw new Error("direct publication tree differs from reviewed files");
  const expected = new Set(bundle.files);
  for (const entry of entries) {
    const match = /^(100644|100755) blob ([a-f0-9]{40})\t([\s\S]+)$/.exec(entry);
    if (!match || !expected.delete(match[3]!)) throw new Error("direct publication tree contains unexpected files");
    const bytes = fs.readFileSync(path.join(bundleRoot, match[3]!));
    const hash = createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex");
    if (hash !== match[2]) throw new Error("direct publication Git bytes differ from reviewed content");
  }
}

/** Internal application primitive. Installed callers must not infer direct policy. */
export async function publishHubProposalDirect(options: DirectPublishOptions): Promise<DirectPublicationResult> {
  const git = options.git ?? runGit, local = options.localHub;
  const proposal = readHubProposalState(options.proposalRoot);
  const hub = createHubIdentity(local.hub.repository, local.hub.targetBranch, local.hub.host);
  if (!["direct", "pr"].includes(options.authorization) || !options.token || hub.canonicalHttpsUrl !== local.hub.canonicalHttpsUrl) {
    throw new Error("direct publication requires explicit authorization and exact remote credentials");
  }
  if (!("hub" in proposal) || !proposal.hub || proposal.hub.host !== hub.host
    || proposal.hub.repository !== hub.repository || proposal.hub.targetBranch !== hub.targetBranch
    || proposal.hub.canonicalHttpsUrl !== hub.canonicalHttpsUrl || proposal.phase !== "prepared") {
    throw new Error("direct publication requires a prepared proposal for this exact Hub");
  }
  if (proposal.diffDigest !== options.expectedDiffDigest) throw new Error("direct publication confirmation does not match review");
  const profileId = hubMutationProfileId(local);
  const lock = acquireHubMutationLock(options.stateRoot, profileId, `direct:${proposal.id}`);
  const transactionRoot = path.join(path.resolve(options.stateRoot), "transactions", `${options.authorization}-${profileId}-${proposal.id}`);
  const receiptPath = path.join(transactionRoot, "receipt.json");
  const intentPath = path.join(transactionRoot, "intent.json");
  const candidateRoot = path.join(transactionRoot, "candidate");
  const bundleRoot = path.join(options.proposalRoot, "bundle");
  try {
    if (computeOkfTreeDigest(bundleRoot) !== proposal.treeDigest) throw new Error("reviewed proposal bytes changed");
    const inspection = readVerifiedHubProposalInspection(options.proposalRoot, proposal);
    await admitHubKnowledgeMutation(options.proposalRoot, proposal);
    await verifyTree(git, local.root, proposal.baseCommit, path.join(options.proposalRoot, "base"));
    const identity = { formatVersion: 1 as const, profileId, proposalId: proposal.id,
      baseCommit: proposal.baseCommit, diffDigest: proposal.diffDigest, treeDigest: proposal.treeDigest };
    let receipt: Receipt;
    if (fs.existsSync(receiptPath)) {
      receipt = JSON.parse(fs.readFileSync(receiptPath, "utf8")) as Receipt;
      if (!receipt || Object.entries(identity).some(([key, value]) => receipt[key as keyof Receipt] !== value)
        || !/^[a-f0-9]{40}$/.test(receipt.commit)) throw new Error("direct publication receipt does not match review");
    } else {
      if (await cleanMain(git, local.root) !== proposal.baseCommit
        || await exactCommit(git, local.root, HUB_PUBLISHED_REF) !== proposal.baseCommit) {
        throw new Error("direct publication requires reviewed Published base without pending local changes");
      }
      if (fs.existsSync(transactionRoot)) {
        if (!fs.existsSync(intentPath) || JSON.stringify(JSON.parse(fs.readFileSync(intentPath, "utf8"))) !== JSON.stringify(identity)) {
          throw new Error("publication transaction ownership is unknown; prepared work is preserved");
        }
        if (fs.existsSync(candidateRoot)) {
          if (fs.lstatSync(candidateRoot).isSymbolicLink()) throw new Error("publication candidate cannot be a symlink");
          await git({ args: ["worktree", "remove", "--force", candidateRoot], cwd: local.root,
            operation: "recover interrupted publication candidate" });
        }
      } else {
        fs.mkdirSync(transactionRoot, { recursive: true, mode: 0o700 });
        writeAtomicJson(intentPath, identity);
      }
      await git({ args: ["worktree", "add", "--detach", candidateRoot, proposal.baseCommit], cwd: local.root,
        operation: "prepare direct publication candidate" });
      for (const entry of fs.readdirSync(candidateRoot)) {
        if (entry !== ".git") fs.rmSync(path.join(candidateRoot, entry), { recursive: true, force: true });
      }
      const bundle = loadOkfBundle(bundleRoot, { requireAgentBaseRootIndex: true });
      if (bundle.treeDigest !== proposal.treeDigest || bundle.files.some((file) => file === ".git" || file.startsWith(".git/"))) {
        throw new Error("direct publication candidate no longer matches reviewed bundle");
      }
      for (const file of bundle.files) {
        const target = path.join(candidateRoot, file);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.copyFileSync(path.join(bundleRoot, file), target, fs.constants.COPYFILE_EXCL);
      }
      await git({ args: ["add", "--all", "--force"], cwd: candidateRoot, operation: "stage complete direct publication" });
      const createdAt = readProposalMetadata(options.proposalRoot).createdAt;
      if (!createdAt || !Number.isFinite(Date.parse(createdAt))) throw new Error("proposal creation timestamp is invalid");
      await git({ args: ["-c", "user.name=AgentBase", "-c", "user.email=agentbase@localhost", "commit",
        "--no-gpg-sign", "--no-verify", "-m", `AgentBase direct publication ${proposal.id}\n\nReviewed-Diff: ${proposal.diffDigest}`],
      cwd: candidateRoot, operation: "commit complete direct publication", commitTimestamp: createdAt });
      receipt = { ...identity, commit: await exactCommit(git, candidateRoot, "HEAD") };
      writeAtomicJson(receiptPath, receipt);
    }
    if (await exactCommit(git, local.root, `${receipt.commit}^`) !== proposal.baseCommit) {
      throw new Error("direct publication candidate has an unexpected parent");
    }
    await verifyTree(git, local.root, receipt.commit, bundleRoot);
    if (computeOkfTreeDigest(bundleRoot) !== receipt.treeDigest) throw new Error("reviewed proposal bytes changed during publication");
    let cleanup: "pending" | undefined;
    // Pin the committed candidate before removing its disposable worktree.
    // The small receipt and object ref remain retry authority until discarded.
    await git({ args: ["update-ref", `refs/agentbase/candidates/${options.authorization}/${proposal.id}`, receipt.commit],
      cwd: local.root, operation: "pin publication candidate" });
    if (fs.existsSync(candidateRoot)) {
      try {
        await git({ args: ["worktree", "remove", candidateRoot], cwd: local.root, operation: "clean publication candidate" });
      } catch { cleanup = "pending"; }
    }
    if (options.authorization === "pr") {
      if (!options.github) throw new Error("PR publication requires the configured GitHub adapter");
      const pr = await publishPreparedPullRequest({ hub, proposalId: proposal.id,
        baseCommit: proposal.baseCommit, diffDigest: proposal.diffDigest, commit: receipt.commit,
        root: local.root, token: options.token, inspection, github: options.github, git });
      return { proposalId: proposal.id, commit: receipt.commit, local: "pending", ...pr, ...(cleanup ? { cleanup } : {}) };
    }
    const target = `refs/heads/${hub.targetBranch}`, fetched = `refs/agentbase/direct/${proposal.id}`;
    const fetchTarget = async () => {
      await git({ args: ["fetch", "--no-tags", hub.canonicalHttpsUrl, `+${target}:${fetched}`], cwd: local.root,
        operation: "inspect direct publication remote", token: options.token });
      return exactCommit(git, local.root, fetched);
    };
    const contains = async (head: string) => {
      if (head === receipt.commit) return true;
      const base = await git({ args: ["merge-base", receipt.commit, head], cwd: local.root,
        operation: "recognize direct publication ancestry" });
      return base.stdout.trim() === receipt.commit;
    };
    const result = (remote: DirectPublicationResult["remote"], recognized = false): DirectPublicationResult => ({
      proposalId: proposal.id, commit: receipt.commit, remote, local: recognized ? "recognized" : "pending",
      ...(cleanup ? { cleanup } : {}),
    });
    let remoteHead: string;
    try { remoteHead = await fetchTarget(); }
    catch { return result("unknown"); }
    if (!await contains(remoteHead)) {
      if (remoteHead !== proposal.baseCommit) throw new Error("remote Hub changed; prepare and review again before direct publication");
      // Recheck the local admission before each write, including a retry.
      if (await cleanMain(git, local.root) !== proposal.baseCommit
        || await exactCommit(git, local.root, HUB_PUBLISHED_REF) !== proposal.baseCommit) {
        throw new Error("local Hub changed before direct publication");
      }
      try {
        await git({ args: ["push", hub.canonicalHttpsUrl, `${receipt.commit}:${target}`], cwd: local.root,
          operation: "push direct publication", token: options.token });
      } catch {
        // A rejected response or lost acknowledgement is not evidence that
        // the server did not apply the commit. Never rebuild or blindly retry.
        try { remoteHead = await fetchTarget(); }
        catch { return result("unknown"); }
        if (!await contains(remoteHead)) throw new Error("direct publication not present on remote; retained candidate can be retried after checking remote policy/base");
      }
    }
    try {
      const head = await cleanMain(git, local.root);
      const published = await exactCommit(git, local.root, HUB_PUBLISHED_REF);
      if (published !== proposal.baseCommit && published !== receipt.commit) {
        const boundary = await git({ args: ["merge-base", receipt.commit, published], cwd: local.root,
          operation: "recognize previously synchronized publication" });
        if (boundary.stdout.trim() === receipt.commit) {
          const localBoundary = await git({ args: ["merge-base", published, head], cwd: local.root,
            operation: "verify local Published ancestry after retry" });
          if (localBoundary.stdout.trim() === published) return result("published", true);
        }
      }
      if (![proposal.baseCommit, receipt.commit].includes(head) || ![proposal.baseCommit, receipt.commit].includes(published)) {
        return result("published");
      }
      if (head !== receipt.commit) await git({ args: ["merge", "--ff-only", receipt.commit], cwd: local.root,
        operation: "recognize direct publication locally" });
      if (published !== receipt.commit) await git({ args: ["update-ref", HUB_PUBLISHED_REF, receipt.commit, published], cwd: local.root,
        operation: "advance direct Published boundary" });
      return result("published", true);
    } catch { return result("published"); }
  } finally { releaseHubMutationLock(lock); }
}
