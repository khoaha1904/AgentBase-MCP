import fs from "node:fs";
import path from "node:path";

import { createHubIdentity, hubProfileId, type HubIdentity } from "../../../core/hub/index.ts";
import { agentBaseStorage, copyLegacyDirectory, legacyAgentBaseStorage } from "../../local-storage/index.ts";

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
  host: string;
  repository: string;
  targetBranch: string;
  publicationPolicy?: "direct" | "pr";
}>;

export type PersistedHubConfiguration = PersistedLocalHubConfiguration | PersistedRemoteHubConfiguration;
export type ActiveHubConfiguration = PersistedHubConfiguration & Readonly<{ hub?: HubIdentity; token?: string }>;
type PersistedHubPointer = Readonly<{ formatVersion: 1; activeHubId: string }>;

function directory(environment: NodeJS.ProcessEnv): string {
  return path.join(agentBaseStorage(environment).config, "hub");
}

function readDirectories(environment: NodeJS.ProcessEnv): readonly string[] {
  const legacy = legacyAgentBaseStorage(environment);
  return legacy ? [directory(environment), path.join(legacy.config)] : [directory(environment)];
}

export function globalHubConfigurationPath(environment: NodeJS.ProcessEnv = process.env): string {
  return path.join(directory(environment), "hub.json");
}

function profilesDirectory(environment: NodeJS.ProcessEnv): string {
  return path.join(directory(environment), "hubs");
}

function profilePath(localHubId: string, environment: NodeJS.ProcessEnv): string {
  if (!/^[a-f0-9]{24}$/.test(localHubId)) throw new Error("Hub profile ID is invalid");
  return path.join(profilesDirectory(environment), `${localHubId}.json`);
}

function profilePaths(localHubId: string, environment: NodeJS.ProcessEnv): readonly string[] {
  return readDirectories(environment).map((root) => path.join(root, "hubs", `${localHubId}.json`));
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
  const allowed = input.kind === "remote" ? [...common, "host", "repository", "targetBranch", "publicationPolicy"] : common;
  if (Object.keys(input).some((key) => !allowed.includes(key)) || input.formatVersion !== 1
    || (input.kind !== "local-only" && input.kind !== "remote")
    || typeof input.localHubId !== "string" || !/^[a-f0-9]{24}$/.test(input.localHubId)
    || typeof input.localRoot !== "string" || !path.isAbsolute(input.localRoot)
    || typeof input.catalogVersion !== "string" || !/^\d+\.\d+\.\d+$/.test(input.catalogVersion)) {
    throw new Error("global Hub configuration is invalid");
  }
  assertCommit(input.baseCommit, "base commit");
  if (input.kind === "remote") {
    if (input.publicationPolicy !== undefined && input.publicationPolicy !== "direct" && input.publicationPolicy !== "pr") {
      throw new Error("Hub publication policy must be direct or pr");
    }
    if (typeof input.repository !== "string" || typeof input.targetBranch !== "string") throw new Error("global Hub remote configuration is invalid");
    if (input.host === undefined) input.host = "github.com";
    if (typeof input.host !== "string") throw new Error("global Hub remote configuration is invalid");
    createHubIdentity(input.repository, input.targetBranch, input.host);
  }
  return input as PersistedHubConfiguration;
}

function parsePointer(value: unknown): PersistedHubPointer | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const input = value as Record<string, unknown>;
  if (Object.keys(input).length !== 2 || input.formatVersion !== 1
    || typeof input.activeHubId !== "string" || !/^[a-f0-9]{24}$/.test(input.activeHubId)) return undefined;
  return input as PersistedHubPointer;
}

function writePointer(file: string, localHubId: string): void {
  const parent = path.dirname(file);
  admitParent(parent, true);
  const temporary = path.join(parent, `.active-${process.pid}-${Date.now().toString(36)}.tmp`);
  try {
    fs.writeFileSync(temporary, `${JSON.stringify({ formatVersion: 1, activeHubId: localHubId }, null, 2)}\n`,
      { mode: 0o600, flag: "wx" });
    fs.chmodSync(temporary, 0o600);
    fs.renameSync(temporary, file);
  } catch (error) {
    if (fs.existsSync(temporary)) fs.rmSync(temporary, { force: true });
    throw error;
  }
}

function writeAtomic(file: string, configuration: PersistedHubConfiguration): void {
  const parent = path.dirname(file);
  admitParent(parent, true);
  const temporary = path.join(parent, `.hub-${process.pid}-${Date.now().toString(36)}.tmp`);
  try {
    fs.writeFileSync(temporary, `${JSON.stringify(parse(configuration), null, 2)}\n`, { mode: 0o600, flag: "wx" });
    fs.chmodSync(temporary, 0o600);
    fs.renameSync(temporary, file);
  } catch (error) {
    if (fs.existsSync(temporary)) fs.rmSync(temporary, { force: true });
    throw error;
  }
}

