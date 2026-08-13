# Tasks: Client MCP Registration

**Input**: Design documents from `specs/010-client-mcp-registration/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/client-registration.md

**Tests**: Requirement-linked tests are mandatory because this feature mutates user-global client configuration and requires explicit recovery evidence.

## Phase 1: Setup and Living Contract

**Purpose**: Establish the active requirement IDs and provider evidence before runtime work.

- [x] T001 Extend required installation IDs through `AB-INSTALL-017` in `scripts/check-specs.mjs` and its fixtures in `scripts/check-specs.test.mjs`
- [x] T002 Update the current installation requirements for registration, coexistence and recovery in `docs/specs/installation.md`

---

## Phase 2: Foundational Registration Contract

**Purpose**: Build the exact client model and recovery boundary that block every user story.

- [x] T003 Write failing expected-entry, concrete Codex/Claude descriptor and entry-normalization tests for `AB-INSTALL-008..011` in `scripts/client-registration.test.mjs`
- [x] T004 Implement exact checkout/runtime admission, client executable admission, bounded shell-free process execution and normalized inspect/add/remove operations in `scripts/client-registration.mjs`
- [x] T005 Write failing private receipt, snapshot identity, unsafe-state and next-run recovery tests for `AB-INSTALL-012..015` in `scripts/client-registration.test.mjs`
- [x] T006 Implement owner-private atomic transaction receipt, guarded snapshots and typed secret-free failures in `scripts/client-registration.mjs`

**Checkpoint**: Exact client operations and durable recovery primitives are independently proven without real client homes.

---

## Phase 3: User Story 1 - Register Selected Coding Clients (Priority: P1) 🎯 MVP

**Goal**: Register Codex, Claude Code or both at user scope from the interactive installer.

**Independent Test**: Every selected combination produces only its exact fake user-scope entry; unselected and non-interactive clients remain unchanged.

- [x] T007 [US1] Add failing Codex-only, Claude-only, both-selected and non-interactive journey tests for `AB-INSTALL-007`, `AB-INSTALL-010` and `AB-INSTALL-017` in `scripts/install.test.mjs`
- [x] T008 [US1] Compose client preflight/registration after selection and credential handling, replace deferred output with per-client verified results and preserve non-interactive behavior in `scripts/install.mjs`

**Checkpoint**: A clean supported client can use the installed AgentBase-MCP entry without manual configuration.

---

## Phase 4: User Story 2 - Rerun Without Damage (Priority: P1)

**Goal**: Make exact reruns no-ops and reject same-name conflicts before mutation.

**Independent Test**: Exact, conflict, moved-checkout and unrelated-setting fixtures preserve every byte not explicitly added by the current transaction.

- [x] T009 [US2] Add failing exact-rerun, conflicting-entry, moved-checkout and unrelated-setting preservation tests for `AB-INSTALL-009..011` in `scripts/client-registration.test.mjs`
- [x] T010 [US2] Complete full-selection preflight, exact no-op and typed conflict behavior before transaction creation in `scripts/client-registration.mjs`

**Checkpoint**: Reinstallation cannot silently take over or repoint an existing AgentBase-named entry.

---

## Phase 5: User Story 3 - Recover All Selected Clients Together (Priority: P1)

**Goal**: Guarantee verified all-or-nothing registration across selected clients with durable retry recovery.

**Independent Test**: Every injected add/verify/interruption/rollback phase either restores admitted pre-state or preserves concurrent bytes with one actionable recovery receipt.

- [x] T011 [US3] Add failing second-client add/verify failure, interruption, reverse rollback, concurrent change and rollback-failure tests for `AB-INSTALL-012..015` in `scripts/client-registration.test.mjs`
- [x] T012 [US3] Implement stable ordered add, exact post-add verification, reverse compensation, digest-gated snapshot recovery and receipt cleanup/retry in `scripts/client-registration.mjs`
- [x] T013 [US3] Add installer-level terminal restoration, credential-independence and recovery-result journeys for `AB-INSTALL-010`, `AB-INSTALL-014` and `AB-INSTALL-016` in `scripts/install.test.mjs`

**Checkpoint**: No supported failure path silently leaves a partial selected-client installation.

---

## Phase 6: Product Documentation and Verification

**Purpose**: Make current behavior discoverable and close the capability with deterministic evidence.

- [x] T014 [P] Update installation usage, exact conflict/recovery guidance and real-smoke boundary in `README.md`, `docs/ARCHITECTURE.md` and `docs/handoff.md`
- [x] T015 Run focused installer suites, architecture cohesion review and `npm run verify`, then record results and close the active selector in `specs/010-client-mcp-registration/verification.md`, `specs/010-client-mcp-registration/spec.md` and `specs/CURRENT.md`

---

## Dependencies & Execution Order

- Phase 1 establishes living IDs and may run before implementation.
- Phase 2 blocks all stories.
- US1 proves clean registration, then US2 adds coexistence preflight, then US3 completes transaction recovery; they are intentionally sequential because they modify the same cohesive owner.
- T014 can proceed after product behavior stabilizes and does not edit runtime files.
- T015 is last and must not perform a real client registration.

## Parallel Opportunities

- T001 and T002 touch separate specification files but should be reviewed together.
- T014 documentation can run alongside final focused test cleanup after runtime behavior is stable.
- No runtime tasks are marked parallel because they intentionally converge on `scripts/client-registration.mjs` or `scripts/install.mjs`; parallel edits would create avoidable conflicts.

## Implementation Strategy

1. Establish living requirement coverage.
2. Make concrete provider/receipt tests fail before implementation.
3. Deliver clean single/both-client registration as the MVP.
4. Add coexistence rules, then transactional recovery.
5. Verify entirely in isolated homes and fake CLIs.
6. Request separate authorization before any real installed-client smoke action.
