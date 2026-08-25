import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import type { EngineIdentity } from "../../core/observations/index.ts";
import { CodebaseMemoryError } from "./errors.ts";
import { runBoundedProcess } from "./process.ts";

const PROVIDER = "codebase-memory-mcp";
const PROVIDER_VERSION = "0.10.8";
const UPSTREAM_COMMIT = "46ae198fc11cda80e817acbc5f5908d7c2de7032";
const PROFILE_ID = "agentbase-mvp-12-v1";
const PROFILE_VERSION = 1;
const ADAPTER_VERSION = 1;
const SAFE_TOOLS = [
  "index_repository", "search_graph", "trace_path", "get_code_snippet",
  "get_architecture", "search_code", "index_status", "check_index_coverage",
  "detect_changes",
] as const;

export type OwnedRuntime = Readonly<{
  runtimeRoot: string;
  executable: string;
  identity: EngineIdentity;
}>;

export type OwnedRuntimeOptions = Readonly<{
  projectRoot: string;
  platform?: NodeJS.Platform;
  architecture?: string;
}>;

export type OwnedRuntimeBundleOptions = OwnedRuntimeOptions & Readonly<{
  runtimeRoot: string;
}>;

function failure(code: "OWNED_RUNTIME_MISSING" | "OWNED_RUNTIME_INVALID" | "SOURCE_INTEGRITY_FAILED"
  | "PROFILE_INTEGRITY_FAILED" | "EXECUTABLE_INTEGRITY_FAILED" | "EXECUTABLE_IDENTITY_FAILED",
operation: string, message: string, cause?: unknown): never {
  throw new CodebaseMemoryError(code, operation, message, cause === undefined ? undefined : { cause });
}

function sha256(data: string | Buffer): string {
  return createHash("sha256").update(data).digest("hex");
}

function sha256File(file: string): string {
  return sha256(fs.readFileSync(file));
}

function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function readJson(file: string, operation: string): Record<string, unknown> {
  try { return record(JSON.parse(fs.readFileSync(file, "utf8")) as unknown); }
  catch (cause) { return failure("OWNED_RUNTIME_INVALID", operation, `cannot read ${path.basename(file)}`, cause); }
}

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value).sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${canonical(entry)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function walk(directory: string, prefix = ""): string[] {
  const files: string[] = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walk(absolute, relative));
    else if (entry.isFile()) files.push(relative);
    else failure("SOURCE_INTEGRITY_FAILED", "admit-owned-runtime", `unexpected source link or special file: ${relative}`);
  }
  return files;
}

function verifySource(vendorRoot: string): string {
  const inventoryFile = path.join(vendorRoot, "inventory.sha256");
  const upstreamRoot = path.join(vendorRoot, "upstream");
  let lines: string[];
  try { lines = fs.readFileSync(inventoryFile, "utf8").trimEnd().split("\n").filter(Boolean); }
  catch (cause) { return failure("SOURCE_INTEGRITY_FAILED", "admit-owned-runtime", "source inventory is missing", cause); }
  const expected = new Map<string, string>();
  for (const line of lines) {
    const match = /^([a-f0-9]{64})  upstream\/(.+)$/.exec(line);
    const digest = match?.[1], relative = match?.[2];
    if (!digest || !relative || path.posix.normalize(relative) !== relative || relative.startsWith("../")) {
      failure("SOURCE_INTEGRITY_FAILED", "admit-owned-runtime", "source inventory contains an unsafe entry");
    }
    expected.set(relative, digest);
  }
  const actual = walk(upstreamRoot);
  if (actual.length !== expected.size || actual.some((relative) => !expected.has(relative))) {
    failure("SOURCE_INTEGRITY_FAILED", "admit-owned-runtime", "source inventory paths do not match the imported tree");
  }
  for (const relative of actual) {
    if (sha256File(path.join(upstreamRoot, relative)) !== expected.get(relative)) {
      failure("SOURCE_INTEGRITY_FAILED", "admit-owned-runtime", `source inventory mismatch: ${relative}`);
    }
  }
  return sha256File(inventoryFile);
}

