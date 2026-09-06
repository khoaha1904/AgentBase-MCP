import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { gzipSync } from "node:zlib";

import { AGENTBASE_VERSION } from "../../src/product-version.ts";
import { AGENTBASE_MCP_PROTOCOL_VERSIONS } from "../../src/app/codebase-memory-mcp/protocol-policy.ts";
import { AGENTBASE_OKF_PROFILE } from "../../src/core/knowledge/index.ts";
import { ownedRuntimeTarget, verifyOwnedRuntimeBundle } from "../../src/providers/codebase-memory/owned-runtime.ts";
import { PRODUCT_SKILL_NAMES } from "../installation/product-skills.mjs";
import {
  AGENTBASE_OKF_RELEASE_PROFILE,
  extractReleaseArchive,
  RELEASE_CONTROL_FILES,
  RELEASE_QUALIFICATION,
  verifyExtractedRelease,
} from "../installation/release-bundle.mjs";

const PRODUCT = "agentbase-mcp";
const AGENTBASE_OKF_SOURCE_PROFILE = `${AGENTBASE_OKF_PROFILE.id}@${AGENTBASE_OKF_PROFILE.version}`;
const METADATA_FILES = new Set(["release-manifest.json", "sbom.cdx.json", "SHA256SUMS"]);
const RELEASED_SKILLS = Object.freeze([...PRODUCT_SKILL_NAMES].sort());
const TARGETS = Object.freeze({
  "linux-x64": Object.freeze({ platform: "linux", architecture: "x64" }),
  "darwin-arm64": Object.freeze({ platform: "darwin", architecture: "arm64" }),
});

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function sha256File(file) {
  return sha256(fs.readFileSync(file));
}

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => [key, canonical(entry)]));
  }
  return value;
}

function canonicalJson(value) {
  return `${JSON.stringify(canonical(value), null, 2)}\n`;
}

function command(commandName, args, options = {}) {
  const result = spawnSync(commandName, args, {
    cwd: options.cwd,
    encoding: "utf8",
    env: options.env ?? process.env,
    maxBuffer: 32 * 1024 * 1024,
  });
  if (result.status !== 0) {
    const detail = (result.stderr || result.stdout || "no command output").trim();
    throw new Error(`${commandName} ${args.join(" ")} failed: ${detail}`);
  }
  return result.stdout;
}

function validRelative(relative) {
  return relative.length > 0
    && relative === relative.split(path.sep).join("/")
    && path.posix.normalize(relative) === relative
    && !relative.startsWith("../")
    && !path.posix.isAbsolute(relative)
    && !relative.includes("\0");
}

function walkFiles(directory, prefix = "") {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walkFiles(absolute, relative));
    else if (entry.isFile()) files.push(relative);
    else throw new Error(`release tree contains a link or special file: ${relative}`);
  }
  return files;
}

function normalizeTree(directory, executablePaths = new Set()) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      fs.chmodSync(absolute, 0o755);
      normalizeTree(absolute, executablePaths);
    } else if (entry.isFile()) {
      const relative = path.relative(directory, absolute);
      fs.chmodSync(absolute, executablePaths.has(absolute) || executablePaths.has(relative) ? 0o755 : 0o644);
    } else {
      throw new Error(`release tree contains a link or special file: ${absolute}`);
    }
  }
}

