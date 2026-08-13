import fs from "node:fs";

import type { ProviderToolDescriptor } from "../../providers/codebase-memory/index.ts";

export const SAFE_TOOL_NAMES = [
  "index_repository", "search_graph", "query_graph", "trace_path",
  "get_code_snippet", "get_graph_schema", "get_architecture", "search_code",
  "list_projects", "index_status", "check_index_coverage", "detect_changes",
] as const;

export type SafeToolName = typeof SAFE_TOOL_NAMES[number];

type Manifest = Readonly<{
  provider: string;
  version: string;
  tools: readonly ProviderToolDescriptor[];
}>;

function readManifest(): Manifest {
  const value = JSON.parse(fs.readFileSync(new URL("../../../fixtures/codebase-memory-v0.10.1/mcp-surface.json", import.meta.url), "utf8")) as Manifest;
  if (value.provider !== "codebase-memory-mcp" || value.version !== "0.10.1" || value.tools.length !== SAFE_TOOL_NAMES.length) {
    throw new Error("captured Codebase Memory MCP manifest is invalid");
  }
  return value;
}

export const SAFE_TOOLS = Object.freeze(readManifest().tools.map((tool) => Object.freeze(tool)));

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value).sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${canonical(entry)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export function isSafeToolName(value: string): value is SafeToolName {
  return (SAFE_TOOL_NAMES as readonly string[]).includes(value);
}

export function assertProviderManifest(providerTools: readonly ProviderToolDescriptor[]): void {
  const byName = new Map(providerTools.map((tool) => [tool.name, tool]));
  for (const expected of SAFE_TOOLS) {
    const actual = byName.get(expected.name);
    if (!actual || canonical(actual.inputSchema) !== canonical(expected.inputSchema)) {
      throw new Error(`Codebase Memory MCP schema drift: ${expected.name}`);
    }
  }
}
