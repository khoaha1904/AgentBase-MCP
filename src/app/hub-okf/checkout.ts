import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { assertHubRemote, type HubIdentity } from "../../core/hub/index.ts";
import { runGit, type GitRequest, type GitOutput } from "../../providers/github-hub/index.ts";

export type HubCheckout = Readonly<{ root: string; baseCommit: string }>;
export type GitRunner = (request: GitRequest) => Promise<GitOutput>;

function assertNoUrlRewrites(output: string): void {
  const keys = output.split("\0").map((entry) => entry.split("\n")[0]?.toLocaleLowerCase());
  if (keys.some((key) => key?.startsWith("url.") && key.endsWith(".insteadof"))) {
    throw new Error("Hub checkout local Git config contains a forbidden URL rewrite");
  }
}

function defaultStateRoot(): string {
  const owner = typeof process.getuid === "function" ? String(process.getuid()) : "portable";
  return path.join(os.tmpdir(), `agentbase-${owner}`, "hub");
}

export async function checkoutHub(hub: HubIdentity, token: string, root = defaultStateRoot(), git: GitRunner = runGit): Promise<HubCheckout> {
  assertHubRemote(hub, hub.canonicalHttpsUrl);
  const identity = createHash("sha256").update(`${hub.repository}\0${hub.targetBranch}`).digest("hex").slice(0, 24);
  const checkoutRoot = path.join(path.resolve(root), identity);
  fs.mkdirSync(path.dirname(checkoutRoot), { recursive: true, mode: 0o700 });
  fs.chmodSync(path.dirname(checkoutRoot), 0o700);
  if (fs.existsSync(checkoutRoot) && fs.lstatSync(checkoutRoot).isSymbolicLink()) {
    throw new Error("Hub checkout cannot be a symlink");
  }
  if (!fs.existsSync(checkoutRoot)) await git({
    args: ["clone", "--no-checkout", "--filter=blob:none", "--no-recurse-submodules", hub.canonicalHttpsUrl, checkoutRoot],
    cwd: path.dirname(checkoutRoot),
    operation: "clone Hub",
    token,
  });
  const localConfig = await git({ args: ["config", "--local", "--null", "--list"], cwd: checkoutRoot, operation: "inspect Hub Git config" });
  assertNoUrlRewrites(localConfig.stdout);
  await git({ args: ["remote", "set-url", "origin", hub.canonicalHttpsUrl], cwd: checkoutRoot, operation: "admit Hub remote" });
  await git({ args: ["fetch", "--no-tags", "--prune", "origin", hub.targetBranch], cwd: checkoutRoot, operation: "fetch Hub target", token });
  const resolved = await git({ args: ["rev-parse", "--verify", "FETCH_HEAD^{commit}"], cwd: checkoutRoot, operation: "resolve Hub base" });
  const baseCommit = resolved.stdout.trim();
  if (!/^[a-f0-9]{40}$/.test(baseCommit)) throw new Error("Hub base did not resolve to an exact commit");
  await git({
    args: ["checkout", "--detach", "--force", baseCommit],
    cwd: checkoutRoot,
    operation: "checkout Hub base",
    token,
  });
  return { root: checkoutRoot, baseCommit };
}
