export const OKF_VERSION = "0.2" as const;
export const OKF_SHARED_DIRECTORY = "okf" as const;
export {
  assertConfirmedDomainAssignment,
  normalizeConfirmedDomain,
  validateConfirmedDomainAssignment,
  type ConfirmedDomain,
  type ConfirmedDomainInput,
} from "./governance/confirmed-domain.ts";
export {
  normalizeHubConceptPath,
  listHubConcepts,
  readHubConcept,
  searchHubConcepts,
  traverseHubConcepts,
  type HubConceptSummary,
  type HubQueryMatch,
  type HubListOptions,
  type HubQueryReader,
  type HubSearchMatch,
  type HubSearchOptions,
  type HubSearchResult,
  type HubTraversalEdge,
  type HubTraversalOptions,
  type HubTraversalResult,
} from "./query/hub-query.ts";
export {
  buildHubContinuity,
  type HubContinuityManifest,
  type HubContinuityOptions,
} from "./query/hub-continuity.ts";
export {
  AGENTBASE_OKF_SCHEMA_CATALOG_VERSION,
  RETIRED_AGENTBASE_SCHEMA_TYPES,
  getOkfConceptSchema,
  listOkfConceptSchemas,
  selectOkfConceptSchemas,
  validateConceptAgainstSchema,
  type OkfConceptSchema,
  type OkfSchemaSelection,
} from "./schemas/catalog.ts";
export type {
  ConceptCandidate,
  MappingProfileVersion,
  ObservationSource,
  OkfAuthoringGuidance,
  OkfAuthoringGuidanceRequest,
  OkfAuthoringRecommendation,
  ResourceSourceTool,
  ResourceObservation,
  SemanticObservation,
  TechnologyMetadata,
} from "./schemas/guidance.ts";
export { getOkfAuthoringGuidance, OkfGuidanceInputError } from "./schemas/guidance.ts";
export { AWS_PROVIDER_PROFILE, listAwsResourceMappings, mapAwsResource } from "./schemas/profiles/aws.ts";
export { TERRAFORM_FAMILY_DETECTOR_PROFILE, detectTerraformResource } from "./schemas/profiles/terraform.ts";
export {
  conceptReferencesRepository,
  createRepositorySourceResource,
  OkfValidationError,
  parseConceptDocument,
  renderConceptDocument,
  repositorySourceResources,
  validateAgentBaseDraft,
  validatePublishableAgentBaseDraft,
  type ConceptDocument,
  type OkfFrontmatter,
  type OkfScalar,
  type OkfValue,
  type VerificationEvent,
} from "./documents/okf-document.ts";
export { computeOkfTreeDigest, loadOkfBundle, type LoadOkfBundleOptions, type OkfBundle } from "./documents/okf-bundle.ts";
export {
  validateOkfRelationships,
  type OkfRelationshipConcept,
  type OkfRelationshipTarget,
  type OkfRelationshipValidation,
  type ValidatedOkfRelationship,
  type ValidatedOkfFlowStep,
} from "./documents/okf-relationships.ts";
export {
  CANONICAL_RELATIONSHIP_KINDS,
  FLOW_STEP_ACTIONS,
  FLOW_STEP_MODES,
  isCanonicalRelationshipKind,
  type CanonicalRelationshipKind,
} from "./documents/relationship-vocabulary.ts";
export {
  diffBundleProposal,
  isMutableAgentBaseDraft,
  prepareBundleProposal,
  readProposalMetadata,
  validateBundleProposal,
  type PrepareProposalOptions,
  type ProposalDiff,
  type ProposalDiffEntry,
  type ProposalMetadata,
  type ProposalState,
  type ValidateProposalOptions,
} from "./proposals/proposal.ts";
export {
  readMaintainerDirectives,
  type MaintainerDirective,
  type MaintainerDirectiveSet,
} from "./governance/directives.ts";
export {
  readRepositoryIdentityRecord,
  resolveRepositoryIdentity,
  type RepositoryIdentityHints,
  type RepositoryIdentityRecord,
  type RepositoryIdentityResolution,
} from "./governance/repository-identity.ts";
export {
  readLiveClaims,
  validateBundleLiveClaims,
  type LiveClaim,
  type LiveClaimRole,
  type LiveClaimTargetKind,
} from "./governance/live-claims.ts";
export {
  applyBundleProposal,
  recoverBundleSwitch,
  type ApplyBundleOptions,
  type RecoveryResult,
  type SwitchManifest,
  type SwitchPhase,
} from "./proposals/switch.ts";
