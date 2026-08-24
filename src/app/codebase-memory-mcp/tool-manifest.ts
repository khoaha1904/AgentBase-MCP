import fs from "node:fs";

import type { ProviderToolDescriptor } from "../../providers/codebase-memory/index.ts";

export const SAFE_TOOL_NAMES = [
  "index_repository", "search_graph", "trace_path", "get_code_snippet",
  "get_architecture", "search_code", "index_status", "check_index_coverage",
  "detect_changes",
] as const;

export type SafeToolName = typeof SAFE_TOOL_NAMES[number];

type Manifest = Readonly<{
  provider: string;
  version: string;
  tools: readonly ProviderToolDescriptor[];
}>;

function readManifest(): Manifest {
  const value = JSON.parse(fs.readFileSync(new URL("../../../fixtures/codebase-memory-v0.10.1/mcp-surface.json", import.meta.url), "utf8")) as Manifest;
  if (value.provider !== "codebase-memory-mcp" || value.version !== "0.10.1") {
    throw new Error("captured Codebase Memory MCP manifest is invalid");
  }
  return value;
}

const manifest = readManifest();
const capturedByName = new Map(manifest.tools.map((tool) => [tool.name, tool]));
const capturedSafeTools = SAFE_TOOL_NAMES.map((name) => {
  const tool = capturedByName.get(name);
  if (!tool) throw new Error(`captured Codebase Memory MCP manifest is missing ${name}`);
  return tool;
});
export const PINNED_PROVIDER_TOOLS = Object.freeze(capturedSafeTools.map((tool) => Object.freeze(tool)));

const READ_ONLY_GRAPH_ANNOTATIONS = Object.freeze({
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
});

function publicDescriptor(tool: ProviderToolDescriptor): ProviderToolDescriptor {
  if (tool.name === "index_repository") {
    return {
      ...tool,
      description: "Index one explicit repository into AgentBase's private disposable Code Graph. Select full, moderate or fast indexing depth.",
      inputSchema: {
        type: "object",
        properties: {
          repo_path: { type: "string", description: "Absolute path to the repository." },
          mode: {
            type: "string", enum: ["full", "moderate", "fast"], default: "full",
            description: "Indexing depth. All modes retain type-aware call and usage resolution.",
          },
          name: { type: "string", description: "Optional project display name." },
        },
        required: ["repo_path"], additionalProperties: false,
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    };
  }
  return {
    ...tool,
    ...(tool.name === "index_status" && tool.description
      ? { description: tool.description.replace(' For structural queries over the misses use query_graph(graph="missed").', "") }
      : {}),
    annotations: READ_ONLY_GRAPH_ANNOTATIONS,
  };
}

export const SAFE_TOOLS = Object.freeze(capturedSafeTools.map((tool) => Object.freeze(publicDescriptor(tool))));

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
  for (const expected of PINNED_PROVIDER_TOOLS) {
    const actual = byName.get(expected.name);
    if (!actual || canonical(actual.inputSchema) !== canonical(expected.inputSchema)) {
      throw new Error(`Codebase Memory MCP schema drift: ${expected.name}`);
    }
  }
}
