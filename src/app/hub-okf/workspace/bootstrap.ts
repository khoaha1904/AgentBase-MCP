import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { createHubIdentity, hubProfileId } from "../../../core/hub/index.ts";
import { AGENTBASE_OKF_SCHEMA_CATALOG_VERSION } from "../../../core/knowledge/index.ts";
import { listRemoteRefs, runGit, type GitOutput, type GitRequest } from "../../../providers/github-hub/index.ts";
import { renderHubCiBundle } from "../ci/artifact.ts";
import {
  acquireHubActivationLock,
  activatePersistedHubConfiguration,
  readPersistedHubConfiguration,
  releaseHubActivationLock,
  replacePersistedHubConfiguration,
  type PersistedHubConfiguration,
  type PersistedRemoteHubConfiguration,
} from "../configuration/configuration-file.ts";
import { loadExactHubProfileToken } from "../configuration/credential-file.ts";
import { acquireHubMutationLock, releaseHubMutationLock, writeAtomicJson } from "../review/proposal-state.ts";
import { HUB_PUBLISHED_REF } from "./local-hub.ts";
import { HUB_README_PATH, renderHubReadme } from "./readme.ts";
import { HUB_BASE_TRAILERS, normalizeGitHubHubUrl } from "./setup.ts";

export type BootstrapGit = (request: GitRequest) => Promise<GitOutput>;

export type HubBootstrapIntent = Readonly<{
  id: string;
  repository: string;
  canonicalHttpsUrl: string;
  host: string;
  targetBranch: string;
  remoteHubId: string;
  baseCommit: string;
  baselinePaths: readonly string[];
  baselineDigest: string;
}>;

export type HubBootstrapPreview = HubBootstrapIntent & Readonly<{
  remoteState: "empty" | "exact-interrupted-target";
  directWrite: true;
}>;

export type HubBootstrapReceipt = Readonly<{
  intent: HubBootstrapIntent;
  localRoot: string;
  phase: "prepared" | "target-pushed" | "remote-admitted" | "completed";
  remoteTarget?: string;
}>;

const ROOT_INDEX = "---\nokf_version: \"0.2\"\n---\n\n# AgentBase-Hub\n";

