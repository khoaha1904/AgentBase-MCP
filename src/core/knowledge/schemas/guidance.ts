import type { OkfConceptSchema } from "./definition.ts";
import { AGENTBASE_OKF_SCHEMA_CATALOG_VERSION, getOkfConceptSchema, selectOkfConceptSchemas } from "./catalog.ts";
import { AWS_PROVIDER_PROFILE, mapAwsResource } from "./profiles/aws.ts";
import { TERRAFORM_DETECTOR_PROFILE, detectTerraformResource } from "./profiles/terraform.ts";
import type { DetectedResource } from "./profiles/definition.ts";

export type ObservationSource = Readonly<{ path: string; startLine: number; endLine: number }>;

export type ConceptCandidate = Readonly<{
  id: string;
  identityHint: string;
  identityBasis: string;
  queryValue: string;
  evidenceIds: readonly string[];
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
  sourceTool: "terraform";
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
  provider?: string;
  product?: string;
  sourceTool?: string;
  resourceType?: string;
}>;

export type MappingProfileVersion = Readonly<{ id: string; version: string }>;

export type OkfAuthoringRecommendation = Readonly<{
  candidateId: string;
  status: "exact" | "ambiguous" | "unsupported";
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

type MappedResource = Readonly<{
  observation: ResourceObservation;
  result: DetectedResource;
  schemaType: string;
  product?: string;
}>;

const ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;

function requireText(value: string, name: string, maximum = 512): void {
  if (typeof value !== "string" || !value.trim() || Buffer.byteLength(value) > maximum) throw new Error(`${name} must be a bounded non-empty string`);
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
    requireExactKeys(candidate, ["id", "identityHint", "identityBasis", "queryValue", "evidenceIds"], "candidate");
    if (!ID.test(candidate.id) || candidates.has(candidate.id)) throw new Error("candidate IDs must be unique and bounded");
    requireText(candidate.identityHint, "candidate identity hint");
    requireText(candidate.identityBasis, "candidate identity basis");
    requireText(candidate.queryValue, "candidate query value");
    if (!candidate.evidenceIds.length || candidate.evidenceIds.length > 64) throw new Error("candidate evidence IDs must be a bounded non-empty list");
    candidates.set(candidate.id, candidate);
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
    if (observation.sourceTool !== "terraform") throw new Error("resource observation source tool is unsupported");
    requireText(observation.resourceType, "resource type", 256);
    requireText(observation.address, "resource address", 512);
  }
  for (const candidate of candidates.values()) {
    if (candidate.evidenceIds.some((id) => !observationIds.has(id))) throw new Error(`candidate ${candidate.id} cites unknown evidence`);
    if (candidate.evidenceIds.some((id) => observations.find((item) => item.id === id)?.candidateId !== candidate.id)) {
      throw new Error(`candidate ${candidate.id} cites evidence owned by another candidate`);
    }
  }
}

export function getOkfAuthoringGuidance(request: OkfAuthoringGuidanceRequest): OkfAuthoringGuidance {
  validateRequest(request);
  const recommendations = request.candidates.map((candidate): OkfAuthoringRecommendation => {
    const semantic = request.semanticObservations.filter((item) => item.candidateId === candidate.id);
    const resources = request.resourceObservations.filter((item) => item.candidateId === candidate.id);
    const detected = resources.map((observation) => ({ observation, result: detectTerraformResource(observation) }));
    const mapped: readonly MappedResource[] = detected.flatMap(({ observation, result }): MappedResource[] => {
      if (result.status !== "exact") return [];
      if (result.resourceType === "module") return [{
        observation, result, schemaType: "Infrastructure Module",
      }];
      const mapping = result.provider === "aws" ? mapAwsResource(result.resourceType) : undefined;
      return mapping ? [{ observation, result, schemaType: mapping.schemaType, product: mapping.product }] : [];
    });
    const semanticSelections = selectOkfConceptSchemas(semantic.map((item) => item.signal));
    const schemaTypes = [...new Set([...mapped.map((item) => item.schemaType), ...semanticSelections.map((item) => item.type)])];
    const limitations = detected.flatMap((item) => item.result.limitations);
    if (schemaTypes.length !== 1) return {
      candidateId: candidate.id,
      status: schemaTypes.length || detected.some((item) => item.result.status === "ambiguous") ? "ambiguous" : "unsupported",
      matchedEvidence: candidate.evidenceIds,
      missingEvidence: [],
      technology: {},
      ...(resources.length ? { detectorProfile: TERRAFORM_DETECTOR_PROFILE } : {}),
      limitations: [...limitations, schemaTypes.length
        ? `evidence maps to multiple schema roles: ${schemaTypes.join(", ")}`
        : "no released provider-neutral schema mapping was established"],
    };
    const schema = getOkfConceptSchema(schemaTypes[0]!);
    if (!schema) throw new Error(`mapped schema is not released: ${schemaTypes[0]}`);
    const resource = mapped.find((item) => item.schemaType === schema.type);
    const semanticSelection = semanticSelections.find((item) => item.type === schema.type);
    return {
      candidateId: candidate.id,
      status: "exact",
      schema,
      matchedEvidence: candidate.evidenceIds,
      missingEvidence: semanticSelection?.missingEvidence ?? [],
      technology: resource ? {
        ...(resource.result.provider ? { provider: resource.result.provider } : {}),
        ...(resource.product ? { product: resource.product } : {}),
        sourceTool: resource.result.sourceTool,
        resourceType: resource.result.resourceType,
      } : {},
      ...(resources.length ? { detectorProfile: TERRAFORM_DETECTOR_PROFILE } : {}),
      ...(resource?.result.provider === "aws" ? { providerProfile: AWS_PROVIDER_PROFILE } : {}),
      limitations,
    };
  });
  return { catalogVersion: AGENTBASE_OKF_SCHEMA_CATALOG_VERSION, recommendations };
}
