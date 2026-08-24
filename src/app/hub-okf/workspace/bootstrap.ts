import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { createHubIdentity, hubProfileId, type LocalOnlyHubState } from "../../../core/hub/index.ts";
import { listRemoteRefs, runGit, type GitOutput, type GitRequest } from "../../../providers/github-hub/index.ts";
import {
  acquireHubActivationLock,
  readPersistedHubConfiguration,
  releaseHubActivationLock,
  replacePersistedHubConfiguration,
  type PersistedLocalHubConfiguration,
  type PersistedRemoteHubConfiguration,
} from "../configuration/configuration-file.ts";
import { loadExactHubProfileToken } from "../configuration/credential-file.ts";
import { HUB_PUBLISHED_REF } from "./local-hub.ts";
import { admitPersistentLocalHub } from "./local-hub.ts";
import { acquireHubMutationLock, releaseHubMutationLock, writeAtomicJson } from "../review/proposal-state.ts";
import { normalizeGitHubHubUrl } from "./setup.ts";

export type BootstrapGit = (request: GitRequest) => Promise<GitOutput>;

export type HubBootstrapIntent = Readonly<{
  id: string;
  repository: string;
  canonicalHttpsUrl: string;
  host: string;
  targetBranch: string;
  localHubId: string;
  remoteHubId: string;
  baseCommit: string;
}>;

export type HubBootstrapReceipt = Readonly<{
  intent: HubBootstrapIntent;
  phase: "prepared" | "target-pushed" | "remote-admitted" | "completed";
  remoteTarget?: string;
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
  if (value.intent.id !== id || !["prepared", "target-pushed", "remote-admitted", "completed"].includes(value.phase)) {
    throw new Error("Hub bootstrap receipt is invalid");
  }
  return value;
}

function writeReceipt(environment: NodeJS.ProcessEnv, receipt: HubBootstrapReceipt): void {
  writeAtomicJson(receiptPath(environment, receipt.intent.id), receipt);
}

function identity(host: string, repository: string, targetBranch: string, base: string): string {
  return createHash("sha256").update([host, repository, targetBranch, base].join("\0")).digest("hex").slice(0, 24);
}

async function localHistory(
  configuration: PersistedLocalHubConfiguration,
  git: BootstrapGit,
): Promise<LocalOnlyHubState> {
  return admitPersistentLocalHub(configuration, git);
}

export async function previewHubBootstrap(
  repositoryUrl: string,
  targetBranch: string,
  environment: NodeJS.ProcessEnv = process.env,
  git: BootstrapGit = runGit,
): Promise<HubBootstrapIntent> {
  const configuration = readPersistedHubConfiguration(environment);
  if (!configuration) throw new Error("Hub bootstrap requires an active local-only Hub");
  const normalized = normalizeGitHubHubUrl(repositoryUrl);
  const remoteIdentity = createHubIdentity(normalized.repository, targetBranch, normalized.host);
  if (configuration.kind === "remote" && (configuration.host !== normalized.host
    || configuration.repository !== normalized.repository || configuration.targetBranch !== targetBranch)) {
    throw new Error("Hub bootstrap identity differs from the active remote profile");
  }
  const localView: PersistedLocalHubConfiguration = { formatVersion: 1, kind: "local-only",
    localHubId: configuration.localHubId, localRoot: configuration.localRoot, baseCommit: configuration.baseCommit,
    catalogVersion: configuration.catalogVersion };
  const state = await localHistory(localView, git);
  const id = identity(normalized.host, normalized.repository, targetBranch, state.baseCommit);
  return { id, host: normalized.host, repository: normalized.repository, canonicalHttpsUrl: normalized.canonicalHttpsUrl,
    targetBranch, localHubId: state.localHubId, remoteHubId: hubProfileId(remoteIdentity), baseCommit: state.baseCommit };
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
  if (/status (?:401|403)/i.test(message)) {
    return new Error(
      "GitHub access is insufficient; update this target Hub profile token with repository read, Contents write and Pull requests write access, then retry",
    );
  }
  return new Error(message);
}