function copyTree(source, destination, options = {}) {
  if (!fs.statSync(source).isDirectory() || fs.lstatSync(source).isSymbolicLink()) {
    throw new Error(`release input must be a regular directory: ${source}`);
  }
  fs.mkdirSync(destination, { recursive: true, mode: 0o755 });
  for (const entry of fs.readdirSync(source, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const relative = options.prefix ? `${options.prefix}/${entry.name}` : entry.name;
    if (options.include && !options.include(relative, entry)) continue;
    const from = path.join(source, entry.name);
    const to = path.join(destination, entry.name);
    if (entry.isDirectory()) copyTree(from, to, { ...options, prefix: relative });
    else if (entry.isFile()) fs.copyFileSync(from, to);
    else throw new Error(`release input contains a link or special file: ${relative}`);
  }
}

function copyFile(source, destination, mode = 0o644) {
  const metadata = fs.lstatSync(source);
  if (!metadata.isFile() || metadata.isSymbolicLink()) throw new Error(`release input must be a regular file: ${source}`);
  fs.mkdirSync(path.dirname(destination), { recursive: true, mode: 0o755 });
  fs.copyFileSync(source, destination);
  fs.chmodSync(destination, mode);
}

function sourceIncluded(relative) {
  const segments = relative.split("/");
  const basename = segments.at(-1) ?? "";
  return !segments.includes("testdata")
    && !segments.includes("test-support")
    && basename !== "test-support.ts"
    && !/\.test\.(?:ts|mjs)$/.test(basename);
}

function readProductMetadata(projectRoot) {
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, "package.json"), "utf8"));
  const packageLock = JSON.parse(fs.readFileSync(path.join(projectRoot, "package-lock.json"), "utf8"));
  const rootLock = packageLock.packages?.[""];
  const versionSource = fs.readFileSync(path.join(projectRoot, "src/product-version.ts"), "utf8");
  const checkedVersion = /AGENTBASE_VERSION\s*=\s*"([^"]+)"/.exec(versionSource)?.[1];
  if (packageJson.version !== AGENTBASE_VERSION || packageLock.version !== AGENTBASE_VERSION
    || rootLock?.version !== AGENTBASE_VERSION || checkedVersion !== AGENTBASE_VERSION) {
    throw new Error("product version differs between source constant, package and lockfile");
  }
  return { packageJson, packageLock };
}

function releasePackage(packageJson) {
  return {
    name: packageJson.name,
    version: packageJson.version,
    private: true,
    description: packageJson.description,
    license: packageJson.license,
    bin: packageJson.bin,
    type: packageJson.type,
    engines: packageJson.engines,
    dependencies: packageJson.dependencies,
  };
}

function productionPackages(projectRoot) {
  const output = command("npm", ["ls", "--parseable", "--all", "--omit=dev"], { cwd: projectRoot });
  const nodeModulesRoot = path.join(projectRoot, "node_modules");
  const prefix = `${nodeModulesRoot}${path.sep}`;
  const packageDirectories = output.trim().split("\n").filter(Boolean).filter((entry) => path.resolve(entry) !== projectRoot);
  if (!packageDirectories.length) throw new Error("installed production dependency closure is empty");
  return packageDirectories.map((directory) => {
    const absolute = fs.realpathSync(directory);
    if (!absolute.startsWith(prefix)) throw new Error(`production dependency is outside node_modules: ${directory}`);
    const relative = path.relative(nodeModulesRoot, absolute).split(path.sep).join("/");
    if (!validRelative(relative)) throw new Error(`unsafe production dependency path: ${relative}`);
    const metadata = JSON.parse(fs.readFileSync(path.join(absolute, "package.json"), "utf8"));
    if (typeof metadata.name !== "string" || typeof metadata.version !== "string") {
      throw new Error(`production dependency has invalid package metadata: ${relative}`);
    }
    return { name: metadata.name, version: metadata.version, path: `node_modules/${relative}`, source: absolute };
  }).sort((left, right) => left.path.localeCompare(right.path));
}

