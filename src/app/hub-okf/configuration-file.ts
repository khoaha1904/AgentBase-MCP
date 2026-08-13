import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { createHubIdentity, type HubIdentity } from "../../core/hub/index.ts";

const MAX_BYTES = 16 * 1024;

export type PersistedLocalHubConfiguration = Readonly<{
  formatVersion: 1;
  kind: "local-only";
  localHubId: string;
  localRoot: string;
  baseCommit: string;
  catalogVersion: string;
}>;

export type PersistedRemoteHubConfiguration = Readonly<{
  formatVersion: 1;
  kind: "remote";
  localHubId: string;
  localRoot: string;
  baseCommit: string;
  catalogVersion: string;
  repository: string;
  targetBranch: "main";
}>;

export type PersistedHubConfiguration = PersistedLocalHubConfiguration | PersistedRemoteHubConfiguration;
export type ActiveHubConfiguration = PersistedHubConfiguration & Readonly<{ hub?: HubIdentity; token?: string }>;

function directory(environment: NodeJS.ProcessEnv): string {
  const base = environment.XDG_CONFIG_HOME || environment.HOME || os.homedir();
  if (!path.isAbsolute(base)) throw new Error("global Hub configuration base must be absolute");
  return environment.XDG_CONFIG_HOME ? path.join(base, "agentbase-mcp") : path.join(base, ".config", "agentbase-mcp");
}

export function globalHubConfigurationPath(environment: NodeJS.ProcessEnv = process.env): string {
  return path.join(directory(environment), "hub.json");
}

function owner(stat: fs.Stats): boolean {
  return typeof process.getuid !== "function" || stat.uid === process.getuid();
}

function pathEntryExists(target: string): boolean {
  try { fs.lstatSync(target); return true; }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

function admitParent(parent: string, create: boolean): void {
  if (!fs.existsSync(parent)) {
    if (!create) throw new Error("global Hub configuration directory is absent");
    fs.mkdirSync(parent, { recursive: true, mode: 0o700 });
    fs.chmodSync(parent, 0o700);
  }
  const stat = fs.lstatSync(parent);
  if (stat.isSymbolicLink() || !stat.isDirectory() || (stat.mode & 0o777) !== 0o700 || !owner(stat)) {
    throw new Error("global Hub configuration directory is unsafe");
  }
}

function assertCommit(value: unknown, label: string): asserts value is string {
  if (typeof value !== "string" || !/^[a-f0-9]{40}$/.test(value)) throw new Error(`global Hub configuration ${label} is invalid`);
}

function parse(value: unknown): PersistedHubConfiguration {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("global Hub configuration is invalid");
  const input = value as Record<string, unknown>;
  const common = ["formatVersion", "kind", "localHubId", "localRoot", "baseCommit", "catalogVersion"];
  const allowed = input.kind === "remote" ? [...common, "repository", "targetBranch"] : common;
  if (Object.keys(input).some((key) => !allowed.includes(key)) || input.formatVersion !== 1
    || (input.kind !== "local-only" && input.kind !== "remote")
    || typeof input.localHubId !== "string" || !/^[a-f0-9]{24}$/.test(input.localHubId)
    || typeof input.localRoot !== "string" || !path.isAbsolute(input.localRoot)
    || typeof input.catalogVersion !== "string" || !/^\d+\.\d+\.\d+$/.test(input.catalogVersion)) {
    throw new Error("global Hub configuration is invalid");
  }
  assertCommit(input.baseCommit, "base commit");
  if (input.kind === "remote") {
    if (typeof input.repository !== "string" || input.targetBranch !== "main") throw new Error("global Hub remote configuration is invalid");
    createHubIdentity(input.repository, input.targetBranch);
  }
  return input as PersistedHubConfiguration;
}

export function readPersistedHubConfiguration(environment: NodeJS.ProcessEnv = process.env): PersistedHubConfiguration | undefined {
  const file = globalHubConfigurationPath(environment);
  if (!pathEntryExists(file)) return undefined;
  admitParent(path.dirname(file), false);
  const stat = fs.lstatSync(file);
  if (stat.isSymbolicLink() || !stat.isFile() || (stat.mode & 0o777) !== 0o600 || !owner(stat) || stat.size < 2 || stat.size > MAX_BYTES) {
    throw new Error("global Hub configuration file is unsafe");
  }
  const descriptor = fs.openSync(file, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
  try {
    const content = fs.readFileSync(descriptor, "utf8");
    return parse(JSON.parse(content) as unknown);
  } catch (error) {
    if (error instanceof SyntaxError) throw new Error("global Hub configuration is invalid");
    throw error;
  } finally { fs.closeSync(descriptor); }
}

export function writePersistedHubConfiguration(
  configuration: PersistedHubConfiguration,
  environment: NodeJS.ProcessEnv = process.env,
): void {
  const admitted = parse(configuration);
  const file = globalHubConfigurationPath(environment), parent = path.dirname(file);
  admitParent(parent, true);
  if (pathEntryExists(file)) throw new Error("an active AgentBase-Hub is already configured");
  const temporary = path.join(parent, `.hub-${process.pid}-${Date.now().toString(36)}.tmp`);
  try {
    fs.writeFileSync(temporary, `${JSON.stringify(admitted, null, 2)}\n`, { mode: 0o600, flag: "wx" });
    fs.chmodSync(temporary, 0o600);
    fs.renameSync(temporary, file);
  } catch (error) {
    if (fs.existsSync(temporary)) fs.rmSync(temporary, { force: true });
    throw error;
  }
}

export function replacePersistedHubConfiguration(
  expected: PersistedHubConfiguration,
  next: PersistedHubConfiguration,
  environment: NodeJS.ProcessEnv = process.env,
): void {
  const current = readPersistedHubConfiguration(environment);
  if (!current || JSON.stringify(current) !== JSON.stringify(parse(expected))) throw new Error("active Hub configuration changed");
  const file = globalHubConfigurationPath(environment), parent = path.dirname(file);
  const temporary = path.join(parent, `.hub-${process.pid}-${Date.now().toString(36)}.tmp`);
  try {
    fs.writeFileSync(temporary, `${JSON.stringify(parse(next), null, 2)}\n`, { mode: 0o600, flag: "wx" });
    fs.renameSync(temporary, file);
  } catch (error) {
    if (fs.existsSync(temporary)) fs.rmSync(temporary, { force: true });
    throw error;
  }
}
