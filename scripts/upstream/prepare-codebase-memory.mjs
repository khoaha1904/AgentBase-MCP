#!/usr/bin/env node
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "../..");
const provider = "codebase-memory-mcp";
const providerVersion = "0.10.8";
const upstreamCommit = "46ae198fc11cda80e817acbc5f5908d7c2de7032";
const adapterVersion = 1;
const profileFile = path.join(root, "vendor/codebase-memory/agentbase/parser-profile.json");
const patchFile = path.join(root, "vendor/codebase-memory/agentbase/patches/0001-parser-profile.patch");
const inventoryFile = path.join(root, "vendor/codebase-memory/inventory.sha256");
const upstreamDirectory = path.join(root, "vendor/codebase-memory/upstream");
const acceptedSurfaceFile = path.join(root, "src/providers/codebase-memory/contracts/v0.10.8/mcp-surface.json");
const selectedToolNames = [
  "index_repository", "search_graph", "trace_path", "get_code_snippet",
  "get_architecture", "search_code", "index_status", "check_index_coverage",
  "detect_changes",
];

function fail(message) { throw new Error(message); }
function sha256(data) { return createHash("sha256").update(data).digest("hex"); }
function sha256File(file) { return sha256(fs.readFileSync(file)); }
function readJson(file) { return JSON.parse(fs.readFileSync(file, "utf8")); }

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value).sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${canonical(entry)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function platformIdentity() {
  const identity = `${process.platform}-${process.arch}`;
  if (identity !== "linux-x64" && identity !== "darwin-arm64") fail(`unsupported platform: ${identity}`);
  return identity;
}

function toolVersion(executable, args = ["--version"]) {
  try {
    return execFileSync(executable, args, { encoding: "utf8", timeout: 15_000 }).trim().split("\n")[0];
  } catch (cause) {
    fail(`required build tool is unavailable: ${executable} (${cause instanceof Error ? cause.message : "unknown error"})`);
  }
}

function preflight() {
  const [major, minor] = process.versions.node.split(".").map(Number);
  if (major !== 24 || minor < 12) fail(`Node >=24.12 <25 is required; received ${process.versions.node}`);
  const cc = process.env.CC || "cc";
  const cxx = process.env.CXX || "c++";
  const tools = {
    node: process.version,
    git: toolVersion("git"),
    make: toolVersion("make"),
    patch: toolVersion("patch"),
    cc: toolVersion(cc),
    cxx: toolVersion(cxx),
  };
  const probeDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-native-probe-"));
  const probe = path.join(probeDirectory, "zlib-probe");
  try {
    execFileSync(cc, ["-x", "c", "-", "-lz", "-o", probe], {
      input: "#include <zlib.h>\nint main(void){return zlibVersion()==0;}\n",
      stdio: ["pipe", "pipe", "pipe"], timeout: 30_000,
    });
  } catch (cause) {
    fail(`native zlib headers/library are unavailable (${cause instanceof Error ? cause.message : "compile failed"})`);
  } finally {
    fs.rmSync(probeDirectory, { recursive: true, force: true });
  }
  return { platform: platformIdentity(), cc, cxx, tools };
}

function verifyInventory() {
  execFileSync(process.execPath, [path.join(root, "scripts/upstream/manage-upstreams.mjs"), "verify", "codebase-memory"], {
    cwd: root, stdio: "pipe", timeout: 60_000,
  });
}

function generateGrammarStubs(staging, profile) {
  const specs = fs.readFileSync(path.join(staging, "internal/cbm/lang_specs.c"), "utf8");
  const declared = [...specs.matchAll(/^extern const TSLanguage \*(tree_sitter_[A-Za-z0-9_]+)\(void\);$/gm)]
    .map((match) => match[1]);
  const selected = new Set(profile.languages.map((language) => language.factory));
  for (const factory of selected) {
    if (!declared.includes(factory)) fail(`profile factory is not declared upstream: ${factory}`);
  }
  const unavailable = [...new Set(declared.filter((factory) => !selected.has(factory)))].sort();
  const generatedDirectory = path.join(staging, ".agentbase-generated");
  fs.mkdirSync(generatedDirectory, { recursive: true, mode: 0o700 });
  const output = path.join(generatedDirectory, "grammar-profile-stubs.c");
  fs.writeFileSync(output,
    "/* Generated from parser-profile.json; omitted factories are intentionally unavailable. */\n" +
    "#include \"tree_sitter/api.h\"\n\n" +
    unavailable.map((factory) => `const TSLanguage *${factory}(void) { return 0; }`).join("\n") + "\n",
    { mode: 0o600 });
  return { relative: ".agentbase-generated/grammar-profile-stubs.c", omittedFactories: unavailable.length };
}

function safeToolSchemas(surface) {
  const byName = new Map(surface.tools.map((tool) => [tool.name, tool]));
  return selectedToolNames.map((name) => {
    const tool = byName.get(name);
    if (!tool) fail(`built provider is missing ${name}`);
    return { name, inputSchema: tool.inputSchema };
  });
}

function probeSurface(binary, staging) {
  const captured = path.join(staging, "captured-surface.json");
  execFileSync(process.execPath, [path.join(root, "scripts/benchmark/capture-codebase-memory-mcp-surface.mjs")], {
    cwd: root,
    env: { ...process.env, AGENTBASE_CBM_BINARY: binary, AGENTBASE_CBM_VERSION: providerVersion,
      AGENTBASE_CBM_TARGET: captured },
    stdio: ["ignore", "ignore", "pipe"], timeout: 60_000,
  });
  const accepted = readJson(acceptedSurfaceFile);
  const actual = readJson(captured);
  if (canonical(safeToolSchemas(actual)) !== canonical(safeToolSchemas(accepted))) {
    fail("built provider tool schema does not match the accepted v0.10.8 surface");
  }
  return sha256(canonical(safeToolSchemas(actual)));
}

export function activatePreparedDirectory(next, destination, rename = fs.renameSync) {
  const backup = path.join(path.dirname(destination), `.${path.basename(destination)}-previous`);
  fs.rmSync(backup, { recursive: true, force: true });
  const hadPrevious = fs.existsSync(destination);
  if (hadPrevious) rename(destination, backup);
  try {
    rename(next, destination);
    fs.rmSync(backup, { recursive: true, force: true });
  } catch (error) {
    if (hadPrevious && !fs.existsSync(destination) && fs.existsSync(backup)) rename(backup, destination);
    throw error;
  }
}

function publish(binary, manifest, target) {
  const parent = path.join(root, "build/providers/codebase-memory");
  fs.mkdirSync(parent, { recursive: true, mode: 0o700 });
  const next = fs.mkdtempSync(path.join(parent, `.${target}-next-`));
  const destination = path.join(parent, target);
  try {
    fs.copyFileSync(binary, path.join(next, provider));
    fs.chmodSync(path.join(next, provider), 0o755);
    fs.writeFileSync(path.join(next, "artifact-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, { mode: 0o600 });
    activatePreparedDirectory(next, destination);
  } finally {
    fs.rmSync(next, { recursive: true, force: true });
  }
  return destination;
}

export function prepareCodebaseMemory() {
  const environment = preflight();
  verifyInventory();
  const profile = readJson(profileFile);
  if (profile.upstreamCommit !== upstreamCommit || !profile.supportedPlatforms.includes(environment.platform)) {
    fail("parser profile identity does not admit this source/platform");
  }
  const staging = path.join(root, "build/upstreams/codebase-memory", environment.platform);
  fs.rmSync(staging, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(staging), { recursive: true, mode: 0o700 });
  fs.cpSync(upstreamDirectory, staging, { recursive: true, preserveTimestamps: true });
  execFileSync("patch", ["--dry-run", "--batch", "--fuzz=0", "-p1", "-i", patchFile], {
    cwd: staging, stdio: "pipe", timeout: 30_000,
  });
  execFileSync("patch", ["--batch", "--fuzz=0", "-p1", "-i", patchFile], {
    cwd: staging, stdio: "pipe", timeout: 30_000,
  });
  const generated = generateGrammarStubs(staging, profile);
  const build = spawnSync(path.join(staging, "scripts/build.sh"), [
    "--version", `v${providerVersion}`, "BUILD_DIR=build/agentbase",
    `AGENTBASE_GRAMMAR_STUB_SRC=${generated.relative}`,
  ], {
    cwd: staging, env: { ...process.env, CBM_NO_CCACHE: "1", CC: environment.cc, CXX: environment.cxx },
    stdio: "inherit",
  });
  if (build.error || build.status !== 0) fail(`Codebase Memory build failed (${build.signal || build.status || "spawn"})`);
  const binary = path.join(staging, "build/agentbase/codebase-memory-mcp");
  const reportedVersion = execFileSync(binary, ["--version"], { encoding: "utf8", timeout: 15_000 }).trim();
  if (reportedVersion !== `${provider} ${providerVersion}`) fail(`unexpected provider identity: ${reportedVersion}`);
  const toolSchemaSha256 = probeSurface(binary, staging);
  const profileDigest = sha256(Buffer.concat([fs.readFileSync(profileFile), fs.readFileSync(patchFile)]));
  const manifest = {
    schema_version: 1,
    provider,
    provider_version: providerVersion,
    upstream_commit: upstreamCommit,
    source_digest: sha256File(inventoryFile),
    profile_id: profile.id,
    profile_version: profile.version,
    profile_digest: profileDigest,
    platform: process.platform,
    architecture: process.arch,
    executable_sha256: sha256File(binary),
    tool_manifest_sha256: sha256File(acceptedSurfaceFile),
    tool_schema_sha256: toolSchemaSha256,
    adapter_version: adapterVersion,
    build_identity: environment.tools,
    omitted_grammar_factories: generated.omittedFactories,
  };
  const destination = publish(binary, manifest, environment.platform);
  verifyInventory();
  process.stdout.write(`${destination}\n`);
  return { destination, manifest };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try { prepareCodebaseMemory(); }
  catch (error) {
    process.stderr.write(`Codebase Memory preparation failed: ${error instanceof Error ? error.message : "unknown error"}\n`);
    process.exitCode = 1;
  }
}
