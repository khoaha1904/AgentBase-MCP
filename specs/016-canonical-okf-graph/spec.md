# Feature Specification: Canonical OKF Graph

**Feature Branch**: `main`

**Created**: 2026-08-15

**Status**: Approved

**Input**: Replace repository-shaped knowledge duplication with one canonical
concept graph and qualify system-centered authoring without forcing one fixed
repository topology.

## Owner Decisions

- Each knowledge entity has one canonical OKF identity. Directory placement
  classifies an entity; links express containment, implementation and evidence.
- Domain, System and Repository are independent concept roles, not three copied
  trees. Domain is optional and must never be inferred from a repository name.
- A repository is source/evidence and may contribute to concepts elsewhere in
  the bundle. Repository concepts contain only repository-specific knowledge.
- Missing knowledge remains an explicit limitation. The initial OKF draft need
  not be complete and must not guess merely to satisfy a benchmark.
- Governed question storage, `/abs-questions` and cloud evidence authority are
  future capabilities and are not implemented here.
- Tokens, elapsed time and YAML/Markdown ratios are diagnostics, not quality
  gates. Evidence, useful structure and honest uncertainty are primary.

## User Scenarios & Testing

### User Story 1 - Author one canonical knowledge graph (Priority: P1)

As an OKF authoring agent, I want to represent systems, components, interfaces,
flows, resources, infrastructure, deployments and source repositories once so
that later agents do not receive contradictory copies of the same knowledge.

**Independent Test**: Author a system supported by frontend, backend and
infrastructure evidence and verify every entity has one path while repository
concepts only link to the canonical entities.

### User Story 2 - Enrich a system from another repository (Priority: P1)

As a maintainer, I want a later repository ingest to add evidence-backed
knowledge to an existing generated concept without allowing protected or
unrelated knowledge to be overwritten.

**Independent Test**: Accept a first repository contribution, prepare a second
repository refresh and verify the same system/component paths are retained,
foreign evidence is preserved and protected concepts remain byte-identical.

### User Story 3 - Judge usefulness rather than inventory size (Priority: P2)

As the product owner, I want benchmark v5 to identify fragmented or shallow OKF
while accepting incomplete evidence-backed drafts so that quality reflects what
a human can review rather than how many files the agent emitted.

**Independent Test**: Score compact system-centered and per-route/per-handler
bundles and verify only the former is useful for owner review while both retain
transparent validation and coverage diagnostics.

## Requirements

- **AB-SCHEMA-016**: The active catalog MUST describe canonical Domain, System,
  Software Component, API Surface, Infrastructure Definition and Deployment
  concepts alongside compatible concrete legacy types. Paths MUST be organized
  by entity role rather than by source repository.
- **AB-SCHEMA-017**: Authoring guidance MUST use the smallest independently
  useful knowledge unit. CRUD operations and implementation-only handlers MUST
  stay inside their useful parent unless independent ownership, lifecycle,
  contract, failure or operational significance is evidenced.
- **AB-SCHEMA-018**: One entity MUST have one canonical concept path. Domain is
  optional; repository concepts MUST describe source-specific behavior and link
  to canonical entities instead of copying their contracts.
- **AB-LOCAL-HUB-012**: A proposal's source repository and logical subject MUST
  be independent from the paths of evidence-backed concepts it changes.
- **AB-LOCAL-HUB-013**: Refresh MUST allow current-source contributions to
  mutable AgentBase concepts across canonical roots, preserve foreign evidence
  and protected bytes, and limit shared index changes to additive navigation.
- **AB-BENCH-036**: Benchmark v5 MUST report `useful_for_owner_review`
  separately from conformance validity and reference coverage.
- **AB-BENCH-037**: V5 usefulness MUST assess canonical identity, useful
  boundaries, body substance, evidence and limitations, and fragmentation. It
  MUST NOT require a fixed concept count or complete repository inventory.
- **AB-BENCH-038**: Offline qualification MUST cover sequential contributions
  from frontend, backend and infrastructure repository identities into one
  canonical system graph without knowledge loss.

## Success Criteria

- **SC-001**: A three-source qualification produces one system identity and no
  duplicate component, interface, flow, resource or deployment identities.
- **SC-002**: A later source can update a mutable canonical concept while every
  previous foreign repository source remains present.
- **SC-003**: Protected human, verified, stable and unknown content remains
  byte-identical during cross-repository refresh.
- **SC-004**: Ordinary route signals recommend API Surface; an API Endpoint is
  recommended only from explicit independent-boundary evidence.
- **SC-005**: Terraform root configuration is represented separately from a
  reusable Terraform Module and from an evidenced deployed instance.
- **SC-006**: V5 rejects benchmark-only metadata in a production Hub proposal
  and reports fragmentation/body shortcomings independently from coverage.
- **SC-007**: Canonical offline verification passes with historical OKF types
  and existing accepted bundles remaining readable.

## Edge Cases

- A shared component may link to more than one system without moving paths.
- A repository may contain only a library or reusable module and therefore have
  no evidenced System or Domain.
- Same-name concepts from two repositories are not merged without evidence.
- A later ingest with missing evidence does not delete accepted knowledge.
- Existing `Open Question` concepts remain readable but are not recommended for
  new authoring while question management is deferred.

## Explicit Non-Goals

- Question ledger persistence, question resolution workflows or `/abs-questions`.
- AWS CLI execution, cloud credentials or durable cloud permissions.
- Migrating or rewriting existing Hub concepts automatically.
- A complete universal taxonomy or a maximum concept count.
- Proving semantic truth without human review.
