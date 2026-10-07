import type { CallToolResult } from "@modelcontextprotocol/server";

import type { DiscoverySession } from "./discovery-session.ts";
import { controlledDiscovery } from "./tool-policy.ts";

export const DISCOVERY_TOOL = {
  name: "discover_repository",
  description: "Read bounded signals from the preflight snapshot; expanded requires confirmation.",
  inputSchema: {
    type: "object",
    properties: {
      repo_path: { type: "string", description: "Absolute path to the exact preflight analysis repository." },
      discovery_mode: { type: "string", enum: ["standard", "expanded"], default: "standard" },
      discovery_confirmation: {
        type: "object",
        properties: {
          seed_id: { type: "string" },
          user_confirmed: { type: "boolean", const: true },
          reason: { type: "string", minLength: 1, maxLength: 512 },
        },
        required: ["seed_id", "user_confirmed", "reason"],
        additionalProperties: false,
      },
    },
    required: ["repo_path"],
    additionalProperties: false,
  },
} as const;

export function callDiscoveryTool(discovery: DiscoverySession, args: Readonly<Record<string, unknown>>): CallToolResult {
  try {
    const selected = controlledDiscovery(args);
    return selected.discoveryMode === "expanded"
      ? discovery.expand(selected.repositoryRoot, selected.discoveryConfirmation)
      : discovery.capture(selected.repositoryRoot);
  } catch (error) {
    return { isError: true, content: [{ type: "text", text: JSON.stringify({
      code: "INVALID_ARGUMENT",
      error: error instanceof Error ? error.message : "discovery failed",
      retryable: true,
      recovery: "correct-and-retry-same-tool",
    }) }] };
  }
}
