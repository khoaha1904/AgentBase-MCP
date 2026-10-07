export const HUB_OKF_QUERY_TOOLS = [
  {
    name: "search_hub_okf",
    description: "Search synchronized Published knowledge with freshness warnings.",
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
] as const;
