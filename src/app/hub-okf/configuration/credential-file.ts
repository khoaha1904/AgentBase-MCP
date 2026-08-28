import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { agentBaseStorage, legacyAgentBaseStorage } from "../../local-storage/index.ts";

const TOKEN_KEY = "AGENTBASE_HUB_GITHUB_TOKEN";
const MAX_CREDENTIAL_BYTES = 16 * 1024;

export type CredentialWriteResult = "created" | "preserved" | "replaced";

function credentialDirectory(environment: NodeJS.ProcessEnv): string {
  return path.join(agentBaseStorage(environment).config, "hub");
}

function credentialDirectories(environment: NodeJS.ProcessEnv): readonly string[] {
  const legacy = legacyAgentBaseStorage(environment);
  return legacy ? [credentialDirectory(environment), path.join(legacy.config)] : [credentialDirectory(environment)];
}

export function globalHubCredentialPath(environment: NodeJS.ProcessEnv = process.env): string {
  return path.join(credentialDirectory(environment), "env");
}

export function hubProfileCredentialPath(localHubId: string, environment: NodeJS.ProcessEnv = process.env): string {
  if (!/^[a-f0-9]{24}$/.test(localHubId)) throw new Error("Hub profile ID is invalid");
  return path.join(credentialDirectory(environment), "credentials", `${localHubId}.env`);
}

function ownerMatches(stat: fs.Stats): boolean {
  return typeof process.getuid !== "function" || stat.uid === process.getuid();
}

