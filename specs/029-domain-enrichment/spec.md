# Feature Specification: Domain Enrichment

**Feature Branch**: `main`

**Created**: 2026-08-22

**Status**: Complete

## Owner Decisions

- Domain Enrichment is a separate post-Ingest workflow over explicitly selected
  Published repositories in one confirmed Domain. It does not read unmerged
  Init/Refresh proposals or interrupt ordinary repository Ingest.
- The user logs into AWS CLI outside MCP and explicitly confirms that the active
  session, account and regions may be used. MCP never receives, reads or stores
  credentials.
- Verification is sequential and candidate-bounded. It never scans an account,
  service or unspecified regions to discover work.
- Exact provider identity and scope may verify that two observations refer to
  one deployed resource. A canonical relationship additionally requires
  interaction evidence; a shared name alone is never enough.
- One run produces one atomic Enrichment proposal for review. Verification never
  Accepts, Publishes, merges a PR or mutates cloud resources.
- Questions use automatic, recommended and manual tiers. A recommendation is not
  Maintainer Guidance until the user selects it; unresolved Questions may remain
  Open without failing a truthful proposal.
- This capability may report duplicate concepts as reviewed candidates, but it
  does not merge or redirect Published concepts. That broader query/migration
  change remains a separate capability.
- AWS is the only provider in this slice. Azure/GCP, broad Guidance scopes,
  account-wide discovery, scheduled enrichment and visual HTML review remain
  deferred.

## User Scenarios & Testing

### User Story 1 - Verify selected cross-repository knowledge (Priority: P1)

As a maintainer, I select Published repositories and known candidates in one
Domain, confirm the AWS account/regions, and receive one reviewable proposal
containing only changes supported by bounded provider and Hub evidence.

**Independent Test**: Run enrichment against a disposable Published Hub and a
deterministic AWS substitute containing one matching resource, one mismatch and
one unavailable candidate; inspect the single proposal without accepting it.

**Acceptance Scenarios**:

1. **Given** two repositories refer to the same exact provider resource and
   their Published evidence proves an interaction, **When** verification
   succeeds, **Then** the proposal adds the canonical identity and relationship
   with provider provenance.
2. **Given** provider identity matches but interaction evidence is absent,
   **When** verification succeeds, **Then** the proposal records the identity
   outcome and Question without inventing a relationship.
3. **Given** only names or incomplete scope appear to match, **When** enrichment
   runs, **Then** it keeps an unresolved candidate instead of joining concepts.
4. **Given** a selected repository is not Published in the confirmed Domain,
   **When** the run is prepared, **Then** it stops before provider access or
   proposal mutation.

### User Story 2 - Resolve Questions in one bounded review (Priority: P1)

As a maintainer, I review automatically verified outcomes together with a small
packet of recommended and direct Questions, answer or defer them, and inspect
the resulting Question and Guidance changes in the same proposal.

**Independent Test**: Supply one Question for each resolution tier and prove
that deterministic evidence, selected human answers and deferred Questions
produce the expected governed documents without changing accepted state.

**Acceptance Scenarios**:

1. **Given** a factual Question has an exact released verification criterion,
   **When** that criterion succeeds, **Then** the proposal shows the automatic
   result and evidence without creating human Guidance.
2. **Given** evidence favors a semantic choice but cannot authorize it, **When**
   the result is reviewed, **Then** the user sees concrete choices, one reasoned
   recommendation and a defer option.
3. **Given** no reliable answer exists, **When** the result is reviewed, **Then**
   the user receives the known context and may answer directly or keep the
   Question Open.
4. **Given** an answer targets a stale Question revision, **When** finalization
   is attempted, **Then** no accepted state or partial proposal is produced.

### User Story 3 - Recover a bounded multi-repository run (Priority: P2)

As a maintainer, I can retry a failed candidate or explicitly revise batch
membership, while successful candidate results remain reproducible and the
final output remains one atomic proposal.

**Independent Test**: Interrupt one candidate after another succeeds, retry it,
then remove a different member before finalization and verify dependency repair
or an explicit blocking Question.

**Acceptance Scenarios**:

1. **Given** permission denial or insufficient evidence for one candidate,
   **When** processing completes, **Then** it is unresolved with a limitation
   and does not make the run fail.
2. **Given** malformed output, timeout or state-integrity failure, **When** the
   candidate fails, **Then** the run remains incomplete and produces no normal
   queryable proposal until retry or explicit membership confirmation.
3. **Given** the user removes a repository before finalization, **When** its
   outputs have dependants, **Then** dangling changes are repaired
   deterministically or presented as a blocking decision before one new
   manifest is finalized.

### Edge Cases

- The active AWS account differs from the confirmed account.
- A regional resource has no evidenced or confirmed region.
- The same resource name exists in two regions or accounts.
- A provider identity conflicts with its account/region metadata.
- AWS CLI is missing, unsupported, logged out or expires mid-run.
- A bounded resource returns access denied, not found, throttling, timeout,
  malformed output or an oversized response.
- Provider evidence verifies identity but conflicts with Published source
  claims or accepted Maintainer Guidance.
- Published Hub `main`, selected Question revision or candidate evidence changes
  before finalization.
- A normalized observation contains a secret-like value.

## Requirements

- **AB-ENRICH-001**: A run MUST bind one exact Published Hub revision, one
  confirmed Domain, an explicit non-empty set of Published Repository IDs,
  exact candidate/Question revisions, and the released catalog/detector/provider
  profile versions. Local Drafts and unmerged PRs MUST NOT be inputs.
