# Feature Specification: Registry-less Hub CI

**Feature Branch**: `034-registryless-hub-ci`

**Created**: 2026-08-22

**Status**: Complete

**Input**: Make AgentBase-Hub CI self-contained without a public or company package registry.

## User Scenarios & Testing

### User Story 1 - Run Hub CI without another repository or registry (Priority: P1)

As a Hub maintainer, I can validate a checkout using only files reviewed into
that Hub and the standard runtime already selected by its workflow.

**Independent Test**: Run the installed workflow command with network/package
installation unavailable and inspect its exit status and summary.

**Acceptance Scenarios**:

1. CI verifies the installed validator checksum before executing it.
2. CI performs no package install and checks out no repository other than the Hub.
3. Invalid Hub knowledge still blocks and freshness remains warning-only.

### User Story 2 - Review installation and upgrades as one CI-only PR (Priority: P1)

As a Hub maintainer, I receive the workflow, standalone validator and versioned
manifest together in the new-Hub base or one explicit existing-Hub CI PR.

**Independent Test**: Preview, submit and recover installation over disposable
Git and confirm the exact three-file diff.

**Acceptance Scenarios**:

1. Preview binds the exact base and digest of all CI files.
2. Submit creates or recovers one PR containing no knowledge changes.
3. Changed, missing or extra CI files stop recovery before a remote write.

## Requirements

- **FR-001**: Installed Hub CI MUST run without a package registry, MCP source
  checkout, MCP credential or runtime dependency installation.
- **FR-002**: The installed validator MUST be generated from the canonical MCP
  validator source rather than maintained as a second policy implementation.
- **FR-003**: Hub CI MUST verify the standalone validator against its manifest
  before execution and fail closed on mismatch.
- **FR-004**: New Hubs MUST contain the exact workflow, validator and manifest.
- **FR-005**: Existing Hubs MUST receive the same three files only through an
  explicit MCP-created CI PR based on exact remote `main`.
- **FR-006**: Preview, retry and recovery MUST bind the complete CI bundle and
  reject extra files, byte drift, changed base or ambiguous PR state.
- **FR-007**: The source package and build tooling MUST remain private and MUST
  define no public-registry publication path.

## Success Criteria

- **SC-001**: A generated Hub CI workflow has zero package-install and sibling-repository steps.
- **SC-002**: Tampering with the installed validator makes CI fail before validation runs.
- **SC-003**: New-Hub and upgrade paths install byte-identical three-file bundles.
- **SC-004**: The existing 50-test repository gate remains at 50 and passes.

## Assumptions

- Node.js 24 is available in the target GitHub Enterprise runner environment.
- Generated CI artifacts are acceptable reviewable support files in Hub.
- Later internal-registry publication is optional and outside this capability.
