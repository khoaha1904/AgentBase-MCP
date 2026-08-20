import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { createHubIdentity, type LocalOnlyHubState } from "../../../core/hub/index.ts";
import { GitHubHubApi, listRemoteRefs, runGit, type GitOutput, type GitRequest } from "../../../providers/github-hub/index.ts";
import { resolveHubConfiguration } from "../configuration/configuration.ts";
import {
  readPersistedHubConfiguration,
  replacePersistedHubConfiguration,
  type PersistedLocalHubConfiguration,
  type PersistedRemoteHubConfiguration,
} from "../configuration/configuration-file.ts";
import { loadGlobalHubToken } from "../configuration/credential-file.ts";
import { admitPersistentLocalHub } from "./local-hub.ts";
import { listPendingHubProposals, type PendingHubProposal } from "../review/pending.ts";
import { publishPendingHubProposals, type HubBatchPublicationReceipt, type PublishGitHub } from "../publication/publish.ts";
import { acquireHubMutationLock, releaseHubMutationLock, writeAtomicJson } from "../review/proposal-state.ts";
import { normalizeGitHubHubUrl } from "./setup.ts";

export type BootstrapMode = "all-to-main" | "base-to-main-knowledge-pr";
export type BootstrapGit = (request: GitRequest) => Promise<GitOutput>;

export type HubBootstrapIntent = Readonly<{
  id: string;
  repository: string;
  canonicalHttpsUrl: string;
  mode: BootstrapMode;
  localHubId: string;
  baseCommit: string;
  activeHead: string;
  proposalIds: readonly string[];
  commits: readonly string[];
}>;

export type HubBootstrapReceipt = Readonly<{
  intent: HubBootstrapIntent;
  phase: "prepared" | "main-pushed" | "remote-admitted" | "completed";
  remoteMain?: string;
  publication?: HubBatchPublicationReceipt;
}>;

function root(environment: NodeJS.ProcessEnv): string {
  const base = environment.XDG_STATE_HOME || (environment.HOME ? path.join(environment.HOME, ".local", "state") : undefined);
  if (!base || !path.isAbsolute(base)) throw new Error("global AgentBase state base must be absolute");
  const target = path.join(base, "agentbase-mcp", "hub-bootstrap");
  fs.mkdirSync(target, { recursive: true, mode: 0o700 });
  const stat = fs.lstatSync(target);
  const owned = typeof process.getuid !== "function" || stat.uid === process.getuid();
  if (stat.isSymbolicLink() || !stat.isDirectory() || (stat.mode & 0o777) !== 0o700 || !owned) {
    throw new Error("Hub bootstrap state directory is unsafe");
  }
  return target;
}

function receiptPath(environment: NodeJS.ProcessEnv, id: string): string { return path.join(root(environment), `${id}.json`); }

function readReceipt(environment: NodeJS.ProcessEnv, id: string): HubBootstrapReceipt | undefined {
  const file = receiptPath(environment, id);
  let stat: fs.Stats;
  try { stat = fs.lstatSync(file); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined; throw error; }
  const owned = typeof process.getuid !== "function" || stat.uid === process.getuid();
  if (stat.isSymbolicLink() || !stat.isFile() || (stat.mode & 0o777) !== 0o600 || !owned || stat.size > 1024 * 1024) {
    throw new Error("Hub bootstrap receipt is unsafe");
  }
  const value = JSON.parse(fs.readFileSync(file, "utf8")) as HubBootstrapReceipt;
  if (value.intent.id !== id || !["prepared", "main-pushed", "remote-admitted", "completed"].includes(value.phase)) {
    throw new Error("Hub bootstrap receipt is invalid");
  }
  return value;
}

function writeReceipt(environment: NodeJS.ProcessEnv, receipt: HubBootstrapReceipt): void {
  writeAtomicJson(receiptPath(environment, receipt.intent.id), receipt);
}

function identity(repository: string, mode: BootstrapMode, base: string, head: string, commits: readonly string[]): string {
  return createHash("sha256").update([repository, mode, base, head, ...commits].join("\0")).digest("hex").slice(0, 24);
}

async function localHistory(
  configuration: PersistedLocalHubConfiguration,
  git: BootstrapGit,
): Promise<Readonly<{ state: LocalOnlyHubState; pending: readonly PendingHubProposal[] }>> {
  const state = await admitPersistentLocalHub(configuration, git);
  return { state, pending: await listPendingHubProposals(state, git) };
}

export async function previewHubBootstrap(
  repositoryUrl: string,
  mode: BootstrapMode,
  environment: NodeJS.ProcessEnv = process.env,
  git: BootstrapGit = runGit,
): Promise<HubBootstrapIntent> {
  if (mode !== "all-to-main" && mode !== "base-to-main-knowledge-pr") throw new Error("Hub bootstrap mode is invalid");
  const configuration = readPersistedHubConfiguration(environment);
  if (!configuration) throw new Error("Hub bootstrap requires an active local-only Hub");
  const normalized = normalizeGitHubHubUrl(repositoryUrl);
  if (configuration.kind === "remote" && configuration.repository !== normalized.repository) {
    throw new Error("Hub is already attached to another remote; switching is not supported");
  }
  const localView: PersistedLocalHubConfiguration = { formatVersion: 1, kind: "local-only",
    localHubId: configuration.localHubId, localRoot: configuration.localRoot, baseCommit: configuration.baseCommit,
    catalogVersion: configuration.catalogVersion };
  const { state, pending } = await localHistory(localView, git);
  const commits = pending.map((item) => item.commit);
  const id = identity(normalized.repository, mode, state.baseCommit, state.activeHead, commits);
  return { id, repository: normalized.repository, canonicalHttpsUrl: normalized.canonicalHttpsUrl, mode,
    localHubId: state.localHubId, baseCommit: state.baseCommit, activeHead: state.activeHead,
    proposalIds: pending.map((item) => item.id), commits };
}

