import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { AGENTBASE_OKF_SCHEMA_CATALOG_VERSION, loadOkfBundle } from "../../../core/knowledge/index.ts";
import { runGit, type GitOutput, type GitRequest } from "../../../providers/github-hub/index.ts";
import { loadGlobalHubToken } from "../configuration/credential-file.ts";
import {
  readPersistedHubConfiguration,
  writePersistedHubConfiguration,
  type PersistedHubConfiguration,
} from "../configuration/configuration-file.ts";
import { renderHubCiBundle } from "../ci/artifact.ts";
import { HUB_README_PATH, renderHubReadme } from "./readme.ts";

export type SetupGit = (request: GitRequest) => Promise<GitOutput>;

export type HubSetupResult = Readonly<{
  kind: "local-only" | "remote";
  localHubId: string;
  localRoot: string;
  baseCommit: string;
  activeHead: string;
  repository?: string;
}>;

export const HUB_BASE_TRAILERS = {
  kind: "AgentBase-Hub-Kind",
  id: "AgentBase-Hub-ID",
  format: "AgentBase-Hub-Format",
} as const;

function dataDirectory(environment: NodeJS.ProcessEnv): string {
  const base = environment.XDG_DATA_HOME || (environment.HOME ? path.join(environment.HOME, ".local", "share") : path.join(os.homedir(), ".local", "share"));
  if (!path.isAbsolute(base)) throw new Error("global AgentBase data base must be absolute");
  return path.join(base, "agentbase-mcp", "hubs");
}

export function normalizeGitHubHubUrl(value: string): Readonly<{ repository: string; canonicalHttpsUrl: string }> {
  let url: URL;
  try { url = new URL(value); } catch { throw new Error("Hub URL must be an exact GitHub HTTPS repository URL"); }
  if (url.protocol !== "https:" || url.hostname !== "github.com" || url.username || url.password || url.search || url.hash || url.port) {
    throw new Error("Hub URL must be a credential-free GitHub HTTPS repository URL");
  }
  const parts = url.pathname.replace(/\/$/, "").split("/").filter(Boolean);
  if (parts.length !== 2) throw new Error("Hub URL must identify exactly one GitHub owner/repository");
  const owner = parts[0]!, repositoryName = parts[1]!.replace(/\.git$/, "");
  if (!/^[A-Za-z0-9_.-]+$/.test(owner) || !/^[A-Za-z0-9_.-]+$/.test(repositoryName) || owner.includes("..") || repositoryName.includes("..")) {
    throw new Error("Hub URL repository identity is invalid");
  }
  const repository = `${owner}/${repositoryName}`;
  return { repository, canonicalHttpsUrl: `https://github.com/${repository}.git` };
}

function exactCommit(value: string, label: string): string {
  const commit = value.trim();
  if (!/^[a-f0-9]{40}$/.test(commit)) throw new Error(`${label} did not resolve to an exact commit`);
  return commit;
}

async function rootCommit(root: string, git: SetupGit): Promise<string> {
  const output = await git({ args: ["rev-list", "--max-parents=0", "--reverse", "HEAD"], cwd: root, operation: "resolve Hub base commit" });
  const commits = output.stdout.trim().split("\n").filter(Boolean);
  if (commits.length !== 1) throw new Error("AgentBase-Hub must have exactly one base commit");
  return exactCommit(commits[0]!, "Hub base");
}

function ensureNoConfiguration(environment: NodeJS.ProcessEnv): void {
  if (readPersistedHubConfiguration(environment)) throw new Error("an active AgentBase-Hub is already configured; switching is not supported");
  if (environment.AGENTBASE_HUB_REPOSITORY || environment.AGENTBASE_HUB_LOCAL_ROOT) {
    throw new Error("an active legacy AgentBase-Hub is already configured; switching is not supported");
  }
}

function privateParent(parent: string): void {
  fs.mkdirSync(parent, { recursive: true, mode: 0o700 });
  fs.chmodSync(parent, 0o700);
  const stat = fs.lstatSync(parent);
  if (stat.isSymbolicLink() || !stat.isDirectory() || (stat.mode & 0o777) !== 0o700) throw new Error("AgentBase Hub data directory is unsafe");
}

function result(configuration: PersistedHubConfiguration, activeHead: string): HubSetupResult {
  return { kind: configuration.kind, localHubId: configuration.localHubId, localRoot: configuration.localRoot,
    baseCommit: configuration.baseCommit, activeHead,
    ...(configuration.kind === "remote" ? { repository: configuration.repository } : {}) };
}

function setupFailure(error: unknown, token: string): Error {
  const message = error instanceof Error ? error.message : "Hub attachment failed";
  const redacted = token ? message.split(token).join("[REDACTED]") : message;
  if (/(?:status 401|status 403|exited with status)/i.test(redacted)) {
    return new Error("GitHub access is insufficient; update the one global token with repository read access, then retry");
  }
  return new Error(redacted);
}

