# Feature Specification: Bundled provider installation

**Feature Branch**: `046-initial-ingest-discovery`

**Created**: 2026-08-25

**Status**: Approved

**Input**: Users install AgentBase once and must not need to know about native
build tools, zlib or a separate Codebase Memory preparation command.

## User Scenarios & Testing

### User Story 1 - Install AgentBase once (Priority: P1)

An enterprise user with the approved Node.js runtime and internal npm registry
runs the existing AgentBase installer once. AgentBase selects and activates its
owned Code Graph runtime, installs dependencies and connects the selected
clients without asking the user to build Codebase Memory or install native
development libraries.

**Why this priority**: Native build knowledge is a release concern, not an
ordinary installation concern.

**Independent Test**: Run the installer against a supported bundled platform
with isolated client homes and prove dependency preparation, runtime activation,
skill installation and MCP registration complete without compiler, zlib or
network-download steps.

**Acceptance Scenarios**:

1. **Given** a valid bundle for the current supported platform, **When** the
   user runs `./install.sh`, **Then** the runtime is verified and activated
   before any client registration and setup completes normally.
2. **Given** the exact bundle is already active, **When** the installer is run
   again, **Then** provider activation is a safe no-op and existing client state
   is preserved.
3. **Given** the current bundle is missing, corrupt or for another platform,
   **When** installation starts, **Then** it fails before skills or client
   configuration change and explains that the release lacks the current
   platform artifact.

---

### User Story 2 - Prepare a trusted platform release (Priority: P2)

An AgentBase release maintainer explicitly builds the pinned, patched Codebase
Memory source once on each supported platform and produces the exact bundle
ordinary users will receive.

**Why this priority**: A simple offline install is possible only when a trusted
release artifact has already been produced and reviewed.

**Independent Test**: On one supported build machine, create a bundle from the
pinned source/profile, verify its identity and then use that bundle in an
isolated ordinary installation.

**Acceptance Scenarios**:

1. **Given** the approved native build prerequisites, **When** the maintainer
   runs the explicit release preparation, **Then** exactly one platform bundle
   is produced with its executable and complete integrity manifest.
2. **Given** an existing bundle for another supported platform, **When** a new
   platform bundle is prepared, **Then** the other bundle is unchanged.
3. **Given** a build, probe or integrity failure, **When** preparation stops,
   **Then** no partial release bundle replaces the last valid bundle.

### Edge Cases

- A supported operating system with an unsupported CPU fails as an unavailable
  release target rather than attempting a source build.
- A bundle executable, manifest, pinned source, parser profile or accepted tool
  surface changed independently is rejected before activation.
- Interrupted activation preserves the previously admitted runtime.
- Windows remains an explicit unsupported AgentBase release target even though
  upstream Codebase Memory supports it.
- npm dependency installation continues to use only the configured internal
  registry; provider activation performs no download.

## Requirements

### Functional Requirements

- **FR-001**: Ordinary installation MUST remain one invocation of the existing
  AgentBase installer.
- **FR-002**: Ordinary installation MUST select only the exact bundled artifact
  matching the current supported operating system and CPU.
- **FR-003**: Ordinary installation MUST NOT compile Codebase Memory or require
  the user to install a compiler, Make, zlib development headers or another
  native build dependency.
- **FR-004**: Provider activation MUST perform no provider download and MUST
  continue to use only the configured internal npm registry for npm packages.
- **FR-005**: Before activation, AgentBase MUST verify the bundle's provider
  version, pinned source, parser profile, platform, accepted tool surface and
  executable checksum.
- **FR-006**: Missing, mismatched or corrupt bundles MUST fail before product
  skills or MCP client configuration change.
- **FR-007**: Activation MUST be atomic: failure or interruption MUST preserve
  the previously admitted runtime, and an exact rerun MUST be a safe no-op.
- **FR-008**: Existing dependency installation, client selection, skill
  allowlist, registration transaction and Hub credential boundaries MUST remain
  unchanged.
- **FR-009**: Native source compilation MUST remain an explicit maintainer-only
  release action and MUST never run during MCP startup or ordinary install.
- **FR-010**: Release preparation MUST produce one self-contained immutable
  platform bundle without changing bundles for other platforms.
- **FR-011**: The MVP release targets MUST be `linux-x64` and `darwin-arm64`;
  Windows and other architectures MUST fail explicitly rather than fall back to
  ambient binaries or source compilation.
- **FR-012**: A platform bundle MUST be traceable to the exact reviewed source,
  profile and accepted tool surface used by runtime admission.

### Key Entities

- **Platform bundle**: One executable plus one integrity manifest for an exact
  supported operating-system and CPU pair.
- **Active runtime**: The private installed copy selected by ordinary AgentBase
  execution; it is replaceable only by a valid platform bundle.
- **Release preparation**: An explicit maintainer action that creates one
  platform bundle from reviewed native source.

## Success Criteria

### Measurable Outcomes

- **SC-001**: A supported enterprise user completes AgentBase installation with
  one command and zero native-development prerequisite commands.
- **SC-002**: Every corrupt, wrong-platform or incomplete bundle in the focused
  acceptance suite is rejected before client or skill mutation.
- **SC-003**: Repeating installation with the same bundle produces the same
  admitted executable identity and no additional provider state.
- **SC-004**: One explicit release preparation produces a bundle that passes the
  same admission checks used by ordinary runtime execution.
- **SC-005**: The repository's complete offline verification gate passes with
  no new production package dependency, daemon or public MCP tool.

## Assumptions

- The AgentBase source/release is already present inside the company; no public
  installer download is required.
- Approved Node.js `>=24.12 <25` and the company's internal npm registry remain
  ordinary installation prerequisites.
- A trusted company macOS arm64 machine will produce the macOS bundle before
  company release; this Linux environment cannot create or qualify it.
- Committing one reviewed native artifact per supported platform is acceptable
  for the private enterprise repository.
