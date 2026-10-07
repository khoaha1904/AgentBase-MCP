import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { gunzipSync } from "node:zlib";

import { isReleasedSkillCatalog } from "./product-skills.mjs";

const METADATA_FILES = new Set(["release-manifest.json", "sbom.cdx.json", "SHA256SUMS"]);
// This control file is copied outside the application tree during install, so
// its admitted release identity must remain self-contained.
export const AGENTBASE_OKF_RELEASE_PROFILE = "agentbase-okf@1.0";
export const RELEASE_CONTROL_FILES = Object.freeze([
  "client-registration.mjs",
  "command.mjs",
  "product-skills.mjs",
  "release-bundle.mjs",
  "release-control.mjs",
  "release-integration.mjs",
  "release-lifecycle.mjs",
]);
export const RELEASE_QUALIFICATION = Object.freeze({
  profile: "agentbase-release-ci-v1",
  status: "passed",
  gates: Object.freeze([
    "contract-check",
    "release-requirement-evidence",
    "repository-verification",
  ]),
});
const TARGETS = Object.freeze({
  "linux-x64": Object.freeze({ platform: "linux", architecture: "x64" }),
  "darwin-arm64": Object.freeze({ platform: "darwin", architecture: "arm64" }),
});

export function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function sha256File(file) {
  return sha256(fs.readFileSync(file));
}

function validRelative(relative) {
  return relative.length > 0
    && relative === relative.split(path.sep).join("/")
    && path.posix.normalize(relative) === relative
    && !relative.startsWith("../")
    && !path.posix.isAbsolute(relative)
    && !relative.includes("\0");
}

export function walkReleaseFiles(directory, prefix = "") {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walkReleaseFiles(absolute, relative));
    else if (entry.isFile()) files.push(relative);
    else throw new Error(`release tree contains a link or special file: ${relative}`);
  }
  return files;
}

function parseChecksums(source) {
  const entries = new Map();
  for (const line of source.trimEnd().split("\n")) {
    const match = /^([a-f0-9]{64})  (.+)$/.exec(line);
    if (!match || !validRelative(match[2]) || entries.has(match[2])) throw new Error("release checksum inventory is invalid");
    entries.set(match[2], match[1]);
  }
  return entries;
}

function tarString(block, offset, length) {
  const end = block.indexOf(0, offset);
  return block.subarray(offset, end >= offset && end < offset + length ? end : offset + length).toString("utf8");
}

function tarOctal(block, offset, length) {
  const value = tarString(block, offset, length).trim();
  if (!/^[0-7]+$/.test(value)) throw new Error("release archive contains an invalid tar number");
  return Number.parseInt(value, 8);
}

function parseArchive(archive) {
  const tar = gunzipSync(archive);
  const entries = [];
  const seen = new Set();
  let offset = 0, zeroBlocks = 0;
  while (offset + 512 <= tar.length) {
    const header = tar.subarray(offset, offset + 512);
    offset += 512;
    if (header.every((byte) => byte === 0)) {
      zeroBlocks += 1;
      if (zeroBlocks === 2) break;
      continue;
    }
    if (zeroBlocks) throw new Error("release archive has data after a zero tar block");
    const recordedChecksum = tarOctal(header, 148, 8);
    const checksumHeader = Buffer.from(header);
    checksumHeader.fill(0x20, 148, 156);
    if (recordedChecksum !== checksumHeader.reduce((sum, byte) => sum + byte, 0)) {
      throw new Error("release archive tar header checksum mismatch");
    }
    const name = tarString(header, 0, 100), prefix = tarString(header, 345, 155);
    const relative = prefix ? `${prefix}/${name}` : name;
    const type = String.fromCharCode(header[156]);
    const size = tarOctal(header, 124, 12), mode = tarOctal(header, 100, 8);
    if (!validRelative(relative) || (type !== "0" && type !== "\0") || seen.has(relative)) {
      throw new Error(`release archive contains an unsafe or duplicate entry: ${relative}`);
    }
    if (!Number.isSafeInteger(size) || size < 0 || offset + size > tar.length) throw new Error("release archive entry size is invalid");
    seen.add(relative);
    entries.push({ path: relative, mode, content: Buffer.from(tar.subarray(offset, offset + size)) });
    offset += Math.ceil(size / 512) * 512;
  }
  if (zeroBlocks !== 2 || offset > tar.length) throw new Error("release archive is incomplete");
  return entries;
}

