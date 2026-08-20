import { CANONICAL_RELATIONSHIP_KINDS } from "../../../core/knowledge/index.ts";

export const HUB_OKF_QUERY_TOOLS = [
  {
    name: "search_hub_okf",
    description: "Search bounded accepted knowledge at the current local AgentBase-Hub main commit.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", minLength: 1, maxLength: 256 },
        domain: { type: "string", minLength: 1, maxLength: 512 },
        types: { type: "array", items: { type: "string", minLength: 1, maxLength: 128 }, minItems: 1, maxItems: 32 },
        global: { type: "boolean", description: "Allow an explicitly broad bounded search across Domains." },
        limit: { type: "integer", minimum: 1, maximum: 100 },
      },
      required: ["query"], additionalProperties: false,
    },
  },
  {
    name: "traverse_hub_okf",
    description: "Traverse a bounded evidenced neighborhood from one exact accepted Hub concept.",
    inputSchema: {
      type: "object",
      properties: {
        start: { type: "string", minLength: 1, maxLength: 512 },
        direction: { type: "string", enum: ["outbound", "inbound", "both"] },
        kinds: { type: "array", items: { type: "string", enum: CANONICAL_RELATIONSHIP_KINDS }, minItems: 1, maxItems: 11 },
        max_depth: { type: "integer", minimum: 1, maximum: 3 },
        limit: { type: "integer", minimum: 1, maximum: 100 },
      },
      required: ["start"], additionalProperties: false,
    },
  },
] as const;