async function ensureOrigin(intent: HubBootstrapIntent, localRoot: string, git: BootstrapGit): Promise<void> {
  try {
    const current = await git({ args: ["remote", "get-url", "origin"], cwd: localRoot, operation: "inspect bootstrap Hub remote" });
    if (current.stdout.trim() !== intent.canonicalHttpsUrl) throw new Error("bootstrap Hub origin changed");
  } catch (error) {
    if (error instanceof Error && /changed/.test(error.message)) throw error;
    await git({ args: ["remote", "add", "origin", intent.canonicalHttpsUrl], cwd: localRoot, operation: "attach bootstrap Hub remote" });
  }
}

function permissionFailure(error: unknown, token: string): Error {
  const message = (error instanceof Error ? error.message : "Hub bootstrap failed").split(token).join("[REDACTED]");
  if (/(?:status 401|status 403|exited with status)/i.test(message)) {
    return new Error(
      "GitHub access is insufficient; update the one global token with repository read, Contents write and Pull requests write access, then retry",
    );
  }
  return new Error(message);
}

export async function executeHubBootstrap(
  repositoryUrl: string,
  mode: BootstrapMode,
  environment: NodeJS.ProcessEnv = process.env,
  options: Readonly<{ git?: BootstrapGit; github?: PublishGitHub }> = {},
): Promise<HubBootstrapReceipt> {
  const git = options.git ?? runGit;
  const configuration = readPersistedHubConfiguration(environment);
  if (!configuration) throw new Error("Hub bootstrap requires an active local-only Hub");
  const intent = await previewHubBootstrap(repositoryUrl, mode, environment, git);
  const token = loadGlobalHubToken(environment);
  if (!token) throw new Error("Hub bootstrap requires the global GitHub token");
  const existingReceipt = readReceipt(environment, intent.id);
  if (configuration.kind === "remote" && !existingReceipt) throw new Error("Hub is already attached to a remote; use normal publication");
  if (existingReceipt?.phase === "completed") throw new Error("Hub bootstrap is already complete; use normal publication and synchronization");
  let receipt = existingReceipt ?? { intent, phase: "prepared" as const };
  if (JSON.stringify(receipt.intent) !== JSON.stringify(intent)) throw new Error("Hub bootstrap intent changed");
  const lock = acquireHubMutationLock(root(environment), `bootstrap:${intent.id}`);
  try {
    if (receipt.phase === "prepared") {
      if (configuration.kind !== "local-only") throw new Error("prepared bootstrap requires local-only configuration");
      const refs = await listRemoteRefs(intent.canonicalHttpsUrl, configuration.localRoot, token, git);
      if (refs.length) throw new Error("new Hub bootstrap requires a GitHub repository with no refs");
      writeReceipt(environment, receipt);
      await ensureOrigin(intent, configuration.localRoot, git);
      const mainCommit = mode === "all-to-main" ? intent.activeHead : intent.baseCommit;
      try {
        await git({ args: ["push", "origin", `${mainCommit}:refs/heads/main`], cwd: configuration.localRoot,
          operation: "bootstrap remote Hub main", token });
      } catch (error) {
        const racedRefs = await listRemoteRefs(intent.canonicalHttpsUrl, configuration.localRoot, token, git);
        if (racedRefs.length) {
          throw new Error("new Hub bootstrap target gained a ref before push; attach it as an existing Hub or supply another empty repository");
        }
        throw error;
      }
      receipt = { intent, phase: "main-pushed", remoteMain: mainCommit };
      writeReceipt(environment, receipt);
    }
    const expectedMain = mode === "all-to-main" ? intent.activeHead : intent.baseCommit;
    if (receipt.remoteMain !== expectedMain) throw new Error("bootstrap receipt remote main is invalid");
    if (receipt.phase === "main-pushed") {
      await git({ args: ["fetch", "--no-tags", "origin", "main"], cwd: configuration.localRoot, operation: "admit bootstrapped Hub main", token });
      if (configuration.kind !== "local-only") throw new Error("bootstrap configuration admission state is invalid");
      const remoteConfiguration: PersistedRemoteHubConfiguration = { ...configuration, kind: "remote",
        repository: intent.repository, targetBranch: "main" };
      replacePersistedHubConfiguration(configuration, remoteConfiguration, environment);
      receipt = { ...receipt, phase: "remote-admitted" };
      writeReceipt(environment, receipt);
    }
  } catch (error) {
    throw permissionFailure(error, token);
  } finally { releaseHubMutationLock(lock); }

  if (receipt.phase === "remote-admitted" && mode === "base-to-main-knowledge-pr" && intent.proposalIds.length) {
    const resolved = resolveHubConfiguration(environment);
    if (resolved.kind !== "remote" || !resolved.hub) throw new Error("bootstrapped Hub remote configuration was not admitted");
    const localHub = await admitPersistentLocalHub(resolved, git);
    const github = options.github ?? new GitHubHubApi(createHubIdentity(intent.repository, "main"), token);
    try {
      const publication = await publishPendingHubProposals({ stateRoot: root(environment), localHub,
        selectedProposalIds: intent.proposalIds, token, github, git });
      receipt = { ...receipt, phase: "completed", publication };
      writeReceipt(environment, receipt);
    } catch (error) { throw permissionFailure(error, token); }
  } else if (receipt.phase === "remote-admitted") {
    receipt = { ...receipt, phase: "completed" };
    writeReceipt(environment, receipt);
  }
  return receipt;
}
