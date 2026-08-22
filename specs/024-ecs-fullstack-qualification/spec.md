# Feature Specification: ECS Full-stack Qualification

**Feature Branch**: `main`

**Created**: 2026-08-22

**Status**: Approved

**Input**: Qualify AgentBase on a second AWS/Terraform repository with frontend,
backend and long-running ECS services; use a stronger model for Initial Ingest
and the existing balanced model for Refresh.

## User Scenarios & Testing

### User Story 1 - Build a trustworthy full-stack baseline (Priority: P1)

As the product owner, I want Initial Ingest to understand a pinned full-stack
ECS repository so that qualification is no longer specific to one Lambda repo.

**Independent Test**: Run one isolated Initial Ingest with `gpt-5.6-sol` and
review whether the draft represents the repository, one system, its independently
useful frontend/backend workloads, their API contract and supporting infrastructure
without turning every AWS resource into a concept.

**Acceptance Scenarios**:

1. **Given** the pinned clean fixture, **When** Sol runs Initial Ingest, **Then**
   it completes the exact proposal lifecycle without deployment, provider CLI,
   Accept, Publish or Hub PR.
2. **Given** valid but incomplete output, **When** it is reviewed, **Then** missing
   optional knowledge remains diagnostic; unsafe provenance, broken relations or
   a missing backend health contract block its use as the Refresh baseline.

### User Story 2 - Refresh a cross-code/infrastructure contract (Priority: P2)

As the product owner, I want Terra Refresh to reconcile one health endpoint
changed consistently in backend code and Terraform so that Refresh proves it
can follow knowledge across application and infrastructure files.

**Independent Test**: From the accepted Sol baseline, change `/status` to
`/health` in the backend route, its documentation and both ALB target groups;
run one Terra probe and conditionally one sequential replica.

**Acceptance Scenarios**:

1. **Given** a baseline containing `/status`, **When** the exact mutation is
   refreshed, **Then** the resulting draft contains `/health`, removes stale
   `/status` health-contract knowledge and preserves unrelated concepts.
2. **Given** a valid probe with no clear blocker, **When** one replica runs,
   **Then** the changed knowledge boundary, sources and relationships are stable;
   otherwise the sequence stops before the replica.

### Edge Cases

- Initial Ingest is structurally valid but omits the backend health contract:
  report the miss and do not manufacture a Refresh baseline.
- A model promotes ALB, DynamoDB, S3, SNS or deployment modules solely because
  they exist: score granularity as a finding rather than changing schemas from
  one run.
- Code and Terraform disagree after mutation: fail fixture preparation before a
  model run.
- A run passes generic semantic coverage but retains `/status`: fail the exact
  mutation gate.

## Requirements

### Functional Requirements

- **AB-BENCH-052**: Qualification MUST pin the public ECS full-stack fixture by
  exact commit and reject source drift or a dirty fixture.
- **AB-BENCH-053**: Initial Ingest MUST use `gpt-5.6-sol`; Refresh MUST use
  `gpt-5.6-terra`. Model choice is workflow-specific, not one suite-wide default.
- **AB-BENCH-054**: Initial Ingest MUST use the existing catalog-7 workflow and
  evaluate useful workload boundaries without requiring a fixed complete concept
  inventory or provider-specific schema.
- **AB-BENCH-055**: A Refresh baseline MUST be reviewable and contain exact
  source-backed backend health-contract knowledge before synthetic mutation.
- **AB-BENCH-056**: Refresh MUST mutate `/status` to `/health` consistently in
  backend implementation/documentation and both Terraform ALB target groups.
- **AB-BENCH-057**: Refresh success MUST require new health-contract knowledge
  and absence of superseded health-contract knowledge in addition to normal
  lifecycle, bundle and owner-review gates.
- **AB-BENCH-058**: Model runs MUST be sequential: one Sol Initial Ingest probe,
  then one Terra Refresh probe and at most one identical Terra replica when the
  preceding required result has no clear blocker. No provider CLI, deployment,
  Accept, Publish or Hub PR is allowed.
- **AB-BENCH-059**: Findings MUST distinguish OKF/MCP defects, benchmark defects
  and truthful partial coverage. One semantic variance MUST NOT create a new
  cross-repository product rule by itself.

### Key Entities

- **Pinned Fixture**: Exact repository revision used read-only by qualification.
- **Initial Baseline**: Reviewable Sol-authored OKF tree eligible for Refresh.
- **Health Contract Mutation**: One consistent `/status` to `/health` change
  across backend and Terraform sources.
- **Qualification Result**: Immutable prompt, trace, OKF tree, metrics and
  separated findings for one model run.

## Success Criteria

### Measurable Outcomes

- **SC-001**: The fixture identity and three health-contract mutation locations
  are verified deterministically before any model call.
- **SC-002**: Initial Ingest either yields one reviewable baseline with the
  backend health contract or stops with an explicit separated finding.
- **SC-003**: Every successful Refresh result contains `/health` health-contract
  knowledge and no `/status` health-contract knowledge.
- **SC-004**: A valid Refresh probe receives exactly one sequential replica, and
  both results can be compared at changed-concept byte and semantic levels.
- **SC-005**: The complete offline gate remains green with no new production
  dependency, provider, schema type or test-case count required solely for this
  qualification.

## Assumptions

- Domain guidance is `Digital Experience`; it is an owner-supplied navigation
  boundary for the fixture, not a schema or inferred universal domain.
- The benchmark reads source and creates isolated local proposal state only; it
  never deploys the sample or requires AWS credentials.
- Terragrunt qualification remains a later structurally focused repository; this
  capability first proves Terraform full-stack workload boundaries.
