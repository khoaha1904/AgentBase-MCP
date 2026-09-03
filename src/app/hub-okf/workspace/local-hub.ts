import fs from "node:fs";
import path from "node:path";

import {
  assertHubRemote,
  HUB_PROPOSAL_TRAILERS,
  createLocalHubState,
  createLocalOnlyHubState,
  type LocalHubState,
  type LocalOnlyHubState,
} from "../../../core/hub/index.ts";
import { AGENTBASE_OKF_SCHEMA_CATALOG_VERSION } from "../../../core/knowledge/index.ts";
import { runGit, type GitOutput, type GitRequest } from "../../../providers/github-hub/index.ts";
import type { HubConfiguration } from "../configuration/configuration.ts";
import type { PersistedLocalHubConfiguration, PersistedRemoteHubConfiguration } from "../configuration/configuration-file.ts";

export type LocalHubGit = (request: GitRequest) => Promise<GitOutput>;
export const HUB_PUBLISHED_REF = "refs/agentbase/published" as const;

function exactCommit(output: string, label: string): string {
  const commit = output.trim();
  if (!/^[a-f0-9]{40}$/.test(commit)) throw new Error(`${label} did not resolve to an exact commit`);
  return commit;
}

function assertNoUrlRewrites(output: string): void {
  const keys = output.split("\0").map((entry) => entry.split("\n")[0]?.toLocaleLowerCase());
  if (keys.some((key) => key?.startsWith("url.") && key.endsWith(".insteadof"))) {
    throw new Error("AgentBase-Hub local Git config contains a forbidden URL rewrite");
  }
}

async function optionalRef(root: string, ref: string, git: LocalHubGit): Promise<string | undefined> {
  const output = (await git({ args: ["for-each-ref", "--format=%(objectname)", ref], cwd: root,
    operation: "resolve Hub Published ref", maximumOutputBytes: 256 })).stdout.trim();
  return output ? exactCommit(output, "Hub Published ref") : undefined;
}

async function inferPublishedBoundary(root: string, activeHead: string, baseCommit: string | undefined,
  git: LocalHubGit): Promise<string> {
  let cursor = activeHead;
  for (let count = 0; count < 512; count += 1) {
    if (baseCommit && cursor === baseCommit) return cursor;
    const message = (await git({ args: ["show", "-s", "--format=%B", cursor], cwd: root,
      operation: "inspect legacy Hub proposal boundary", maximumOutputBytes: 64 * 1024 })).stdout;
    if (!message.split("\n").some((line) => line.startsWith(`${HUB_PROPOSAL_TRAILERS.id}: `))) return cursor;
    cursor = exactCommit((await git({ args: ["rev-parse", "--verify", `${cursor}^`], cwd: root,
      operation: "walk legacy Hub proposal boundary", maximumOutputBytes: 256 })).stdout, "legacy Hub proposal parent");
  }
  throw new Error("legacy Hub proposal ancestry exceeds the migration bound");
}

async function admitPublishedRef(root: string, activeHead: string, baseCommit: string | undefined,
  git: LocalHubGit, readOnly = false, legacyTrackingRef?: string): Promise<string> {
  const existing = await optionalRef(root, HUB_PUBLISHED_REF, git);
  if (existing) return existing;
  let inferred: string | undefined;
  if (legacyTrackingRef) {
    const tracking = await optionalRef(root, legacyTrackingRef, git);
    if (tracking) {
      try {
        const mergeBase = exactCommit((await git({ args: ["merge-base", tracking, activeHead], cwd: root,
          operation: "inspect legacy remote-tracking boundary", maximumOutputBytes: 256 })).stdout, "legacy tracking ancestry");
        if (mergeBase === tracking) inferred = tracking;
      } catch { /* An unrelated fetched ref is not an admitted boundary. */ }
    }
  }
  inferred ??= await inferPublishedBoundary(root, activeHead, baseCommit, git);
  if (!readOnly) await git({ args: ["update-ref", HUB_PUBLISHED_REF, inferred, "0".repeat(40)], cwd: root,
    operation: "migrate Hub Published ref", maximumOutputBytes: 4096 });
  return inferred;
}

type RemoteConfiguration = HubConfiguration | (PersistedRemoteHubConfiguration & Readonly<{ hub: HubConfiguration["hub"]; token?: string }>);
type LocalConfiguration = PersistedLocalHubConfiguration & Readonly<{ token?: string }>;

function isLocalConfiguration(configuration: RemoteConfiguration | LocalConfiguration): configuration is LocalConfiguration {
  return "kind" in configuration && configuration.kind === "local-only";
}

export function admitPersistentLocalHub(configuration: RemoteConfiguration, git?: LocalHubGit,
  options?: Readonly<{ readOnly?: boolean; allowRecoveryState?: boolean }>): Promise<LocalHubState>;
export function admitPersistentLocalHub(configuration: LocalConfiguration, git?: LocalHubGit,
  options?: Readonly<{ readOnly?: boolean; allowRecoveryState?: boolean }>): Promise<LocalOnlyHubState>;