export type HubActivationLock = Readonly<{ file: string; descriptor: number }>;

export function acquireHubActivationLock(environment: NodeJS.ProcessEnv = process.env): HubActivationLock {
  const parent = directory(environment);
  admitParent(parent, true);
  const file = path.join(parent, ".hub-activation.lock");
  if (pathEntryExists(file)) {
    try {
      const value = JSON.parse(fs.readFileSync(file, "utf8")) as { pid?: unknown };
      if (typeof value.pid !== "number") throw new Error("Hub activation lock is invalid");
      let alive = true;
      try { process.kill(value.pid, 0); }
      catch (error) { alive = (error as NodeJS.ErrnoException).code === "EPERM"; }
      if (alive) throw new Error("another Hub activation is in progress");
      fs.rmSync(file);
    } catch (error) {
      if (pathEntryExists(file)) throw new Error("another Hub activation is in progress", { cause: error });
    }
  }
  try {
    const descriptor = fs.openSync(file, fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_WRONLY, 0o600);
    fs.writeFileSync(descriptor, `${JSON.stringify({ pid: process.pid })}\n`);
    fs.fsyncSync(descriptor);
    return { file, descriptor };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EEXIST") throw new Error("another Hub activation is in progress");
    throw error;
  }
}

export function releaseHubActivationLock(lock: HubActivationLock): void {
  fs.closeSync(lock.descriptor);
  fs.rmSync(lock.file, { force: false });
}

function withActivationLock<T>(environment: NodeJS.ProcessEnv, operation: () => T): T {
  const lock = acquireHubActivationLock(environment);
  try { return operation(); }
  finally { releaseHubActivationLock(lock); }
}

export function readPersistedHubProfile(
  localHubId: string,
  environment: NodeJS.ProcessEnv = process.env,
): PersistedHubConfiguration | undefined {
  const file = profilePaths(localHubId, environment).find(pathEntryExists);
  if (!file) return undefined;
  admitParent(path.dirname(file), false);
  const stat = fs.lstatSync(file);
  if (stat.isSymbolicLink() || !stat.isFile() || (stat.mode & 0o777) !== 0o600 || !owner(stat) || stat.size < 2 || stat.size > MAX_BYTES) {
    throw new Error("Hub profile file is unsafe");
  }
  return parse(JSON.parse(fs.readFileSync(file, "utf8")) as unknown);
}

export function activatePersistedHubConfiguration(
  configuration: PersistedHubConfiguration,
  environment: NodeJS.ProcessEnv = process.env,
  expectedActiveHubId?: string | null,
  options: Readonly<{ activationLock?: HubActivationLock }> = {},
): void {
  const activate = () => {
    const admitted = parse(configuration);
    const active = readPersistedHubConfiguration(environment);
    if (expectedActiveHubId !== undefined && (active?.localHubId ?? null) !== expectedActiveHubId) {
      throw new Error("active Hub profile changed during configuration");
    }
    if (active) writeAtomic(profilePath(active.localHubId, environment), active);
    writeAtomic(profilePath(admitted.localHubId, environment), admitted);
    writePointer(globalHubConfigurationPath(environment), admitted.localHubId);
  };
  if (options.activationLock) {
    if (options.activationLock.file !== path.join(directory(environment), ".hub-activation.lock")) {
      throw new Error("Hub activation lock does not belong to this configuration root");
    }
    activate();
  } else withActivationLock(environment, activate);
}

