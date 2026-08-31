# Feature Specification: Refresh change accounting

**Feature Branch**: `feature/refresh-change-accounting`

**Created**: 2026-08-31

**Status**: Complete on feature branch; not merged

**Input**: The owner wants a risky Refresh-quality improvement isolated on a
feature branch and merged only after focused and repository-wide verification.

## Contract Delta

- **Change classification**: bounded product workflow and capability behavior.
- **Product Contract**: `docs/product/03-knowledge-lifecycle.md` — a Refresh
  proposal must expose how each bounded changed path affected shared knowledge.
- **Architecture Contract**: `docs/architecture/flows.md` — change accounting is
  proposal-review context, not canonical OKF knowledge or a second store.
- **Capability Contract**:
  `docs/capabilities/09-ingest-and-refresh/02-refresh-and-change-detection.md`,
  `docs/capabilities/09-ingest-and-refresh/06-refresh-reconciliation.md` and
  `docs/capabilities/11-review-and-publish/01-runtime-requirements.md`.
- **Stable requirements**: `AB-REFRESH-013..016`.
- **Current-contract updates**: the Product, Architecture and Capability paths
  above plus the released Refresh workflow instructions.
- **Baseline commit**: `c2fe125d91e6154891e37a8344abc719747ab71c`.

## Owner Decisions

- This slice accounts for the exact bounded paths already returned by normal
  Refresh; it does not add a full-repository or adaptive deep scan.
- A changed path has one outcome: `updated`, `new`, `embedded`, `question` or
  `ignored`. Every outcome carries a concise reason.
- `updated`, `new` and `embedded` outcomes require a changed concept with exact
  source evidence for that path. Missing, duplicate or unsupported accounting
  fails Finalize while leaving the authoring session repairable.
- Omitted-path counts and source-diff limitations remain visible and make the
  accounting partial; they are not presented as complete repository coverage.
- Change accounting is retained in proposal inspection. It does not create an
  OKF concept, schema, database, background process or publication shortcut.
- A Refresh with changed paths and only `question`/`ignored` outcomes still
  proposes the new observed source checkpoint for review. A true zero-delta,
  zero-knowledge-change Refresh remains `no_change`.

## User Scenarios & Testing

### User Story 1 - Prevent silent Refresh omissions (Priority: P1)

As an AgentBase maintainer, I can require every changed path presented to the
Refresh agent to have one explicit, reviewable knowledge outcome before the
proposal is finalized.

**Why this priority**: A new feature is useful to later AIT work only when its
important code change either updates shared knowledge or leaves a visible
reason why it did not.

**Independent Test**: Prepare a Refresh with one changed file, attempt Finalize
without accounting and observe a repairable failure; then provide an evidenced
outcome and observe a valid proposal containing that outcome.

**Acceptance Scenarios**:

1. **Given** one or more returned changed paths, **When** Finalize omits, repeats
   or invents a path outcome, **Then** Finalize fails before proposal creation
   and retains the editable session.
2. **Given** an `updated`, `new` or `embedded` outcome, **When** no changed Hub
   concept cites that exact repository path, **Then** Finalize rejects the
   unsupported outcome.
3. **Given** complete valid outcomes, **When** Finalize succeeds, **Then** the
   inspection retains the ordered outcomes and their reasons.

---

### User Story 2 - Review truthful partial coverage (Priority: P2)

As a proposal reviewer, I can distinguish accounted paths from paths or history
the bounded source-diff step could not expose, without mistaking partial work
for complete repository understanding.

**Why this priority**: Large or incomplete deltas must stay useful without
claiming that uninspected source was covered.

**Independent Test**: Finalize a Refresh with an ignored outcome and synthetic
omission/limitation metadata; inspect the proposal and verify the outcome and
partial boundary remain visible.

**Acceptance Scenarios**:

1. **Given** every returned path is explicitly `question` or `ignored`, **When**
   Finalize succeeds, **Then** a reviewable proposal records the outcomes and
   advances the Repository observation only after ordinary review/Accept.
2. **Given** omitted paths or source-diff limitations, **When** inspection is
   rendered, **Then** it marks accounting partial and exposes the exact count
   and limitations.
3. **Given** no returned changed path and no authored knowledge change, **When**
   Finalize runs, **Then** the existing successful `no_change` behavior remains.

### Edge Cases

- Direct legacy authoring sessions without a captured source-change set retain
  their existing behavior; only runtime Refresh sessions enforce accounting.
- A path may contain spaces or encoded source-resource segments; matching uses
  the normalized repository-source parser rather than string fragments.
- Multiple concepts may cite one path, but the path still has exactly one
  declared outcome.
- Source paths filtered as secret-like are never exposed by this feature.

## Requirements

### Functional Requirements

- **FR-001**: Refresh Prepare MUST freeze the bounded source-change result in
  the authoring session used by Finalize.
- **FR-002**: Refresh Finalize MUST require exactly one normalized outcome and
  non-empty reason for every returned changed path.
- **FR-003**: Materialized outcomes MUST be supported by a changed concept and
  exact current-Repository source path; `new` MUST identify a newly created
  concept and `updated` MUST identify an existing changed concept.
- **FR-004**: Missing, duplicate, extra or unsupported outcomes MUST fail before
  proposal creation without consuming the Initial Ingest repair budget or
  deleting the Refresh session.
- **FR-005**: Proposal inspection MUST retain ordered outcomes, partial status,
  omitted count and source-diff limitations.
- **FR-006**: A non-empty fully accounted source delta MUST produce a reviewable
  Repository observed-source update even when every outcome is `question` or
  `ignored`.
- **FR-007**: This feature MUST NOT add adaptive/full discovery, new OKF schema,
  durable candidate state, dependency, daemon, Accept or Publish behavior.

### Key Entities

- **Refresh source-change set**: bounded normalized paths, omitted count and
  source-diff limitations frozen at Prepare.
- **Change outcome**: one path, one outcome kind and one reviewer-readable
  reason.
- **Change accounting**: ordered outcomes plus the partial-coverage boundary
  retained in proposal inspection.

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% of returned changed paths have exactly one outcome in every
  successfully finalized runtime Refresh.
- **SC-002**: 0 `updated`, `new` or `embedded` outcomes pass without a changed
  concept carrying exact source evidence for that path.
- **SC-003**: 100% of omitted counts and source-diff limitations returned by
  Prepare are visible in finalized inspection.
- **SC-004**: Missing-accounting failure is repairable in the same session, and
  a corrected retry succeeds.
- **SC-005**: Focused tests and the canonical `npm run verify` gate pass on the
  feature branch before any merge decision.

## Assumptions

- The existing 128-path source-change bound is retained in this slice.
- Outcome reasons are review metadata, not a substitute for source evidence.
- The normal proposal, Accept and publication lifecycle remains authoritative.

## Implementation Evidence

- Runtime Refresh freezes the exact `sourceChanges` result into the private
  authoring session and includes it in session identity/retry matching.
- Finalize normalizes and verifies exactly one outcome per returned path.
  Materialized claims require both changed concept bytes and exact parsed
  current-Repository source evidence.
- Proposal `inspection.json` retains normalized outcomes, partial status,
  omitted count and source-diff limitations. Ignored-only deltas update the
  Repository observation through an ordinary proposal; zero-delta runs keep the
  prior `no_change` behavior.
- Focused tests pass 7/7. The canonical repository gate passes 153/153 tests
  plus specification, upstream, type, dependency, secret and diff checks.
- The implementation remains on `feature/refresh-change-accounting`; no merge
  into `main` was performed.
