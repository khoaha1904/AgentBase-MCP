import fs from "node:fs";
import path from "node:path";

import {
  assertHubRemote,
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

type RemoteConfiguration = HubConfiguration | (PersistedRemoteHubConfiguration & Readonly<{ hub: HubConfiguration["hub"]; token?: string }>);
type LocalConfiguration = PersistedLocalHubConfiguration & Readonly<{ token?: string }>;

function isLocalConfiguration(configuration: RemoteConfiguration | LocalConfiguration): configuration is LocalConfiguration {
  return "kind" in configuration && configuration.kind === "local-only";
}

export function admitPersistentLocalHub(configuration: RemoteConfiguration, git?: LocalHubGit): Promise<LocalHubState>;
export function admitPersistentLocalHub(configuration: LocalConfiguration, git?: LocalHubGit): Promise<LocalOnlyHubState>;
export async function admitPersistentLocalHub(
  configuration: RemoteConfiguration | LocalConfiguration,
  git: LocalHubGit = runGit,
): Promise<LocalHubState | LocalOnlyHubState> {
  const root = configuration.localRoot;
  const exists = fs.existsSync(root);
  if (exists && fs.lstatSync(root).isSymbolicLink()) throw new Error("AgentBase-Hub local root cannot be a symlink");
  if (!exists && isLocalConfiguration(configuration)) throw new Error("configured local-only AgentBase-Hub is absent");
  if (!exists) {
    if (isLocalConfiguration(configuration)) throw new Error("configured local-only AgentBase-Hub is absent");
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
  }
  if (!fs.statSync(root).isDirectory()) throw new Error("AgentBase-Hub local root must be a directory");
  const config = await git({ args: ["config", "--local", "--null", "--list"], cwd: root, operation: "inspect local Hub config" });
  assertNoUrlRewrites(config.stdout);
  if (!isLocalConfiguration(configuration)) {
    const remote = await git({ args: ["remote", "get-url", "origin"], cwd: root, operation: "inspect local Hub remote" });
    assertHubRemote(configuration.hub, remote.stdout.trim());
  }
  const branch = await git({ args: ["symbolic-ref", "--quiet", "--short", "HEAD"], cwd: root, operation: "inspect local Hub branch" });
  if (branch.stdout.trim() !== "main") throw new Error("AgentBase-Hub local checkout must be on main");
  const status = await git({ args: ["status", "--porcelain=v1", "--untracked-files=all"], cwd: root, operation: "inspect local Hub tree" });
  if (status.stdout.length) throw new Error("AgentBase-Hub local tree must be clean");
  const active = await git({
    args: ["rev-parse", "--verify", "refs/heads/main^{commit}"],
    cwd: root,
    operation: "resolve local Hub head",
  });
  if (isLocalConfiguration(configuration)) {
    const base = await git({ args: ["rev-parse", "--verify", `${configuration.baseCommit}^{commit}`], cwd: root, operation: "resolve local Hub base" });
    if (exactCommit(base.stdout, "local Hub base") !== configuration.baseCommit) throw new Error("configured local Hub base changed");
    return createLocalOnlyHubState({ kind: "local-only", root, localHubId: configuration.localHubId,
      baseCommit: configuration.baseCommit, remoteBase: configuration.baseCommit,
      activeHead: exactCommit(active.stdout, "local Hub head"), catalogVersion: configuration.catalogVersion });
  }
  const remoteBase = await git({ args: ["rev-parse", "--verify", "refs/remotes/origin/main^{commit}"], cwd: root, operation: "resolve admitted remote base" });
  return createLocalHubState({
    root,
    hub: configuration.hub,
    ...("localHubId" in configuration && configuration.localHubId ? { localHubId: configuration.localHubId } : {}),
    ...("baseCommit" in configuration && !/^0+$/.test(configuration.baseCommit) ? { baseCommit: configuration.baseCommit } : {}),
    remoteBase: exactCommit(remoteBase.stdout, "remote Hub base"),
    activeHead: exactCommit(active.stdout, "local Hub head"),
    catalogVersion: AGENTBASE_OKF_SCHEMA_CATALOG_VERSION,
  });
}
