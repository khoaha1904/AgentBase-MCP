import type { OkfConceptSchema } from "./definition.ts";
import { AGENTBASE_OKF_SCHEMA_CATALOG_VERSION, getOkfConceptSchema, selectOkfConceptSchemas } from "./catalog.ts";
import { AWS_PROVIDER_PROFILE, mapAwsResource } from "./profiles/aws.ts";
import { TERRAFORM_FAMILY_DETECTOR_PROFILE, detectTerraformResource } from "./profiles/terraform.ts";
import { CLOUDFORMATION_DETECTOR_PROFILE, detectCloudFormationResource } from "./profiles/cloudformation.ts";
import type { DetectedResource, ProviderResourceMapping } from "./profiles/definition.ts";

export type ObservationSource = Readonly<{ path: string; startLine: number; endLine: number }>;
export type ResourceSourceTool = "terraform" | "terragrunt" | "sam" | "cloudformation";

function detectResource(observation: ResourceObservation): DetectedResource {
  return observation.sourceTool === "sam" || observation.sourceTool === "cloudformation"
    ? detectCloudFormationResource(observation) : detectTerraformResource(observation);
}
export type PromotionBasis = "shared-contract" | "cross-boundary" | "ownership" | "lifecycle"
  | "failure" | "security" | "operational";
export type PromotionEvidence = Readonly<{ basis: PromotionBasis; evidenceIds: readonly string[] }>;

export type ConceptCandidate = Readonly<{
  id: string;
  identityHint: string;
  identityBasis: string;
  queryValue: string;
  evidenceIds: readonly string[];
  disposition: "concept" | "embedded";
  parentCandidateId?: string;
  suggestedType?: string;
  promotion?: PromotionEvidence;
}>;

export type SemanticObservation = Readonly<{
  id: string;
  candidateId: string;
  role: "implementation" | "configuration" | "documentation";
  signal: string;
  source: ObservationSource;
}>;

export type ResourceObservation = Readonly<{
  id: string;
  candidateId: string;
  sourceTool: ResourceSourceTool;
  resourceType: string;
  address: string;
  source: ObservationSource;
}>;

export type OkfAuthoringGuidanceRequest = Readonly<{
  candidates: readonly ConceptCandidate[];
  semanticObservations: readonly SemanticObservation[];
  resourceObservations: readonly ResourceObservation[];
}>;

export type TechnologyMetadata = Readonly<{
  kind?: string;
  provider?: string;
  product?: string;
  sourceTool?: string;
  resourceType?: string;
}>;

export type MappingProfileVersion = Readonly<{ id: string; version: string }>;

export type OkfAuthoringRecommendation = Readonly<{
  candidateId: string;
  disposition: "concept" | "embedded";
  parentCandidateId?: string;
  status: "exact" | "suggested" | "embedded" | "ambiguous" | "unsupported";
  schema?: OkfConceptSchema;
  matchedEvidence: readonly string[];
  missingEvidence: readonly string[];
  technology: TechnologyMetadata;
  detectorProfile?: MappingProfileVersion;
  providerProfile?: MappingProfileVersion;
  limitations: readonly string[];
}>;

export type OkfAuthoringGuidance = Readonly<{
  catalogVersion: string;
  recommendations: readonly OkfAuthoringRecommendation[];
}>;

export class OkfGuidanceInputError extends Error {}

type TechnologyDetection = Readonly<{
  observation: ResourceObservation;
  result: DetectedResource;
  mapping?: ProviderResourceMapping;
}>;

const ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const PROMOTION_BASES: readonly PromotionBasis[] = [
  "shared-contract", "cross-boundary", "ownership", "lifecycle", "failure", "security", "operational",
];

function requireText(value: string, name: string, maximum = 512): void {
  if (typeof value !== "string" || !value.trim() || Buffer.byteLength(value) > maximum) {
    throw new Error(`${name} must be a bounded non-empty string`);
  }
}

function requireExactKeys(value: object, expected: readonly string[], name: string): void {
  const actual = Object.keys(value).sort();
  const keys = [...expected].sort();
  if (actual.length !== keys.length || actual.some((item, index) => item !== keys[index])) {
    throw new Error(`${name} contains unknown or missing fields`);
  }
}