function stateRoot(environment: NodeJS.ProcessEnv): string {
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

function dataRoot(environment: NodeJS.ProcessEnv): string {
  const base = environment.XDG_DATA_HOME || (environment.HOME ? path.join(environment.HOME, ".local", "share") : path.join(os.homedir(), ".local", "share"));
  if (!path.isAbsolute(base)) throw new Error("global AgentBase data base must be absolute");
  const target = path.join(base, "agentbase-mcp", "hubs");
  fs.mkdirSync(target, { recursive: true, mode: 0o700 });
  fs.chmodSync(target, 0o700);
  const stat = fs.lstatSync(target);
  if (stat.isSymbolicLink() || !stat.isDirectory() || (stat.mode & 0o777) !== 0o700) {
    throw new Error("AgentBase Hub data directory is unsafe");
  }
  return target;
}

function receiptPath(environment: NodeJS.ProcessEnv, remoteHubId: string): string {
  if (!/^[a-f0-9]{24}$/.test(remoteHubId)) throw new Error("Hub bootstrap profile ID is invalid");
  return path.join(stateRoot(environment), `${remoteHubId}.json`);
}

function readReceipt(environment: NodeJS.ProcessEnv, remoteHubId: string): HubBootstrapReceipt | undefined {
  const file = receiptPath(environment, remoteHubId);
  let stat: fs.Stats;
  try { stat = fs.lstatSync(file); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined; throw error; }
  const owned = typeof process.getuid !== "function" || stat.uid === process.getuid();
  if (stat.isSymbolicLink() || !stat.isFile() || (stat.mode & 0o777) !== 0o600 || !owned || stat.size > 1024 * 1024) {
    throw new Error("Hub bootstrap receipt is unsafe");
  }
  const value = JSON.parse(fs.readFileSync(file, "utf8")) as HubBootstrapReceipt;
  if (value.intent.remoteHubId !== remoteHubId || !path.isAbsolute(value.localRoot)
    || !["prepared", "target-pushed", "remote-admitted", "completed"].includes(value.phase)) {
    throw new Error("Hub bootstrap receipt is invalid");
  }
  return value;
}

function writeReceipt(environment: NodeJS.ProcessEnv, receipt: HubBootstrapReceipt): void {
  writeAtomicJson(receiptPath(environment, receipt.intent.remoteHubId), receipt);
}

function baselineFiles(targetBranch: string): Readonly<Record<string, Buffer>> {
  return { [HUB_README_PATH]: Buffer.from(renderHubReadme()), "index.md": Buffer.from(ROOT_INDEX),
    ...renderHubCiBundle(targetBranch).files };
}

function filesDigest(files: Readonly<Record<string, Buffer>>): string {
  const bytes = Object.entries(files).sort(([left], [right]) => left.localeCompare(right)).flatMap(([relative, value]) => [
    Buffer.from(`${relative}\0${value.length}\0`), value, Buffer.from("\0"),
  ]);
  return `sha256:${createHash("sha256").update(Buffer.concat(bytes)).digest("hex")}`;
}

function createIntent(
  normalized: ReturnType<typeof normalizeGitHubHubUrl>, targetBranch: string, remoteHubId: string, baseCommit: string,
): HubBootstrapIntent {
  const files = baselineFiles(targetBranch), baselineDigest = filesDigest(files);
  const id = createHash("sha256").update([
    normalized.host, normalized.repository, targetBranch, baseCommit, baselineDigest,
  ].join("\0")).digest("hex").slice(0, 24);
  return { id, host: normalized.host, repository: normalized.repository,
    canonicalHttpsUrl: normalized.canonicalHttpsUrl, targetBranch, remoteHubId, baseCommit,
    baselinePaths: Object.keys(files).sort(), baselineDigest };
}

async function exactCommit(root: string, ref: string, operation: string, git: BootstrapGit): Promise<string> {
  const value = (await git({ args: ["rev-parse", "--verify", `${ref}^{commit}`], cwd: root,
    operation, maximumOutputBytes: 256 })).stdout.trim();
  if (!/^[a-f0-9]{40}$/.test(value)) throw new Error(`${operation} is invalid`);
  return value;
}

async function validatePreparedBaseline(receipt: HubBootstrapReceipt, git: BootstrapGit): Promise<void> {
  const root = receipt.localRoot, expected = baselineFiles(receipt.intent.targetBranch);
  if (!fs.existsSync(root) || fs.lstatSync(root).isSymbolicLink() || !fs.statSync(root).isDirectory()) {
    throw new Error("prepared Hub bootstrap checkout is unavailable");
  }
  const branch = (await git({ args: ["symbolic-ref", "--quiet", "--short", "HEAD"], cwd: root,
    operation: "validate prepared Hub branch" })).stdout.trim();
  if (branch !== "main") throw new Error("prepared Hub bootstrap checkout is not on internal main");
  const origin = (await git({ args: ["remote", "get-url", "origin"], cwd: root,
    operation: "validate prepared Hub remote" })).stdout.trim();
  if (origin !== receipt.intent.canonicalHttpsUrl) throw new Error("prepared Hub bootstrap remote changed");
  if (await exactCommit(root, "HEAD", "validate prepared Hub commit", git) !== receipt.intent.baseCommit) {
    throw new Error("prepared Hub bootstrap commit changed");
  }
  if (await exactCommit(root, HUB_PUBLISHED_REF, "validate prepared Published boundary", git) !== receipt.intent.baseCommit) {
    throw new Error("prepared Hub Published boundary changed");
  }
  const status = (await git({ args: ["status", "--porcelain=v1", "--untracked-files=all"], cwd: root,
    operation: "validate prepared Hub tree" })).stdout;
  if (status) throw new Error("prepared Hub bootstrap tree is not clean");
  const paths = (await git({ args: ["ls-tree", "-r", "--name-only", receipt.intent.baseCommit], cwd: root,
    operation: "validate prepared Hub paths", maximumOutputBytes: 64 * 1024 })).stdout.trim().split("\n").filter(Boolean).sort();
  if (JSON.stringify(paths) !== JSON.stringify(receipt.intent.baselinePaths)) throw new Error("prepared Hub baseline paths changed");
  for (const [relative, bytes] of Object.entries(expected)) {
    const actual = (await git({ args: ["show", `${receipt.intent.baseCommit}:${relative}`], cwd: root,
      operation: "validate prepared Hub baseline bytes", maximumOutputBytes: Math.max(64 * 1024, bytes.length + 1024) })).stdout;
    if (!Buffer.from(actual).equals(bytes)) throw new Error(`prepared Hub baseline changed at ${relative}`);
  }
  if (filesDigest(expected) !== receipt.intent.baselineDigest) throw new Error("prepared Hub baseline digest changed");
}

async function prepareBaseline(
  normalized: ReturnType<typeof normalizeGitHubHubUrl>, targetBranch: string, remoteHubId: string,
  environment: NodeJS.ProcessEnv, git: BootstrapGit,
): Promise<HubBootstrapReceipt> {
  const parent = dataRoot(environment), localRoot = path.join(parent, remoteHubId);
  if (fs.existsSync(localRoot)) throw new Error("Hub profile checkout exists without a matching bootstrap receipt; attach it instead");
  const staging = path.join(parent, `.bootstrap-${remoteHubId}-${randomUUID()}`), files = baselineFiles(targetBranch);
  fs.mkdirSync(staging, { mode: 0o700 });
  try {
    await git({ args: ["init", "--initial-branch=main"], cwd: staging, operation: "initialize Hub bootstrap checkout" });
    for (const [relative, bytes] of Object.entries(files)) {
      const target = path.join(staging, ...relative.split("/"));
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, bytes, { mode: relative.endsWith(".mjs") ? 0o755 : 0o644 });
    }
    await git({ args: ["add", ...Object.keys(files)], cwd: staging, operation: "stage complete Hub baseline" });
    const message = ["Initialize AgentBase-Hub base", "", `${HUB_BASE_TRAILERS.kind}: base`,
      `${HUB_BASE_TRAILERS.id}: ${remoteHubId}`, `${HUB_BASE_TRAILERS.format}: 1`].join("\n");
    await git({ args: ["-c", "user.name=AgentBase", "-c", "user.email=agentbase@localhost", "commit", "--no-gpg-sign",
      "--no-verify", "-m", message], cwd: staging, operation: "commit complete Hub baseline",
    commitTimestamp: new Date().toISOString() });
    const baseCommit = await exactCommit(staging, "HEAD", "resolve complete Hub baseline", git);
    await git({ args: ["remote", "add", "origin", normalized.canonicalHttpsUrl], cwd: staging,
      operation: "attach Hub bootstrap remote" });
    await git({ args: ["update-ref", HUB_PUBLISHED_REF, baseCommit], cwd: staging,
      operation: "initialize bootstrap Published boundary" });
    fs.renameSync(staging, localRoot);
    const prepared: HubBootstrapReceipt = { intent: createIntent(normalized, targetBranch, remoteHubId, baseCommit),
      localRoot, phase: "prepared" };
    writeReceipt(environment, prepared);
    return prepared;
  } catch (error) {
    if (fs.existsSync(staging)) fs.rmSync(staging, { recursive: true, force: true });
    throw error;
  }
}

