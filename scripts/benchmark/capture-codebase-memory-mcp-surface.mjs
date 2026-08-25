#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const binary = process.env.AGENTBASE_CBM_BINARY;
const version = process.env.AGENTBASE_CBM_VERSION;
if (!binary || !version) {
  throw new Error("AGENTBASE_CBM_BINARY and AGENTBASE_CBM_VERSION are required");
}
const cache = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-mcp-capture-"));
const target = process.env.AGENTBASE_CBM_TARGET
  ?? path.join(root, "fixtures", `codebase-memory-v${version}`, "mcp-surface.json");
const allowed = new Set([
  "index_repository", "search_graph", "query_graph", "trace_path",
  "get_code_snippet", "get_graph_schema", "get_architecture", "search_code",
  "list_projects", "index_status", "check_index_coverage", "detect_changes",
]);
const transport = new StdioClientTransport({
  command: binary,
  cwd: root,
  env: { ...process.env, CBM_CACHE_DIR: cache, CBM_ALLOWED_ROOT: root, CBM_LOG_LEVEL: "error" },
  stderr: "pipe",
});
const client = new Client({ name: "agentbase-contract-capture", version: "0.0.0" });

try {
  await client.connect(transport);
  const result = await client.listTools(undefined, { cacheMode: "bypass" });
  const tools = result.tools.filter((tool) => allowed.has(tool.name));
  if (tools.length !== allowed.size) throw new Error(`expected ${allowed.size} safe tools, received ${tools.length}`);
  const fixture = {
    provider: "codebase-memory-mcp",
    version,
    resultContract: "forward raw MCP content, structuredContent and isError fields without OKF normalization",
    tools,
  };
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(fixture, null, 2)}\n`, { mode: 0o600 });
  process.stdout.write(`${target}\n`);
} finally {
  await client.close().catch(() => undefined);
  fs.rmSync(cache, { recursive: true, force: true });
}
