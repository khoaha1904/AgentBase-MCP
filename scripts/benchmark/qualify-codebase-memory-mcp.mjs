#!/usr/bin/env node
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";

const root = path.resolve(import.meta.dirname, "../..");
const scope = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-mcp-qualification-"));
const repository = path.join(scope, "selected-repository");
fs.cpSync(path.join(root, "scripts/benchmark/testdata/typescript-modular-monolith"), repository, { recursive: true });

function treeDigest(directory) {
  const hash = createHash("sha256");
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))) {
      const absolute = path.join(current, entry.name);
      const relative = path.relative(directory, absolute).split(path.sep).join("/");
      hash.update(relative).update("\0");
      if (entry.isDirectory()) walk(absolute);
      else if (entry.isFile()) hash.update(fs.readFileSync(absolute));
      hash.update("\0");
    }
  };
  walk(directory);
  return hash.digest("hex");
}

const before = treeDigest(repository);
const transport = new StdioClientTransport({
  command: process.execPath,
  args: [path.join(root, "src", "cli.ts"), "mcp"],
  cwd: scope,
  env: { ...process.env },
  stderr: "pipe",
});
const client = new Client({ name: "agentbase-fresh-process-qualification", version: "0.0.0" });
const started = performance.now();

try {
  await client.connect(transport, { timeout: 30_000 });
  const listed = await client.listTools(undefined, { timeout: 30_000, cacheMode: "bypass" });
  const premature = await client.callTool({ name: "search_graph", arguments: { project: "fixture-mcp" } }, { timeout: 30_000 });
  const rejected = await client.callTool({
    name: "index_repository",
    arguments: { repo_path: repository, name: "fixture-mcp", persistence: true },
  }, { timeout: 30_000 });
  const indexed = await client.callTool({
    name: "index_repository",
    arguments: { repo_path: repository, name: "fixture-mcp", mode: "fast" },
  }, { timeout: 180_000 });
  const architecture = await client.callTool({
    name: "get_architecture",
    arguments: { project: "fixture-mcp", aspects: ["overview"] },
  }, { timeout: 60_000 });
  const searched = await client.callTool({
    name: "search_graph",
    arguments: { project: "fixture-mcp", query: "inspect workspace", limit: 5, format: "json" },
  }, { timeout: 60_000 });
  const after = treeDigest(repository);
  const result = {
    tools: listed.tools.map((tool) => tool.name),
    prematureReadRejected: premature.isError === true,
    persistenceRejected: rejected.isError === true,
    indexSucceeded: indexed.isError !== true,
    architectureSucceeded: architecture.isError !== true,
    searchSucceeded: searched.isError !== true,
    sourceUnchanged: before === after,
    sourcePersistenceAbsent: !fs.existsSync(path.join(repository, ".codebase-memory")),
    elapsedMs: Number((performance.now() - started).toFixed(3)),
  };
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (result.tools.length !== 44 || Object.entries(result).some(([key, value]) => key !== "tools" && key !== "elapsedMs" && value !== true)) {
    process.exitCode = 1;
  }
} finally {
  await client.close().catch(() => undefined);
  fs.rmSync(scope, { recursive: true, force: true });
}
