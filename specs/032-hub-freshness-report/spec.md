# Feature Specification: Hub Freshness Report

**Feature Branch**: `032-hub-freshness-report`

**Created**: 2026-08-22

**Status**: Complete

**Input**: Add a fast, warning-only freshness tool before designing Hub CI.

## User Scenarios & Testing

### User Story 1 - Review Hub freshness (Priority: P1)

As a Hub reader or maintainer, I can request one bounded report showing when
each Repository contribution was last observed, so I can decide where a later
Refresh may be useful without treating age as proof that knowledge is wrong.

**Why this priority**: The report is useful locally and is the reusable product
boundary that a future CI workflow can call.

**Independent Test**: Run the freshness action against a Hub containing known,
old and missing observation times and inspect one exact, ordered report.

**Acceptance Scenarios**:

1. **Given** Repository concepts with valid observed-source metadata, **When**
   freshness is requested, **Then** the report returns their exact observation
   time, non-negative age, source revision and Hub commit without probing source.
2. **Given** a Repository without valid observation metadata, **When** freshness
   is requested, **Then** it remains visible as `unknown` rather than failing or
   receiving an invented timestamp.
3. **Given** Local Draft knowledge above Published `main`, **When** freshness is
   requested, **Then** the report labels the exact layer and commit it read.

### User Story 2 - Use the same report through CLI and MCP (Priority: P2)

As an operator or host agent, I can obtain the same structured report through
the local Hub CLI or MCP action without a second freshness implementation.

**Why this priority**: Local use comes first; later automation can reuse the
same deterministic report rather than putting policy in GitHub Actions.

**Independent Test**: Invoke both adapters over the same admitted Hub and compare
their report fields and ordering.

**Acceptance Scenarios**:

1. **Given** an admitted Hub, **When** either adapter requests freshness, **Then**
   both return the report derived by the same application/core boundary.
2. **Given** no admitted Hub, **When** freshness is requested, **Then** the action
   fails with the ordinary Hub setup guidance and creates no state.

### Edge Cases

- An empty Hub returns zero rows and succeeds.
- A future/custom non-Repository concept does not affect Repository freshness.
- A clock earlier than an observed timestamp produces age `0`, not a negative age.
- Malformed Hub Markdown remains an integrity failure; freshness does not hide it.
- Missing source access, GitHub token, AWS CLI or network does not change output.

## Requirements

### Functional Requirements

- **FR-001**: The system MUST derive one bounded freshness report from one exact
  admitted Hub commit without repository, provider or network access.
- **FR-002**: Each Repository row MUST include its canonical identity when
  available, title, Markdown path, observation state, exact observation time,
  derived age and exact clean commit or dirty digest when available.
- **FR-003**: Rows with missing observation metadata MUST remain visible as
  `unknown`; the system MUST NOT invent a time, revision, stale label or winner.
- **FR-004**: The report MUST sort unknown rows first, then observed rows from
  oldest to newest, with deterministic path tie-breaking.
- **FR-005**: The report MUST identify its exact Hub commit, Published or Local
  Draft layer, generation time and observed/unknown totals.
- **FR-006**: CLI `okf hub freshness` and MCP `read_hub_freshness` MUST reuse the
  same report implementation and remain read-only.
- **FR-007**: Freshness MUST be warning context only: it MUST NOT Refresh, create
  Questions, change OKF, write a report file, contact source or apply a threshold.
- **FR-008**: The first slice MUST add no dependency, daemon, scheduler, provider,
  credential permission or GitHub Actions workflow.

### Key Entities

- **Hub freshness report**: Exact Hub view, generation time, totals and ordered Repository rows.
- **Repository freshness row**: Repository identity/path plus observed or unknown source state.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Known, unknown, empty and future-clock fixtures produce deterministic reports.
- **SC-002**: Zero source/provider/network operations occur during report generation.
- **SC-003**: CLI and MCP expose the same report shape from the same admitted Hub.
- **SC-004**: The canonical offline verification gate remains green without increasing the top-level test count.

## Assumptions

- Repository-level `agentbase.repository.observed_source` is the first useful
  Refresh checkpoint; per-value freshness remains available through the existing
  observed-value query.
- Future Hub CI will consume this boundary in a separate capability.
