# Feature Specification: Batch OKF Authoring

**Feature Branch**: `main`

**Created**: 2026-08-15

**Status**: Approved

**Input**: Reduce AgentBase MCP authoring context without teaching the workflow
repository-specific answers. Preserve the reviewable evidence-first behavior
accepted by capability 014.

## Owner Decisions

- Optimize general MCP interaction shape, not fixture discovery or expected OKF
  content.
- Initial OKF remains a reviewable draft. Missing knowledge is allowed and must
  not encourage guessing.
- Existing fine-grained schema tools remain compatible, but the recommended
  workflow should not require list/select/get and one validation call per file.
- Token and elapsed values are supporting telemetry, not the product-quality
  gate. A cheaper direct run that finds less evidence does not prove a better
  knowledge workflow.
- Question persistence, `/abs-questions`, AWS CLI authority and cross-repository
  enrichment remain future capabilities.

## User Scenarios & Testing

### User Story 1 - Read only relevant authoring guidance (Priority: P1)

As an authoring agent, I want one call to return the full guidance for schemas
selected from my evidence signals so that I do not load the entire catalog and
then fetch each selected schema separately.

**Independent Test**: Submit evidence signals spanning several supported types
and verify one deterministic response contains only the selected full schemas.

### User Story 2 - Validate one bundle coherently (Priority: P1)

As an authoring agent, I want one bounded call to validate every concept and its
cross-document relationships so that validation does not repeat full content
through one MCP round trip per file.

**Independent Test**: Submit valid and invalid multi-concept bundles and verify
per-concept plus relationship failures are reported together without filesystem
authority.

### User Story 3 - Prove lower interaction overhead without losing quality (Priority: P2)

As the product owner, I want the unchanged general workflow measured on both
benchmark repositories so that lower call count is not bought with hidden
answers or invalid OKF.

**Independent Test**: Exercise one immutable v4 workflow on both pinned fixtures
and compare its quality, calls, payload and tokens with retained v3 MCP evidence.

## Requirements

- **AB-SCHEMA-013**: MCP MUST accept bounded repository evidence signals and
  return the complete definitions of only the deterministically selected OKF
  schemas in one advisory response. It MUST NOT require a preceding catalog
  listing or a subsequent per-schema read.
- **AB-SCHEMA-014**: MCP MUST validate a bounded caller-supplied OKF bundle in
  one content-only call, combining AgentBase draft policy, known-schema policy
  and cross-document relationship checks. It MUST report failures per concept
  and for the relationship set without reading caller-selected paths.
- **AB-BENCH-032**: The immutable v4 MCP workflow MUST use batch schema guidance
  and batch bundle validation. Legacy list/get/per-concept tools MUST NOT be
  required by that workflow.
- **AB-BENCH-033**: Benchmark evidence MUST report completed authoring-schema
  and validation call counts plus supplied/result payload bytes separately from
  model token usage.
- **AB-BENCH-034**: v4 MUST retain the same evidence-first authoring contract,
  hidden-reference boundary and reviewability assessment as v3.
- **AB-BENCH-035**: The same v4 workflow MUST be measured on Health Aware and
  shopping cart against their retained v3 MCP baselines before an efficiency
  improvement is claimed.

## Success Criteria

- **SC-001**: Selected full schemas are returned in one call and exclude every
  unselected catalog definition.
- **SC-002**: One bundle call detects every per-concept policy failure and every
  target/link/known-schema relationship failure covered by the existing
  validators.
- **SC-003**: Input stays bounded to 64 concepts, 256 KiB per concept and 4 MiB
  total content; invalid bounds fail without filesystem access.
- **SC-004**: Fake v4 execution proves the batch lifecycle and legacy v1-v3
  prompt identities remain unchanged.
- **SC-005**: Both model-backed v4 MCP outputs remain `reviewable`.
- **SC-006**: Each v4 run reduces completed schema/validation MCP calls by at
  least 50% versus its retained v3 MCP baseline. Token and elapsed changes are
  reported honestly even if they do not improve and never outweigh evidence
  quality or unresolved-question usefulness.

## Explicit Non-Goals

- Repository-specific prompts, expected concepts or fixture-key lookup.
- Completeness gates or automatic Hub acceptance.
- Removing compatible fine-grained MCP tools.
- Question storage, `/abs-questions`, AWS CLI, cloud authority or external
  evidence enrichment.
