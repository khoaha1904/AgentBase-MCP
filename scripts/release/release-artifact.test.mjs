import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { gzipSync } from "node:zlib";

import {
  buildReleaseArtifact,
  extractReleaseArchive,
  releaseContract,
  resolveSourceIdentity,
  verifyExtractedRelease,
} from "./release-artifact.mjs";
import { verifyOuterChecksum } from "../installation/release-bundle.mjs";

const projectRoot = path.resolve(import.meta.dirname, "../..");
const sourceIdentity = Object.freeze({ commit: "a".repeat(40), committedAt: 1_788_457_430 });

function sha256File(file) {
  return createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function filesEqual(left, right) {
  const leftDescriptor = fs.openSync(left, "r"), rightDescriptor = fs.openSync(right, "r");
  const leftBuffer = Buffer.alloc(1024 * 1024), rightBuffer = Buffer.alloc(1024 * 1024);
  try {
    while (true) {
      const leftBytes = fs.readSync(leftDescriptor, leftBuffer, 0, leftBuffer.length, null);
      const rightBytes = fs.readSync(rightDescriptor, rightBuffer, 0, rightBuffer.length, null);
      if (leftBytes !== rightBytes) return false;
      if (leftBytes === 0) return true;
      if (!leftBuffer.subarray(0, leftBytes).equals(rightBuffer.subarray(0, rightBytes))) return false;
    }
  } finally {
    fs.closeSync(leftDescriptor);
    fs.closeSync(rightDescriptor);
  }
}

function runGit(root, args) {
  const result = spawnSync("git", args, { cwd: root, encoding: "utf8" });
  if (result.status !== 0) throw new Error(result.stderr);
  return result.stdout.trim();
}

function createFakeCodex(root) {
  const bin = path.join(root, "bin"), executable = path.join(bin, "codex");
  fs.mkdirSync(bin, { recursive: true });
  fs.writeFileSync(executable, `#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const file = path.join(process.env.CODEX_HOME, "config.toml");
const args = process.argv.slice(2);
const read = () => fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : {};
const write = (value) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(value)); };
if (args.length === 1 && args[0] === "--version") process.stdout.write("codex 1.0.0\\n");
else if (args.join(" ") === "mcp add --help") process.stdout.write("Usage: codex mcp add\\n");
else if (args.join(" ") === "mcp list --json") {
  const entry = read().agentbase;
  process.stdout.write(JSON.stringify(entry ? [{ name: "agentbase", transport: { type: "stdio", command: entry.command, args: entry.args, env: {}, env_vars: [] } }] : []));
} else if (args[0] === "mcp" && args[1] === "add" && args[2] === "agentbase" && args[3] === "--") {
  write({ agentbase: { command: args[4], args: args.slice(5) } });
} else if (args.join(" ") === "mcp remove agentbase") write({});
else process.exitCode = 2;
`, { mode: 0o700 });
  return bin;
}

function octal(header, offset, length, value) {
  Buffer.from(`${value.toString(8).padStart(length - 1, "0")}\0`).copy(header, offset);
}

function unsafeArchive(file) {
  const header = Buffer.alloc(512);
  Buffer.from("../escape").copy(header, 0);
  octal(header, 100, 8, 0o644);
  octal(header, 108, 8, 0);
  octal(header, 116, 8, 0);
  octal(header, 124, 12, 0);
  octal(header, 136, 12, 0);
  header.fill(0x20, 148, 156);
  header[156] = "0".charCodeAt(0);
  Buffer.from("ustar\0").copy(header, 257);
  Buffer.from("00").copy(header, 263);
  const checksum = header.reduce((sum, byte) => sum + byte, 0);
  Buffer.from(`${checksum.toString(8).padStart(6, "0")}\0 `).copy(header, 148);
  fs.writeFileSync(file, gzipSync(Buffer.concat([header, Buffer.alloc(1024)]), { level: 9, mtime: 0 }));
}

test("[AB-RELEASE-003] source identity requires exact clean Git state", (t) => {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-release-source-")));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  runGit(root, ["init", "--quiet"]);
  fs.writeFileSync(path.join(root, "tracked.txt"), "accepted\n");
  runGit(root, ["add", "tracked.txt"]);
  runGit(root, ["-c", "user.name=AgentBase Test", "-c", "user.email=test@agentbase.invalid", "commit", "--quiet", "-m", "fixture"]);
  const source = resolveSourceIdentity(root);
  assert.match(source.commit, /^[a-f0-9]{40}$/);
  assert.equal(Number.isSafeInteger(source.committedAt), true);
  fs.appendFileSync(path.join(root, "tracked.txt"), "drift\n");
  assert.throws(() => resolveSourceIdentity(root), /clean Git worktree/);
});

test("[AB-DISC-008][AB-RELEASE-001..011][AB-RELEASE-CI-008] builds and verifies an exact reproducible qualified host archive", async (t) => {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-release-test-")));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const firstOutput = path.join(root, "first"), secondOutput = path.join(root, "second");
  const target = `${process.platform}-${process.arch}`;
  const first = await buildReleaseArtifact({ projectRoot, outputDirectory: firstOutput, target, sourceIdentity, qualified: true });
  const second = await buildReleaseArtifact({ projectRoot, outputDirectory: secondOutput, target, sourceIdentity, qualified: true });

  assert.equal(first.releaseId, `agentbase-mcp-${releaseContract.version}-${target}`);
  assert.equal(first.sha256, second.sha256);
  assert.equal(verifyOuterChecksum(first.archive), first.sha256);
  assert.equal(filesEqual(first.archive, second.archive), true);
  assert.equal(fs.readFileSync(first.outerChecksum, "utf8"), `${sha256File(first.archive)}  ${path.basename(first.archive)}\n`);

  const extracted = extractReleaseArchive(first.archive, path.join(root, "extracted"));
  const manifest = await verifyExtractedRelease(extracted, { target, qualified: true });
  assert.deepEqual(manifest.qualification, {
    gates: ["contract-check", "release-requirement-evidence", "repository-verification"],
    profile: "agentbase-release-ci-v1",
    status: "passed",
  });
  assert.deepEqual(manifest.skills, [...releaseContract.skills]);
  assert.deepEqual(manifest.knowledge.agentbase_profiles, {
    author: "agentbase-okf@1.0",
    read: ["agentbase-okf@1.0"],
  });
  assert.equal(manifest.knowledge.qualified_scale, null);
  const sbom = JSON.parse(fs.readFileSync(path.join(extracted, "sbom.cdx.json"), "utf8"));
  const sbomNames = sbom.components.map((component) => component.name);
  assert.equal(sbomNames.includes("yaml"), true);
  assert.equal(sbomNames.includes("zod"), true);
  assert.equal(fs.existsSync(path.join(extracted, "vendor")), false);
  assert.equal(fs.existsSync(path.join(extracted, "src/providers/codebase-memory")), false);
  assert.equal(fs.existsSync(path.join(extracted, "scripts/benchmark")), false);
  assert.equal(manifest.skills.includes("use-codebase-memory"), false);
  assert.equal(fs.existsSync(path.join(extracted, "node_modules/@swc/core")), false);
  assert.equal(fs.existsSync(path.join(extracted, "src/cli.test.ts")), false);
  for (const retired of ["review/accept.ts", "publication/publish.ts", "review/test-support.ts",
    "review/test-support/accept.ts", "publication/test-support.ts"]) {
    assert.equal(fs.existsSync(path.join(extracted, "src/app/hub-okf", retired)), false);
  }
  assert.equal("devDependencies" in JSON.parse(fs.readFileSync(path.join(extracted, "package.json"), "utf8")), false);

  const installedHome = path.join(root, "installed"), userHome = path.join(root, "home");
  fs.mkdirSync(userHome, { recursive: true });
  const codexHome = path.join(root, "codex"), clientBin = createFakeCodex(root);
  const installedEnvironment = {
    ...process.env,
    AGENTBASE_HOME: installedHome,
    HOME: userHome,
    CODEX_HOME: codexHome,
    PATH: `${clientBin}${path.delimiter}${process.env.PATH ?? ""}`,
  };
  const installed = spawnSync(path.join(extracted, "install.sh"), ["--clients", "codex"], { encoding: "utf8", env: installedEnvironment });
  assert.equal(installed.status, 0, installed.stderr);
  const stableLauncher = path.join(installedHome, "bin", "abs");
  const clientEntry = JSON.parse(fs.readFileSync(path.join(codexHome, "config.toml"), "utf8")).agentbase;
  assert.deepEqual(clientEntry, { command: stableLauncher, args: ["mcp"] });
  assert.deepEqual(fs.readdirSync(path.join(codexHome, "skills")).sort(), [...releaseContract.skills].sort());
  const launched = spawnSync(stableLauncher, ["--help"], { encoding: "utf8", env: installedEnvironment });
  assert.equal(launched.status, 0, launched.stderr);
  assert.match(launched.stdout, /^AgentBase CLI$/m);
  const uninstalled = spawnSync(stableLauncher, ["uninstall"], { encoding: "utf8", env: installedEnvironment });
  assert.equal(uninstalled.status, 0, uninstalled.stderr);
  assert.equal(fs.existsSync(stableLauncher), false);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(codexHome, "config.toml"), "utf8")), {});
  assert.deepEqual(fs.readdirSync(path.join(codexHome, "skills")), []);

  await assert.rejects(
    buildReleaseArtifact({ projectRoot, outputDirectory: firstOutput, target, sourceIdentity }),
    /output already exists/,
  );
  fs.appendFileSync(path.join(extracted, "README.md"), "drift\n");
  await assert.rejects(verifyExtractedRelease(extracted, { target }), /checksum mismatch/);
});

test("[AB-RELEASE-010, AB-RELEASE-011] rejects an unsafe archive before extraction", (t) => {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-release-unsafe-")));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const archive = path.join(root, "unsafe.tar.gz");
  unsafeArchive(archive);
  assert.throws(() => extractReleaseArchive(archive, path.join(root, "output")), /unsafe or duplicate entry/);
  assert.equal(fs.existsSync(path.join(root, "escape")), false);
});
