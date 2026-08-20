# Feature Specification: AgentStack Foundation

**Feature Branch**: `main`

**Created**: 2026-08-20

**Status**: Completed

**Input**: Replace AgentBase-MCP's hand-written architecture metrics and
registry with the minimal AgentStack standard already adopted by AgentDocks:
native dependency, dead-code and secret-scanning tools plus the existing SDD
and agent instructions.

## Owner Decisions

- Keep the modular-monolith shape, capability ownership documentation, cycle
  prevention and core/provider/application dependency direction.
- Remove the custom architecture engine, exact ownership registry, file metric
  budgets and non-growing architecture baseline because they obstruct ordinary
  cohesive changes.
- Use `dependency-cruiser`, `knip` and `gitleaks` through their native configs
  and script names; do not create another wrapper framework or copy their
  engines.
- Keep `docs/ARCHITECTURE.md` as the human/agent ownership index. Tool config
  enforces stable dependency facts, not every prose ownership statement.
- Development verification only: no production dependency, runtime behavior,
  Hub data, repository evidence or credential workflow changes.
- AgentStack remains a facts/standards reference. AgentBase-MCP does not depend
  on the AgentStack repository at runtime or during normal verification.

## User Scenarios & Testing

### User Story 1 - Change code without metric debt (Priority: P1)

As an AgentBase maintainer, I want architecture verification to reject real
dependency violations without blocking a cohesive change because a file gained
lines, bytes or imports.

**Why this priority**: The current custom checker reports review-size warnings
and maintains exact baselines that can make correct feature work serve an
internal metric rather than product behavior.

**Independent Test**: Run the architecture gate on the real source tree and on
small violating fixtures; the real tree passes, while a cycle, reverse layer
dependency and cross-capability private import fail.

**Acceptance Scenarios**:

1. **Given** a valid cohesive file grows, **When** verification runs, **Then**
   no line, byte, density, line-length or import-count rule blocks it.
2. **Given** core imports an application/provider module, **When** verification
   runs, **Then** it fails with the offending dependency.
3. **Given** two source modules form a cycle, **When** verification runs,
   **Then** it fails without consulting a custom baseline.
4. **Given** one capability imports a private file of another capability,
   **When** verification runs, **Then** it fails while imports through that
   capability's public entrypoint remain allowed.

---

### User Story 2 - Run one complete offline repository gate (Priority: P1)

As a maintainer preparing a change, I want the canonical verification command
to find dead code/dependencies and likely committed secrets alongside the
existing specification, type and test checks.

**Why this priority**: These are independent deterministic risks and mature
tools already solve them better than repository-specific code.

**Independent Test**: Run each native tool and the composed verification gate
on the clean repository; all pass without network, model calls or source
mutation.

**Acceptance Scenarios**:

1. **Given** the maintained source and entrypoints, **When** dead-code analysis
   runs, **Then** unused files and dependencies fail while intentionally public
   export/type noise excluded by the reviewed initial scope does not.
2. **Given** repository files without a secret finding, **When** secret scanning
   runs, **Then** it exits successfully and redacts any reported value.
3. **Given** any native gate fails, **When** the composed verification command
   runs, **Then** it exits non-zero without modifying source or retrying.

### Edge Cases

- A public barrel has many imports but one cohesive responsibility: no metric
  warning or baseline is created.
- Tests and scripts are legitimate entrypoints: dead-code configuration names
  them explicitly rather than adding broad ignore lists.
- A foreign/custom OKF example resembles a credential: only a narrow,
  reviewed false-positive exception may be added; secret values are never
  printed in the gate.
- A developer lacks the required native secret scanner: verification fails
  clearly instead of downloading or installing it automatically.
- Dependency tooling cannot parse a source file: the gate fails rather than
  silently passing on a partial graph.

## Requirements

### Functional Requirements

- **AB-FND-010**: Every runtime and test file MUST remain attributable to one
  documented capability through the source layout and architecture ownership
  index. Verification MUST NOT require a second exact ownership registry.
- **AB-FND-011**: Cross-capability source imports MUST use the target
  capability's public entrypoint. Native dependency analysis MUST reject a
  cross-capability private import with exact source and target paths.
- **AB-FND-012**: Native dependency analysis MUST reject local cycles, core to
  provider/application dependencies and provider to application dependencies.
- **AB-FND-013**: Canonical verification MUST NOT gate on file line count,
  bytes, maximum line length, density or local-import count, and MUST NOT retain
  non-growing metric baselines or exceptions.
- **AB-FND-015**: `npm run verify` MUST compose specification, type, dependency
  architecture, dead-code/dependency, redacted secret, offline test and diff
  checks and fail when any required check fails.
- **AB-FND-020**: Dead-code analysis MUST use a native maintained tool with
  explicit project entrypoints and MUST initially gate unused files and
  dependencies without forcing removal of intentionally public exports/types.
- **AB-FND-021**: Secret analysis MUST use the native scanner's default rules,
  project configuration and redacted output; it MUST NOT read ignored secret
  files through a custom repository scanner or auto-install a binary.
- **AB-FND-022**: Architecture and dead-code tools MUST be reviewed, lockfile-
  pinned development dependencies. The native secret-scanner prerequisite MUST
  be documented and remain outside production/runtime dependencies.

### Key Entities

- **Dependency Rule Set**: Native configuration for cycles, layer direction and
  cross-capability public boundaries.
- **Dead-Code Configuration**: Explicit project and entrypoint scope consumed by
  the native analyzer.
- **Secret-Scanning Configuration**: Default native rules plus only reviewed
  project-specific adjustments, always with redacted reporting.
- **Canonical Verification Gate**: Existing offline command that composes the
  individual deterministic checks.

## Success Criteria

### Measurable Outcomes

- **SC-001**: The real AgentBase-MCP source passes dependency analysis with zero
  cycles, reverse-layer imports or cross-capability private imports.
- **SC-002**: Focused fixtures demonstrate 100% rejection of one cycle, one
  reverse-layer dependency and one cross-capability private import, while one
  public-entrypoint import passes.
- **SC-003**: The custom checker, its tests, metric baseline and ownership
  registry are absent, with zero replacement line/byte/import-budget code.
- **SC-004**: Dead-code and redacted secret checks pass on the maintained
  repository and are required by the canonical gate.
- **SC-005**: `npm run verify` passes offline without changing application
  runtime dependencies, generated Hub knowledge or repository source data.

## Non-Goals

- A shared AgentStack config package or runtime dependency on the AgentStack repo.
- An apply/review engine, standards CLI or automatic tool installer.
- ESLint, Biome, file-size or complexity gates in this capability.
- Production runtime, MCP tools, Code Graph, OKF schemas or Hub behavior changes.
- Running a real model benchmark, rebuilding a Hub PR, publishing or deploying.

## Assumptions

- Node.js 24 and npm remain the development environment.
- The VPS already provides the reviewed native `gitleaks` binary; other
  environments install it deliberately outside this repository.
- Existing directory ownership in `docs/ARCHITECTURE.md` remains current.
- The checkpoint commit `117f640` is the recovery point for this foundation change.