function expectedProfile(vendorRoot: string): Readonly<{ digest: string; profile: Record<string, unknown> }> {
  const profileFile = path.join(vendorRoot, "agentbase/parser-profile.json");
  const patchFile = path.join(vendorRoot, "agentbase/patches/0001-parser-profile.patch");
  const profile = readJson(profileFile, "admit-owned-runtime");
  if (profile.id !== PROFILE_ID || profile.version !== PROFILE_VERSION || profile.upstreamCommit !== UPSTREAM_COMMIT) {
    failure("PROFILE_INTEGRITY_FAILED", "admit-owned-runtime", "parser profile identity does not match the accepted profile");
  }
  return { profile, digest: sha256(Buffer.concat([fs.readFileSync(profileFile), fs.readFileSync(patchFile)])) };
}

function expectedSurface(projectRoot: string): Readonly<{ manifest: string; schema: string }> {
  const file = path.join(projectRoot, "fixtures/codebase-memory-v0.10.8/mcp-surface.json");
  const surface = readJson(file, "admit-owned-runtime");
  const tools = Array.isArray(surface.tools) ? surface.tools.map(record) : [];
  const byName = new Map(tools.map((tool) => [tool.name, tool]));
  const selected = SAFE_TOOLS.map((name) => {
    const tool = byName.get(name);
    if (!tool) failure("OWNED_RUNTIME_INVALID", "admit-owned-runtime", `accepted provider manifest is missing ${name}`);
    return { name, inputSchema: tool.inputSchema };
  });
  return { manifest: sha256File(file), schema: sha256(canonical(selected)) };
}

export function ownedRuntimeTarget(platform: NodeJS.Platform, architecture: string): string {
  if (platform === "linux" && architecture === "x64") return "linux-x64";
  if (platform === "darwin" && architecture === "arm64") return "darwin-arm64";
  throw new CodebaseMemoryError("UNSUPPORTED_PLATFORM", "admit-owned-runtime", `unsupported platform: ${platform}-${architecture}`);
}

