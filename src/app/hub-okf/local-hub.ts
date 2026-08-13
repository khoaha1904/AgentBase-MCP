import fs from "node:fs";
import path from "node:path";

import { assertHubRemote, createLocalHubState, type LocalHubState } from "../../core/hub/index.ts";
import { AGENTBASE_OKF_SCHEMA_CATALOG_VERSION } from "../../core/knowledge/index.ts";
import { runGit, type GitOutput, type GitRequest } from "../../providers/github-hub/index.ts";
import type { HubConfiguration } from "./configuration.ts";

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

export async function admitPersistentLocalHub(
  configuration: HubConfiguration,
  git: LocalHubGit = runGit,
): Promise<LocalHubState> {
  const root = configuration.localRoot;
  const exists = fs.existsSync(root);
  if (exists && fs.lstatSync(root).isSymbolicLink()) throw new Error("AgentBase-Hub local root cannot be a symlink");
  if (!exists) {
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
  const remote = await git({ args: ["remote", "get-url", "origin"], cwd: root, operation: "inspect local Hub remote" });
  assertHubRemote(configuration.hub, remote.stdout.trim());
  const branch = await git({ args: ["symbolic-ref", "--quiet", "--short", "HEAD"], cwd: root, operation: "inspect local Hub branch" });
  if (branch.stdout.trim() !== configuration.hub.targetBranch) throw new Error("AgentBase-Hub local checkout must be on main");
  const status = await git({ args: ["status", "--porcelain=v1", "--untracked-files=all"], cwd: root, operation: "inspect local Hub tree" });
  if (status.stdout.length) throw new Error("AgentBase-Hub local tree must be clean");
  const active = await git({
    args: ["rev-parse", "--verify", `refs/heads/${configuration.hub.targetBranch}^{commit}`],
    cwd: root,
    operation: "resolve local Hub head",
  });
  const remoteBase = await git({
    args: ["rev-parse", "--verify", `refs/remotes/origin/${configuration.hub.targetBranch}^{commit}`],
    cwd: root,
    operation: "resolve admitted remote base",
  });
  return createLocalHubState({
    root,
    hub: configuration.hub,
    remoteBase: exactCommit(remoteBase.stdout, "remote Hub base"),
    activeHead: exactCommit(active.stdout, "local Hub head"),
    catalogVersion: AGENTBASE_OKF_SCHEMA_CATALOG_VERSION,
  });
}
