# Tasks: Own Upstream Runtimes

**Input**: [spec.md](spec.md), [plan.md](plan.md), [research.md](research.md),
[data-model.md](data-model.md) and
[upstream-runtime-contract.md](contracts/upstream-runtime-contract.md)

**Execution rule**: Run sequentially. After every phase, compare implementation
with capability 044 and the living high/low-level owners. A material mismatch
stops implementation for owner review; do not code around it.

## Phase 0: Qualify the upstream revision

- [X] T001 [US1] Retain the current `v0.10.1` tool manifest and one compact set of representative graph, coverage and normalized-evidence outputs as the comparison baseline.
- [X] T002 [US1] Build or run pristine `v0.10.8` from its approved local checkout and execute the same model-free qualification without changing AgentBase runtime admission.
- [X] T003 [US1] Record exact schema/result differences, accept only explained upstream correctness fixes, and stop for owner review if any drift can materially change OKF authoring.

**Checkpoint**: `v0.10.8` is either the accepted behavior baseline or the
capability stops. No vendored source, package removal or runtime cutover occurs
before this decision.

## Phase 1: Own the approved source inputs

- [X] T004 [US3] Add `vendor/README.md` and minimal local-source import/inventory utilities defining immutable upstream, AgentBase overlay and generated-artifact ownership, with nested-Git, checksum, path and 100 MB guards.
- [X] T005 [US3] Import approved Codebase Memory `v0.10.8` core and only the 12 accepted grammar inputs with provenance, licenses/notices and deterministic inventory; exclude the Graph UI frontend.
- [X] T006 [US1] Add the exact parser profile plus one external patch that limits grammar compilation/registration and turns omitted recognized languages into visible unsupported skips.
- [X] T007 [US1] Prove the patch applies only in disposable staging and run one compact supported/unsupported-language qualification; record retained size and largest file.
- [X] T008 [US3] Import diagram-design `2.6.5`/`648c2a597839301e06df1e7434a08bde9f42eed3` with provenance, licenses/notices and deterministic inventory, without installing its skill or runtime dependencies.

**Checkpoint**: Both source snapshots are attributed and byte-verifiable. The
Codebase Memory subset builds in staging; diagram-design remains inert.

## Phase 2: Build and admit the native provider

- [X] T009 [US1] Implement bounded platform/toolchain/source preflight and a staged native Codebase Memory build using the approved upstream entrypoint.
- [X] T010 [US2] Probe a successful build, generate the source/profile/platform/tool/executable manifest and atomically publish the ignored current-platform artifact while preserving the previous artifact on failure.
- [X] T011 [US1] Replace npm-package resolution with exact owned-artifact admission while preserving the current engine-evidence shape and all bounded process/session behavior.
- [X] T012 [US2] Extend the existing provider test owner for missing artifact, wrong platform, source/profile/manifest/executable drift and interrupted replacement.

**Checkpoint**: The owned `v0.10.8` build matches the accepted pristine
`v0.10.8` baseline. Runtime never builds, downloads, recovers or searches
`PATH` for another executable.

## Phase 3: Cut over installation safely

- [X] T013 [US1] Remove `codebase-memory-mcp` and its allowed postinstall from `package.json`/`package-lock.json`; retain only dependencies resolved through the user's configured registry.
- [X] T014 [US1] Put Node 24, supported-platform, native-tool, inventory and provider preparation checks before skill/client mutation in the existing installer transaction.
- [X] T015 [US1] Preserve current skill/client rollback and the last admitted artifact when preparation or registration fails; never choose a public fallback authority.
- [X] T016 [US1] Extend the existing installer test owner for ordering, failure isolation and non-interactive behavior without real registry or client mutation.

**Checkpoint**: Enterprise installation builds from repository-owned source
through approved local tools/internal dependencies and performs no public
download.

## Phase 4: Prove compatibility and inactive foundations

- [X] T017 [US1] Capture the accepted `v0.10.8` tool manifest and prove the official MCP listing remains 43 tools with the same nine Code Graph actions.
- [X] T018 [US1] Run representative supported-language graph/evidence/lifecycle fixtures against the owned build and confirm no unintended OKF/Hub workflow change.
- [X] T019 [US3] Verify the Graph UI frontend is absent and diagram-design supports a self-contained static HTML/SVG path; keep rendering inactive and exclude browser downloads, remote fonts, URL onboarding and PNG automation.
- [X] T020 [US3] Add maintainer instructions for local approved source updates, inventory regeneration, patch review and explicit requalification; add no automatic updater.

**Checkpoint**: The provider version and distribution changed through separate,
reviewable comparisons. No public product surface was added.

## Phase 5: Reconcile and qualify both platforms

- [X] T021 Reconcile the current repository-reading, installation and deferred-capability documents plus the minimal matching high-level text before closure.
- [X] T022 Run `npm run verify`, vendor/profile checks and Linux x64 native qualification; record deterministic and native evidence in `verification.md`.
- [ ] T023 [ENTERPRISE RELEASE GATE] Run the same native qualification on macOS arm64 with approved Node 24 and internal registry, appending platform evidence without changing code to fit the environment.
- [X] T024 Audit spec/plan/tasks against implementation, close Linux development and carry T023 visibly as an external release gate without claiming macOS support.

## Dependencies and stopping rules

- Phase 0 precedes all imported-source or runtime changes.
- Phase 1 precedes native admission; Phase 2 precedes npm/installer cutover.
- Phase 3 precedes compatibility and platform qualification.
- T023 is an enterprise release gate requiring the company macOS environment.
  It does not block Linux development closure or the next separately scoped
  capability, but AgentBase MUST NOT claim macOS arm64 release qualification
  until that lane passes.
- A model benchmark is not automatic. Run one only if deterministic version
  qualification exposes a material risk to OKF authoring.
- No Hub cleanup/PR, UI server, diagram rendering or context-graph database is
  part of these tasks.

## Minimal implementation strategy

Reuse the upstream build, existing AgentBase provider/session adapters, current
installer transaction and existing design-level test owners. Add only version
qualification, inventory, one parser-profile overlay, native artifact
preparation and exact admission. Do not create a package publisher, language
plugin system, updater, daemon, second graph or new public action.