function validateSource(source: ObservationSource): void {
  if (!source.path || source.path.startsWith("/") || source.path.split("/").some((part) => !part || part === "." || part === "..")
    || !Number.isInteger(source.startLine) || !Number.isInteger(source.endLine)
    || source.startLine < 1 || source.endLine < source.startLine) {
    throw new Error("observation source must be one normalized relative path and positive line span");
  }
}

function validateRequest(request: OkfAuthoringGuidanceRequest): void {
  requireExactKeys(request, ["candidates", "semanticObservations", "resourceObservations"], "guidance request");
  if (!request.candidates.length || request.candidates.length > 64
    || request.semanticObservations.length > 64 || request.resourceObservations.length > 64) {
    throw new Error("guidance accepts 1..64 candidates and at most 64 observations of each kind");
  }
  const candidates = new Map<string, ConceptCandidate>();
  for (const candidate of request.candidates) {
    requireExactKeys(candidate, ["id", "identityHint", "identityBasis", "queryValue", "evidenceIds", "disposition",
      ...(candidate.parentCandidateId === undefined ? [] : ["parentCandidateId"]),
      ...(candidate.suggestedType === undefined ? [] : ["suggestedType"]),
      ...(candidate.promotion === undefined ? [] : ["promotion"])], "candidate");
    if (!ID.test(candidate.id) || candidates.has(candidate.id)) throw new Error("candidate IDs must be unique and bounded");
    requireText(candidate.identityHint, "candidate identity hint");
    requireText(candidate.identityBasis, "candidate identity basis");
    requireText(candidate.queryValue, "candidate query value");
    if (!(["concept", "embedded"] as const).includes(candidate.disposition)) throw new Error("candidate disposition is invalid");
    if (candidate.suggestedType !== undefined) {
      requireText(candidate.suggestedType, "candidate suggested type", 256);
      if (getOkfConceptSchema(candidate.suggestedType)?.authoringScope !== "initial-ingest") {
        throw new Error("candidate suggested type must name a released Initial Ingest schema");
      }
    }
    if (candidate.promotion !== undefined) {
      requireExactKeys(candidate.promotion, ["basis", "evidenceIds"], "candidate promotion");
      if (!PROMOTION_BASES.includes(candidate.promotion.basis)) throw new Error("candidate promotion basis is invalid");
      if (!candidate.promotion.evidenceIds.length || candidate.promotion.evidenceIds.length > 64) {
        throw new Error("candidate promotion evidence IDs must be a bounded non-empty list");
      }
      if (candidate.disposition === "concept" && candidate.suggestedType === undefined) {
        throw new Error("candidate promotion requires standalone suggested concept intent");
      }
    }
    if (candidate.disposition === "concept" && candidate.parentCandidateId !== undefined) {
      throw new Error("concept candidate cannot name an embedded parent");
    }
    if (!candidate.evidenceIds.length || candidate.evidenceIds.length > 64) {
      throw new Error("candidate evidence IDs must be a bounded non-empty list");
    }
    candidates.set(candidate.id, candidate);
  }
  for (const candidate of candidates.values()) {
    if (candidate.disposition === "embedded") {
      const parent = candidate.parentCandidateId ? candidates.get(candidate.parentCandidateId) : undefined;
      if (!parent || parent.disposition !== "concept" || parent.id === candidate.id) {
        throw new Error("embedded candidate parent must name a concept candidate");
      }
    }
  }
  const observations = [...request.semanticObservations, ...request.resourceObservations];
  const observationIds = new Set<string>();
  for (const observation of observations) {
    if (!ID.test(observation.id) || observationIds.has(observation.id)) throw new Error("observation IDs must be unique and bounded");
    if (!candidates.has(observation.candidateId)) throw new Error(`unknown observation candidate: ${observation.candidateId}`);
    validateSource(observation.source);
    observationIds.add(observation.id);
  }
  for (const observation of request.semanticObservations) {
    requireExactKeys(observation, ["id", "candidateId", "role", "signal", "source"], "semantic observation");
    requireExactKeys(observation.source, ["path", "startLine", "endLine"], "observation source");
    if (!["documentation", "implementation", "configuration"].includes(observation.role)) throw new Error("semantic observation role is invalid");
    requireText(observation.signal, "semantic observation", 2048);
  }
  for (const observation of request.resourceObservations) {
    requireExactKeys(observation, ["id", "candidateId", "sourceTool", "resourceType", "address", "source"], "resource observation");
    requireExactKeys(observation.source, ["path", "startLine", "endLine"], "observation source");
    if (!(["terraform", "terragrunt", "sam", "cloudformation"] as const).includes(observation.sourceTool)) {
      throw new Error("resource observation source tool is unsupported");
    }
    requireText(observation.resourceType, "resource type", 256);
    requireText(observation.address, "resource address", 512);
    detectResource(observation);
  }
  for (const candidate of candidates.values()) {
    if (candidate.evidenceIds.some((id) => !observationIds.has(id))) throw new Error(`candidate ${candidate.id} cites unknown evidence`);
    if (candidate.disposition === "embedded" && candidate.evidenceIds.some((id) => (
      observations.find((item) => item.id === id)?.candidateId !== candidate.id
    ))) {
      throw new Error(`candidate ${candidate.id} cites evidence owned by another candidate`);
    }
    if (candidate.promotion?.evidenceIds.some((id) => !candidate.evidenceIds.includes(id))) {
      throw new Error(`candidate ${candidate.id} promotion must cite candidate evidence`);
    }
    if (candidate.disposition === "concept" && ["Interface", "Resource"].includes(candidate.suggestedType ?? "") && candidate.promotion
      && !candidate.evidenceIds.some((id) => request.semanticObservations
        .some((item) => item.id === id && item.candidateId === candidate.id))) {
      throw new Error(`candidate ${candidate.id} Interface/Resource promotion requires semantic evidence`);
    }
  }
}

