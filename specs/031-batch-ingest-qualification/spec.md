# Feature Specification: Batch Initial Ingest Qualification

**Feature Branch**: `031-batch-ingest-qualification`

**Created**: 2026-08-22

**Status**: Complete

**Input**: Qualify capability 030 with one real Sol-driven Batch Initial Ingest over two pinned Terraform repositories in one owner-confirmed Domain, stopping before Accept, Publish or provider access.

## User Scenarios & Testing

### User Story 1 - Review one real batch proposal (Priority: P1)

As the product owner, I can run one bounded model-backed batch probe and review
whether two repositories become one truthful, attributable proposal without
confusing lifecycle failure, OKF quality and benchmark defects.

**Why this priority**: Deterministic tests prove mechanics but not whether a real
agent can operate the workflow or author useful multi-repository knowledge.

**Independent Test**: Run the pinned batch suite once and inspect its retained
prompt, trace, combined OKF bundle, lifecycle assessment and per-member report.

**Acceptance Scenarios**:

1. **Given** two clean pinned Terraform repositories and one confirmed Domain,
   **When** Sol executes the Batch Init workflow sequentially, **Then** exactly
   one final proposal is inspected and no Accept, Publish or provider call occurs.
2. **Given** a member or deterministic lifecycle blocker, **When** the probe
   stops, **Then** available evidence is retained and no replica is authorized.
3. **Given** a valid proposal, **When** the report is produced, **Then** it
   separates batch lifecycle, OKF quality and benchmark/harness findings.

### Edge Cases

- Source drift or a dirty fixture fails before model execution.
- A failed member, missing final proposal, extra proposal, forbidden tool call or
  malformed combined bundle is a visible lifecycle failure.
- Truthful partial member knowledge remains reviewable and is not failed merely
  because a reference probe is absent.

## Requirements

### Functional Requirements

- **FR-001**: The suite MUST pin two distinct clean Terraform repository commits,
  catalog 7.0.0, one Domain, Codex version, Sol model and reasoning effort.
- **FR-002**: One isolated host-agent process MUST execute Batch Init sequentially
  through prepare, confirm, per-member investigation/authoring/record, batch
  finalize and inspect.
- **FR-003**: Each member MUST use one independent repository index and evidence
  rooted only in that repository; no provider CLI or cross-member source evidence
  is allowed.
- **FR-004**: The run MUST retain exact portable prompt, JSONL events, final
  message, combined OKF tree, run metadata and report under one UTC run identity.
- **FR-005**: The harness MUST reject source drift, lifecycle omissions, forbidden
  calls, missing or multiple final proposals and invalid combined OKF.
- **FR-006**: Reporting MUST show proposal outcome, member attribution, shared
  paths, limitations and separate OKF, MCP/runtime and benchmark findings.
- **FR-007**: The run MUST stop before Accept, Publish, remote Hub mutation,
  provider CLI or cloud mutation.
- **FR-008**: Only a valid first probe without a clear quality blocker MAY
  authorize one identical sequential replica; a third run is not routine.
- **FR-009**: Sequential member indexing MUST replace the prior repository graph
  binding only after clean provider shutdown; it MUST NOT retain two live graph
  sessions or reuse one member's graph as another member's evidence.

### Key Entities

- **Batch qualification manifest**: Frozen model, Domain, fixture and expectation inputs.
- **Batch run**: One isolated agent execution and its lifecycle evidence.
- **Member assessment**: Attributable contribution and quality findings for one repository.

## Success Criteria

### Measurable Outcomes

- **SC-001**: One command retains all required artifacts for a two-member batch.
- **SC-002**: A successful run contains exactly one valid `batch-new` proposal
  covering both canonical Repository IDs and the confirmed Domain.
- **SC-003**: Every completed member has attributable authored paths and no source
  evidence from the other member.
- **SC-004**: Zero Accept, Publish, provider or remote-Hub calls occur.
- **SC-005**: Offline lifecycle-contract coverage and the canonical 50-test gate remain green.

## Assumptions

- The existing host Codex authentication is available; AgentBase reads no model credential.
- Cloud Operations is explicit benchmark-owner Domain guidance, not an inference
  from AWS technology names.
- The first slice assesses one combined proposal without introducing a new
  completeness score or changing production runtime behavior.
