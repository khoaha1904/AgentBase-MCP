export const OKF_VERSION = "0.2" as const;
export const OKF_SHARED_DIRECTORY = "okf" as const;
export {
  normalizeHubConceptPath,
  readHubConcept,
  searchHubConcepts,
  type HubQueryMatch,
  type HubQueryReader,
  type HubSearchOptions,
} from "./hub-query.ts";
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
  createRepositorySourceResource,
  OkfValidationError,
  parseConceptDocument,
  renderConceptDocument,
  validateAgentBaseDraft,
  type ConceptDocument,
  type OkfFrontmatter,
  type OkfScalar,
  type OkfValue,
  type VerificationEvent,
} from "./okf-document.ts";
export { computeOkfTreeDigest, loadOkfBundle, type LoadOkfBundleOptions, type OkfBundle } from "./okf-bundle.ts";
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