function technologyFrom(detection: TechnologyDetection | undefined): TechnologyMetadata {
  if (!detection) return {};
  return {
    ...(detection.mapping?.technologyKind ? { kind: detection.mapping.technologyKind } : {}),
    ...(detection.result.provider ? { provider: detection.result.provider } : {}),
    ...(detection.mapping?.product ? { product: detection.mapping.product } : {}),
    sourceTool: detection.result.sourceTool,
    resourceType: detection.result.resourceType,
  };
}

export function getOkfAuthoringGuidance(request: OkfAuthoringGuidanceRequest): OkfAuthoringGuidance {
  try {
    validateRequest(request);
  } catch (error) {
    throw new OkfGuidanceInputError(error instanceof Error ? error.message : "guidance request is invalid");
  }
  const recommendations = request.candidates.map((candidate): OkfAuthoringRecommendation => {
    const semantic = request.semanticObservations.filter((item) => item.candidateId === candidate.id);
    const resources = request.resourceObservations.filter((item) => item.candidateId === candidate.id);
    const detections: readonly TechnologyDetection[] = resources.map((observation): TechnologyDetection => {
      const result = detectResource(observation);
      const mapping = result.status === "exact" && result.provider === "aws" ? mapAwsResource(result.resourceType) : undefined;
      return mapping ? { observation, result, mapping } : { observation, result };
    });
    const limitations = detections.flatMap((item) => item.result.limitations);
    const mapped = detections.filter((item) => item.mapping);
    const distinctTechnologies = new Set(mapped.map((item) => `${item.mapping!.product}\0${item.mapping!.technologyKind}`));
    const technology = technologyFrom(mapped[0] ?? detections[0]);
    const detectorProfiles = new Set(resources.map((item) => item.sourceTool === "sam" || item.sourceTool === "cloudformation"
      ? CLOUDFORMATION_DETECTOR_PROFILE : TERRAFORM_FAMILY_DETECTOR_PROFILE));
    const base = {
      candidateId: candidate.id,
      disposition: candidate.disposition,
      matchedEvidence: candidate.evidenceIds,
      missingEvidence: [],
      technology,
      ...(detectorProfiles.size === 1 ? { detectorProfile: [...detectorProfiles][0]! } : {}),
      ...(mapped.length ? { providerProfile: AWS_PROVIDER_PROFILE } : {}),
    } as const;
    if (detectorProfiles.size > 1 || detections.some((item) => item.result.status === "ambiguous") || distinctTechnologies.size > 1) return {
      ...base,
      status: "ambiguous",
      limitations: [...limitations, ...(distinctTechnologies.size > 1 ? ["evidence identifies multiple technology resources"] : []),
        ...(detectorProfiles.size > 1 ? ["candidate combines multiple source detector families; qualify observations separately"] : [])],
    };
    if (candidate.disposition === "embedded") {
      const ignoredStandaloneHints = candidate.suggestedType !== undefined || candidate.promotion !== undefined
        ? ["embedded disposition overrides standalone suggested type and promotion hints"] : [];
      if (!mapped.length) return {
        ...base,
        parentCandidateId: candidate.parentCandidateId!,
        status: "embedded",
        limitations: [...limitations, ...ignoredStandaloneHints,
          `embedded in ${candidate.parentCandidateId}; technology is retained provider-neutral because no released provider profile maps it`],
      };
      return {
        ...base,
        parentCandidateId: candidate.parentCandidateId!,
        status: "embedded",
        limitations: [...limitations, ...ignoredStandaloneHints,
          `embedded in ${candidate.parentCandidateId}; technology detection does not promote a concept`],
      };
    }
    const exactFunction = mapped.length === 1 && mapped[0]?.mapping?.technologyKind === "runtime-function";
    const semanticSelections = selectOkfConceptSchemas(semantic.map((item) => item.signal));
    const semanticTypes = [...new Set(semanticSelections.map((item) => item.type))];
    if (exactFunction) {
      const schema = getOkfConceptSchema("Function")!;
      return {
        ...base,
        status: "exact",
        schema,
        missingEvidence: semanticSelections.find((item) => item.type === "Function")?.missingEvidence ?? [],
        limitations: [...limitations, ...(candidate.suggestedType && candidate.suggestedType !== "Function"
          ? [`exact structured mapping Function overrides suggested type ${candidate.suggestedType}`] : [])],
      };
    }
    const semanticRoleNote = candidate.suggestedType && semanticTypes.length
      && !semanticTypes.includes(candidate.suggestedType)
      ? [`semantic role hints ${semanticTypes.join(", ")} differ from suggested type ${candidate.suggestedType}; the suggestion remains reviewable intent`]
      : [];
    if (candidate.suggestedType === "Interface" || candidate.suggestedType === "Resource") {
      const compatibleBases = candidate.suggestedType === "Interface"
        ? ["shared-contract", "cross-boundary"]
        : ["cross-boundary", "ownership", "lifecycle", "failure", "security", "operational"];
      if (!candidate.promotion || !compatibleBases.includes(candidate.promotion.basis)) return {
        ...base,
        status: "unsupported",
        limitations: [...limitations,
          `${candidate.suggestedType} requires a compatible promotion basis and candidate-owned semantic evidence; declaration or suggested type alone remains embedded knowledge`],
      };
    }
    const schemaType = candidate.suggestedType ?? (semanticTypes.length === 1 ? semanticTypes[0] : undefined);
    if (!schemaType) return {
      ...base,
      status: semanticTypes.length > 1 ? "ambiguous" : "unsupported",
      limitations: [...limitations, semanticTypes.length > 1
        ? `evidence maps to multiple schema roles: ${semanticTypes.join(", ")}`
        : "no released provider-neutral schema promotion was established"],
    };
    const schema = getOkfConceptSchema(schemaType)!;
    return {
      ...base,
      status: "suggested",
      schema,
      missingEvidence: semanticSelections.find((item) => item.type === schema.type)?.missingEvidence ?? [],
      limitations: [...limitations, ...semanticRoleNote,
        `${schema.type} is an evidence-bound semantic suggestion and requires proposal review`],
    };
  });
  return { catalogVersion: AGENTBASE_OKF_SCHEMA_CATALOG_VERSION, recommendations };
}
