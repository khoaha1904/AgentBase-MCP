# Tasks: Scoped Graph Session

**Input:** design documents under `specs/003-scoped-graph-session/`
**Status:** Complete

## Phase 1: Setup and real compatibility evidence

**Purpose:** admit the one material dependency and prove the exact provider can
serve a clean short-lived stdio session before shaping product code.

- [x] T001 Pin `@modelcontextprotocol/client@2.0.0` exactly, verify package/lock integrity and run a production dependency audit in `package.json` and `package-lock.json`
- [x] T002 Run the exact managed `codebase-memory-mcp@0.10.1` against a disposable fixture through the official client, capture sanitized negotiation/tool/error/cleanup evidence in `fixtures/codebase-memory-v0.10.1/session.json`, and resolve any compatibility caveat in `specs/003-scoped-graph-session/research.md`
- [x] T003 Record the dependency, scoped-session, no-daemon, stop/rollback and upgrade consequences in `docs/decisions/0007-scoped-provider-session.md`

**Checkpoint:** stop without application implementation if the exact provider
cannot negotiate, return the required tools and exit cleanly without config,
watcher or standing-process behavior.

## Phase 2: Foundational transport seam

**Purpose:** extend the existing provider factory without changing the
provider-neutral adapter/evidence contract.

- [x] T004 Add transport/cleanup public contract scenarios for `AB-GRAPH-005`, `AB-GRAPH-010` and `AB-GRAPH-013` in `src/providers/codebase-memory/session.test.ts`
- [x] T005 Define explicit `one-shot` and `scoped-session` provider modes plus idempotent cleanup values while preserving existing callers in `src/providers/codebase-memory/index.ts`
- [x] T006 [P] Extend exact typed lifecycle failure codes for `AB-GRAPH-008`, `AB-GRAPH-009` and `AB-GRAPH-012` in `src/providers/codebase-memory/errors.ts`
- [x] T007 Update the registered Codebase Memory responsibility without adding a capability root or exception in `scripts/module-boundaries.json`

**Checkpoint:** one-shot conformance remains green and no MCP type crosses the
provider public entrypoint.

## Phase 3: User Story 1 — One scoped evidence session (P1) 🎯 MVP

**Goal:** serve the accepted index/architecture/search/trace/snippet flow through
one bounded process and always close it.

**Independent test:** a fake stdio server serves the complete task through one
session, produces the same normalized facts as captured one-shot responses, and
all success/failure paths close exactly once.

- [x] T008 [P] [US1] Write connection, tool-call, message/stderr bound, timeout, premature-exit, cancellation and graceful/forced cleanup tests for `AB-GRAPH-006`–`AB-GRAPH-009` in `src/providers/codebase-memory/session.test.ts`
- [x] T009 [US1] Implement the bounded official-client stdio session and existing `ProviderInvoker` bridge for `AB-GRAPH-006`–`AB-GRAPH-010` in `src/providers/codebase-memory/session.ts`
- [x] T010 [P] [US1] Add captured one-shot/session fact-and-source normalization parity scenarios for `AB-GRAPH-010` in `src/providers/codebase-memory/adapter.test.ts`
- [x] T011 [P] [US1] Write complete-round source drift, forbidden mutation, partial-result and cleanup acceptance tests for `AB-GRAPH-009`–`AB-GRAPH-011` in `src/app/repository-okf/graph-round.test.ts`
- [x] T012 [US1] Compose source identity, private workspace, selected provider, existing evidence preparation and mandatory cleanup in `src/app/repository-okf/graph-round.ts`
- [x] T013 [US1] Route explicit scoped-session evidence without changing one-shot default in `src/app/repository-okf/real-evidence.ts`, `src/app/repository-okf/index.ts`, and `src/cli.ts`

**Checkpoint:** offline tests prove one complete process-scoped round; the real
command returns all five critical facts within three files and leaves no
provider process.

## Phase 4: User Story 2 — Paired lifecycle measurement (P1)

**Goal:** produce honest same-host one-shot/session timing, parity and promotion
evidence.

**Independent test:** injected transports and monotonic times create three
alternating pairs, correct medians/ratio and promotion decisions for pass,
speed-miss, parity-miss, mutation and cleanup cases.

- [x] T014 [P] [US2] Write stage-shape, alternating-order, cache-isolation, median, parity and promotion-gate tests for `AB-GRAPH-001`–`AB-GRAPH-004` in `src/app/repository-okf/graph-round.test.ts`
- [x] T015 [US2] Add monotonic graph-round diagnostics excluded from evidence digest and implement the three-pair benchmark for `AB-GRAPH-001`–`AB-GRAPH-004` in `src/app/repository-okf/graph-round.ts`
- [x] T016 [US2] Add the opt-in exact-fixture `benchmark:codebase-memory` command and JSON contract in `package.json`, `src/app/repository-okf/real-evidence.ts`, `src/app/repository-okf/index.ts`, and `src/cli.ts`
- [x] T017 [US2] Run three real alternating pairs, record six raw arms, medians, fact/source parity, repository mutation, cleanup and limitations in `specs/003-scoped-graph-session/verification.md`

**Checkpoint:** session is promotion-eligible only if every arm is safe/complete
and its median total is at most half the one-shot median.

## Phase 5: User Story 3 — Explicit failure and rollback (P1)

**Goal:** preserve one-shot as a visible rollback and prevent hidden partial or
fallback behavior.