export function readPersistedHubConfiguration(environment: NodeJS.ProcessEnv = process.env): PersistedHubConfiguration | undefined {
  const file = readDirectories(environment).map((root) => path.join(root, "hub.json")).find(pathEntryExists);
  if (!file) return undefined;
  admitParent(path.dirname(file), false);
  const stat = fs.lstatSync(file);
  if (stat.isSymbolicLink() || !stat.isFile() || (stat.mode & 0o777) !== 0o600 || !owner(stat) || stat.size < 2 || stat.size > MAX_BYTES) {
    throw new Error("global Hub configuration file is unsafe");
  }
  const descriptor = fs.openSync(file, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
  try {
    const content = fs.readFileSync(descriptor, "utf8");
    const value = JSON.parse(content) as unknown;
    const pointer = parsePointer(value);
    if (!pointer) return parse(value);
    const profile = readPersistedHubProfile(pointer.activeHubId, environment);
    if (!profile || profile.localHubId !== pointer.activeHubId) throw new Error("active Hub profile is absent");
    return profile;
  } catch (error) {
    if (error instanceof SyntaxError) throw new Error("global Hub configuration is invalid");
    throw error;
  } finally { fs.closeSync(descriptor); }
}

export function writePersistedHubConfiguration(
  configuration: PersistedHubConfiguration,
  environment: NodeJS.ProcessEnv = process.env,
): void {
  withActivationLock(environment, () => {
    const admitted = parse(configuration);
    const file = globalHubConfigurationPath(environment), parent = path.dirname(file);
    admitParent(parent, true);
    if (pathEntryExists(file)) throw new Error("an active AgentBase-Hub is already configured");
    writeAtomic(profilePath(admitted.localHubId, environment), admitted);
    writePointer(file, admitted.localHubId);
  });
}

export function replacePersistedHubConfiguration(
  expected: PersistedHubConfiguration,
  next: PersistedHubConfiguration,
  environment: NodeJS.ProcessEnv = process.env,
  options: Readonly<{ activationLock?: HubActivationLock; retireExpected?: boolean }> = {},
): void {
  const replace = () => {
    const current = readPersistedHubConfiguration(environment);
    if (!current || JSON.stringify(current) !== JSON.stringify(parse(expected))) throw new Error("active Hub configuration changed");
    writeAtomic(profilePath(next.localHubId, environment), next);
    writePointer(globalHubConfigurationPath(environment), next.localHubId);
    if (options.retireExpected && expected.localHubId !== next.localHubId) {
      fs.rmSync(profilePath(expected.localHubId, environment), { force: true });
    }
  };
  if (options.activationLock) {
    if (options.activationLock.file !== path.join(directory(environment), ".hub-activation.lock")) {
      throw new Error("Hub activation lock does not belong to this configuration root");
    }
    replace();
  } else withActivationLock(environment, replace);
}

export type HubConfigurationMigration = Readonly<{ previousId: string; currentId: string }>;

export function migratePersistedHubConfiguration(
  environment: NodeJS.ProcessEnv = process.env,
): HubConfigurationMigration | undefined {
  const canonicalFile = globalHubConfigurationPath(environment);
  const file = readDirectories(environment).map((root) => path.join(root, "hub.json")).find(pathEntryExists);
  if (!file) return undefined;
  const legacyStorage = file !== canonicalFile;
  const configuration = readPersistedHubConfiguration(environment);
  const descriptor = fs.openSync(file, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
  let legacy = false;
  try {
    const value = JSON.parse(fs.readFileSync(descriptor, "utf8")) as unknown;
    legacy = !parsePointer(value);
  } finally { fs.closeSync(descriptor); }
  if (!configuration) return undefined;
  const currentId = configuration.kind === "remote"
    ? hubProfileId(createHubIdentity(configuration.repository, configuration.targetBranch, configuration.host))
    : configuration.localHubId;
  const oldStorage = legacyAgentBaseStorage(environment);
  const oldHubRoot = oldStorage ? path.join(oldStorage.hubs, configuration.localHubId) : undefined;
  const canonicalHubRoot = path.join(agentBaseStorage(environment).hubs, currentId);
  if (legacyStorage && oldHubRoot && path.resolve(configuration.localRoot) === path.resolve(oldHubRoot)
    && fs.existsSync(canonicalHubRoot)) throw new Error("canonical Hub checkout already exists before storage migration");
  const migratedLocalRoot = legacyStorage && oldHubRoot && path.resolve(configuration.localRoot) === path.resolve(oldHubRoot)
    ? copyLegacyDirectory(configuration.localRoot, canonicalHubRoot)
    : configuration.localRoot;
  if (legacyStorage && oldStorage) copyLegacyDirectory(path.join(oldStorage.state, "hub-bootstrap"),
    path.join(agentBaseStorage(environment).state, "hub-bootstrap"));
  if (!legacyStorage && !legacy && currentId === configuration.localHubId && migratedLocalRoot === configuration.localRoot) return undefined;
  return withActivationLock(environment, () => {
    const current = readPersistedHubConfiguration(environment);
    if (!current || current.localHubId !== configuration.localHubId) throw new Error("active Hub changed during migration");
    const migrated = { ...current, localHubId: currentId, localRoot: migratedLocalRoot };
    const canonicalProfile = profilePath(currentId, environment);
    const existing = pathEntryExists(canonicalProfile) ? readPersistedHubProfile(currentId, environment) : undefined;
    if (existing && JSON.stringify(existing) !== JSON.stringify(parse(migrated))) {
      throw new Error("canonical Hub profile already differs from the legacy profile");
    }
    writeAtomic(profilePath(currentId, environment), migrated);
    writePointer(canonicalFile, currentId);
    if (!legacyStorage && current.localHubId !== currentId) fs.rmSync(profilePath(current.localHubId, environment), { force: true });
    return { previousId: current.localHubId, currentId };
  });
}