function legacyReceipt(
  configuration: Extract<PersistedHubConfiguration, { kind: "local-only" }>,
  normalized: ReturnType<typeof normalizeGitHubHubUrl>, targetBranch: string, remoteHubId: string,
  environment: NodeJS.ProcessEnv,
): HubBootstrapReceipt {
  const prepared: HubBootstrapReceipt = { intent: createIntent(normalized, targetBranch, remoteHubId, configuration.baseCommit),
    localRoot: configuration.localRoot, phase: "prepared" };
  writeReceipt(environment, prepared);
  return prepared;
}

function sameRemote(configuration: PersistedHubConfiguration | undefined, intent: HubBootstrapIntent): boolean {
  return configuration?.kind === "remote" && configuration.host === intent.host
    && configuration.repository === intent.repository && configuration.targetBranch === intent.targetBranch
    && configuration.localHubId === intent.remoteHubId;
}

export async function previewHubBootstrap(
  repositoryUrl: string, targetBranch: string, environment: NodeJS.ProcessEnv = process.env, git: BootstrapGit = runGit,
): Promise<HubBootstrapPreview> {
  const normalized = normalizeGitHubHubUrl(repositoryUrl);
  const remoteHubId = hubProfileId(createHubIdentity(normalized.repository, targetBranch, normalized.host));
  const token = loadExactHubProfileToken(remoteHubId, environment);
  if (!token) throw new Error("Hub bootstrap requires the owner-private target Hub profile token");
  const configuration = readPersistedHubConfiguration(environment);
  let receipt = readReceipt(environment, remoteHubId);
  if (receipt?.phase === "completed") throw new Error("Hub bootstrap is already complete; use normal Hub workflows");
  if (receipt) {
    if (receipt.intent.host !== normalized.host || receipt.intent.repository !== normalized.repository
      || receipt.intent.targetBranch !== targetBranch) throw new Error("Hub bootstrap receipt identity changed");
  } else if (configuration?.kind === "local-only") {
    receipt = legacyReceipt(configuration, normalized, targetBranch, remoteHubId, environment);
  } else {
    if (configuration?.kind === "remote" && configuration.host === normalized.host
      && configuration.repository === normalized.repository && configuration.targetBranch === targetBranch) {
      throw new Error("Hub is already attached; use normal Hub workflows");
    }
    receipt = await prepareBaseline(normalized, targetBranch, remoteHubId, environment, git);
  }
  await validatePreparedBaseline(receipt, git);
  const refs = await listRemoteRefs(receipt.intent.canonicalHttpsUrl, receipt.localRoot, token, git);
  if (!refs.length) return { ...receipt.intent, remoteState: "empty", directWrite: true };
  if (refs.length === 1 && refs[0]?.ref === `refs/heads/${targetBranch}` && refs[0].commit === receipt.intent.baseCommit) {
    return { ...receipt.intent, remoteState: "exact-interrupted-target", directWrite: true };
  }
  throw new Error("new Hub bootstrap requires an exact empty repository; attach the existing Hub instead");
}

