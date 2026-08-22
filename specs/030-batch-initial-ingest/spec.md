# Feature Specification: Batch Initial Ingest

**Feature Branch**: `main`

**Created**: 2026-08-22

**Status**: Complete

## Owner Decisions

- A batch contains explicit local repository roots assigned to one confirmed
  primary Domain. AgentBase never scans a workspace recursively to find members.
- Preflight reads bounded root README/docs for every member, compares the
  proposed Domain with existing Hub Domains and shows mismatches before work.
- Repository investigation and authoring run sequentially and in isolation.
  Raw source/graph context from one member is not reused as evidence for another.
- One confirmed batch produces one atomic proposal, one later Accept and one
  later PR. It does not publish a partial hidden subset.
- A failed member may be retried without rerunning unchanged completed members.
  Removing a member is an explicit manifest revision and must repair or reject
  every attributable or dangling contribution before Finalize.
- Initial Ingest remains sparse and cumulative. Missing optional knowledge does
  not fail a truthful member or batch.
- Cross-repository discovery, provider CLI verification and Question answering
  are not performed during Batch Ingest; Domain Enrichment remains separate.
- This slice implements Batch Initial Ingest only. Batch Refresh, parallel
  execution, workspace scanning and visual review remain deferred.

## User Scenarios & Testing

### User Story 1 - Confirm and ingest a repository batch (Priority: P1)

As a maintainer, I select several repositories and a Domain, review one concise
preflight matrix, then receive one reviewable proposal containing isolated,
source-backed knowledge for all successful confirmed members.

**Independent Test**: Ingest three disposable Terraform repositories with one
Domain outlier and prove no authoring starts before corrected confirmation; the
confirmed run creates one proposal and no accepted-state mutation.

**Acceptance Scenarios**:

1. **Given** explicit repository roots and a proposed Domain, **When** preflight
   completes, **Then** every member has an identity outcome, evidence summary,
   proposed Domain and warning status.
2. **Given** an unresolved identity or Domain mismatch, **When** confirmation is
   attempted, **Then** no repository authoring starts.
3. **Given** a confirmed matrix, **When** the batch runs, **Then** members are
   authored sequentially against one exact Hub base with separate evidence.
4. **Given** all members produce truthful valid output, **When** Finalize runs,
   **Then** exactly one atomic proposal contains their repository-owned changes.

### User Story 2 - Recover an incomplete batch (Priority: P1)

As a maintainer, I can retry only a failed member or explicitly revise the
membership, without losing or duplicating unchanged completed work.

**Independent Test**: Fail the second of three repositories, retry it, then
repeat with an explicit removal and prove both paths produce deterministic
outcomes without rerunning an unchanged first member.

**Acceptance Scenarios**:

1. **Given** one member fails integrity or validation, **When** the run stops,
   **Then** the batch is Incomplete and no normal proposal is exposed.
2. **Given** exact source and Hub base are unchanged, **When** the failed member
   is retried, **Then** completed sibling staging is reused exactly once.
3. **Given** a member is removed explicitly, **When** its authored contribution
   has no safe deterministic removal, **Then** revision stops with a concrete
   dependency decision instead of silently publishing the remainder.
4. **Given** a completed member's source changed, **When** recovery resumes,
   **Then** that member is invalidated and rerun before Finalize.

### User Story 3 - Review and publish the atomic batch (Priority: P2)

As a maintainer, I can inspect additions, removals, Questions, limitations and
per-repository attribution, then use the existing Accept/publication lifecycle
for one batch unit.

**Independent Test**: Inspect, Accept and publish a two-repository batch in a
disposable Hub; prove the PR targets `main`, explains both repository scopes and
cannot be split after Accept.

**Acceptance Scenarios**:

1. **Given** a finalized batch, **When** it is inspected, **Then** review groups
   changes by repository and identifies shared navigation changes separately.
2. **Given** the exact proposal is accepted, **When** it is submitted, **Then**
   one PR targets Hub `main` using the MCP-managed Hub credential.
3. **Given** only a subset is requested after Accept, **When** publication is
   attempted, **Then** it rejects the split and preserves the atomic unit.

### Edge Cases

- Duplicate or nested repository roots appear in one request.
- One root is absent, symlinked, dirty or changes after preflight; dirty state is
  allowed only while its exact digest remains unchanged.