function lstatIfPresent(target: string): fs.Stats | undefined {
  try {
    return fs.lstatSync(target);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
}

function admitDirectory(directory: string, create: boolean): void {
  let stat = lstatIfPresent(directory);
  if (!stat) {
    if (!create) throw new Error("global credential directory is absent");
    fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
    fs.chmodSync(directory, 0o700);
    stat = fs.lstatSync(directory);
  }
  if (stat.isSymbolicLink()) throw new Error("global credential directory cannot be a symlink");
  if (!stat.isDirectory()) throw new Error("global credential directory must be a directory");
  if ((stat.mode & 0o777) !== 0o700 || !ownerMatches(stat)) {
    throw new Error("global credential directory has unsafe permissions or ownership");
  }
}

function admitFile(file: string): fs.Stats {
  const stat = fs.lstatSync(file);
  if (stat.isSymbolicLink()) throw new Error("global credential file cannot be a symlink");
  if (!stat.isFile()) throw new Error("global credential path must be a regular file");
  if ((stat.mode & 0o777) !== 0o600 || !ownerMatches(stat)) {
    throw new Error("global credential file has unsafe permissions or ownership");
  }
  if (stat.size < 1 || stat.size > MAX_CREDENTIAL_BYTES) throw new Error("global credential file size is invalid");
  return stat;
}

function parseCredential(content: Buffer): string {
  let source: string;
  try {
    source = new TextDecoder("utf-8", { fatal: true }).decode(content);
  } catch {
    throw new Error("global credential file format is invalid");
  }
  const match = source.match(/^AGENTBASE_HUB_GITHUB_TOKEN=([^\r\n]+)\n$/);
  if (!match?.[1]) throw new Error("global credential file format is invalid");
  return match[1];
}

function readCredentialFile(file: string): string {
  admitFile(file);
  const descriptor = fs.openSync(file, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
  try {
    const stat = fs.fstatSync(descriptor);
    if (!stat.isFile() || (stat.mode & 0o777) !== 0o600 || !ownerMatches(stat)) {
      throw new Error("global credential file changed during admission");
    }
    return parseCredential(fs.readFileSync(descriptor));
  } finally {
    fs.closeSync(descriptor);
  }
}

export function loadGlobalHubToken(environment: NodeJS.ProcessEnv = process.env): string | undefined {
  const ambient = environment[TOKEN_KEY];
  if (ambient) return ambient;
  for (const directory of credentialDirectories(environment)) {
    const file = path.join(directory, "env");
    if (lstatIfPresent(file)) { admitDirectory(directory, false); return readCredentialFile(file); }
  }
  return undefined;
}

export function loadHubProfileToken(localHubId: string, environment: NodeJS.ProcessEnv = process.env): string | undefined {
  return loadExactHubProfileToken(localHubId, environment);
}

/** Exact identity-bound credential. Use for every prospective Hub attachment. */
export function loadExactHubProfileToken(localHubId: string, environment: NodeJS.ProcessEnv = process.env): string | undefined {
  if (!/^[a-f0-9]{24}$/.test(localHubId)) throw new Error("Hub profile ID is invalid");
  for (const directory of credentialDirectories(environment)) {
    const file = path.join(directory, "credentials", `${localHubId}.env`);
    if (lstatIfPresent(file)) {
      admitDirectory(path.dirname(file), false);
      return readCredentialFile(file);
    }
  }
  return undefined;
}

function credentialBytes(token: string): Buffer {
  if (!token || /[\r\n\0]/.test(token)) throw new Error("Hub token must be a non-empty single-line value");
  return Buffer.from(`${TOKEN_KEY}=${token}\n`, "utf8");
}

export function writeGlobalHubToken(
  token: string,
  environment: NodeJS.ProcessEnv = process.env,
  options: Readonly<{ replace?: boolean }> = {},
): CredentialWriteResult {
  const content = credentialBytes(token);
  if (content.length > MAX_CREDENTIAL_BYTES) throw new Error("Hub token exceeds the credential size limit");
  const file = globalHubCredentialPath(environment), directory = path.dirname(file);
  admitDirectory(directory, true);
  const existed = Boolean(lstatIfPresent(file));
  if (existed) {
    admitFile(file);
    if (!options.replace) return "preserved";
  }
  const temporary = path.join(directory, `.env-${process.pid}-${randomUUID()}.tmp`);
  let descriptor: number | undefined;
  try {
    descriptor = fs.openSync(temporary, fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_WRONLY, 0o600);
    fs.writeFileSync(descriptor, content);
    fs.fsyncSync(descriptor);
    fs.closeSync(descriptor);
    descriptor = undefined;
    fs.chmodSync(temporary, 0o600);
    fs.renameSync(temporary, file);
  } catch (error) {
    if (descriptor !== undefined) fs.closeSync(descriptor);
    if (fs.existsSync(temporary)) fs.rmSync(temporary, { force: true });
    throw error;
  }
  return existed ? "replaced" : "created";
}

export function writeHubProfileToken(
  localHubId: string,
  token: string,
  environment: NodeJS.ProcessEnv = process.env,
  options: Readonly<{ replace?: boolean }> = {},
): CredentialWriteResult {
  const content = credentialBytes(token);
  if (content.length > MAX_CREDENTIAL_BYTES) throw new Error("Hub token exceeds the credential size limit");
  const file = hubProfileCredentialPath(localHubId, environment), directory = path.dirname(file);
  admitDirectory(directory, true);
  const existed = Boolean(lstatIfPresent(file));
  if (existed) {
    admitFile(file);
    if (!options.replace) return "preserved";
  }
  const temporary = path.join(directory, `.credential-${process.pid}-${randomUUID()}.tmp`);
  try {
    fs.writeFileSync(temporary, content, { mode: 0o600, flag: "wx" });
    fs.chmodSync(temporary, 0o600);
    fs.renameSync(temporary, file);
  } catch (error) {
    if (fs.existsSync(temporary)) fs.rmSync(temporary, { force: true });
    throw error;
  }
  return existed ? "replaced" : "created";
}

export function migrateHubProfileToken(localHubId: string, environment: NodeJS.ProcessEnv = process.env): void {
  const profile = hubProfileCredentialPath(localHubId, environment);
  if (lstatIfPresent(profile)) return;
  // Only migrate owner-private stored files. Never bind an ambient process
  // token to a newly selected Hub identity.
  const directories = credentialDirectories(environment);
  const legacyFile = directories.slice(1).map((directory) => path.join(directory, "credentials", `${localHubId}.env`)).find(lstatIfPresent)
    ?? directories.map((directory) => path.join(directory, "env")).find(lstatIfPresent);
  const legacy = legacyFile ? (admitDirectory(path.dirname(legacyFile), false), readCredentialFile(legacyFile)) : undefined;
  if (legacy) writeHubProfileToken(localHubId, legacy, environment);
}

export function copyHubProfileToken(
  previousId: string,
  currentId: string,
  environment: NodeJS.ProcessEnv = process.env,
): void {
  if (previousId === currentId) return;
  const previous = loadExactHubProfileToken(previousId, environment);
  const current = loadExactHubProfileToken(currentId, environment);
  if (previous && current && previous !== current) throw new Error("canonical Hub profile credential already differs");
  if (previous && !current) writeHubProfileToken(currentId, previous, environment);
}

export function removeHubProfileToken(
  localHubId: string,
  environment: NodeJS.ProcessEnv = process.env,
): void {
  const oldFile = hubProfileCredentialPath(localHubId, environment);
  if (lstatIfPresent(oldFile)) {
    admitFile(oldFile);
    fs.rmSync(oldFile);
  }
}
