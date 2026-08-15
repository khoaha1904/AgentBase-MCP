import type { CallToolResult } from "@modelcontextprotocol/server";
import {
  AGENTBASE_OKF_SCHEMA_CATALOG_VERSION,
  getOkfConceptSchema,
  listOkfConceptSchemas,
  normalizeHubConceptPath,
  parseConceptDocument,
  selectOkfConceptSchemas,
  validateAgentBaseDraft,
  validateConceptAgainstSchema,
  validateOkfRelationships,
  type ConceptDocument,
  type OkfRelationshipTarget,
} from "../../core/knowledge/index.ts";

export const OKF_SCHEMA_TOOL_NAMES = [
  "list_okf_schemas", "get_okf_schema", "select_okf_schemas", "validate_okf_concept", "validate_okf_relationships",
  "get_okf_authoring_schemas", "validate_okf_bundle", "validate_okf_changes",
] as const;
export type OkfSchemaToolName = typeof OKF_SCHEMA_TOOL_NAMES[number];

const conceptSetInputSchema = {
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
} as const;

const targetSummarySchema = {
  type: "array", maxItems: 512,
  items: {
    type: "object",
    properties: {
      identity: { type: "string", minLength: 1, maxLength: 256 },
      path: { type: "string", minLength: 1, maxLength: 1024 },
      type: { type: "string", minLength: 1, maxLength: 256 },
    },
    required: ["identity", "path", "type"], additionalProperties: false,
  },
} as const;

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
    inputSchema: conceptSetInputSchema,
  },
  {
    name: "get_okf_authoring_schemas",
    description: "Select and return complete OKF schema guidance for bounded repository evidence signals in one advisory call.",
    inputSchema: {
      type: "object",
      properties: {
        signals: {
          type: "array", items: { type: "string", minLength: 1, maxLength: 2048 }, minItems: 1, maxItems: 64,
        },
      },
      required: ["signals"], additionalProperties: false,
    },
  },
  {
    name: "validate_okf_bundle",
    description: "Validate draft policy, known schemas and cross-document relationships for a bounded supplied OKF bundle in one call.",
    inputSchema: conceptSetInputSchema,
  },
  {
    name: "validate_okf_changes",
    description: "Validate changed OKF concepts against bounded unchanged target summaries without supplying the whole Hub.",
    inputSchema: {
      type: "object",
      properties: { changes: conceptSetInputSchema.properties.concepts, targets: targetSummarySchema },
      required: ["changes", "targets"], additionalProperties: false,
    },
  },
] as const;

function result(value: unknown, isError = false): CallToolResult {
  return { content: [{ type: "text", text: JSON.stringify(value) }], ...(isError ? { isError: true } : {}) };
}

type SuppliedConcept = Readonly<{ identity: string; path: string; content: string }>;
type ParsedSuppliedConcept = Readonly<{ item: SuppliedConcept; concept: ConceptDocument }>
  | Readonly<{ item: SuppliedConcept; error: string }>;

function suppliedConcepts(args: Readonly<Record<string, unknown>>, key = "concepts"): Readonly<{ entries?: SuppliedConcept[]; error?: string }> {
  const supplied = args[key];
  const valid = Array.isArray(supplied) && supplied.length >= 1 && supplied.length <= 64
    && supplied.every((item) => item && typeof item === "object" && !Array.isArray(item)
      && typeof item.identity === "string" && item.identity.length >= 1 && item.identity.length <= 256
      && typeof item.path === "string" && item.path.length >= 1 && item.path.length <= 1024
      && typeof item.content === "string" && item.content.length >= 1
      && Buffer.byteLength(item.content) <= 262144);
  if (!valid) return { error: `${key} must be a bounded list of identity, path and content strings` };
  const entries = supplied as SuppliedConcept[];
  if (entries.reduce((bytes, item) => bytes + Buffer.byteLength(item.content), 0) > 4 * 1024 * 1024) {
    return { error: "concept content exceeds 4194304 bytes" };
  }
  return { entries };
}