export function verifyOuterChecksum(archiveFile) {
  const checksumFile = `${archiveFile}.sha256`;
  const match = /^([a-f0-9]{64})  ([^/\n]+)\n$/.exec(fs.readFileSync(checksumFile, "utf8"));
  if (!match || match[2] !== path.basename(archiveFile) || match[1] !== sha256File(archiveFile)) {
    throw new Error("release outer checksum is missing or invalid");
  }
  return match[1];
}

export function extractReleaseArchive(archiveFile, destination) {
  const entries = parseArchive(fs.readFileSync(archiveFile));
  const roots = new Set(entries.map((entry) => entry.path.split("/")[0]));
  if (roots.size !== 1) throw new Error("release archive must contain exactly one root");
  const releaseId = [...roots][0];
  if (!/^agentbase-mcp-[0-9]+\.[0-9]+\.[0-9]+-(?:linux-x64|darwin-arm64)$/.test(releaseId)) {
    throw new Error("release archive root identity is invalid");
  }
  const root = path.join(destination, releaseId);
  if (fs.existsSync(root)) throw new Error(`release extraction target already exists: ${root}`);
  for (const entry of entries) {
    const relative = entry.path.slice(releaseId.length + 1);
    if (!validRelative(relative)) throw new Error(`release archive contains an unsafe path: ${entry.path}`);
    const target = path.join(root, ...relative.split("/"));
    if (!target.startsWith(`${root}${path.sep}`)) throw new Error(`release archive escapes its root: ${entry.path}`);
    fs.mkdirSync(path.dirname(target), { recursive: true, mode: 0o755 });
    fs.writeFileSync(target, entry.content, { flag: "wx", mode: entry.mode });
    fs.chmodSync(target, entry.mode);
  }
  return root;
}

function exactArray(left, right) {
  return left.length === right.length && left.every((entry, index) => entry === right[index]);
}

function validateQualification(qualification, required) {
  if (qualification === undefined) {
    if (required) throw new Error("release manifest is not CI-qualified");
    return;
  }
  if (!qualification || typeof qualification !== "object"
    || !exactArray(Object.keys(qualification).sort(), ["gates", "profile", "status"])
    || qualification.profile !== RELEASE_QUALIFICATION.profile
    || qualification.status !== RELEASE_QUALIFICATION.status
    || !Array.isArray(qualification.gates)
    || !exactArray(qualification.gates, RELEASE_QUALIFICATION.gates)) {
    throw new Error("release CI qualification identity is invalid");
  }
}

function readJson(file, label) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch { throw new Error(`release ${label} is invalid`); }
}


