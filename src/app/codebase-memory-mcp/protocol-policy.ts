import type { ServerOptions } from "@modelcontextprotocol/server";

/**
 * MCP wire eras supported by AgentBase. Keep the legacy entry for existing
 * stdio hosts while making the modern protocol an explicit contract.
 */
export const AGENTBASE_MCP_PROTOCOL_VERSIONS = [
  "2025-11-25",
  "2026-07-28",
] as const;

export const AGENTBASE_MCP_SERVER_OPTIONS = {
  supportedProtocolVersions: [...AGENTBASE_MCP_PROTOCOL_VERSIONS],
  cacheHints: {
    "tools/list": { ttlMs: 0, cacheScope: "private" },
  },
} satisfies Pick<ServerOptions, "supportedProtocolVersions" | "cacheHints">;

