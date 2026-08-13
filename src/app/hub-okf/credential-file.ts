import { randomUUID } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const TOKEN_KEY = "AGENTBASE_HUB_GITHUB_TOKEN";
const MAX_CREDENTIAL_BYTES = 16 * 1024;

export type CredentialWriteResult = "created" | "preserved" | "replaced";

function credentialDirectory(environment: NodeJS.ProcessEnv): string {
  const base = environment.XDG_CONFIG_HOME || environment.HOME || os.homedir();
  if (!path.isAbsolute(base)) throw new Error("global credential base must be absolute");
  return environment.XDG_CONFIG_HOME
    ? path.join(base, "agentbase-mcp")
    : path.join(base, ".config", "agentbase-mcp");
}

export function globalHubCredentialPath(environment: NodeJS.ProcessEnv = process.env): string {
  return path.join(credentialDirectory(environment), "env");
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
  const file = globalHubCredentialPath(environment);
  if (!lstatIfPresent(file)) return undefined;
  admitDirectory(path.dirname(file), false);
  return readCredentialFile(file);
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
