# Feature Specification: Own Upstream Runtimes

**Feature Branch**: `044-own-upstream-runtimes`

**Created**: 2026-08-25

**Status**: In Progress

**Input**: Migrate pinned Codebase Memory and diagram-design source into
AgentBase so an enterprise installation can build and run without downloading
code or binaries from a public registry or GitHub at install/runtime.

## User Scenarios & Testing

### User Story 1 - Install Code Graph without public downloads (Priority: P1)

As an enterprise developer, I can prepare AgentBase from its checked-out source
using the approved company registry and obtain the same bounded Code Graph
behavior without the current package postinstall downloading a binary from
GitHub.

**Why this priority**: Code Graph is mandatory local functionality and the
current public-package recovery path violates the enterprise boundary.

**Independent Test**: In a public-network-denied environment with dependencies
available through the configured registry, installation builds and admits the
pinned provider, starts AgentBase MCP, and completes the current nine-action
Code Graph contract on a supported fixture.

**Acceptance Scenarios**:

1. **Given** the pinned source snapshot, supported toolchain and internal
   dependency registry, **When** installation prepares AgentBase, **Then** the
   provider is built and admitted without contacting GitHub or a public package
   registry.
2. **Given** the current `v0.10.1` behavior baseline and the proposed `v0.10.8`
   source, **When** maintainers qualify the new revision before vendoring it,
   **Then** exact tool-schema drift and representative graph/evidence differences
   are visible and an unexplained material difference stops the migration.
3. **Given** the admitted provider, **When** an agent indexes and queries one
   repository, **Then** the existing nine-action surface, lifecycle bounds,
   evidence identity and source-mutation protections remain unchanged.
4. **Given** a missing dependency, unsupported platform or modified source,
   **When** preparation runs, **Then** it fails before MCP registration and
   never falls back to an external download.

---

### User Story 2 - Reproduce on both development platforms (Priority: P1)

As a maintainer, I can build the same accepted source profile on Linux x64 and
macOS arm64 and distinguish every resulting native artifact by exact platform,
source/profile identity and executable digest.

**Why this priority**: Current AgentBase admission accepts Linux x64 only, while
the company target is macOS arm64.

**Independent Test**: Each platform builds in its native environment, produces
an admitted manifest, reports the pinned provider version and passes the same
platform-neutral Code Graph contract; a manifest or artifact from the other
platform is rejected.

**Acceptance Scenarios**:

1. **Given** Linux x64 or macOS arm64, **When** the approved build completes,
   **Then** its artifact records the exact platform, upstream revision, parser
   profile, source digest and executable digest.
2. **Given** a mismatched platform, source digest, profile or executable,
   **When** AgentBase admits the provider, **Then** it fails closed before
   starting the provider.
3. **Given** a previously valid artifact and a failed rebuild, **When** the
   failure is handled, **Then** the prior artifact remains intact and no client
   registration is changed.

---

### User Story 3 - Audit and update owned upstream source (Priority: P2)

As an AgentBase maintainer, I can see exactly which upstream revisions and
licenses are present, which files are AgentBase patches, and how to repeat a
future approved import without treating upstream code as original AgentBase
work.

**Why this priority**: Source ownership must remain maintainable and legally
attributed after its original Git history is removed.

**Independent Test**: A reviewer can trace each imported tree to its pinned
revision, verify its snapshot digest and notices, identify the bounded
AgentBase patch/profile, and detect unrecorded drift offline.

**Acceptance Scenarios**:

1. **Given** the AgentBase checkout, **When** a reviewer follows the upstream
   inventory, **Then** Codebase Memory resolves to tag `v0.10.8` and commit
   `46ae198fc11cda80e817acbc5f5908d7c2de7032`, while diagram-design resolves to
   manifest version `2.6.5` and commit
   `648c2a597839301e06df1e7434a08bde9f42eed3`.
2. **Given** either imported tree, **When** its bytes differ from the admitted
   inventory, **Then** verification reports the exact unapproved drift.
3. **Given** a future upstream update, **When** it is proposed, **Then** it is a
   separately reviewed migration with refreshed provenance, licenses, patch
   audit and qualification evidence; no automatic updater runs.

### Edge Cases

- The configured registry silently falls back to the public npm registry.
- The approved Node 24 runtime or native compiler is unavailable.
- A build is interrupted after the old artifact exists but before the new one
  is admitted.
- An unsupported source language is present in a repository.
- The imported upstream contains generated files larger than the Git host's
  accepted object limit.
- Graph UI or diagram rendering dependencies try to fetch fonts, browsers,
  URLs or release artifacts during preparation.
- Upstream tool schemas drift even though the executable still reports the
  expected version.

## Requirements

### Functional Requirements

- **FR-001**: AgentBase MUST own reviewable source snapshots for Codebase Memory
  and diagram-design at the exact approved revisions, without nested Git
  history.
- **FR-002**: Each snapshot MUST preserve its upstream license, attribution,
  source URL, version/commit and a deterministic inventory digest.
- **FR-003**: Upstream bytes, AgentBase patch bytes and generated build artifacts
  MUST remain visibly separate; unrecorded edits to upstream bytes MUST fail
  verification.
- **FR-004**: The admitted Codebase Memory source profile MUST contain exactly
  HCL/Terraform, JavaScript, TypeScript, TSX, Python, Go, Java, YAML, JSON,
  Dockerfile, Markdown and Bash grammar support for this release.
