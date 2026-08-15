export const OKF_VERSION = "0.2" as const;
export const OKF_SHARED_DIRECTORY = "okf" as const;
export {
  normalizeHubConceptPath,
  readHubConcept,
  searchHubConcepts,
  traverseHubConcepts,
  type HubConceptSummary,
  type HubQueryMatch,
  type HubQueryReader,
  type HubSearchMatch,
  type HubSearchOptions,
  type HubSearchResult,
  type HubTraversalEdge,
  type HubTraversalOptions,
  type HubTraversalResult,
} from "./hub-query.ts";
export {
  buildHubContinuity,
  type HubContinuityManifest,
  type HubContinuityOptions,
} from "./hub-continuity.ts";
export {
  AGENTBASE_OKF_SCHEMA_CATALOG_VERSION,
  getOkfConceptSchema,
  listOkfConceptSchemas,
  selectOkfConceptSchemas,
  validateConceptAgainstSchema,
  type OkfConceptSchema,
  type OkfSchemaSelection,
} from "./schema-catalog.ts";
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
} from "./okf-document.ts";
export { computeOkfTreeDigest, loadOkfBundle, type LoadOkfBundleOptions, type OkfBundle } from "./okf-bundle.ts";
export {
  validateOkfRelationships,
  type OkfRelationshipConcept,
  type OkfRelationshipTarget,
  type OkfRelationshipValidation,
  type ValidatedOkfRelationship,
  type ValidatedOkfFlowStep,
} from "./okf-relationships.ts";
export {
  CANONICAL_RELATIONSHIP_KINDS,
  FLOW_STEP_ACTIONS,
  FLOW_STEP_MODES,
  isCanonicalRelationshipKind,
  type CanonicalRelationshipKind,
} from "./relationship-vocabulary.ts";
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
} from "./proposal.ts";
export {
  readMaintainerDirectives,
  type MaintainerDirective,
  type MaintainerDirectiveSet,
} from "./directives.ts";
export {
  applyBundleProposal,
  recoverBundleSwitch,
  type ApplyBundleOptions,
  type RecoveryResult,
  type SwitchManifest,
  type SwitchPhase,
} from "./switch.ts";
