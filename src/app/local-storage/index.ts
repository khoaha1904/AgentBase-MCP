import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export type AgentBaseStorage = Readonly<{
  root: string;
  config: string;
  hubs: string;
  state: string;
  cache: string;
  tmp: string;
  hubRuntime: string;
  hubCheckouts: string;
  providerCache: string;
}>;

export type LegacyAgentBaseStorage = Readonly<{
  config: string;
  hubs: string;
  state: string;
}>;

function absolute(value: string, label: string): string {
  if (!path.isAbsolute(value)) throw new Error(`${label} must be absolute`);
  return path.normalize(value);
}

export function agentBaseStorage(environment: NodeJS.ProcessEnv = process.env): AgentBaseStorage {
  const root = absolute(environment.AGENTBASE_HOME || path.join(environment.HOME || os.homedir(), ".agentbase"), "AgentBase storage root");
  return {
    root,
    config: path.join(root, "config"),
    hubs: path.join(root, "hubs"),
    state: path.join(root, "state"),
    cache: path.join(root, "cache"),
    tmp: path.join(root, "tmp"),
    hubRuntime: path.join(root, "state", "hub-runtime"),
    hubCheckouts: path.join(root, "tmp", "hub"),
    providerCache: path.join(root, "cache", "codebase-memory"),
  };
}

export function legacyAgentBaseStorage(environment: NodeJS.ProcessEnv = process.env): LegacyAgentBaseStorage | undefined {
  if (environment.AGENTBASE_HOME) return undefined;
  const home = environment.HOME || os.homedir();
  const configBase = environment.XDG_CONFIG_HOME || path.join(home, ".config");
  const dataBase = environment.XDG_DATA_HOME || path.join(home, ".local", "share");
  const stateBase = environment.XDG_STATE_HOME || path.join(home, ".local", "state");
  return {
    config: path.join(configBase, "agentbase-mcp"),
    hubs: path.join(dataBase, "agentbase-mcp", "hubs"),
    state: path.join(stateBase, "agentbase-mcp"),
  };
}

export function repositoryStateRoot(repositoryRoot: string, environment: NodeJS.ProcessEnv = process.env): string {
  const identity = createHash("sha256").update(fs.realpathSync(repositoryRoot)).digest("hex").slice(0, 24);
  return path.join(agentBaseStorage(environment).state, "repositories", identity);
}

export function ensureAgentBaseDirectory(directory: string): string {
  if (fs.existsSync(directory)) {
    const existing = fs.lstatSync(directory);
    if (existing.isSymbolicLink() || !existing.isDirectory()
      || (typeof process.getuid === "function" && existing.uid !== process.getuid())) {
      throw new Error(`AgentBase storage directory is unsafe: ${directory}`);
    }
  } else fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  fs.chmodSync(directory, 0o700);
  const stat = fs.lstatSync(directory);
  if (stat.isSymbolicLink() || !stat.isDirectory() || (stat.mode & 0o777) !== 0o700
    || (typeof process.getuid === "function" && stat.uid !== process.getuid())) {
    throw new Error(`AgentBase storage directory is unsafe: ${directory}`);
  }
  return directory;
}

export function copyLegacyDirectory(source: string, target: string): string {
  if (fs.existsSync(target)) {
    const targetStat = fs.lstatSync(target);
    if (targetStat.isSymbolicLink() || !targetStat.isDirectory()
      || (typeof process.getuid === "function" && targetStat.uid !== process.getuid())) {
      throw new Error(`AgentBase migration target is unsafe: ${target}`);
    }
    return target;
  }
  if (!fs.existsSync(source)) return target;
  const sourceStat = fs.lstatSync(source);
  if (sourceStat.isSymbolicLink() || !sourceStat.isDirectory()
    || (typeof process.getuid === "function" && sourceStat.uid !== process.getuid())) {
    throw new Error(`legacy AgentBase storage directory is unsafe: ${source}`);
  }
  ensureAgentBaseDirectory(path.dirname(target));
  const staging = `${target}.migration-${process.pid}-${Date.now().toString(36)}`;
  try {
    fs.cpSync(source, staging, { recursive: true, errorOnExist: true, filter: (entry) => {
      if (fs.lstatSync(entry).isSymbolicLink()) throw new Error(`legacy AgentBase storage contains a symlink: ${entry}`);
      return true;
    } });
    fs.chmodSync(staging, 0o700);
    try { fs.renameSync(staging, target); }
    catch (error) {
      if (!fs.existsSync(target)) throw error;
      fs.rmSync(staging, { recursive: true, force: true });
    }
  } catch (error) {
    if (fs.existsSync(staging)) fs.rmSync(staging, { recursive: true, force: true });
    throw error;
  }
  return target;
}
