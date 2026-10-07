import type { ServerOptions } from "@modelcontextprotocol/server";

/**
 * MCP wire eras supported by AgentBase. Keep the legacy entry for existing
 * stdio hosts while making the modern protocol an explicit contract.
 */
export const AGENTBASE_MCP_PROTOCOL_VERSIONS = [
  "2025-11-25",
  "2026-07-28",
] as const;

export const AGENTBASE_MCP_JSON_SCHEMA_DIALECT = "https://json-schema.org/draft/2020-12/schema";

export function modernToolInputSchema(schema: Readonly<Record<string, unknown>>): Record<string, unknown> {
  const concise = (value: unknown): unknown => Array.isArray(value) ? value.map(concise)
    : value && typeof value === "object" ? Object.fromEntries(Object.entries(value)
      .filter(([key]) => key !== "description").map(([key, item]) => [key, concise(item)])) : value;
  const root = concise(schema) as Record<string, unknown>;
  const occurrences = new Map<string, number>();
  const children = (node: Record<string, unknown>, visit: (node: Record<string, unknown>) => Record<string, unknown>) => {
    const next = { ...node };
    if (node.properties) next.properties = Object.fromEntries(Object.entries(node.properties as Record<string, Record<string, unknown>>)
      .map(([key, item]) => [key, visit(item)]));
    if (node.items) next.items = visit(node.items as Record<string, unknown>);
    for (const key of ["oneOf", "anyOf", "allOf"]) if (Array.isArray(node[key])) next[key] = node[key].map(visit);
    return next;
  };
  const count = (node: Record<string, unknown>): Record<string, unknown> => {
    const key = JSON.stringify(node);
    if (key.length > 160) occurrences.set(key, (occurrences.get(key) ?? 0) + 1);
    return children(node, count);
  };
  count(root);
  const definitions: Record<string, unknown> = {}, ids = new Map<string, string>();
  const factor = (node: Record<string, unknown>): Record<string, unknown> => {
    const key = JSON.stringify(node);
    if ((occurrences.get(key) ?? 0) > 1) {
      let id = ids.get(key);
      if (!id) {
        id = `s${ids.size}`; ids.set(key, id);
        definitions[id] = children(node, factor);
      }
      return { $ref: `#/$defs/${id}` };
    }
    return children(node, factor);
  };
  // Keep each tool independently resolvable. Only repeated local schemas share bytes.
  const compact = children(root, factor);
  return { $schema: AGENTBASE_MCP_JSON_SCHEMA_DIALECT, ...compact,
    ...(ids.size ? { $defs: definitions } : {}) };
}

export const AGENTBASE_MCP_SERVER_OPTIONS = {
  supportedProtocolVersions: [...AGENTBASE_MCP_PROTOCOL_VERSIONS],
  cacheHints: {
    "tools/list": { ttlMs: 0, cacheScope: "private" },
  },
} satisfies Pick<ServerOptions, "supportedProtocolVersions" | "cacheHints">;