**Independent test:** every declared session failure rejects the round, cleans
up, reports its own code, performs zero one-shot retry, and a separately selected
one-shot round still satisfies Capability 002.

- [x] T018 [P] [US3] Add protocol, MCP tool-error, malformed content, timeout, output, exit, mutation, cleanup and no-auto-fallback scenarios for `AB-GRAPH-012` in `src/providers/codebase-memory/session.test.ts` and `src/app/repository-okf/graph-round.test.ts`
- [x] T019 [US3] Normalize session lifecycle failures and reject partial evidence without transport fallback in `src/providers/codebase-memory/session.ts`, `src/providers/codebase-memory/errors.ts`, and `src/app/repository-okf/graph-round.ts`
- [x] T020 [P] [US3] Preserve explicit one-shot arguments, identity and accepted evidence contract for `AB-GRAPH-013` in `src/providers/codebase-memory/process.test.ts` and `src/app/repository-okf/graph-round.test.ts`
- [x] T021 [US3] Complete CLI validation/redaction and distinct exit behavior for invalid args versus lifecycle failure in `src/app/repository-okf/real-evidence.ts` and `src/cli.ts`

**Checkpoint:** scoped-session failure never claims a partial bundle; one-shot
rollback remains separately runnable and no native provider enters the offline
gate.

## Phase 6: Documentation, conformance and closure

- [x] T022 [P] Add accepted `AB-GRAPH-001`–`AB-GRAPH-014` behavior and session/default outcome to `docs/specs/local-code-intelligence.md`, then route and enforce it in `AGENTS.md`, `scripts/check-specs.mjs`, and `scripts/check-specs.test.mjs`
- [x] T023 [P] Document explicit session/one-shot/benchmark flows and non-goals in `README.md` and `specs/003-scoped-graph-session/quickstart.md`
- [x] T024 Update provider/session ownership, state boundary and measured limitation in `docs/ARCHITECTURE.md`, `docs/roadmap.md`, and `docs/handoff.md`
- [x] T025 Re-measure source/test budgets, update only exact ownership or ceilings when required, and record results in `scripts/architecture-baseline.json` and `specs/003-scoped-graph-session/verification.md`
- [x] T026 Run offline `npm run verify`, structural skill validation, production audit and explicit real-integration cleanup checks, then reconcile `spec.md`, `plan.md`, `tasks.md`, `specs/CURRENT.md`, and `specs/003-scoped-graph-session/verification.md`
- [x] T027 Capture only newly proven reusable scoped-session/promotion lessons in `/home/khoa/workspace/agentstack/docs/patterns/managed-native-provider-boundary.md`

## Dependencies and execution order

```text
owner approval -> T001
T001 -> T002 -> T003
T002 -> T004-T007
T004 + T006 -> T008 -> T009
T005 + T009 -> T010-T013 -> US1 complete
US1 -> T014-T017 -> US2 complete
US1 -> T018-T021 -> US3 complete
US1 + US2 + US3 -> T022-T027
```

## Parallel opportunities

- T006 and T007 use separate provider-error and ownership files after the spike.
- T010 and T011 cover adapter parity and application round safety separately.
- T018 and T020 cover session failures and one-shot rollback in separate seams.
- T022 and T023 update living-contract and user-guide surfaces after behavior is
  stable.

Only one agent is assumed. `[P]` marks file-independent opportunities, not a
requirement to delegate.

## Implementation strategy

The smallest useful slice is Setup + Foundational + User Story 1. Stop there if
the scoped provider cannot negotiate or clean up safely. User Story 2 decides
promotion from real evidence. User Story 3 and closure preserve rollback and
make the new lifecycle supportable.

Do not add watcher, daemon, auto-refresh, second provider, direct-source value
benchmark, OKF changes, Hub, Terraform or AWS work in this capability.

## Format validation

The initial 27 tasks use sequential IDs, exact file paths, story labels only in
user-story phases and `[P]` only for independent file surfaces. Four append-only
convergence tasks record gaps found after implementation without rewriting the
approved task history.

## Phase 7: Convergence

- [x] T028 Recheck repository source/control identity after all graph queries and before accepting evidence in `src/app/repository-okf/prepare-evidence.ts`, with a post-index query-drift scenario in `src/app/repository-okf/graph-round.test.ts`, per AB-GRAPH-011 (partial)
- [x] T029 Require the accepted critical fact identities and maximum source-file bound in benchmark parity/promotion, including an equal-but-incomplete arm scenario in `src/app/repository-okf/graph-round.ts` and `src/app/repository-okf/graph-round.test.ts`, per AB-GRAPH-003 (partial)
- [x] T030 Preserve typed per-arm failure outcomes in the paired benchmark report without partial successful evidence or hidden fallback, and cover continuation/reporting in `src/app/repository-okf/graph-round.ts` and `src/app/repository-okf/graph-round.test.ts`, per US2 acceptance and AB-GRAPH-002/AB-GRAPH-012 (partial)

## Phase 8: Convergence

- [x] T031 Compare repository source/control integrity from before provider admission through after provider cleanup, and reject cleanup-time mutation in `src/app/repository-okf/prepare-evidence.ts`, `src/app/repository-okf/graph-round.ts`, and `src/app/repository-okf/graph-round.test.ts`, per AB-GRAPH-011 and SC-GRAPH-004 (partial)
