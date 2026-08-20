/** Stable shape shared by every released AgentBase concept schema. */
export type OkfConceptSchema = Readonly<{
  type: string;
  purpose: string;
  directoryHint: string;
  specificity: number;
  fallbackType?: string;
  selectWhen: readonly string[];
  evidenceRequirements: readonly string[];
  requiredFrontmatter: readonly string[];
  recommendedSections: readonly string[];
  allowedLinks: readonly string[];
  investigationQuestions: readonly string[];
  metadataGuidance: readonly Readonly<{ field: string; evidence: string; requiredWhenSupported: boolean }>[];
  relationshipGuidance: readonly Readonly<{ kind: string; targetTypes: readonly string[]; evidence: string }>[];
  flowStepGuidance?: Readonly<{ actions: readonly string[]; modes: readonly string[]; evidence: string }>;
  optionalEnrichment: readonly string[];
  limitationGuidance: string;
}>;

type SchemaOptions = Readonly<{
  fallbackType?: string;
  requiredFrontmatter?: readonly string[];
  investigationQuestions?: readonly string[];
  metadataGuidance?: OkfConceptSchema["metadataGuidance"];
  relationshipGuidance?: OkfConceptSchema["relationshipGuidance"];
  flowStepGuidance?: OkfConceptSchema["flowStepGuidance"];
  optionalEnrichment?: readonly string[];
}>;

const generatedEvidence = ["title", "description", "generated", "sources"];
const limitations = "State missing or contradictory evidence explicitly; never invent semantic fields.";

export function defineSchema(
  type: string, purpose: string, directoryHint: string, specificity: number,
  selectWhen: readonly string[], evidenceRequirements: readonly string[],
  recommendedSections: readonly string[], allowedLinks: readonly string[],
  options: SchemaOptions = {},
): OkfConceptSchema {
  return {
    type, purpose, directoryHint, specificity, selectWhen, evidenceRequirements, recommendedSections, allowedLinks,
    ...(options.fallbackType ? { fallbackType: options.fallbackType } : {}),
    requiredFrontmatter: options.requiredFrontmatter ?? generatedEvidence,
    investigationQuestions: options.investigationQuestions ?? evidenceRequirements.map((item) => `What source proves ${item}?`),
    metadataGuidance: options.metadataGuidance ?? [],
    relationshipGuidance: options.relationshipGuidance ?? [],
    ...(options.flowStepGuidance ? { flowStepGuidance: options.flowStepGuidance } : {}),
    optionalEnrichment: options.optionalEnrichment ?? [],
    limitationGuidance: limitations,
  };
}