export async function verifyOwnedRuntimeBundle(options: OwnedRuntimeBundleOptions): Promise<OwnedRuntime> {
  const projectRoot = fs.realpathSync(options.projectRoot);
  const platform = options.platform ?? process.platform;
  const architecture = options.architecture ?? process.arch;
  ownedRuntimeTarget(platform, architecture);
  const vendorRoot = path.join(projectRoot, "vendor/codebase-memory");
  const sourceDigest = verifySource(vendorRoot);
  const profile = expectedProfile(vendorRoot);
  const surface = expectedSurface(projectRoot);
  const runtimeRoot = path.resolve(options.runtimeRoot);
  if (!runtimeRoot.startsWith(`${projectRoot}${path.sep}`)) {
    failure("OWNED_RUNTIME_INVALID", "admit-owned-runtime", "owned provider artifact root is outside AgentBase");
  }
  let runtimeMetadata: fs.Stats, runtimeLinkMetadata: fs.Stats;
  try {
    runtimeLinkMetadata = fs.lstatSync(runtimeRoot);
    runtimeMetadata = fs.statSync(runtimeRoot);
  } catch (cause) {
    return failure("OWNED_RUNTIME_MISSING", "admit-owned-runtime", "owned provider artifact root is missing", cause);
  }
  if (runtimeLinkMetadata.isSymbolicLink() || !runtimeMetadata.isDirectory()) {
    failure("OWNED_RUNTIME_INVALID", "admit-owned-runtime", "owned provider artifact root must be a regular directory");
  }
  const manifestFile = path.join(runtimeRoot, "artifact-manifest.json");
  const executable = path.join(runtimeRoot, PROVIDER);
  if (!fs.existsSync(manifestFile) || !fs.existsSync(executable)) {
    failure("OWNED_RUNTIME_MISSING", "admit-owned-runtime",
      "owned provider artifact executable or manifest is missing");
  }
  const entries = fs.readdirSync(runtimeRoot).sort();
  if (entries.length !== 2 || entries[0] !== "artifact-manifest.json" || entries[1] !== PROVIDER) {
    failure("OWNED_RUNTIME_INVALID", "admit-owned-runtime",
      "owned provider artifact root must contain only the executable and artifact manifest");
  }
  const manifest = readJson(manifestFile, "admit-owned-runtime");
  const expected = {
    schema_version: 1, provider: PROVIDER, provider_version: PROVIDER_VERSION,
    upstream_commit: UPSTREAM_COMMIT, source_digest: sourceDigest,
    profile_id: PROFILE_ID, profile_version: PROFILE_VERSION, profile_digest: profile.digest,
    platform, architecture, tool_manifest_sha256: surface.manifest,
    tool_schema_sha256: surface.schema, adapter_version: ADAPTER_VERSION,
  };
  for (const [key, value] of Object.entries(expected)) {
    if (manifest[key] === value) continue;
    if (key === "source_digest") failure("SOURCE_INTEGRITY_FAILED", "admit-owned-runtime", "artifact source identity does not match");
    if (key === "profile_digest" || key === "profile_id" || key === "profile_version") {
      failure("PROFILE_INTEGRITY_FAILED", "admit-owned-runtime", "artifact parser-profile identity does not match");
    }
    failure("OWNED_RUNTIME_INVALID", "admit-owned-runtime", `artifact manifest mismatch: ${key}`);
  }
  let metadata: fs.Stats;
  try {
    metadata = fs.statSync(executable);
    fs.accessSync(executable, fs.constants.X_OK);
  } catch (cause) {
    return failure("OWNED_RUNTIME_MISSING", "admit-owned-runtime", "owned provider artifact is missing or not executable", cause);
  }
  if (!metadata.isFile() || fs.lstatSync(executable).isSymbolicLink()) {
    failure("OWNED_RUNTIME_INVALID", "admit-owned-runtime", "owned provider artifact must be a regular file");
  }
  const executableSha256 = sha256File(executable);
  if (manifest.executable_sha256 !== executableSha256) {
    failure("EXECUTABLE_INTEGRITY_FAILED", "admit-owned-runtime", "owned provider artifact digest does not match its manifest");
  }
  const probe = await runBoundedProcess({
    executable, args: ["--version"], cwd: projectRoot, env: {}, operation: "provider-version",
    timeoutMs: 15_000, maximumStdoutBytes: 4_096, maximumStderrBytes: 16_384,
  });
  if (probe.stdout.trim() !== `${PROVIDER} ${PROVIDER_VERSION}`) {
    failure("EXECUTABLE_IDENTITY_FAILED", "provider-version", "owned provider artifact reported an incompatible identity");
  }
  return {
    runtimeRoot,
    executable,
    identity: {
      provider: PROVIDER,
      packageName: PROVIDER,
      providerVersion: PROVIDER_VERSION,
      packageIntegrity: `source-sha256:${sourceDigest};profile-sha256:${profile.digest}`,
      executableSha256,
      adapterVersion: ADAPTER_VERSION,
      invocationMode: "one-shot-cli",
    },
  };
}

export async function resolveOwnedRuntime(options: OwnedRuntimeOptions): Promise<OwnedRuntime> {
  const projectRoot = fs.realpathSync(options.projectRoot);
  const platform = options.platform ?? process.platform;
  const architecture = options.architecture ?? process.arch;
  const platformTarget = ownedRuntimeTarget(platform, architecture);
  return verifyOwnedRuntimeBundle({ ...options, projectRoot,
    runtimeRoot: path.join(projectRoot, "build/providers/codebase-memory", platformTarget) });
}
