import type { ConceptDocument } from "./okf-document.ts";
import { OKF_CONCEPT_SCHEMAS, type OkfConceptSchema } from "./schema-definitions.ts";

export type { OkfConceptSchema } from "./schema-definitions.ts";

export const AGENTBASE_OKF_SCHEMA_CATALOG_VERSION = "2.0.0" as const;

export type OkfSchemaSelection = Readonly<{
  type: string;
  matchedSignals: readonly string[];
  missingEvidence: readonly string[];
}>;

const schemas: readonly OkfConceptSchema[] = OKF_CONCEPT_SCHEMAS;

export function listOkfConceptSchemas(): readonly OkfConceptSchema[] { return schemas; }
export function getOkfConceptSchema(type: string): OkfConceptSchema | undefined { return schemas.find((item) => item.type === type); }

function matchesSignal(signal: string, rule: string): boolean {
  if (/^[a-z0-9]+$/.test(rule)) {
    return new RegExp(`(?:^|[^a-z0-9])${rule}(?:$|[^a-z0-9])`).test(signal);
  }
  return signal.includes(rule);
}

export function selectOkfConceptSchemas(signals: readonly string[]): readonly OkfSchemaSelection[] {
  const normalized = [...new Set(signals.map((signal) => signal.trim().toLocaleLowerCase()).filter(Boolean))];
  const selected = schemas.flatMap((item) => {
    const matchedSignals = normalized.filter((signal) => item.selectWhen.some((rule) => matchesSignal(signal, rule)));
    if (!matchedSignals.length) return [];
    const missingEvidence = item.evidenceRequirements.filter((requirement) => !normalized.some((signal) => signal.includes(requirement.toLocaleLowerCase())));
    return [{ type: item.type, matchedSignals, missingEvidence, specificity: item.specificity, fallbackType: item.fallbackType }];
  });
  const shadowed = new Set(selected.flatMap((item) => item.fallbackType ? [item.fallbackType] : []));
  return selected
    .filter((item) => !shadowed.has(item.type))
    .sort((left, right) => right.specificity - left.specificity || left.type.localeCompare(right.type))
    .map(({ type, matchedSignals, missingEvidence }) => ({ type, matchedSignals, missingEvidence }));
}

export function validateConceptAgainstSchema(concept: ConceptDocument): readonly string[] {
  const selected = getOkfConceptSchema(concept.type);
  if (!selected) return [];
  return selected.requiredFrontmatter.flatMap((field) => concept.frontmatter[field] === undefined
    ? [`${concept.path}: ${concept.type} requires ${field}`]
    : []);
}
