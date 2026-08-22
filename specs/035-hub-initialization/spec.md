# Feature Specification: Hub Initialization

**Feature Branch**: `035-hub-initialization`

**Created**: 2026-08-23

**Status**: Complete

**Input**: Initialize the support baseline of an existing Hub through one reviewed PR.

## User Scenarios & Testing

### User Story 1 - Initialize only the missing Hub baseline (Priority: P1)

As a Hub maintainer, I can preview and create one support-only PR that adds a
standard README when absent and installs or repairs CI only when needed.

**Independent Test**: Preview and submit against disposable Hubs with missing,
current and custom baseline combinations.

**Acceptance Scenarios**:

1. Missing README plus current CI produces a README-only PR.
2. Existing README is preserved byte-for-byte, including custom content.
3. Missing or drifted CI adds the exact three-file CI bundle.
4. A complete baseline returns `current` and creates no PR.

### User Story 2 - Initialize independently of knowledge drafts (Priority: P1)

As a maintainer with unresolved Local Drafts, I can initialize Hub support files
from exact remote `main` without replaying, publishing or deleting knowledge.

**Independent Test**: Keep unrelated local commits, advance remote `main`, then
preview and submit initialization directly from that exact remote base.

## Requirements

- **FR-001**: Preview MUST report README state, CI state, exact changed paths,
  remote-main commit and one deterministic initialization digest.
- **FR-002**: Initialization MUST add the standard README only when `README.md`
  is absent and MUST never overwrite an existing README.
- **FR-003**: Initialization MUST skip an exact current CI bundle and MUST install
  all three released CI files when CI is missing, partial or outdated.
- **FR-004**: A complete baseline MUST be a no-op.
- **FR-005**: Submit MUST create or recover one support-only PR from the exact
  previewed remote `main`; it MUST reject extra files, byte drift or ambiguity.
- **FR-006**: Initialization MUST use the dedicated Hub token and MUST NOT
  synchronize, replay, publish, delete or mutate Local Draft knowledge.
- **FR-007**: The previous CI-only MCP tools MUST be replaced by one explicit
  preview/initialize pair rather than retained as duplicate public workflows.

## Success Criteria

- **SC-001**: Current CI plus missing README yields exactly one changed path.
- **SC-002**: Existing custom README remains byte-identical in every scenario.
- **SC-003**: Remote-main advancement does not require knowledge synchronization.
- **SC-004**: The repository verification gate remains 50/50.

## Assumptions

- An existing Hub already has an admitted OKF root index.
- Empty repositories continue using the existing bootstrap flow because no base
  branch exists on which to open a pull request.
