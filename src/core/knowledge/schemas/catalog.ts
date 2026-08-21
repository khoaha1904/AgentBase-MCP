import type { ConceptDocument } from "../documents/okf-document.ts";
import { OKF_CONCEPT_SCHEMAS, type OkfConceptSchema } from "./definitions/concepts.ts";

export type { OkfConceptSchema } from "./definitions/concepts.ts";

export const AGENTBASE_OKF_SCHEMA_CATALOG_VERSION = "7.0.0" as const;

export const RETIRED_AGENTBASE_SCHEMA_TYPES: ReadonlyMap<string, string> = new Map([
  ["AWS Lambda", "Function"],
  ["Software Component", "Component"],
  ["Service", "Component"],
  ["API Surface", "Interface"],
  ["API Endpoint", "Interface"],
  ["Event", "Interface"],
  ["Business Flow", "Flow"],
  ["Domain Entity", "Entity"],
  ["Server", "re-ingest under catalog 7 promotion rules"],
  ["Queue", "re-ingest under catalog 7 promotion rules"],
  ["Database", "re-ingest under catalog 7 promotion rules"],
  ["Database Table", "re-ingest under catalog 7 promotion rules"],
  ["Object Storage", "re-ingest under catalog 7 promotion rules"],
  ["Infrastructure Definition", "re-ingest under catalog 7 promotion rules"],
  ["Infrastructure Module", "re-ingest under catalog 7 promotion rules"],
  ["Deployment", "re-ingest under catalog 7 promotion rules"],
  ["AWS SQS Queue", "re-ingest under catalog 7 promotion rules"],
  ["Terraform Module", "re-ingest under catalog 7 promotion rules"],
] as const);

export type OkfSchemaSelection = Readonly<{
  type: string;
  matchedSignals: readonly string[];
  missingEvidence: readonly string[];
}>;

function inheritSchema(schema: OkfConceptSchema, seen: ReadonlySet<string> = new Set()): OkfConceptSchema {
  if (!schema.fallbackType || seen.has(schema.type)) return schema;
  const fallback = OKF_CONCEPT_SCHEMAS.find((item) => item.type === schema.fallbackType);
  if (!fallback) return schema;
  const inherited = inheritSchema(fallback, new Set([...seen, schema.type]));
  const relations = [...inherited.relationshipGuidance, ...schema.relationshipGuidance];
  const relationKeys = new Set<string>();
  return {
    ...schema,
    allowedLinks: [...new Set([...inherited.allowedLinks, ...schema.allowedLinks])],
    relationshipGuidance: relations.filter((item) => {
      const key = `${item.kind}\0${item.targetTypes.join("\0")}`;
      if (relationKeys.has(key)) return false;
      relationKeys.add(key);
      return true;
    }),
  };
}

const schemas: readonly OkfConceptSchema[] = OKF_CONCEPT_SCHEMAS.map((schema) => inheritSchema(schema));

export function listOkfConceptSchemas(): readonly OkfConceptSchema[] { return schemas; }
export function getOkfConceptSchema(type: string): OkfConceptSchema | undefined { return schemas.find((item) => item.type === type); }

function matchesSignal(signal: string, rule: string): boolean {
  const signalTokens = signal.split(/[^a-z0-9]+/).filter(Boolean);
  const ruleTokens = rule.split(/[^a-z0-9]+/).filter(Boolean);
  const matchesToken = (expected: string, actual: string) => actual === expected
    || (ruleTokens.length > 1 && (actual === `${expected}s` || actual === `${expected}es`
      || (expected.endsWith("y") && actual === `${expected.slice(0, -1)}ies`)));
  return ruleTokens.length > 0
    && ruleTokens.every((expected) => signalTokens.some((actual) => matchesToken(expected, actual)));
}

export function selectOkfConceptSchemas(
  signals: readonly string[], scope: "initial-ingest" | "enrichment" = "initial-ingest",
): readonly OkfSchemaSelection[] {
  const normalized = [...new Set(signals.map((signal) => signal.trim().toLocaleLowerCase()).filter(Boolean))];
  const selected = schemas.filter((item) => item.authoringScope === scope).flatMap((item) => {
    const matchedSignals = normalized.filter((signal) => item.selectWhen.some((rule) => matchesSignal(signal, rule)));
    if (!matchedSignals.length) return [];
    const missingEvidence = item.evidenceRequirements.filter((requirement) => !normalized.some((signal) => signal.includes(requirement.toLocaleLowerCase())));
    return [{ type: item.type, matchedSignals, missingEvidence, specificity: item.specificity, fallbackType: item.fallbackType }];
  });
  return selected
    .filter((item) => !selected.some((specialization) => specialization.fallbackType === item.type
      && item.matchedSignals.every((signal) => specialization.matchedSignals.includes(signal))))
    .sort((left, right) => right.specificity - left.specificity || left.type.localeCompare(right.type))
    .map(({ type, matchedSignals, missingEvidence }) => ({ type, matchedSignals, missingEvidence }));
}

export function validateConceptAgainstSchema(concept: ConceptDocument): readonly string[] {
  const replacement = RETIRED_AGENTBASE_SCHEMA_TYPES.get(concept.type);
  if (replacement) return [`${concept.path}: ${concept.type} is retired for AgentBase authoring; use ${replacement}`];
  const selected = getOkfConceptSchema(concept.type);
  if (!selected) return [];
  return selected.requiredFrontmatter.flatMap((field) => concept.frontmatter[field] === undefined
    ? [`${concept.path}: ${concept.type} requires ${field}`]
    : []);
}
