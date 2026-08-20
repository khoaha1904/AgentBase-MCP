import type { CallToolResult } from "@modelcontextprotocol/server";
import {
  AGENTBASE_OKF_SCHEMA_CATALOG_VERSION,
  getOkfConceptSchema,
  getOkfAuthoringGuidance,
  listOkfConceptSchemas,
  normalizeHubConceptPath,
  parseConceptDocument,
  selectOkfConceptSchemas,
  validateAgentBaseDraft,
  validateConceptAgainstSchema,
  validateOkfRelationships,
  type ConceptDocument,
  type OkfAuthoringGuidanceRequest,
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
    description: "Map bounded source-backed candidates and observations to provider-neutral OKF schema guidance in one advisory call.",
    inputSchema: {
      type: "object",
      properties: {
        candidates: {
          type: "array", minItems: 1, maxItems: 64, items: { type: "object", properties: {
            id: { type: "string" }, identity_hint: { type: "string" }, identity_basis: { type: "string" },
            query_value: { type: "string" }, evidence_ids: {
              type: "array", minItems: 1, maxItems: 64,
              description: "IDs from semantic_observations or resource_observations in this request; never repository:// source URIs.",
              items: { type: "string" },
            },
          }, required: ["id", "identity_hint", "identity_basis", "query_value", "evidence_ids"], additionalProperties: false },
        },
        semantic_observations: {
          type: "array", maxItems: 64, items: { type: "object", properties: {
            id: { type: "string" }, candidate_id: { type: "string" },
            role: { type: "string", enum: ["documentation", "implementation", "configuration"] },
            signal: { type: "string" }, source: { type: "object", properties: {
              path: { type: "string" }, start_line: { type: "integer", minimum: 1 }, end_line: { type: "integer", minimum: 1 },
            }, required: ["path", "start_line", "end_line"], additionalProperties: false },
          }, required: ["id", "candidate_id", "role", "signal", "source"], additionalProperties: false },
        },
        resource_observations: {
          type: "array", maxItems: 64, items: { type: "object", properties: {
            id: { type: "string" }, candidate_id: { type: "string" }, source_tool: { type: "string", enum: ["terraform"] },
            resource_type: { type: "string" }, address: { type: "string" }, source: { type: "object", properties: {
              path: { type: "string" }, start_line: { type: "integer", minimum: 1 }, end_line: { type: "integer", minimum: 1 },
            }, required: ["path", "start_line", "end_line"], additionalProperties: false },
          }, required: ["id", "candidate_id", "source_tool", "resource_type", "address", "source"], additionalProperties: false },
        },
      },
      required: ["candidates", "semantic_observations", "resource_observations"], additionalProperties: false,
    },
  },
  {
    name: "validate_okf_bundle",
    description: "Validate draft policy, known schemas and cross-document relationships for a bounded supplied OKF bundle in one call.",
    inputSchema: conceptSetInputSchema,
  },
  {
    name: "validate_okf_changes",
    description: "Validate changed OKF concepts against bounded unchanged target summaries. Identity is the OKF-root-relative Markdown path without .md.",
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

function guidanceRequest(args: Readonly<Record<string, unknown>>): OkfAuthoringGuidanceRequest {
  const object = (value: unknown, name: string, expected: readonly string[]): Readonly<Record<string, unknown>> => {
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${name} must be an object`);
    const item = value as Readonly<Record<string, unknown>>;
    if (Object.keys(item).sort().join("\0") !== [...expected].sort().join("\0")) throw new Error(`${name} contains unknown or missing fields`);
    return item;
  };
  const array = (value: unknown, name: string): readonly unknown[] => {
    if (!Array.isArray(value)) throw new Error(`${name} must be a list`);
    return value;
  };
  const source = (value: unknown) => {
    const item = object(value, "observation source", ["path", "start_line", "end_line"]);
    return { path: item.path as string, startLine: item.start_line as number, endLine: item.end_line as number };
  };
  object(args, "guidance request", ["candidates", "semantic_observations", "resource_observations"]);
  return {
    candidates: array(args.candidates, "candidates").map((value) => {
      const item = object(value, "candidate", ["id", "identity_hint", "identity_basis", "query_value", "evidence_ids"]);
      return { id: item.id as string, identityHint: item.identity_hint as string, identityBasis: item.identity_basis as string,
        queryValue: item.query_value as string, evidenceIds: array(item.evidence_ids, "candidate evidence_ids") as string[] };
    }),
    semanticObservations: array(args.semantic_observations, "semantic_observations").map((value) => {
      const item = object(value, "semantic observation", ["id", "candidate_id", "role", "signal", "source"]);
      return { id: item.id as string, candidateId: item.candidate_id as string,
        role: item.role as "documentation" | "implementation" | "configuration", signal: item.signal as string, source: source(item.source) };
    }),
    resourceObservations: array(args.resource_observations, "resource_observations").map((value) => {
      const item = object(value, "resource observation", ["id", "candidate_id", "source_tool", "resource_type", "address", "source"]);
      return { id: item.id as string, candidateId: item.candidate_id as string, sourceTool: item.source_tool as "terraform",
        resourceType: item.resource_type as string, address: item.address as string, source: source(item.source) };
    }),
  };
}

type SuppliedConcept = Readonly<{ identity: string; path: string; content: string }>;
type ParsedSuppliedConcept = Readonly<{ item: SuppliedConcept; concept: ConceptDocument }>
  | Readonly<{ item: SuppliedConcept; error: string }>;

function durableIdentity(pathValue: string): string {
  const normalized = normalizeHubConceptPath(pathValue);
  if (normalized !== pathValue || normalized.startsWith("okf/")) {
    throw new Error("path must be normalized and relative to the OKF root without an okf/ prefix");
  }
  return normalized.slice(0, -3);
}

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
      && item.identity === item.path.slice(0, -3) && !item.path.startsWith("okf/")
      && typeof item.type === "string" && item.type.length >= 1 && item.type.length <= 256);
  return valid ? { entries: supplied as OkfRelationshipTarget[] }
    : { error: "targets must use normalized OKF-root-relative paths and path-derived identities" };
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
    try {
      const expected = durableIdentity(entry.item.path);
      if (entry.item.identity !== expected) failures.push(`${entry.item.path}: identity must equal ${expected}`);
    } catch (error) {
      failures.push(`${entry.item.path}: ${error instanceof Error ? error.message : "invalid durable path"}`);
    }
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
      const guidance = getOkfAuthoringGuidance(guidanceRequest(args));
      return result({ ...guidance,
        okfVersion: "0.2",
        identityContract: "identity equals the normalized OKF-root-relative Markdown path without .md; never prefix paths with okf/",
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