- **AB-ENRICH-002**: Provider access MUST require explicit user confirmation of
  the existing CLI session, expected account and bounded region set. MCP MUST
  NOT login, accept/read/persist credentials, alter provider configuration or
  use CLI defaults as knowledge truth.
- **AB-ENRICH-003**: MCP MUST expose only released, versioned, read-only AWS
  verification operations. It MUST construct direct bounded invocations from
  typed inputs, reject arbitrary commands/flags and account or region mismatch,
  and MUST NOT enumerate an account, service or unspecified region.
- **AB-ENRICH-004**: A successful provider call MUST yield a bounded normalized
  observation containing exact authority, location, native identity, allowed
  non-sensitive fields, operation/profile version, time and integrity digest.
  Raw provider output, credential context and secret-like values MUST NOT enter
  a proposal or Hub document.
- **AB-ENRICH-005**: Strong identity matching MUST use a released provider key.
  Same name, variable or label alone MUST remain unresolved. Identity evidence
  MUST NOT create a canonical relationship without independent interaction
  evidence.
- **AB-ENRICH-006**: Candidate processing MUST be sequential and classify each
  selected item as `confirmed`, `rejected`, `unresolved` or `failed`.
  `unresolved` is a valid truthful result; `failed` keeps the run incomplete
  until explicit retry or membership revision.
- **AB-ENRICH-007**: Question handling MUST distinguish deterministic factual
  resolution, recommended maintainer confirmation and direct maintainer input.
  Only an explicit human selection creates attributed Maintainer Guidance;
  deferred Questions remain Open.
- **AB-ENRICH-008**: Finalization MUST create one immutable atomic Enrichment
  proposal from the exact manifest and terminal outcomes. It MAY add safe
  provider observations, external identities, canonical evidenced relations,
  Question/Guidance changes and duplicate candidates; it MUST NOT auto-merge
  concepts, Accept, Publish or mutate provider resources.
- **AB-ENRICH-009**: Accepted Enrichment MUST reuse the current proposal,
  inspection, Accept and publication lifecycle as one Domain-scoped unit based
  on Published `main`. A changed base, stale revision or dependency conflict
  MUST stop or revalidate before remote mutation; membership MUST NOT change
  silently.
- **AB-ENRICH-010**: Provider absence, expired login, access denial, not-found or
  missing scope MUST preserve existing knowledge and return a reviewable
  limitation. Protocol, integrity and unsafe-output failures MUST admit no
  partial observation.
- Existing Ingest, Refresh, query, Question, observed-value and publication
  behavior MUST remain unchanged unless an explicit Enrichment run is active.
- The implementation MUST reuse the modular monolith and Git-backed Hub without
  a database, daemon, background retry loop, generic cloud runner or new
  production dependency.

### Key Entities

- **Enrichment Manifest**: Immutable Published baseline, Domain, Repository and
  candidate/Question membership, provider scope and released profile versions.
- **Verification Profile**: Released bounded read-only operation contract and
  its normalization/safety rules.
- **Provider Observation**: Small provenance-bearing non-sensitive result for
  one exact resource at one authority/location/time.
- **Candidate Outcome**: Confirmed, rejected, unresolved or failed result bound
  to exact input evidence.
- **Enrichment Proposal**: One immutable multi-repository review unit containing
  all governed changes and limitations from a finalized manifest.

## Success Criteria

- **SC-001**: A deterministic end-to-end run over at least three Published
  repositories produces exactly one inspectable proposal containing a verified
  relation, an identity-only outcome and an unresolved limitation, with zero
  accepted-state mutation before Accept.
- **SC-002**: Every provider invocation in verification evidence is attributable
  to one confirmed candidate, account and region; account-wide, service-wide and
  unspecified-region invocations count remains zero.
- **SC-003**: Exact identity plus interaction evidence produces the intended
  canonical relation in all supported cases, while name-only and cross-region
  collisions produce zero false canonical joins.
- **SC-004**: Automatic, recommended and direct Question cases preserve exact
  attribution and revision behavior; unselected recommendations produce zero
  Maintainer Guidance documents.
- **SC-005**: Credential material and raw provider responses have zero persisted
  bytes in proposal, Hub and diagnostic artifacts; unsafe output is rejected
  before mutation.
- **SC-006**: Retry and membership-revision scenarios either reproduce one valid
  atomic proposal or stop with an explicit recoverable reason; no partial result
  appears in normal Hub query.
- **SC-007**: The canonical offline gate passes without increasing the 50-test
  design-level suite, adding a production dependency or changing ordinary
  Ingest/Refresh behavior.

## Assumptions

- Selected repositories, Questions and candidates already exist on exact
  Published Hub `main`; enriching open Init/Refresh PRs is intentionally
  unsupported.
- The first released provider surface is the minimum AWS operation set required
  by deterministic fixtures and one explicitly authorized smoke environment.
- Repository evidence and provider evidence may disagree; the workflow preserves
  both and surfaces a Question instead of selecting a universal source of truth.
- Missing knowledge is acceptable. Later Refresh or Enrichment runs may build it
  up without making the current truthful partial proposal invalid.

## Non-Goals

- Initial Ingest, Refresh or Batch Ingest orchestration.
- Azure, GCP, arbitrary provider commands or account-wide resource discovery.
- Automatic concept merge/redirect, split or Hub-wide identity migration.
- Repository cloning, remote Code Graph construction or normal-query provider
  lookup.
- Automatic Accept, Publish, PR merge or cloud-resource mutation.
- Scheduled enrichment/freshness CI, HTML/graph review or broad Guidance scope.