function deterministicUuid(seed) {
  const bytes = Buffer.from(sha256(seed).slice(0, 32), "hex");
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const value = bytes.toString("hex");
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`;
}

function buildSbom(projectRoot, source, target, dependencies) {
  const raw = command("npm", ["sbom", "--package-lock-only", "--sbom-format", "cyclonedx", "--sbom-type", "application"],
    { cwd: projectRoot });
  const sbom = JSON.parse(raw);
  const missing = new Set(dependencies.map((dependency) => `${dependency.name}@${dependency.version}`));
  sbom.components = (sbom.components ?? []).filter((component) => missing.has(component["bom-ref"]));
  if (sbom.components.some((component) => !missing.delete(component["bom-ref"])) || missing.size !== 0) {
    throw new Error("CycloneDX component closure differs from installed production dependencies");
  }
  const rootReference = sbom.metadata?.component?.["bom-ref"];
  const productionReferences = new Set(sbom.components.map((component) => component["bom-ref"]));
  sbom.dependencies = (sbom.dependencies ?? []).filter((dependency) => dependency.ref === rootReference
    || productionReferences.has(dependency.ref)).map((dependency) => ({
    ...dependency,
    dependsOn: (dependency.dependsOn ?? []).filter((reference) => productionReferences.has(reference)),
  }));
  sbom.serialNumber = `urn:uuid:${deterministicUuid(`${source.commit}:${AGENTBASE_VERSION}:${target}`)}`;
  sbom.metadata = {
    ...sbom.metadata,
    timestamp: new Date(source.committedAt * 1000).toISOString(),
    tools: [{ vendor: "AgentBase", name: "release-builder", version: AGENTBASE_VERSION }],
  };
  if (Array.isArray(sbom.components)) {
    sbom.components.sort((left, right) => String(left["bom-ref"] ?? "").localeCompare(String(right["bom-ref"] ?? "")));
  }
  if (Array.isArray(sbom.dependencies)) {
    sbom.dependencies.sort((left, right) => String(left.ref ?? "").localeCompare(String(right.ref ?? "")));
    for (const dependency of sbom.dependencies) {
      if (Array.isArray(dependency.dependsOn)) dependency.dependsOn.sort();
    }
  }
  return canonicalJson(sbom);
}

export function resolveSourceIdentity(projectRoot, injected) {
  if (injected !== undefined) {
    if (!/^[a-f0-9]{40}$/.test(injected.commit) || !Number.isSafeInteger(injected.committedAt) || injected.committedAt <= 0) {
      throw new Error("injected source identity is invalid");
    }
    return Object.freeze({ commit: injected.commit, committedAt: injected.committedAt });
  }
  const dirty = command("git", ["status", "--porcelain=v1", "--untracked-files=all"], { cwd: projectRoot });
  if (dirty.trim()) throw new Error("public release build requires a clean Git worktree");
  const commit = command("git", ["rev-parse", "HEAD"], { cwd: projectRoot }).trim();
  const committedAt = Number(command("git", ["show", "-s", "--format=%ct", "HEAD"], { cwd: projectRoot }).trim());
  if (!/^[a-f0-9]{40}$/.test(commit) || !Number.isSafeInteger(committedAt) || committedAt <= 0) {
    throw new Error("cannot resolve exact Git source identity");
  }
  return Object.freeze({ commit, committedAt });
}

function payloadManifest(root) {
  return walkFiles(root).filter((relative) => !METADATA_FILES.has(relative)).map((relative) => {
    const file = path.join(root, ...relative.split("/"));
    const metadata = fs.statSync(file);
    return {
      path: relative,
      mode: metadata.mode & 0o777,
      size: metadata.size,
      sha256: sha256File(file),
    };
  });
}

function writeInternalChecksums(root) {
  const files = walkFiles(root).filter((relative) => relative !== "SHA256SUMS");
  const content = files.map((relative) => `${sha256File(path.join(root, ...relative.split("/")))}  ${relative}`).join("\n");
  fs.writeFileSync(path.join(root, "SHA256SUMS"), `${content}\n`, { mode: 0o644 });
}

function writeTarString(header, offset, length, value) {
  const data = Buffer.from(value);
  if (data.length > length) throw new Error(`tar value is too long: ${value}`);
  data.copy(header, offset);
}

function writeTarOctal(header, offset, length, value) {
  const octal = value.toString(8).padStart(length - 1, "0");
  if (octal.length >= length) throw new Error(`tar numeric value is too large: ${value}`);
  writeTarString(header, offset, length, `${octal}\0`);
}

function splitTarPath(relative) {
  if (Buffer.byteLength(relative) <= 100) return { name: relative, prefix: "" };
  for (let index = relative.lastIndexOf("/"); index > 0; index = relative.lastIndexOf("/", index - 1)) {
    const prefix = relative.slice(0, index), name = relative.slice(index + 1);
    if (Buffer.byteLength(prefix) <= 155 && Buffer.byteLength(name) <= 100) return { name, prefix };
  }
  throw new Error(`release path is too long for ustar: ${relative}`);
}

function tarHeader(relative, size, mode, mtime) {
  const header = Buffer.alloc(512);
  const fields = splitTarPath(relative);
  writeTarString(header, 0, 100, fields.name);
  writeTarOctal(header, 100, 8, mode);
  writeTarOctal(header, 108, 8, 0);
  writeTarOctal(header, 116, 8, 0);
  writeTarOctal(header, 124, 12, size);
  writeTarOctal(header, 136, 12, mtime);
  header.fill(0x20, 148, 156);
  header[156] = "0".charCodeAt(0);
  writeTarString(header, 257, 6, "ustar\0");
  writeTarString(header, 263, 2, "00");
  writeTarString(header, 345, 155, fields.prefix);
  const checksum = header.reduce((sum, byte) => sum + byte, 0);
  writeTarString(header, 148, 8, `${checksum.toString(8).padStart(6, "0")}\0 `);
  return header;
}

function createArchive(root, releaseId, mtime) {
  const parts = [];
  for (const relative of walkFiles(root)) {
    const content = fs.readFileSync(path.join(root, ...relative.split("/")));
    const mode = fs.statSync(path.join(root, ...relative.split("/"))).mode & 0o777;
    parts.push(tarHeader(`${releaseId}/${relative}`, content.length, mode, mtime), content);
    const remainder = content.length % 512;
    if (remainder) parts.push(Buffer.alloc(512 - remainder));
  }
  parts.push(Buffer.alloc(1024));
  return gzipSync(Buffer.concat(parts), { level: 9, mtime: 0 });
}

function assemblePayload(projectRoot, root, target, dependencies, packageJson) {
  copyTree(path.join(projectRoot, "src"), path.join(root, "src"), { include: sourceIncluded });
  for (const skill of RELEASED_SKILLS) {
    copyTree(path.join(projectRoot, ".agents/skills", skill), path.join(root, ".agents/skills", skill));
  }
  copyTree(path.join(projectRoot, "assets"), path.join(root, "assets"));
  for (const name of ["README.md", "LICENSE"]) copyFile(path.join(projectRoot, name), path.join(root, name));
  for (const name of RELEASE_CONTROL_FILES) {
    copyFile(path.join(projectRoot, "scripts/installation", name), path.join(root, "scripts/installation", name));
  }
  fs.writeFileSync(path.join(root, "install.sh"), `#!/bin/sh
set -eu
agentbase_release_root="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
exec node "$agentbase_release_root/scripts/installation/release-control.mjs" install --release-root "$agentbase_release_root" "$@"
`, { mode: 0o755 });
  fs.writeFileSync(path.join(root, "package.json"), canonicalJson(releasePackage(packageJson)), { mode: 0o644 });

  for (const dependency of dependencies) {
    copyTree(dependency.source, path.join(root, ...dependency.path.split("/")), {
      include: (relative) => !relative.split("/").includes("node_modules"),
    });
  }
  const vendorRoot = path.join(projectRoot, "vendor/codebase-memory");
  for (const name of ["UPSTREAM.md", "inventory.sha256"]) copyFile(path.join(vendorRoot, name), path.join(root, "vendor/codebase-memory", name));
  copyTree(path.join(vendorRoot, "agentbase"), path.join(root, "vendor/codebase-memory/agentbase"));
  copyTree(path.join(vendorRoot, "artifacts", target), path.join(root, "vendor/codebase-memory/artifacts", target));

  normalizeTree(root);
  fs.chmodSync(path.join(root, "install.sh"), 0o755);
  fs.chmodSync(path.join(root, "src/cli.ts"), 0o755);
  fs.chmodSync(path.join(root, "vendor/codebase-memory/artifacts", target, "codebase-memory-mcp"), 0o755);
}

export async function buildReleaseArtifact(options) {
  if (AGENTBASE_OKF_SOURCE_PROFILE !== AGENTBASE_OKF_RELEASE_PROFILE) {
    throw new Error("release Profile identity differs from the source Profile contract");
  }
  const projectRoot = fs.realpathSync(options.projectRoot);
  const targetId = options.target ?? ownedRuntimeTarget(process.platform, process.arch);
  const target = TARGETS[targetId];
  if (!target) throw new Error(`unsupported release target: ${targetId}`);
  if (target.platform !== process.platform || target.architecture !== process.arch) {
    throw new Error(`release target must match the build host: ${process.platform}-${process.arch}`);
  }
  const source = resolveSourceIdentity(projectRoot, options.sourceIdentity);
  const { packageJson } = readProductMetadata(projectRoot);
  const dependencies = productionPackages(projectRoot);
  const providerRoot = path.join(projectRoot, "vendor/codebase-memory/artifacts", targetId);
  await verifyOwnedRuntimeBundle({ projectRoot, runtimeRoot: providerRoot, ...target });

  const outputDirectory = path.resolve(options.outputDirectory);
  fs.mkdirSync(outputDirectory, { recursive: true, mode: 0o755 });
  const releaseId = `${PRODUCT}-${AGENTBASE_VERSION}-${targetId}`;
  const archive = path.join(outputDirectory, `${releaseId}.tar.gz`);
  const outerChecksum = `${archive}.sha256`;
  if (fs.existsSync(archive) || fs.existsSync(outerChecksum)) throw new Error(`release output already exists: ${archive}`);

  const staging = fs.mkdtempSync(path.join(outputDirectory, ".agentbase-release-"));
  const root = path.join(staging, releaseId);
  const extraction = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-release-verify-"));
  let archivePublished = false;
  try {
    fs.mkdirSync(root, { recursive: true, mode: 0o755 });
    assemblePayload(projectRoot, root, targetId, dependencies, packageJson);
    const sbom = buildSbom(projectRoot, source, targetId, dependencies);
    fs.writeFileSync(path.join(root, "sbom.cdx.json"), sbom, { mode: 0o644 });
    const manifest = {
      schema_version: 1,
      product: PRODUCT,
      version: AGENTBASE_VERSION,
      release_id: releaseId,
      source: { commit: source.commit, committed_at: new Date(source.committedAt * 1000).toISOString() },
      target: { id: targetId, ...target },
      runtime: {
        node: packageJson.engines.node,
        entrypoint: "src/cli.ts",
        mcp_protocol_eras: [...AGENTBASE_MCP_PROTOCOL_VERSIONS],
        local_state_schema: 1,
        lifecycle_api: 1,
        integration_state_schema: 1,
      },
      knowledge: {
        okf_base: "0.2",
        agentbase_profiles: { read: [AGENTBASE_OKF_RELEASE_PROFILE], author: AGENTBASE_OKF_RELEASE_PROFILE },
        qualified_scale: null,
      },
      ...(options.qualified === true ? { qualification: RELEASE_QUALIFICATION } : {}),
      dependencies: { packages: dependencies.map(({ name, version, path: packagePath }) => ({ name, version, path: packagePath })) },
      skills: [...RELEASED_SKILLS],
      sbom: { path: "sbom.cdx.json", format: "CycloneDX-1.5-json", sha256: sha256(sbom) },
      files: payloadManifest(root),
    };
    fs.writeFileSync(path.join(root, "release-manifest.json"), canonicalJson(manifest), { mode: 0o644 });
    writeInternalChecksums(root);
    await verifyExtractedRelease(root, { target: targetId, qualified: options.qualified === true });

    const archiveBytes = createArchive(root, releaseId, source.committedAt);
    const temporaryArchive = path.join(staging, `${releaseId}.tar.gz`);
    fs.writeFileSync(temporaryArchive, archiveBytes, { mode: 0o644 });
    const extractedRoot = extractReleaseArchive(temporaryArchive, extraction);
    await verifyExtractedRelease(extractedRoot, { target: targetId, qualified: options.qualified === true });
    const archiveDigest = sha256(archiveBytes);
    if (sha256File(temporaryArchive) !== archiveDigest) throw new Error("written release archive checksum mismatch");
    const temporaryChecksum = path.join(staging, `${releaseId}.tar.gz.sha256`);
    const checksumContent = `${archiveDigest}  ${path.basename(archive)}\n`;
    fs.writeFileSync(temporaryChecksum, checksumContent, { mode: 0o644 });
    if (fs.readFileSync(temporaryChecksum, "utf8") !== checksumContent) throw new Error("written outer checksum differs from release digest");
    fs.linkSync(temporaryArchive, archive);
    archivePublished = true;
    fs.linkSync(temporaryChecksum, outerChecksum);
    return Object.freeze({ archive, outerChecksum, sha256: archiveDigest, releaseId });
  } catch (error) {
    if (archivePublished) fs.rmSync(archive, { force: true });
    fs.rmSync(outerChecksum, { force: true });
    throw error;
  } finally {
    fs.rmSync(staging, { recursive: true, force: true });
    fs.rmSync(extraction, { recursive: true, force: true });
  }
}

export const releaseContract = Object.freeze({ product: PRODUCT, version: AGENTBASE_VERSION, skills: RELEASED_SKILLS, targets: TARGETS });

export { extractReleaseArchive, verifyExtractedRelease } from "../installation/release-bundle.mjs";
