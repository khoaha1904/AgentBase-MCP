import type { CallToolResult } from "@modelcontextprotocol/server";
import {
  AGENTBASE_OKF_SCHEMA_CATALOG_VERSION,
  getOkfConceptSchema,
  listOkfConceptSchemas,
  parseConceptDocument,
  selectOkfConceptSchemas,
  validateAgentBaseDraft,
  validateConceptAgainstSchema,
  validateOkfRelationships,
} from "../../core/knowledge/index.ts";

export const OKF_SCHEMA_TOOL_NAMES = [
  "list_okf_schemas", "get_okf_schema", "select_okf_schemas", "validate_okf_concept", "validate_okf_relationships",
] as const;
export type OkfSchemaToolName = typeof OKF_SCHEMA_TOOL_NAMES[number];

export const OKF_SCHEMA_TOOLS = [
  {
    name: "list_okf_schemas",
    description: "List the versioned AgentBase concept schema catalog layered on Google OKF v0.2.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "get_okf_schema",
    description: "Read one AgentBase concept schema by its exact OKF type.",
    inputSchema: {
      type: "object", properties: { type: { type: "string", minLength: 1 } },
      required: ["type"], additionalProperties: false,
    },
  },
  {
    name: "select_okf_schemas",
    description: "Recommend schemas from repository evidence signals; the authoring agent retains the final choice.",
    inputSchema: {
      type: "object",
      properties: {
        signals: { type: "array", items: { type: "string", minLength: 1 }, minItems: 1, maxItems: 64 },
      },
      required: ["signals"], additionalProperties: false,
    },
  },
  {
    name: "validate_okf_concept",
    description: "Validate Markdown against Google OKF, AgentBase draft policy and a known type schema.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", minLength: 1 }, content: { type: "string", minLength: 1 },
      },
      required: ["path", "content"], additionalProperties: false,
    },
  },
  {
    name: "validate_okf_relationships",
    description: "Validate cross-document OKF relationship targets, Markdown links and known-schema guidance from bounded supplied content.",
    inputSchema: {
      type: "object",
      properties: {
        concepts: {
          type: "array", minItems: 1, maxItems: 64,
          items: {
            type: "object",
            properties: {
              identity: { type: "string", minLength: 1, maxLength: 256 },
              path: { type: "string", minLength: 1, maxLength: 1024 },
              content: { type: "string", minLength: 1, maxLength: 262144 },
            },
            required: ["identity", "path", "content"], additionalProperties: false,
          },
        },
      },
      required: ["concepts"], additionalProperties: false,
    },
  },
] as const;

function result(value: unknown, isError = false): CallToolResult {
  return { content: [{ type: "text", text: JSON.stringify(value) }], ...(isError ? { isError: true } : {}) };
}

export function callOkfSchemaTool(name: OkfSchemaToolName, args: Readonly<Record<string, unknown>>): CallToolResult {
  try {
    if (name === "list_okf_schemas") return result({
      catalogVersion: AGENTBASE_OKF_SCHEMA_CATALOG_VERSION,
      okfVersion: "0.2",
      schemas: listOkfConceptSchemas(),
    });
    if (name === "get_okf_schema") {
      if (typeof args.type !== "string" || !args.type.trim()) {
        return result({ error: "type must be non-empty" }, true);
      }
      const schema = getOkfConceptSchema(args.type);
      return schema
        ? result({ catalogVersion: AGENTBASE_OKF_SCHEMA_CATALOG_VERSION, schema })
        : result({ error: `unknown AgentBase schema: ${args.type}`, googleOkfAllowsUnknownTypes: true }, true);
    }
    if (name === "select_okf_schemas") {
      const valid = Array.isArray(args.signals) && args.signals.length
        && args.signals.every((signal) => typeof signal === "string" && Boolean(signal.trim()));
      if (!valid) return result({ error: "signals must be a non-empty string list" }, true);
      return result({
        catalogVersion: AGENTBASE_OKF_SCHEMA_CATALOG_VERSION,
        recommendations: selectOkfConceptSchemas(args.signals as string[]),
        advisory: true,
      });
    }
    if (name === "validate_okf_relationships") {
      const supplied = args.concepts;
      const valid = Array.isArray(supplied) && supplied.length >= 1 && supplied.length <= 64
        && supplied.every((item) => item && typeof item === "object" && !Array.isArray(item)
          && typeof item.identity === "string" && Boolean(item.identity)
          && typeof item.path === "string" && Boolean(item.path)
          && typeof item.content === "string" && Boolean(item.content));
      if (!valid) return result({ error: "concepts must be a bounded list of identity, path and content strings" }, true);
      const entries = supplied as { identity: string; path: string; content: string }[];
      if (entries.reduce((bytes, item) => bytes + Buffer.byteLength(item.content), 0) > 4 * 1024 * 1024) {
        return result({ error: "concept content exceeds 4194304 bytes" }, true);
      }
      const validation = validateOkfRelationships(entries.map((item) => ({
        identity: item.identity,
        concept: parseConceptDocument(item.path, item.content),
      })));
      return result({ valid: validation.failures.length === 0, ...validation }, validation.failures.length > 0);
    }
    if (typeof args.path !== "string" || typeof args.content !== "string") {
      return result({ error: "path and content must be strings" }, true);
    }
    const concept = parseConceptDocument(args.path, args.content);
    const failures = [...validateAgentBaseDraft(concept), ...validateConceptAgainstSchema(concept)];
    return result({ valid: failures.length === 0, type: concept.type, knownSchema: Boolean(getOkfConceptSchema(concept.type)), failures }, failures.length > 0);
  } catch (error) {
    return result({ error: error instanceof Error ? error.message : "concept validation failed" }, true);
  }
}