export async function attachExistingHub(
  repositoryUrl: string,
  environment: NodeJS.ProcessEnv = process.env,
  git: SetupGit = runGit,
): Promise<HubSetupResult> {
  ensureNoConfiguration(environment);
  const token = loadGlobalHubToken(environment);
  if (!token) throw new Error("existing Hub attachment requires the global GitHub token");
  const normalized = normalizeGitHubHubUrl(repositoryUrl);
  const localHubId = createHash("sha256").update(`github\0${normalized.repository}`).digest("hex").slice(0, 24);
  const parent = dataDirectory(environment), localRoot = path.join(parent, localHubId);
  privateParent(parent);
  if (fs.existsSync(localRoot)) throw new Error("owned Hub destination already exists without an admitted configuration");
  const staging = path.join(parent, `.attach-${localHubId}-${randomUUID()}`);
  try {
    await git({ args: ["clone", "--branch", "main", "--single-branch", "--no-recurse-submodules", normalized.canonicalHttpsUrl, staging],
      cwd: parent, operation: "attach existing AgentBase-Hub", token });
    const branch = await git({ args: ["symbolic-ref", "--quiet", "--short", "HEAD"], cwd: staging, operation: "validate attached Hub branch" });
    if (branch.stdout.trim() !== "main") throw new Error("attached AgentBase-Hub checkout is not on main");
    const remote = await git({ args: ["remote", "get-url", "origin"], cwd: staging, operation: "validate attached Hub remote" });
    if (remote.stdout.trim() !== normalized.canonicalHttpsUrl) throw new Error("attached AgentBase-Hub remote identity changed");
    const config = await git({ args: ["config", "--local", "--null", "--list"], cwd: staging, operation: "validate attached Hub config" });
    if (config.stdout.split("\0").some((entry) => /^url\..*\.insteadof\n/i.test(entry))) {
      throw new Error("attached AgentBase-Hub contains a forbidden URL rewrite");
    }
    const status = await git({ args: ["status", "--porcelain=v1", "--untracked-files=all"], cwd: staging, operation: "validate attached Hub tree" });
    if (status.stdout.length) throw new Error("attached AgentBase-Hub tree is not clean");
    loadOkfBundle(staging, { requireAgentBaseRootIndex: true });
    const baseCommit = await rootCommit(staging, git);
    const head = await git({ args: ["rev-parse", "--verify", "HEAD^{commit}"], cwd: staging, operation: "resolve attached Hub head" });
    const activeHead = exactCommit(head.stdout, "Hub head");
    const configuration: PersistedHubConfiguration = { formatVersion: 1, kind: "remote", localHubId, localRoot, baseCommit,
      catalogVersion: AGENTBASE_OKF_SCHEMA_CATALOG_VERSION, repository: normalized.repository, targetBranch: "main" };
    fs.renameSync(staging, localRoot);
    try { writePersistedHubConfiguration(configuration, environment); }
    catch (error) { fs.rmSync(localRoot, { recursive: true, force: true }); throw error; }
    return result(configuration, activeHead);
  } catch (error) {
    if (fs.existsSync(staging)) fs.rmSync(staging, { recursive: true, force: true });
    throw setupFailure(error, token);
  }
}

export async function createLocalHub(
  environment: NodeJS.ProcessEnv = process.env,
  git: SetupGit = runGit,
  createdAt = new Date().toISOString(),
): Promise<HubSetupResult> {
  ensureNoConfiguration(environment);
  const localHubId = createHash("sha256").update(`local\0${randomUUID()}`).digest("hex").slice(0, 24);
  const parent = dataDirectory(environment), localRoot = path.join(parent, localHubId);
  privateParent(parent);
  const staging = path.join(parent, `.new-${localHubId}`);
  if (fs.existsSync(staging) || fs.existsSync(localRoot)) throw new Error("owned Hub initialization path already exists");
  fs.mkdirSync(staging, { mode: 0o700 });
  try {
    await git({ args: ["init", "--initial-branch=main"], cwd: staging, operation: "initialize local AgentBase-Hub" });
    fs.writeFileSync(path.join(staging, HUB_README_PATH), renderHubReadme());
    fs.writeFileSync(path.join(staging, "index.md"), "---\nokf_version: \"0.2\"\n---\n\n# AgentBase-Hub\n");
    const ci = renderHubCiBundle();
    for (const [relative, bytes] of Object.entries(ci.files)) {
      const target = path.join(staging, ...relative.split("/"));
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, bytes, { mode: relative.endsWith(".mjs") ? 0o755 : 0o644 });
    }
    await git({ args: ["add", HUB_README_PATH, "index.md", ...Object.keys(ci.files)], cwd: staging, operation: "stage AgentBase-Hub base" });
    const message = [
      "Initialize AgentBase-Hub base", "", `${HUB_BASE_TRAILERS.kind}: base`,
      `${HUB_BASE_TRAILERS.id}: ${localHubId}`, `${HUB_BASE_TRAILERS.format}: 1`,
    ].join("\n");
    await git({ args: ["-c", "user.name=AgentBase", "-c", "user.email=agentbase@localhost", "commit", "--no-gpg-sign", "--no-verify", "-m", message],
      cwd: staging, operation: "commit AgentBase-Hub base", commitTimestamp: createdAt });
    const head = await git({ args: ["rev-parse", "--verify", "HEAD^{commit}"], cwd: staging, operation: "resolve local Hub base" });
    const baseCommit = exactCommit(head.stdout, "Hub base");
    const configuration: PersistedHubConfiguration = { formatVersion: 1, kind: "local-only", localHubId, localRoot,
      baseCommit, catalogVersion: AGENTBASE_OKF_SCHEMA_CATALOG_VERSION };
    fs.renameSync(staging, localRoot);
    try { writePersistedHubConfiguration(configuration, environment); }
    catch (error) { fs.rmSync(localRoot, { recursive: true, force: true }); throw error; }
    return result(configuration, baseCommit);
  } catch (error) {
    if (fs.existsSync(staging)) fs.rmSync(staging, { recursive: true, force: true });
    throw error;
  }
}