export async function verifyExtractedRelease(root, expected = {}) {
  const metadata = fs.lstatSync(root);
  if (!metadata.isDirectory() || metadata.isSymbolicLink()) throw new Error("release root must be a regular directory");
  const files = walkReleaseFiles(root);
  const checksums = parseChecksums(fs.readFileSync(path.join(root, "SHA256SUMS"), "utf8"));
  const covered = files.filter((relative) => relative !== "SHA256SUMS");
  if (!exactArray([...checksums.keys()].sort(), [...covered].sort())) throw new Error("release checksum inventory does not match file closure");
  for (const [relative, digest] of checksums) {
    if (sha256File(path.join(root, ...relative.split("/"))) !== digest) throw new Error(`release checksum mismatch: ${relative}`);
  }

  const manifest = readJson(path.join(root, "release-manifest.json"), "manifest");
  const packageJson = readJson(path.join(root, "package.json"), "package metadata");
  if (manifest.schema_version !== 1 || manifest.product !== "agentbase-mcp"
    || !/^(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)$/.test(manifest.version)
    || packageJson.version !== manifest.version || manifest.release_id !== path.basename(root)
    || manifest.release_id !== `${manifest.product}-${manifest.version}-${manifest.target?.id}`) {
    throw new Error("release manifest product identity is invalid");
  }
  if (expected.releaseId && manifest.release_id !== expected.releaseId) throw new Error("release identity differs from requested release");
  if (expected.target && manifest.target?.id !== expected.target) throw new Error("release manifest target differs from requested target");
  validateQualification(manifest.qualification, expected.qualified === true);
  if (manifest.runtime?.lifecycle_api !== 1 || manifest.runtime?.integration_state_schema !== 1) {
    throw new Error("release lifecycle compatibility identity is invalid");
  }
  if (manifest.knowledge?.okf_base !== "0.2"
    || !exactArray(manifest.knowledge?.agentbase_profiles?.read ?? [], [AGENTBASE_OKF_RELEASE_PROFILE])
    || manifest.knowledge?.agentbase_profiles?.author !== AGENTBASE_OKF_RELEASE_PROFILE
    || manifest.knowledge?.qualified_scale !== null) {
    throw new Error("release knowledge compatibility identity is invalid");
  }
  const target = TARGETS[manifest.target?.id];
  if (!target || manifest.target.platform !== target.platform || manifest.target.architecture !== target.architecture) {
    throw new Error("release manifest target identity is invalid");
  }
  if (expected.host !== false && (target.platform !== process.platform || target.architecture !== process.arch)) {
    throw new Error(`release target does not match host: ${process.platform}-${process.arch}`);
  }
  const payload = files.filter((relative) => !METADATA_FILES.has(relative));
  const declared = Array.isArray(manifest.files) ? manifest.files : [];
  if (!exactArray(declared.map((entry) => entry.path), payload)) throw new Error("release manifest does not match payload closure");
  for (const entry of declared) {
    const file = path.join(root, ...entry.path.split("/")), fileMetadata = fs.statSync(file);
    if (entry.mode !== (fileMetadata.mode & 0o777) || entry.size !== fileMetadata.size || entry.sha256 !== sha256File(file)) {
      throw new Error(`release payload manifest mismatch: ${entry.path}`);
    }
  }
  const sbomFile = path.join(root, "sbom.cdx.json");
  if (sha256File(sbomFile) !== manifest.sbom?.sha256) throw new Error("release SBOM identity is invalid");
  const dependencies = manifest.dependencies?.packages ?? [];
  const dependencyPaths = dependencies.map((entry) => entry.path).sort();
  const dependencyReferences = dependencies.map((entry) => `${entry.name}@${entry.version}`).sort();
  const sbom = readJson(sbomFile, "SBOM");
  if (!exactArray(dependencyReferences, (sbom.components ?? []).map((entry) => entry["bom-ref"]).sort())) {
    throw new Error("release SBOM dependency closure is invalid");
  }
  for (const relative of payload.filter((entry) => entry.startsWith("node_modules/"))) {
    if (!dependencyPaths.some((packagePath) => relative === packagePath || relative.startsWith(`${packagePath}/`))) {
      throw new Error(`release contains an undeclared dependency file: ${relative}`);
    }
  }
  const forbidden = payload.find((relative) => relative.startsWith("vendor/codebase-memory/upstream/")
    || /(?:^|\/)testdata(?:\/|$)/.test(relative)
    || /(?:^|\/)test-support(?:\/|\.|$)/.test(relative)
    || relative.startsWith("src/") && /\.test\.(?:ts|mjs)$/.test(relative));
  if (forbidden) throw new Error(`release contains excluded content: ${forbidden}`);
  if (!isReleasedSkillCatalog(manifest.skills)) {
    throw new Error("release product skill catalog is invalid");
  }
  const expectedSkills = [...manifest.skills].sort();
  const packagedSkills = [...new Set(payload.filter((relative) => relative.startsWith(".agents/skills/"))
    .map((relative) => relative.split("/")[2]))].sort();
  if (!exactArray(packagedSkills, expectedSkills)
    || expectedSkills.some((name) => !payload.includes(`.agents/skills/${name}/SKILL.md`))) {
    throw new Error("release product skill payload is invalid");
  }
  if (RELEASE_CONTROL_FILES.some((name) => !payload.includes(`scripts/installation/${name}`))) {
    throw new Error("release lifecycle control closure is invalid");
  }
  const smoke = spawnSync(process.execPath, [path.join(root, "src/cli.ts"), "--help"], {
    cwd: root, encoding: "utf8", env: { PATH: process.env.PATH ?? "" }, maxBuffer: 1024 * 1024,
  });
  if (smoke.status !== 0 || !smoke.stdout.startsWith("AgentBase CLI\n")) {
    throw new Error(`release CLI smoke failed: ${(smoke.stderr || smoke.stdout).trim()}`);
  }
  return manifest;
}

export const releaseTargets = TARGETS;
