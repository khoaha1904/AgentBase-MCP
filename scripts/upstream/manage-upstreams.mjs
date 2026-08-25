#!/usr/bin/env node
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const repositoryRoot = path.resolve(import.meta.dirname, "../..");
const maximumFileBytes = 100 * 1024 * 1024;
const selectedGrammars = new Set([
  "bash", "dockerfile", "go", "hcl", "java", "javascript", "json",
  "markdown", "python", "tsx", "typescript", "yaml",
]);

const upstreams = Object.freeze({
  "codebase-memory": Object.freeze({
    commit: "46ae198fc11cda80e817acbc5f5908d7c2de7032",
    version: "v0.10.8",
    url: "https://github.com/DeusData/codebase-memory-mcp",
    license: "MIT",
    include(relative) {
      if (relative === "Formula") return false;
      if (relative === "graph-ui" || relative.startsWith("graph-ui/")) return false;
      const shim = /^internal\/cbm\/grammar_([^/]+)\.c$/.exec(relative);
      if (shim) return selectedGrammars.has(shim[1]);
      const grammar = /^internal\/cbm\/vendored\/grammars\/([^/]+)\//.exec(relative);
      return !grammar || selectedGrammars.has(grammar[1]);
    },
    selection: "Core runtime and the AgentBase 12-language grammar profile; Graph UI frontend excluded.",
  }),
  "diagram-design": Object.freeze({
    commit: "648c2a597839301e06df1e7434a08bde9f42eed3",
    version: "2.6.5",
    url: "https://github.com/carhrynlavery/diagram-design",
    license: "MIT",
    include: () => true,
    selection: "Complete tracked source snapshot; inactive in capability 044.",
  }),
});

function fail(message) {
  throw new Error(message);
}

function runGit(source, args) {
  return execFileSync("git", ["-C", source, ...args], {
    encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024,
  }).trim();
}

function safeRelative(value) {
  if (!value || value.includes("\0") || path.isAbsolute(value)) return false;
  const normalized = path.posix.normalize(value.replaceAll("\\", "/"));
  return normalized === value && normalized !== ".." && !normalized.startsWith("../");
}

function sha256File(file) {
  return createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function walk(directory, prefix = "") {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walk(absolute, relative));
    else if (entry.isFile()) files.push(relative);
    else fail(`unexpected non-file in imported source: ${relative}`);
  }
  return files;
}

function inventory(upstreamDirectory) {
  return `${walk(upstreamDirectory).map((relative) =>
    `${sha256File(path.join(upstreamDirectory, relative))}  upstream/${relative}`,
  ).join("\n")}\n`;
}

function provenance(name, config) {
  return `# ${name} upstream\n\n` +
    `- Source: ${config.url}\n` +
    `- Version: \`${config.version}\`\n` +
    `- Commit: \`${config.commit}\`\n` +
    `- License: ${config.license}\n` +
    `- Selection: ${config.selection}\n\n` +
    "The `upstream/` tree is immutable. AgentBase changes are retained outside it.\n";
}

function importUpstream(name, sourceArgument) {
  const config = upstreams[name];
  if (!config) fail(`unknown upstream: ${name}`);
  if (!sourceArgument) fail("import requires an approved local checkout path");
  const source = path.resolve(sourceArgument);
  if (!fs.statSync(source, { throwIfNoEntry: false })?.isDirectory()) fail(`source is not a directory: ${source}`);
  if (runGit(source, ["rev-parse", "HEAD"]) !== config.commit) fail(`source commit does not match ${config.commit}`);

  const destination = path.join(repositoryRoot, "vendor", name);
  const temporary = fs.mkdtempSync(path.join(path.dirname(destination), `.${name}-import-`));
  const upstreamDirectory = path.join(temporary, "upstream");
  fs.mkdirSync(upstreamDirectory, { recursive: true, mode: 0o755 });
  try {
    const tracked = runGit(source, ["ls-files", "-z"]).split("\0").filter(Boolean).sort();
    for (const relative of tracked) {
      if (!safeRelative(relative)) fail(`unsafe tracked path: ${relative}`);
      if (!config.include(relative)) continue;
      const input = path.join(source, relative);
      const metadata = fs.lstatSync(input);
      if (!metadata.isFile()) fail(`unexpected tracked link or special file: ${relative}`);
      if (metadata.size >= maximumFileBytes) fail(`tracked file is at least 100 MiB: ${relative}`);
      const output = path.join(upstreamDirectory, relative);
      fs.mkdirSync(path.dirname(output), { recursive: true, mode: 0o755 });
      fs.copyFileSync(input, output);
      fs.chmodSync(output, metadata.mode & 0o111 ? 0o755 : 0o644);
    }
    fs.writeFileSync(path.join(temporary, "inventory.sha256"), inventory(upstreamDirectory), { mode: 0o644 });
    fs.writeFileSync(path.join(temporary, "UPSTREAM.md"), provenance(name, config), { mode: 0o644 });
    const existingOverlay = path.join(destination, "agentbase");
    if (fs.statSync(existingOverlay, { throwIfNoEntry: false })?.isDirectory()) {
      fs.cpSync(existingOverlay, path.join(temporary, "agentbase"), {
        recursive: true,
        errorOnExist: true,
      });
    }
    verifyDirectory(name, temporary);

    const backup = `${destination}.previous`;
    fs.rmSync(backup, { recursive: true, force: true });
    if (fs.existsSync(destination)) fs.renameSync(destination, backup);
    try {
      fs.renameSync(temporary, destination);
      fs.rmSync(backup, { recursive: true, force: true });
    } catch (error) {
      if (!fs.existsSync(destination) && fs.existsSync(backup)) fs.renameSync(backup, destination);
      throw error;
    }
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
  process.stdout.write(`${destination}\n`);
}

function verifyDirectory(name, directory = path.join(repositoryRoot, "vendor", name)) {
  if (!upstreams[name]) fail(`unknown upstream: ${name}`);
  const upstreamDirectory = path.join(directory, "upstream");
  const inventoryFile = path.join(directory, "inventory.sha256");
  const nestedGit = fs.existsSync(upstreamDirectory)
    ? fs.readdirSync(upstreamDirectory, { recursive: true }).find((entry) => path.basename(String(entry)) === ".git")
    : undefined;
  if (nestedGit) fail(`nested Git metadata found: ${nestedGit}`);
  const expected = fs.readFileSync(inventoryFile, "utf8");
  const actual = inventory(upstreamDirectory);
  if (actual !== expected) fail(`${name} inventory mismatch`);
  for (const relative of walk(upstreamDirectory)) {
    if (fs.statSync(path.join(upstreamDirectory, relative)).size >= maximumFileBytes) {
      fail(`imported file is at least 100 MiB: ${relative}`);
    }
  }
  return { files: walk(upstreamDirectory).length, bytes: Buffer.byteLength(actual) };
}

function verify(name) {
  const result = verifyDirectory(name);
  process.stdout.write(`${name}: ${result.files} files verified\n`);
}

const [command, name, source] = process.argv.slice(2);
if (command === "import") importUpstream(name, source);
else if (command === "verify") verify(name);
else fail("usage: manage-upstreams.mjs <import NAME SOURCE | verify NAME>");