- Two roots resolve to the same canonical Repository identity.
- A canonical Repository already exists and therefore requires Refresh.
- The same new concept path is authored by two members.
- Members append different entries to the same Hub index.
- Hub base advances during execution or before Finalize.
- A retry uses stale member, manifest or source revisions.
- Membership revision removes the only source for a relation or Question.

## Requirements

- **AB-BATCH-001**: Batch preparation MUST bind one exact Hub base, one confirmed
  Domain and 2..32 explicit unique local repository roots. It MUST NOT discover
  members by scanning outside those roots.
- **AB-BATCH-002**: Preflight MUST produce one per-member matrix containing
  canonical identity status, bounded repository-document evidence, existing and
  proposed Domain, and warnings. Unresolved rows MUST block confirmation.
- **AB-BATCH-003**: Every member MUST be eligible for Initial Ingest. Existing
  canonical repositories MUST be rejected with a Refresh instruction; duplicate
  identities, nested roots and changed confirmation inputs MUST fail closed.
  A dirty repository MAY proceed only when its exact dirty digest is bound and
  remains unchanged through Finalize.
- **AB-BATCH-004**: Confirmed members MUST run sequentially in manifest order.
  Each member MUST retain independent source state, evidence, graph namespace,
  candidate set, Questions, limitations and staging digest.
- **AB-BATCH-005**: A truthful partial repository proposal is a successful member
  outcome. Cross-repository inference, provider calls and completeness scoring
  MUST NOT become batch success gates.
- **AB-BATCH-006**: Finalization MUST compose all current completed members onto
  one exact base. The coordinator MAY regenerate only validated append-only
  indexes and navigation of the one confirmed Domain from member-owned targets;
  it MUST preserve other Domain content, reject every other overlapping authored
  ownership, validate the complete result and create one immutable atomic batch
  proposal.
- **AB-BATCH-007**: A failed member MUST keep the batch Incomplete. Explicit retry
  MAY reuse completed members only when their full source/base/input/staging
  digests still match; no hidden retry or duplicate append is allowed.
- **AB-BATCH-008**: Membership revision MUST create a new immutable manifest
  revision, remove attributable output, revalidate shared indexes, Questions and
  relationships, and reject any unresolved dangling contribution.
- **AB-BATCH-009**: Inspect, Accept, pending reconstruction and publication MUST
  treat the batch as one unit, retain all member Repository IDs and attribution,
  and publish one independent PR to `main`. No operation may split it after
  Finalize or merge the PR.
- **AB-BATCH-010**: Existing single-repository Ingest/Refresh, Domain Enrichment,
  query and publication behavior MUST remain unchanged. The implementation MUST
  add no database, daemon, parallel runner, production dependency or model call
  inside MCP.

### Key Entities

- **Batch Preflight Matrix**: Review-only identity and Domain evidence for each
  explicit root.
- **Batch Manifest**: Immutable base, Domain, ordered membership and revisions.
- **Member Checkpoint**: One repository's exact inputs, source state, outcome and
  staging digest.
- **Batch Proposal**: One immutable multi-repository review/publication unit.

## Success Criteria

- **SC-001**: Three confirmed repositories produce exactly one inspectable batch
  proposal with per-repository attribution and zero accepted-state mutation
  before Accept.
- **SC-002**: An outlier or existing Repository blocks authoring in all covered
  cases until membership/Domain is corrected explicitly.
- **SC-003**: A failed middle member can be retried without rerunning unchanged
  completed siblings; duplicate concepts, files and index targets remain zero.
- **SC-004**: Membership removal either yields one fully valid recomposed bundle
  or one explicit blocking dependency; partial hidden publication remains zero.
- **SC-005**: Batch inspection and PR summary identify every member plus all
  shared changes, and publication creates exactly one main-based PR unit.
- **SC-006**: The canonical offline gate passes with the existing production
  dependencies and no increase in the 50-case design-level test count.

## Assumptions

- The host agent/skill performs repository reasoning; MCP remains deterministic.
- Repositories are available locally and authorized read-only by the user.
- Sparse knowledge is expected to build up through later Refresh and Domain
  Enrichment runs.

## Non-Goals

- Batch Refresh or mixed Init/Refresh membership.
- Parallel repository processing or automatic workspace discovery.
- Cross-repository relations, provider verification or Question resolution.
- Per-item selection after Finalize, automatic Accept/Publish or PR merge.
- Static HTML review or model-backed batch qualification in the offline slice.