- **FR-005**: Unsupported grammars and their generated parser files MUST NOT be
  stored or compiled. Their files MUST be skipped as unsupported rather than
  causing a provider crash or a false supported-language claim.
- **FR-006**: The profile/import process MUST prevent any tracked file from
  reaching 100 MB.
- **FR-007**: Preparation MUST consume only the checked-out source, approved
  local toolchain and the user's configured internal registries; it MUST NOT
  contain a public-registry, GitHub Release or arbitrary executable fallback.
- **FR-008**: Codebase Memory preparation MUST build native artifacts for Linux
  x64 and macOS arm64 through the same versioned build contract.
- **FR-009**: Every admitted native artifact MUST bind provider version,
  upstream commit, parser-profile version, source digest, target platform,
  executable digest and AgentBase adapter version.
- **FR-010**: Provider admission MUST reject missing, malformed, mismatched,
  non-executable or wrong-version artifacts before process startup.
- **FR-011**: Build/install MUST stage a new artifact and manifest atomically;
  failure MUST preserve the previous admitted artifact and occur before client
  registration mutation.
- **FR-012**: The current package postinstall/recovery path and its GitHub binary
  download MUST be removed from AgentBase installation and runtime.
- **FR-013**: Migration MUST preserve the released 43-tool catalog, including
  the exact nine-action Code Graph surface, tool-schema drift checks, bounded
  process/session lifecycle and normalized evidence semantics.
- **FR-014**: Canonical verification MUST be offline and deterministic. Native
  builds and per-platform qualification MAY remain explicit platform lanes, but
  both supported lanes MUST produce retained evidence before migration closes.
- **FR-015**: Graph UI source MUST be retained and buildable from the approved
  registry, but AgentBase MUST NOT start, expose or register that UI in this
  capability.
- **FR-016**: diagram-design source MUST be retained with an offline-safe
  static HTML/SVG path, but AgentBase MUST NOT add a diagram skill, public tool,
  Hub UI or automatic rendering in this capability.
- **FR-017**: Playwright/Chromium, PNG automation, remote fonts, URL onboarding
  and network-loaded assets MUST be excluded from the migration's required
  build and verification path.
- **FR-018**: The approved runtime baseline MUST remain Node.js `>=24.12 <25`;
  setup guidance MUST require an enterprise-approved Node 24 distribution and
  MUST NOT prescribe an uncontrolled public download.
- **FR-019**: A future upstream update MUST require explicit owner approval and
  refresh provenance, inventory, license, patch and behavior evidence; AgentBase
  MUST provide no automatic update mechanism.
- **FR-020**: If implementation discovers a material product or architecture
  gap, the high-level and low-level design owners MUST be revised and reviewed
  before implementation continues. Small related gaps MAY be accumulated into
  one explicit spec-sync checkpoint, but MUST be reconciled before closure.
- **FR-021**: Before imported source or runtime admission changes, AgentBase MUST
  qualify Codebase Memory `v0.10.8` against the current `v0.10.1` behavior
  baseline using the exact public tool manifest and representative supported-
  language graph/evidence fixtures. Material unexplained drift MUST stop for
  owner review; qualification MUST NOT silently make the old version canonical.

### Key Entities

- **Upstream Snapshot**: One immutable imported source tree, identified by
  project, source URL, approved revision, license and content inventory.
- **Parser Profile**: The exact supported language set and bounded patch that
  converts the upstream all-language build into AgentBase's accepted subset.
- **Platform Artifact**: One native executable plus admission manifest for an
  exact source/profile/platform build.
- **Upstream Patch Set**: AgentBase-owned changes kept outside or mechanically
  distinguishable from imported upstream bytes.

## Success Criteria

### Measurable Outcomes

- **SC-001**: A public-network-denied installation using configured internal
  dependencies completes without any attempted public URL or GitHub Release
  access.
- **SC-002**: Linux x64 and macOS arm64 each pass provider identity, nine-action
  surface, lifecycle and fixture-evidence qualification from the same pinned
  source/profile identity.
- **SC-003**: Unsupported source-language fixtures are skipped predictably,
  while all 12 profile-language fixtures are recognized without provider crash.
- **SC-004**: The tracked Codebase Memory snapshot remains below 200 MiB and
  contains no individual file at or above 100 MB; the exact final size is
  recorded as evidence rather than promised as a runtime metric.
- **SC-005**: One-byte changes to upstream source, admission manifest or native
  executable are detected before provider startup.
- **SC-006**: The official MCP listing remains exactly 43 tools and the complete
  canonical AgentBase verification passes without adding a model benchmark.
- **SC-007**: A reviewer can identify both upstream revisions, licenses, source
  inventories and every AgentBase patch without consulting deleted Git history
  or the public network.
- **SC-008**: Retained qualification distinguishes upstream-version changes
  from source-build/distribution changes and records every intentionally accepted
  tool or evidence difference before the npm dependency is removed.

## Assumptions

- The company registry audit confirms the currently identified supporting npm
  dependencies are available. The public `codebase-memory-mcp` package path is
  rejected because its postinstall downloads a binary from GitHub; AgentBase
  does not require the company registry to contain the new provider package.
- Native compiler/system-library availability is environment preflight, not a
  reason to add another package manager or binary distribution service.
- Company users may install dependencies from the configured internal registry;
  "offline" means no public egress, not zero access to that registry.
- SQL and the other 147 upstream grammars are deferred until a real repository
  requires them. Adding a language changes the profile and requires focused
  qualification.
- Future Hub graph visualization and evidence-backed diagram rendering are
  separate capabilities after this supply-chain migration is stable.
