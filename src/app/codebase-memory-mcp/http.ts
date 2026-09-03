import { createMcpHandler, type McpHttpHandler } from "@modelcontextprotocol/server";

import { createAgentBaseMcpServer } from "./server.ts";

export type AgentBaseMcpHttpOptions = Parameters<typeof createAgentBaseMcpServer>[0];

/**
 * Creates a web-standard MCP handler for modern Streamable HTTP.
 *
 * The SDK creates a fresh high-level server for each request, so this adapter
 * does not rely on transport sessions for AgentBase state. Legacy 2025
 * requests remain available through the SDK's stateless compatibility leg.
 */
export function createAgentBaseMcpHttpHandler(options: AgentBaseMcpHttpOptions): McpHttpHandler {
  return createMcpHandler(() => createAgentBaseMcpServer(options).server, {
    legacy: "stateless",
    responseMode: "auto",
  });
}
