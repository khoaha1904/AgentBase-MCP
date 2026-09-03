export const OKF_VERSION = "0.2" as const;
export const OKF_SHARED_DIRECTORY = "okf" as const;
export {
  appendKnowledgeActivity,
  parseKnowledgeActivityLog,
  renderKnowledgeActivityLog,
  repositoryActivityLogPath,
  type KnowledgeActivityEntry,
} from "./documents/activity-log.ts";
export {
  createInventoryReceipt,
  createInventoryItemId,
  createQuestionPlanId,
  rebaseInventoryReceipt,
  DISCOVERY_LANES,
  DiscoveryValidationError,
  validateDiscoveryInventory,
  validateDiscoverySeed,
  validateInventoryReceipt,
  type CoverageResult,
  type DiscoveryOutcome,
  type DiscoveryGroup,
  type DiscoveryInventory,
  type DiscoveryLane,
  type DiscoveryLaneResult,
  type DiscoveryPriority,
  type DiscoverySeed,
  type DiscoverySourceIdentity,
  type InventoryItem,
  type InventoryOutput,
  type InventoryReceipt,
  type QuestionPlan,
} from "./discovery.ts";
export {
  normalizeHubRemovalDeclarations,
  type HubRemovalDeclaration,
} from "./proposals/refresh.ts";
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
  type HubConceptSummary,
  type HubQueryMatch,
  type HubListOptions,
  type HubQueryReader,
  type HubSearchMatch,
  type HubSearchOptions,
  type HubSearchResult,
} from "./query/hub-query.ts";
export {
  loadHubGraph,
  resolveHubIdentity,
  summarizeHubConcept,
  type HubGraph,
  type HubGraphConcept,
  type HubGraphEdge,
} from "./query/hub-query-graph.ts";
export {
  buildHubContinuity,
  type HubContinuityGap,
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
  parseRepositorySourceResource,
  renderConceptDocument,
  repositorySourceResources,
  validateAgentBaseDraft,
  validatePublishableAgentBaseDraft,
  type ConceptDocument,
  type OkfFrontmatter,
  type OkfScalar,
  type OkfValue,
  type RepositorySourceResource,
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
  displayEndpoints,
  relationshipDisplayDescriptor,
  RELATIONSHIP_DISPLAY_DESCRIPTORS,
  type RelationshipDisplayClass,
  type RelationshipDisplayDescriptor,
  type RelationshipDisplayDirection,
} from "./visualization/predicate-descriptors.ts";
export {
  buildPublishedVisualizationProjection,
  serializePublishedVisualizationProjection,
  type PublishedVisualizationProjection,
  type PublishedVisualizationProjectionOptions,
  type VisualizationEdge,
  type VisualizationFlow,
  type VisualizationFlowStep,
  type VisualizationNode,
  type VisualizationOmission,
  type VisualizationQuestion,
} from "./visualization/published-projection.ts";
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
  readRepositoryObservedSource,
  resolveRepositoryIdentity,
  type RepositoryIdentityHints,
  type RepositoryIdentityRecord,
  type RepositoryObservedSource,
  type RepositoryIdentityResolution,
} from "./governance/repository-identity.ts";
export {
  readHubFreshness,
  type HubFreshnessProjection,
  type RepositoryFreshness,
} from "./query/hub-freshness.ts";
export {
  createObservedValueId,
  normalizeRepositoryObservedValues,
  normalizeProviderObservedValues,
  observedValueSafetyFailure,
  readObservedValues,
  renderObservedValuesSection,
  validateBundleObservedValues,
  type NormalizeRepositoryObservedValuesOptions,
  type NormalizeProviderObservedValuesOptions,
  type ObservedValue,
  type ObservedValueIdInput,
  type ObservedValueRole,
  type ObservedValueScalar,
  type RepositoryObservedValueState,
} from "./governance/observed-values.ts";
export {
  createQuestionId,
  mergeOpenQuestion,
  parseQuestionDocument,
  renderQuestionBody,
  renderQuestionDocument,
  renderQuestionIndex,
  resolveQuestion,
  resolveQuestionFromEvidence,
  validateQuestionTransition,
  type CandidateEvidenceQuestionReference,
  type OwnedItemQuestionReference,
  type QuestionKind,
  type QuestionReference,
  type QuestionState,
  type SharedQuestion,
} from "./governance/questions.ts";
export {
  externalIdentityKey,
  readExternalIdentities,
  validateBundleExternalIdentities,
  withExternalIdentity,
  type ExternalIdentity,
} from "./governance/external-identities.ts";
export {
  createProviderObservation,
  providerObservationSourceResource,
  validateProviderObservation,
  type ProviderObservation,
  type ProviderObservationInput,
} from "./governance/provider-observations.ts";
export {
  applyBundleProposal,
  recoverBundleSwitch,
  type ApplyBundleOptions,
  type RecoveryResult,
  type SwitchManifest,
  type SwitchPhase,
} from "./proposals/switch.ts";
