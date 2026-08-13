# Tasks: Lazy Hub Configuration and Bootstrap

**Input**: Design documents under `specs/009-lazy-hub-bootstrap/`

**Tests**: Requirement-linked tests are mandatory because this feature changes optional authority, persistent configuration, direct-main bootstrap and recovery.

## Phase 1: Product and ownership setup

- [x] T001 Add AB-HUB-SETUP-001..017 living requirements and active spec enforcement in `docs/specs/agentbase-hub.md`, `scripts/check-specs.mjs` and `scripts/check-specs.test.mjs`
- [x] T002 Update Hub capability ownership/responsibility without adding a new module in `docs/ARCHITECTURE.md` and `scripts/module-boundaries.json`

## Phase 2: Foundational optional Hub state

- [x] T003 [P] Add optional-remote/base/knowledge identity contract tests in `src/core/hub/local-state.test.ts` and `src/core/hub/proposal.test.ts`
- [x] T004 Implement stable local Hub ID, exact base identity and optional remote authority in `src/core/hub/local-state.ts`, `src/core/hub/proposal.ts` and `src/core/hub/index.ts`
- [x] T005 [P] Add global configuration absence, parse, mode, permission, symlink, atomicity and legacy-environment tests in `src/app/hub-okf/configuration-file.test.ts` and `src/app/hub-okf/configuration.test.ts`
- [x] T006 Implement atomic non-secret global Hub configuration and optional/legacy resolution in `src/app/hub-okf/configuration-file.ts` and `src/app/hub-okf/configuration.ts`
- [x] T007 Adapt local Hub admission, authoring session identity and pending ancestry to local-only/remote states in `src/app/hub-okf/local-hub.ts`, `src/app/hub-okf/authoring-session.ts`, `src/app/hub-okf/pending.ts` and focused tests

## Phase 3: User Story 1 — Work without a Hub (P1)

**Goal**: MCP and Code Graph operate normally with no Hub while Hub status/setup remain available.

**Independent Test**: Start from a disposable unconfigured home, exercise graph tools/status and prove zero Hub state or network activity.

- [x] T008 [P] [US1] Add unconfigured status, prepare refusal and no-Hub graph server tests in `src/app/hub-okf/mcp-tools.test.ts`, `src/app/hub-okf/runtime-actions.test.ts` and `src/app/codebase-memory-mcp/server.test.ts`
- [x] T009 [US1] Make Hub runtime actions always available, reload optional configuration per action and return structured setup choices in `src/app/hub-okf/runtime-actions.ts` and `src/app/codebase-memory-mcp/server.ts`
- [x] T010 [US1] Expose Hub status through MCP and CLI without requiring configuration in `src/app/hub-okf/mcp-tools.ts`, `src/app/hub-okf/cli.ts` and `src/cli.ts`

## Phase 4: User Story 2 — Attach an existing Hub (P1)

**Goal**: Lazily clone and atomically admit one exact existing AgentBase-Hub URL.

**Independent Test**: Attach a disposable admitted remote and reject invalid URL/content/permission/interruption with no partial config.

- [x] T011 [P] [US2] Add exact URL parsing, staged clone, Hub validation, collision and interrupted-admission tests in `src/app/hub-okf/setup.test.ts`
- [x] T012 [US2] Implement credential-free GitHub URL normalization and staged existing-Hub attachment in `src/app/hub-okf/setup.ts`
- [x] T013 [US2] Route configure-existing through runtime, MCP and CLI contracts in `src/app/hub-okf/runtime-actions.ts`, `src/app/hub-okf/mcp-tools.ts` and `src/app/hub-okf/cli.ts`

## Phase 5: User Story 3 — Create and grow a local-only Hub (P1)

**Goal**: Initialize a useful local Hub base and run the existing OKF lifecycle without remote authority.

**Independent Test**: Create one local base, accept/query two proposals, list both pending and prove no origin/network action.

