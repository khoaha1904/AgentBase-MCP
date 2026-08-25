#!/usr/bin/env node
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";

const root = path.resolve(import.meta.dirname, "../..");
const binary = process.env.AGENTBASE_CBM_BINARY;
const version = process.env.AGENTBASE_CBM_VERSION;
if (!binary || !version) {
  throw new Error("AGENTBASE_CBM_BINARY and AGENTBASE_CBM_VERSION are required");
}
const target = process.env.AGENTBASE_CBM_TARGET;
const safeTools = [
  "index_repository", "search_graph", "trace_path", "get_code_snippet",
  "get_architecture", "search_code", "index_status", "check_index_coverage",
  "detect_changes",
];

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value).sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${canonical(entry)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function digestTree(directory) {
  const hash = createHash("sha256");
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const absolute = path.join(current, entry.name);
      hash.update(path.relative(directory, absolute).split(path.sep).join("/")).update("\0");
      if (entry.isDirectory()) walk(absolute);
      else if (entry.isFile()) hash.update(fs.readFileSync(absolute));
      hash.update("\0");
    }
  };
  walk(directory);
  return hash.digest("hex");
}

function textOf(result) {
  return canonical(result.structuredContent ?? result.content ?? result);
}

if (!fs.existsSync(binary)) throw new Error(`Codebase Memory binary not found: ${binary}`);
const reportedVersion = execFileSync(binary, ["--version"], { encoding: "utf8", timeout: 15_000 }).trim();
if (reportedVersion !== `codebase-memory-mcp ${version}`) {
  throw new Error(`expected codebase-memory-mcp ${version}, received ${reportedVersion}`);
}

const scope = fs.mkdtempSync(path.join(os.tmpdir(), `agentbase-cbm-${version}-`));
const repository = path.join(scope, "repository");
const cache = path.join(scope, "cache");
fs.cpSync(path.join(root, "fixtures", "typescript-modular-monolith"), repository, { recursive: true });
const sourceBefore = digestTree(repository);
const project = "agentbase-typescript-fixture";
const transport = new StdioClientTransport({
  command: binary,
  cwd: repository,
  env: {
    ...process.env,
    CBM_CACHE_DIR: cache,
    CBM_ALLOWED_ROOT: repository,
    CBM_LOG_LEVEL: "error",
    HOME: cache,
    LANG: "C.UTF-8",
    LC_ALL: "C.UTF-8",
  },
  stderr: "pipe",
});
const client = new Client({ name: "agentbase-revision-qualification", version: "0.0.0" });

try {
  await client.connect(transport, { timeout: 30_000 });
  const listed = await client.listTools(undefined, { timeout: 30_000, cacheMode: "bypass" });
  const selected = safeTools.map((name) => listed.tools.find((tool) => tool.name === name));
  if (selected.some((tool) => !tool)) throw new Error("provider is missing one or more AgentBase Code Graph tools");
  const toolSchemaSha256 = createHash("sha256").update(canonical(selected.map(({ name, inputSchema }) => ({ name, inputSchema })))).digest("hex");

  const indexed = await client.callTool({
    name: "index_repository",
    arguments: { repo_path: repository, name: project, mode: "fast", persistence: false },
  }, { timeout: 180_000 });
  const architecture = await client.callTool({
    name: "get_architecture", arguments: { project, aspects: ["overview"] },
  }, { timeout: 60_000 });
  const searched = await client.callTool({
    name: "search_graph", arguments: { project, query: "inspect workspace", limit: 10, format: "json" },
  }, { timeout: 60_000 });
  const traced = await client.callTool({
    name: "trace_path", arguments: { project, function_name: "inspectWorkspace", direction: "outbound", depth: 1, limit: 20, mode: "calls", format: "json" },
  }, { timeout: 60_000 });
  const coverage = await client.callTool({
    name: "index_status", arguments: { project },
  }, { timeout: 60_000 });

  const indexText = textOf(indexed);
  const architectureText = textOf(architecture);
  const searchText = textOf(searched);
  const traceText = textOf(traced);
  const coverageText = textOf(coverage);
  const result = {
    schemaVersion: 1,
    provider: "codebase-memory-mcp",
    version,
    reportedVersion,
    toolSchemaSha256,
    safeToolCount: selected.length,
    checks: {
      indexSucceeded: indexed.isError !== true,
      architectureSucceeded: architecture.isError !== true,
      searchSucceeded: searched.isError !== true,
      traceSucceeded: traced.isError !== true,
      coverageSucceeded: coverage.isError !== true,
      inspectWorkspaceFound: searchText.includes("inspectWorkspace"),
      listModulesCallFound: traceText.includes("listModules"),
      resolveWorkspaceCallFound: traceText.includes("resolveWorkspace"),
      appCatalogBoundaryFound: architectureText.includes("catalog"),
      appWorkspaceBoundaryFound: architectureText.includes("workspace"),
      noSkippedFiles: /\"skipped(?:_count)?\":0|skipped[^0-9]*0/i.test(indexText + coverageText),
      noPartialFiles: /\"parse_partial(?:_count)?\":0|parse.partial[^0-9]*0/i.test(indexText + coverageText),
      sourceUnchanged: sourceBefore === digestTree(repository),
      persistenceAbsent: !fs.existsSync(path.join(repository, ".codebase-memory")),
    },
  };
  const output = `${JSON.stringify(result, null, 2)}\n`;
  if (target) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, output, { mode: 0o600 });
  }
  process.stdout.write(output);
  if (Object.values(result.checks).some((value) => value !== true)) process.exitCode = 1;
} finally {
  await client.close().catch(() => undefined);
  fs.rmSync(scope, { recursive: true, force: true });
}