function suppliedTargets(args: Readonly<Record<string, unknown>>): Readonly<{ entries?: OkfRelationshipTarget[]; error?: string }> {
  const supplied = args.targets;
  const validPath = (value: string) => {
    try { return normalizeHubConceptPath(value) === value; } catch { return false; }
  };
  const valid = Array.isArray(supplied) && supplied.length <= 512
    && supplied.every((item) => item && typeof item === "object" && !Array.isArray(item)
      && typeof item.identity === "string" && item.identity.length >= 1 && item.identity.length <= 256
      && typeof item.path === "string" && item.path.length >= 1 && item.path.length <= 1024 && validPath(item.path)
      && typeof item.type === "string" && item.type.length >= 1 && item.type.length <= 256);
  return valid ? { entries: supplied as OkfRelationshipTarget[] }
    : { error: "targets must be a bounded list of identity, path and type strings" };
}

function validateBundle(entries: readonly SuppliedConcept[], targets: readonly OkfRelationshipTarget[] = []): CallToolResult {
  const parsed: ParsedSuppliedConcept[] = entries.map((item) => {
    try { return { item, concept: parseConceptDocument(item.path, item.content) }; }
    catch (error) { return { item, error: error instanceof Error ? error.message : "concept parsing failed" }; }
  });
  const concepts = parsed.map((entry) => {
    if ("error" in entry) return {
      identity: entry.item.identity, path: entry.item.path, valid: false,
      failures: [`${entry.item.path}: ${entry.error}`],
    };
    const failures = [...validateAgentBaseDraft(entry.concept), ...validateConceptAgainstSchema(entry.concept)];
    return { identity: entry.item.identity, path: entry.item.path, type: entry.concept.type,
      knownSchema: Boolean(getOkfConceptSchema(entry.concept.type)), valid: failures.length === 0, failures };
  });
  const parsedConcepts = parsed.flatMap((entry) => "concept" in entry
    ? [{ identity: entry.item.identity, concept: entry.concept }] : []);
  const relationshipValidation = parsedConcepts.length === entries.length
    ? validateOkfRelationships(parsedConcepts, { targets, strictSourceIdentities: new Set(parsedConcepts.map((item) => item.identity)) })
    : { failures: [] as readonly string[], relationships: [], flowSteps: [], warnings: [] as readonly string[] };
  const valid = concepts.every((concept) => concept.valid) && relationshipValidation.failures.length === 0;
  return result({ valid, concepts, relationshipFailures: relationshipValidation.failures,
    relationshipWarnings: relationshipValidation.warnings, relationships: relationshipValidation.relationships,
    flowSteps: relationshipValidation.flowSteps, relationshipValidationSkipped: parsedConcepts.length !== entries.length }, !valid);
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
    if (name === "get_okf_authoring_schemas") {
      const signals = args.signals;
      const valid = Array.isArray(signals) && signals.length >= 1 && signals.length <= 64
        && signals.every((signal) => typeof signal === "string" && signal.length >= 1 && signal.length <= 2048);
      if (!valid) return result({ error: "signals must be a bounded non-empty string list" }, true);
      const recommendations = selectOkfConceptSchemas(signals as string[]);
      return result({
        catalogVersion: AGENTBASE_OKF_SCHEMA_CATALOG_VERSION,
        okfVersion: "0.2",
        schemas: recommendations.map((recommendation) => ({
          ...getOkfConceptSchema(recommendation.type),
          matchedSignals: recommendation.matchedSignals,
          missingEvidence: recommendation.missingEvidence,
        })),
        advisory: true,
      });
    }
    if (name === "validate_okf_relationships" || name === "validate_okf_bundle" || name === "validate_okf_changes") {
      const supplied = suppliedConcepts(args, name === "validate_okf_changes" ? "changes" : "concepts");
      if (!supplied.entries) return result({ error: supplied.error }, true);
      const entries = supplied.entries;
      if (name === "validate_okf_bundle" || name === "validate_okf_changes") {
        const targets = name === "validate_okf_changes" ? suppliedTargets(args) : { entries: [] as OkfRelationshipTarget[] };
        if (!targets.entries) return result({ error: targets.error }, true);
        return validateBundle(entries, targets.entries);
      }
      const concepts = entries.map((item) => ({
        identity: item.identity,
        concept: parseConceptDocument(item.path, item.content),
      }));
      const validation = validateOkfRelationships(concepts, {
        strictSourceIdentities: new Set(concepts.map((item) => item.identity)),
      });
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
