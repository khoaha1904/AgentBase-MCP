# Feature Specification: AgentBase-Hub CI

**Feature Branch**: `033-hub-ci`

**Created**: 2026-08-22

**Status**: Complete

**Input**: Complete Hub CI after the read-only freshness boundary, before the first MVP release candidate.

## User Scenarios & Testing

### User Story 1 - Reject unsafe or invalid Hub changes (Priority: P1)

As a Hub maintainer, every pull request and Published `main` check validates OKF
structure and obvious sensitive content before knowledge is merged.

**Independent Test**: Run the exact CI command over valid, malformed, foreign-type
and secret-like Hub fixtures and inspect its exit status and summary.

**Acceptance Scenarios**:

1. Valid AgentBase and custom OKF passes; an unknown custom type produces a warning only.
2. Invalid indexes, known schemas, relationships, Questions, observed values,
   external identities or obvious sensitive content fail the command.
3. An empty AgentBase Hub base passes with a zero-row freshness report.

### User Story 2 - Receive CI in every new Hub (Priority: P1)

As a new Hub owner, local Hub creation includes a reviewable GitHub Actions
workflow that invokes the pinned AgentBase release without another secret.

**Independent Test**: Create a local Hub and inspect its exact base tree/workflow.

**Acceptance Scenarios**:

1. The base commit contains one fixed workflow with read-only permissions,
   pinned third-party actions and a pinned AgentBase release tag.
2. Pull request, `main`, schedule and manual runs use the same offline command.
3. The workflow never uses `pull_request_target`, MCP token or write permission.

### User Story 3 - Add or update CI in an existing Hub (Priority: P2)

As an existing Hub owner, I can preview and explicitly submit one dedicated CI
upgrade PR without changing remote `main` or mixing it with knowledge proposals.

**Independent Test**: Use disposable Git and fake GitHub over missing, current,
drifted and retry states.

**Acceptance Scenarios**:

1. Preview reports missing, current or outdated workflow and the exact intended bytes.
2. Explicit submit creates or recovers one fixed branch and PR from current remote `main`.
3. Changed base/branch, multiple PRs or conflicting bytes stop before push; MCP
   never merges, approves, closes, force-pushes or deletes anything.

### Edge Cases

- Pull requests from forks receive no secret and remain verifiable.
- Missing future AgentBase release tag fails visibly rather than falling back to `main`.
- Broken local links and index targets block; external HTTP links do not.
- A known AgentBase type is strict; a foreign type receives base validation plus warning.
- Freshness ages never fail CI and never trigger Refresh.
- A current workflow makes upgrade a no-op.

## Requirements

### Functional Requirements

- **FR-001**: One offline Hub CI command MUST return deterministic blocking
  errors, non-blocking warnings and the capability-032 Repository freshness report.
- **FR-002**: Blocking integrity MUST cover OKF/root/index syntax, known AgentBase
  schemas, canonical relationship targets, Questions/index, observed values,
  external identities and obvious sensitive content/path patterns.
- **FR-003**: Unknown custom types MUST receive base OKF validation and a visible
  warning; unknown type alone MUST NOT fail CI.
- **FR-004**: Freshness MUST remain exact-age warning context with no threshold,
  source probe, Question, Refresh or write.
- **FR-005**: New Hub base MUST include one deterministic workflow that runs on
  pull request, `main`, weekly schedule and manual dispatch.
- **FR-006**: Workflow dependencies MUST be pinned, permissions MUST be
  `contents: read`, and it MUST use no stored MCP credential or write-capable event.
- **FR-007**: Workflow MUST invoke a fixed public AgentBase-MCP release tag and
  the same offline command used locally; it MUST NOT copy validator policy into Hub.
- **FR-008**: Existing-Hub installation MUST require preview followed by explicit
  submission of one workflow-only PR based on exact remote `main`.
- **FR-009**: Upgrade retry MUST recover the exact matching branch/PR; drift,
  ambiguity or changed base MUST stop without remote-main mutation.
- **FR-010**: CI output MUST be a GitHub Actions Summary; it MUST NOT persist a
  report in Hub, publish knowledge or mutate cloud/source resources.
- **FR-011**: The implementation MUST add no production dependency, daemon,
  scheduler service, database, model call or provider profile.

### Key Entities

- **Hub CI result**: Blocking errors, warnings, exact bundle identity and freshness projection.
- **Hub CI workflow**: Deterministic GitHub Actions bytes pinned to one AgentBase release.
- **CI upgrade intent**: Exact repository/base/workflow digest and resulting branch/PR identity.

## Success Criteria

- **SC-001**: Valid/empty/custom fixtures pass and every blocking fixture fails deterministically.
- **SC-002**: New Hub creation always commits the exact workflow once.
- **SC-003**: Existing Hub upgrade produces one workflow-only recoverable PR and zero direct `main` writes.
- **SC-004**: Freshness remains non-blocking for all ages and unknown timestamps.
- **SC-005**: Canonical verification remains 50 top-level tests with no new dependency.

## Assumptions

- `khoaha1904/AgentBase-MCP` remains publicly readable for Hub runners.
- Release preparation creates the workflow-pinned tag `v0.1.0-rc.1` before real CI qualification.
- GitHub-hosted Actions and Node.js 24 are available for the first release target.