- [x] T014 [P] [US3] Add private local init, README/index bytes, base trailer, no-network and interruption tests in `src/app/hub-okf/setup.test.ts`
- [x] T015 [US3] Implement local Hub initialization and exact base commit in `src/app/hub-okf/setup.ts`
- [x] T016 [US3] Route configure-new and prove local-only prepare/finalize/accept/query/pending E2E in `src/app/hub-okf/runtime-actions.ts`, `src/app/hub-okf/mcp-tools.ts`, `src/app/hub-okf/cli.ts` and `src/app/hub-okf/local-e2e.test.ts`

## Phase 6: User Story 4 — Bootstrap a new remote deliberately (P2)

**Goal**: Attach an empty user-created repository and preserve the reviewed base/knowledge split under either explicit mode.

**Independent Test**: From `B0 -> K1 -> K2`, prove exact all-to-main and base-to-main-plus-one-PR refs plus checkpoint recovery.

- [x] T017 [P] [US4] Add bounded empty-ref discovery and race/redaction tests in `src/providers/github-hub/git-process.test.ts`
- [x] T018 [US4] Extend bounded Git provider operations needed for exact bootstrap refs in `src/providers/github-hub/git-process.ts` and `src/providers/github-hub/index.ts`
- [x] T019 [P] [US4] Add bootstrap intent, both modes, zero-knowledge, populated remote, drift and every checkpoint recovery test in `src/app/hub-okf/bootstrap.test.ts`
- [x] T020 [US4] Implement serialized first-bootstrap intent/receipt/recovery and reuse batch publication in `src/app/hub-okf/bootstrap.ts`
- [x] T021 [US4] Route bootstrap preview/execute through runtime, MCP and CLI contracts in `src/app/hub-okf/runtime-actions.ts`, `src/app/hub-okf/mcp-tools.ts` and `src/app/hub-okf/cli.ts`

## Phase 7: User Story 5 — Recover from missing GitHub access (P2)

**Goal**: Preserve local state and provide secret-free token-access remediation at every remote phase.

**Independent Test**: Inject repository-read, Contents-write and Pull-requests-write denial, replace a fake token and retry exact state.

- [x] T022 [P] [US5] Add permission-category, token-canary and retry tests in `src/providers/github-hub/github-api.test.ts`, `src/app/hub-okf/setup.test.ts` and `src/app/hub-okf/bootstrap.test.ts`
- [x] T023 [US5] Normalize bounded permission guidance across attach/bootstrap/publication in `src/providers/github-hub/github-api.ts`, `src/app/hub-okf/setup.ts` and `src/app/hub-okf/bootstrap.ts`

## Phase 8: Product documentation and closure

- [x] T024 Update public exports, README, installer wording and handoff in `src/app/hub-okf/index.ts`, `README.md`, `docs/specs/installation.md` and `docs/handoff.md`
- [x] T025 Run focused setup/bootstrap/provider/security journeys, review architecture cohesion without metric-driven splitting, and record results in `specs/009-lazy-hub-bootstrap/verification.md`
- [x] T026 Run `$speckit-converge` until clean and `npm run verify`; reconcile FR-001..017/SC-001..007 and close `specs/CURRENT.md` only when no task remains

## Dependencies and execution order

- T001–T007 establish the optional-state/configuration foundation.
- US1 depends on optional runtime construction from the foundation.
- US2 and US3 share setup/config files and execute sequentially after US1; each remains independently testable.
- US4 depends on a local-only base/knowledge history from US3 and reuses existing batch publication.
- US5 hardens every remote phase after US2/US4 behavior exists.
- T024–T026 close only after every story and recovery path passes.

## Parallel opportunities

- Core state tests (T003) and configuration tests (T005) touch separate owners.
- No-Hub MCP/server tests (T008) can be written before runtime composition changes.
- Provider empty-ref tests (T017) and bootstrap app tests (T019) touch separate owners.
- Permission fixtures (T022) may be drafted across provider/setup/bootstrap before T023 composition.

## Implementation strategy

1. Make absence a valid state before adding setup mutations.
2. Deliver existing attach and new local init as separate complete flows.
3. Prove local-only OKF before any remote bootstrap code.
4. Implement all-to-main first, then base-only plus existing PR lifecycle and recovery.
5. Add permission guidance, living docs, convergence and canonical verification.