export async function executeHubBootstrap(
  repositoryUrl: string,
  targetBranch: string,
  environment: NodeJS.ProcessEnv = process.env,
  options: Readonly<{ git?: BootstrapGit }> = {},
): Promise<HubBootstrapReceipt> {
  const git = options.git ?? runGit;
  const configuration = readPersistedHubConfiguration(environment);
  if (!configuration) throw new Error("Hub bootstrap requires an active local-only Hub");
  const intent = await previewHubBootstrap(repositoryUrl, targetBranch, environment, git);
  const token = loadExactHubProfileToken(intent.remoteHubId, environment);
  if (!token) throw new Error("Hub bootstrap requires the owner-private target Hub profile token");
  const existingReceipt = readReceipt(environment, intent.id);
  if (configuration.kind === "remote" && !existingReceipt) throw new Error("Hub is already attached to a remote; use normal publication");
  if (existingReceipt?.phase === "completed") throw new Error("Hub bootstrap is already complete; use normal publication and synchronization");
  let receipt = existingReceipt ?? { intent, phase: "prepared" as const };
  if (JSON.stringify(receipt.intent) !== JSON.stringify(intent)) {
    const admittedIdentityTransition = configuration.kind === "remote"
      && configuration.localHubId === receipt.intent.remoteHubId
      && intent.localHubId === receipt.intent.remoteHubId
      && JSON.stringify({ ...receipt.intent, localHubId: intent.localHubId }) === JSON.stringify(intent);
    if (!admittedIdentityTransition) throw new Error("Hub bootstrap intent changed");
  }
  const lock = acquireHubMutationLock(root(environment), `bootstrap:${intent.id}`);
  let activationLock: ReturnType<typeof acquireHubActivationLock> | undefined;
  try {
    activationLock = acquireHubActivationLock(environment);
    const pinnedConfiguration = readPersistedHubConfiguration(environment);
    if (!pinnedConfiguration || JSON.stringify(pinnedConfiguration) !== JSON.stringify(configuration)) {
      throw new Error("active Hub profile changed before bootstrap acquired ownership");
    }
    if (receipt.phase === "prepared") {
      if (configuration.kind !== "local-only") throw new Error("prepared bootstrap requires local-only configuration");
      const refs = await listRemoteRefs(intent.canonicalHttpsUrl, configuration.localRoot, token, git);
      const mainCommit = intent.baseCommit;
      if (refs.length) {
        if (refs.length !== 1 || refs[0]?.ref !== `refs/heads/${intent.targetBranch}` || refs[0].commit !== mainCommit) {
          throw new Error("new Hub bootstrap requires an empty repository or its exact interrupted target ref");
        }
        receipt = { intent, phase: "target-pushed", remoteTarget: mainCommit };
        writeReceipt(environment, receipt);
      } else {
        writeReceipt(environment, receipt);
      }
      await ensureOrigin(intent, configuration.localRoot, git);
      if (receipt.phase === "prepared") {
        try {
          await git({ args: ["push", "origin", `${mainCommit}:refs/heads/${intent.targetBranch}`], cwd: configuration.localRoot,
            operation: "bootstrap remote Hub target", token });
        } catch (error) {
          const racedRefs = await listRemoteRefs(intent.canonicalHttpsUrl, configuration.localRoot, token, git);
          if (racedRefs.length !== 1 || racedRefs[0]?.ref !== `refs/heads/${intent.targetBranch}` || racedRefs[0].commit !== mainCommit) {
            throw new Error("new Hub bootstrap target gained a different ref before push; attach it or supply another empty repository");
          }
        }
        receipt = { intent, phase: "target-pushed", remoteTarget: mainCommit };
        writeReceipt(environment, receipt);
      }
    }
    const expectedMain = intent.baseCommit;
    if (receipt.remoteTarget !== expectedMain) throw new Error("bootstrap receipt remote target is invalid");
    if (receipt.phase === "target-pushed") {
      await git({ args: ["fetch", "--no-tags", "origin", intent.targetBranch], cwd: configuration.localRoot, operation: "admit bootstrapped Hub target", token });
      if (configuration.kind === "local-only") {
        const remoteConfiguration: PersistedRemoteHubConfiguration = { ...configuration, kind: "remote",
          localHubId: receipt.intent.remoteHubId,
          host: intent.host, repository: intent.repository, targetBranch: intent.targetBranch };
        replacePersistedHubConfiguration(configuration, remoteConfiguration, environment,
          { activationLock, retireExpected: true });
      } else if (configuration.localHubId !== receipt.intent.remoteHubId || configuration.host !== intent.host
        || configuration.repository !== intent.repository || configuration.targetBranch !== intent.targetBranch) {
        throw new Error("bootstrap configuration admission state is invalid");
      }
      const published = (await git({ args: ["rev-parse", "--verify", `${HUB_PUBLISHED_REF}^{commit}`],
        cwd: configuration.localRoot, operation: "inspect bootstrapped Published boundary" })).stdout.trim();
      if (published !== expectedMain) {
        if (published !== configuration.baseCommit) throw new Error("bootstrap Published boundary changed");
        await git({ args: ["update-ref", HUB_PUBLISHED_REF, expectedMain, published], cwd: configuration.localRoot,
          operation: "admit bootstrapped Published boundary" });
      }
      receipt = { ...receipt, phase: "remote-admitted" };
      writeReceipt(environment, receipt);
    }
  } catch (error) {
    throw permissionFailure(error, token);
  } finally {
    if (activationLock) releaseHubActivationLock(activationLock);
    releaseHubMutationLock(lock);
  }

  if (receipt.phase === "remote-admitted") {
    receipt = { ...receipt, phase: "completed" };
    writeReceipt(environment, receipt);
  }
  return receipt;
}
