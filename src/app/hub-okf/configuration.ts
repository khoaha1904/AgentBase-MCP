import fs from "node:fs";
import path from "node:path";

import { createHubIdentity, type HubIdentity } from "../../core/hub/index.ts";

export type HubConfiguration = Readonly<{
  hub: HubIdentity;
  localRoot: string;
  token?: string;
}>;

export function loadHubConfiguration(environment: NodeJS.ProcessEnv): HubConfiguration {
  const repository = environment.AGENTBASE_HUB_REPOSITORY;
  const targetBranch = environment.AGENTBASE_HUB_TARGET_BRANCH;
  const configuredRoot = environment.AGENTBASE_HUB_LOCAL_ROOT;
  if (!repository || !targetBranch || !configuredRoot) {
    throw new Error("Hub repository, target branch and absolute local root must be configured by the operator");
  }
  if (!path.isAbsolute(configuredRoot)) throw new Error("Hub local root must be absolute");
  const localRoot = path.resolve(configuredRoot);
  if (fs.existsSync(localRoot) && fs.lstatSync(localRoot).isSymbolicLink()) {
    throw new Error("Hub local root cannot be a symlink");
  }
  const token = environment.AGENTBASE_HUB_GITHUB_TOKEN;
  return {
    hub: createHubIdentity(repository, targetBranch),
    localRoot,
    ...(token ? { token } : {}),
  };
}
