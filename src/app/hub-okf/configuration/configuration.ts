import fs from "node:fs";
import path from "node:path";

import { createHubIdentity, type HubIdentity } from "../../../core/hub/index.ts";
import { loadGlobalHubToken, loadHubProfileToken } from "./credential-file.ts";
import {
  readPersistedHubConfiguration,
  type PersistedLocalHubConfiguration,
  type PersistedRemoteHubConfiguration,
} from "./configuration-file.ts";

export type HubConfiguration = Readonly<{
  hub: HubIdentity;
  localRoot: string;
  token?: string;
}>;

export type OptionalHubConfiguration =
  | Readonly<{ kind: "unconfigured"; token?: string }>
  | (PersistedLocalHubConfiguration & Readonly<{ token?: string }>)
  | (PersistedRemoteHubConfiguration & Readonly<{ hub: HubIdentity; token?: string }>);

function legacyConfiguration(environment: NodeJS.ProcessEnv): HubConfiguration | undefined {
  const repository = environment.AGENTBASE_HUB_REPOSITORY;
  const targetBranch = environment.AGENTBASE_HUB_TARGET_BRANCH;
  const configuredRoot = environment.AGENTBASE_HUB_LOCAL_ROOT;
  if (!repository && !targetBranch && !configuredRoot) return undefined;
  if (!repository || !targetBranch || !configuredRoot) throw new Error("Hub repository, target branch and absolute local root must be configured together");
  if (!path.isAbsolute(configuredRoot)) throw new Error("Hub local root must be absolute");
  return { hub: createHubIdentity(repository, targetBranch), localRoot: path.resolve(configuredRoot) };
}

export function resolveHubConfiguration(environment: NodeJS.ProcessEnv = process.env): OptionalHubConfiguration {
  const persisted = readPersistedHubConfiguration(environment);
  if (persisted) {
    const token = persisted.kind === "remote" ? loadHubProfileToken(persisted.localHubId, environment) : undefined;
    if (persisted.kind === "remote") return {
      ...persisted, hub: createHubIdentity(persisted.repository, persisted.targetBranch, persisted.host), ...(token ? { token } : {}),
    };
    return { ...persisted, ...(token ? { token } : {}) };
  }
  const legacy = legacyConfiguration(environment);
  const token = loadGlobalHubToken(environment);
  if (!legacy) return { kind: "unconfigured" };
  return { formatVersion: 1, kind: "remote", localHubId: "0".repeat(24), localRoot: legacy.localRoot,
    baseCommit: "0".repeat(40), catalogVersion: "2.0.0", repository: legacy.hub.repository,
    host: legacy.hub.host, targetBranch: legacy.hub.targetBranch, hub: legacy.hub, ...(token ? { token } : {}) };
}

export function loadHubConfiguration(environment: NodeJS.ProcessEnv): HubConfiguration {
  const resolved = resolveHubConfiguration(environment);
  if (resolved.kind !== "remote" || !resolved.hub) throw new Error("remote AgentBase Hub must be configured by the operator");
  const localRoot = path.resolve(resolved.localRoot);
  if (fs.existsSync(localRoot) && fs.lstatSync(localRoot).isSymbolicLink()) {
    throw new Error("Hub local root cannot be a symlink");
  }
  return {
    hub: resolved.hub,
    localRoot,
    ...(resolved.token ? { token: resolved.token } : {}),
  };
}