export async function admitPersistentLocalHub(
  configuration: RemoteConfiguration | LocalConfiguration,
  git: LocalHubGit = runGit,
  options: Readonly<{ readOnly?: boolean; allowRecoveryState?: boolean }> = {},
): Promise<LocalHubState | LocalOnlyHubState> {
  const root = configuration.localRoot;
  const exists = fs.existsSync(root);
  let cloned = false;
  if (exists && fs.lstatSync(root).isSymbolicLink()) throw new Error("AgentBase-Hub local root cannot be a symlink");
  if (!exists && isLocalConfiguration(configuration)) throw new Error("configured local-only AgentBase-Hub is absent");
  if (!exists) {
    if (isLocalConfiguration(configuration)) throw new Error("configured local-only AgentBase-Hub is absent");
    if (options.readOnly) throw new Error("configured AgentBase-Hub local checkout is absent");
    if (!configuration.token) throw new Error("initial AgentBase-Hub clone requires the dedicated token");
    fs.mkdirSync(path.dirname(root), { recursive: true, mode: 0o700 });
    await git({
      args: [
        "clone", "--branch", configuration.hub.targetBranch, "--single-branch",
        "--no-recurse-submodules", configuration.hub.canonicalHttpsUrl, root,
      ],
      cwd: path.dirname(root),
      operation: "clone persistent AgentBase-Hub",
      token: configuration.token,
    });
    cloned = true;
  }
  if (!fs.statSync(root).isDirectory()) throw new Error("AgentBase-Hub local root must be a directory");
  const config = await git({ args: ["config", "--local", "--null", "--list"], cwd: root, operation: "inspect local Hub config" });
  assertNoUrlRewrites(config.stdout);
  if (!isLocalConfiguration(configuration)) {
    const remote = await git({ args: ["remote", "get-url", "origin"], cwd: root, operation: "inspect local Hub remote" });
    assertHubRemote(configuration.hub, remote.stdout.trim());
  }
  if (cloned && !isLocalConfiguration(configuration) && configuration.hub.targetBranch !== "main") {
    await git({ args: ["branch", "-m", "main"], cwd: root, operation: "normalize local Hub branch" });
  }
  let branchName: string | undefined;
  try {
    branchName = (await git({ args: ["symbolic-ref", "--quiet", "--short", "HEAD"], cwd: root,
      operation: "inspect local Hub branch" })).stdout.trim();
  } catch (error) {
    if (!options.allowRecoveryState) throw error;
  }
  if (branchName !== "main" && !(options.allowRecoveryState && branchName === undefined)) {
    throw new Error("AgentBase-Hub local checkout must be on main");
  }
  const status = await git({ args: ["status", "--porcelain=v1", "--untracked-files=all"], cwd: root, operation: "inspect local Hub tree" });
  if (status.stdout.length && !options.allowRecoveryState) throw new Error("AgentBase-Hub local tree must be clean");
  const active = await git({
    args: ["rev-parse", "--verify", "refs/heads/main^{commit}"],
    cwd: root,
    operation: "resolve local Hub head",
  });
  const activeHead = exactCommit(active.stdout, "local Hub head");
  if (isLocalConfiguration(configuration)) {
    const base = await git({ args: ["rev-parse", "--verify", `${configuration.baseCommit}^{commit}`], cwd: root, operation: "resolve local Hub base" });
    if (exactCommit(base.stdout, "local Hub base") !== configuration.baseCommit) throw new Error("configured local Hub base changed");
    const published = await admitPublishedRef(root, activeHead, configuration.baseCommit, git, options.readOnly);
    if (published !== configuration.baseCommit) throw new Error("local-only Hub Published boundary changed");
    const mergeBase = exactCommit((await git({ args: ["merge-base", published, activeHead], cwd: root,
      operation: "validate local-only Published ancestry", maximumOutputBytes: 256 })).stdout, "Published ancestry");
    if (mergeBase !== published) throw new Error("local-only Hub Published boundary is not an ancestor of local main");
    return createLocalOnlyHubState({ kind: "local-only", root, localHubId: configuration.localHubId,
      baseCommit: configuration.baseCommit, remoteBase: published,
      activeHead, catalogVersion: configuration.catalogVersion });
  }
  const remoteBase = await admitPublishedRef(root, activeHead,
    "baseCommit" in configuration && !/^0+$/.test(configuration.baseCommit) ? configuration.baseCommit : undefined,
    git, options.readOnly, `refs/remotes/origin/${configuration.hub.targetBranch}`);
  const mergeBase = exactCommit((await git({ args: ["merge-base", remoteBase, activeHead], cwd: root,
    operation: "validate Published ancestry", maximumOutputBytes: 256 })).stdout, "Published ancestry");
  if (mergeBase !== remoteBase) throw new Error("Hub Published boundary is not an ancestor of local main");
  return createLocalHubState({
    root,
    hub: configuration.hub,
    ...("localHubId" in configuration && configuration.localHubId ? { localHubId: configuration.localHubId } : {}),
    ...("baseCommit" in configuration && !/^0+$/.test(configuration.baseCommit) ? { baseCommit: configuration.baseCommit } : {}),
    remoteBase,
    activeHead,
    catalogVersion: AGENTBASE_OKF_SCHEMA_CATALOG_VERSION,
  });
}
