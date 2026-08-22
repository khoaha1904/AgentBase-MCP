# Feature Specification: Observed Value Snapshots

**Feature Branch**: `main`

**Created**: 2026-08-22

**Status**: Complete

## Owner Decisions

- Replace the unpublished legacy live-reference contract in one clean cutover;
  do not dual-read, migrate or retain a resolver compatibility layer.
- Hub stores only small useful non-sensitive observed values with source state;
  it is not a source/config copy or second Code Graph.
- Ordinary Hub query returns snapshots without probing source access. An explicit
  current-value request may use existing repository graph/file tools separately.
- Repository-file snapshots are this implementation slice. Provider CLI,
  provider observations, remote repository reading and Domain Enrichment remain
  deferred.
- Refresh preserves matched observation identities and omission never deletes
  accepted knowledge. Existing Question workflows continue using the new
  evidence identities.
- New authoring entries may omit generated identity/source state. MCP normalizes
  them before proposal validation; Question input uses natural observation
  references and never asks the host/model to calculate an ID.

## User Scenarios & Testing

### User Story 1 - Author readable observed values (Priority: P1)

As an OKF author or reviewer, I can store a small evidenced value in its owning
concept and read the same value in a deterministic Markdown section without a
semantic locator.

**Independent Test**: Validate one clean and one dirty repository observation,
reject an invalid owner/duplicate/secret entry, and derive the exact readable
table from the structured value.

### User Story 2 - Query snapshots without source access (Priority: P1)

As a Hub reader, I can retrieve observed values, age and provenance even when no
repository is bound, without triggering source reads or treating the value as
current truth.

**Independent Test**: Read one concept through the replacement MCP action and
assert `source_access: not-checked`, exact Hub commit, source state and no current
repository binding in the response.

### User Story 3 - Reconcile observations safely (Priority: P2)

As a maintainer, I can Refresh an attributable observed value while preserving
its ID, and Questions can continue to reference the new evidence contract.

**Independent Test**: Refresh a concept with the same observation ID and changed
value/source state, reject identity removal, and prepare/finalize Question input
from observed values.

## Requirements

- **AB-VALUE-001..007**: Repository observed values MUST implement the accepted
  owner, identity, scalar, source-state, conflict and sensitive-value contract.
- **AB-QUERY-006..010**: Snapshot query MUST expose exact provenance/layer state,
  MUST default source access to `not-checked`, and MUST replace the legacy action
  without implicit source/provider access or write-back.
- **AB-MCP-015**: Explicit current-source work MUST remain a separate host flow
  using existing authorized source tools; this capability MUST add no resolver,
  cache, parser, re-index or second graph.
- Legacy `agentbase.live_claims`, `LiveClaim` exports and
  `read_hub_live_evidence` MUST no longer be authored or exposed after cutover.
- Unsafe candidate observations MAY be omitted with a warning before authoring;
  an unsafe entry present in a supplied bundle MUST fail validation while Hub
  query redacts only the offending value.
- Refresh MUST reconcile observations item-by-item: only the current Repository's
  streams may change, foreign streams remain unchanged, omission preserves prior
  streams, and explicit contribution lifecycle owns removal.

## Edge Cases

- A file-level source has no line fragment.
- A dirty repository has HEAD plus digest, or is unborn with digest and null HEAD.
- The observed subject differs from the containing concept identity.
- Two concepts reuse one observed-value ID.
- Refresh omits or renames an accepted observation.
- A snapshot property/value is obvious secret material.
- A concept has no observed values and therefore no generated table.
- A Question references a new same-proposal observation before its ID exists.
- A shared concept contains current- and foreign-Repository observations.

## Success Criteria

- **SC-001**: Legacy live-claim contract and MCP action have zero runtime exports
  or callers; foreign unknown extensions remain readable.
- **SC-002**: Focused acceptance evidence covers valid clean/dirty observations,
  owner/ID/source/value failures, deterministic readable rendering and Refresh
  preservation without increasing the canonical test count above 50.
- **SC-003**: Snapshot query returns 100% of valid bounded values with exact Hub
  commit/source observation state and performs zero repository-access probes.
- **SC-004**: Full canonical offline verification passes with no new dependency,
  provider, credential boundary, process or architecture exception.

## Non-Goals

- Provider CLI or `provider-observation://` runtime support.
- Remote repository source reading or automatic current-value resolution.
- Automatic Refresh, stale threshold, background watcher or CI report.
- Shared Question-document implementation from Part 07.
- Migration of unpublished local benchmark drafts or historical artifacts.