function permissionFailure(error: unknown, token: string): Error {
  const message = (error instanceof Error ? error.message : "Hub bootstrap failed").split(token).join("[REDACTED]");
  if (/status (?:401|403)/i.test(message)) {
    return new Error("GitHub access is insufficient; update this Hub profile token with repository read and Contents write access, then retry");
  }
  return new Error(message);
}

export async function executeHubBootstrap(
  repositoryUrl: string, targetBranch: string, environment: NodeJS.ProcessEnv = process.env,
  options: Readonly<{ git?: BootstrapGit }> = {},
): Promise<HubBootstrapReceipt> {
  const git = options.git ?? runGit;
  const preview = await previewHubBootstrap(repositoryUrl, targetBranch, environment, git);
  const token = loadExactHubProfileToken(preview.remoteHubId, environment);
  if (!token) throw new Error("Hub bootstrap requires the owner-private target Hub profile token");
  let receipt = readReceipt(environment, preview.remoteHubId);
  if (!receipt) throw new Error("prepared Hub bootstrap receipt is absent");
  const pinnedConfiguration = readPersistedHubConfiguration(environment);
  const lock = acquireHubMutationLock(stateRoot(environment), `bootstrap:${preview.remoteHubId}`);
  let activationLock: ReturnType<typeof acquireHubActivationLock> | undefined;
  try {
    activationLock = acquireHubActivationLock(environment);
    if (JSON.stringify(readPersistedHubConfiguration(environment)) !== JSON.stringify(pinnedConfiguration)) {
      throw new Error("active Hub profile changed before bootstrap acquired ownership");
    }
    if (receipt.phase === "prepared") {
      const refs = await listRemoteRefs(receipt.intent.canonicalHttpsUrl, receipt.localRoot, token, git);
      if (!refs.length) {
        try {
          await git({ args: ["push", "origin", `${receipt.intent.baseCommit}:refs/heads/${receipt.intent.targetBranch}`],
            cwd: receipt.localRoot, operation: "bootstrap remote Hub target", token });
        } catch (error) {
          const raced = await listRemoteRefs(receipt.intent.canonicalHttpsUrl, receipt.localRoot, token, git);
          if (raced.length !== 1 || raced[0]?.ref !== `refs/heads/${receipt.intent.targetBranch}`
            || raced[0].commit !== receipt.intent.baseCommit) throw error;
        }
      } else if (refs.length !== 1 || refs[0]?.ref !== `refs/heads/${receipt.intent.targetBranch}`
        || refs[0].commit !== receipt.intent.baseCommit) {
        throw new Error("new Hub bootstrap target gained another ref before push; attach it instead");
      }
      receipt = { ...receipt, phase: "target-pushed", remoteTarget: receipt.intent.baseCommit };
      writeReceipt(environment, receipt);
    }
    if (receipt.remoteTarget !== receipt.intent.baseCommit) throw new Error("bootstrap receipt remote target is invalid");
    if (receipt.phase === "target-pushed") {
      await git({ args: ["fetch", "--no-tags", "origin", receipt.intent.targetBranch], cwd: receipt.localRoot,
        operation: "admit bootstrapped Hub target", token });
      const remoteConfiguration: PersistedRemoteHubConfiguration = { formatVersion: 1, kind: "remote",
        localHubId: receipt.intent.remoteHubId, localRoot: receipt.localRoot, baseCommit: receipt.intent.baseCommit,
        catalogVersion: AGENTBASE_OKF_SCHEMA_CATALOG_VERSION, host: receipt.intent.host,
        repository: receipt.intent.repository, targetBranch: receipt.intent.targetBranch };
      const current = readPersistedHubConfiguration(environment);
      if (sameRemote(current, receipt.intent)) {
        if (JSON.stringify(current) !== JSON.stringify(remoteConfiguration)) throw new Error("bootstrapped Hub profile differs from its prepared baseline");
      } else if (current?.kind === "local-only" && current.localRoot === receipt.localRoot) {
        replacePersistedHubConfiguration(current, remoteConfiguration, environment, { activationLock, retireExpected: true });
      } else {
        activatePersistedHubConfiguration(remoteConfiguration, environment, current?.localHubId ?? null, { activationLock });
      }
      if (await exactCommit(receipt.localRoot, HUB_PUBLISHED_REF, "inspect bootstrapped Published boundary", git)
        !== receipt.intent.baseCommit) throw new Error("bootstrapped Published boundary changed");
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
