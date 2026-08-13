# Tasks: Graph Refresh Reuse

**Input:** design documents under `specs/004-graph-refresh-reuse/`
**Status:** Complete

## Phase 1: Decision record and foundation

**Purpose:** Establish the small private-state boundary before changing graph
round behavior.

- [x] T001 Record the provider-owned refresh, exact-receipt reuse, no-watcher and explicit-recovery decision in `docs/decisions/0008-graph-refresh-reuse.md`
- [x] T002 Write version/type/bounds/source/engine/namespace validation, exact-match decision and atomic old-file-preservation tests for AB-REFRESH-001–003/007 in `src/app/repository-okf/graph-freshness.test.ts`
- [x] T003 Implement the narrow receipt value, reader, decision and atomic writer for AB-REFRESH-001–003/007 in `src/app/repository-okf/graph-freshness.ts`
- [x] T004 [P] Write external-state-root, metadata/provider separation, opaque namespace and permission tests in `src/app/repository-okf/provider-workspace.test.ts`
- [x] T005 Extend the existing private workspace with an AgentBase-owned receipt path and opaque namespace ID in `src/app/repository-okf/provider-workspace.ts`
- [x] T006 Register only the new repository-OKF freshness file ownership and update exact architecture ceilings if measured need requires it in `scripts/module-boundaries.json` and `scripts/architecture-baseline.json`

**Checkpoint:** receipt logic is offline, bounded and independently testable; no
provider process or graph algorithm has changed.

## Phase 2: User Story 1 — Reuse an unchanged graph (P1) 🎯 MVP

**Goal:** Skip indexing on an exact accepted source/provider/namespace match
while retaining every query, integrity and cleanup check.

**Independent test:** two fake-provider rounds over identical source return
equivalent evidence; the second makes zero index calls, reports
`reused/exact-match`, closes cleanly and commits a complete receipt.

- [x] T007 [US1] Write initial-refresh/second-reuse, zero-index, equivalent-evidence, diagnostics-redaction and post-cleanup commit scenarios for AB-REFRESH-004/007/010 in `src/app/repository-okf/graph-refresh.test.ts`
- [x] T008 [US1] Compose freshness loading/decision, skipped index and post-cleanup receipt commit into the existing bounded lifecycle in `src/app/repository-okf/graph-round.ts`
- [x] T009 [P] [US1] Export only the required freshness/diagnostic values through `src/app/repository-okf/index.ts`
- [x] T010 [US1] Verify existing one-shot and scoped-session graph-round tests retain exact managed-binary, private-cache, no-background, evidence and cleanup behavior for AB-REFRESH-011 in `src/app/repository-okf/graph-round.test.ts`

**Checkpoint:** unchanged explicit rounds reuse private graph state without a
native index call or any background behavior.

## Phase 3: User Story 2 — Refresh changed or forced freshness (P1)

**Goal:** Delegate exactly one provider refresh for changed/missing/forced state,
advance receipt only on safe success and provide explicit recovery.

**Independent test:** fake add/modify/delete/source/provider/forced scenarios
make exactly one index call; every injected failure keeps the prior receipt
bytes, emits no partial evidence and performs no hidden retry.

- [x] T011 [US2] Add changed source/provider, malformed/missing receipt, forced refresh and exact one-index-call tests for AB-REFRESH-003/005/006 in `src/app/repository-okf/graph-refresh.test.ts`
- [x] T012 [US2] Add index/query/source-drift/cleanup/receipt-write failure and reuse-cache explicit-recovery/no-retry tests for AB-REFRESH-008/009 in `src/app/repository-okf/graph-refresh.test.ts`
- [x] T013 [US2] Complete typed preparation diagnostics and visible `--refresh` recovery behavior without automatic fallback in `src/app/repository-okf/graph-round.ts`
- [x] T014 [P] [US2] Write CLI order/repetition/invalid-value/default/forced and redacted-error scenarios in `src/app/repository-okf/real-evidence.test.ts`
- [x] T015 [US2] Add the optional `--refresh` argument and pass forced freshness through the current integration command in `src/app/repository-okf/real-evidence.ts`
- [x] T016 [US2] Run disposable exact-provider initial/add/modify/delete/reuse/forced qualification for AB-REFRESH-012, stop instead of adding recovery machinery on contract failure, and capture sanitized outcomes/limitations in `fixtures/codebase-memory-v0.10.1/refresh.json` and `specs/004-graph-refresh-reuse/verification.md`

**Checkpoint:** changed and forced rounds are correct and explicit; a failed
reuse is one visible failure plus one owner-selected recovery action.

## Phase 4: Living contracts and closure

- [x] T017 [P] Add accepted AB-REFRESH-001–012 behavior to `docs/specs/local-code-intelligence.md`, then route and mechanically enforce the stable IDs in `AGENTS.md`, `scripts/check-specs.mjs`, and `scripts/check-specs.test.mjs`
- [x] T018 [P] Document the explicit automatic-decision/`--refresh` flow and measured non-goals in `README.md` and `specs/004-graph-refresh-reuse/quickstart.md`
- [x] T019 Update ownership, private-state boundary, roadmap and handoff outcome in `docs/ARCHITECTURE.md`, `docs/roadmap.md`, and `docs/handoff.md`
- [x] T020 Capture only a newly proven reusable freshness-receipt lesson, if one remains after implementation, in `/home/khoa/workspace/agentstack/docs/patterns/managed-native-provider-boundary.md`
- [x] T021 Run offline `npm run verify`, production audit and explicit exact-provider cleanup checks, then reconcile `spec.md`, `plan.md`, `tasks.md`, `specs/CURRENT.md`, and `specs/004-graph-refresh-reuse/verification.md`

## Dependencies and execution order

```text
owner approval -> T001
T001 -> T002/T004
T002 -> T003
T004 -> T005
T003 + T005 -> T006 -> T007 -> T008 -> US1 complete
US1 -> T011/T012/T014 -> T013/T015 -> T016 -> US2 complete
US1 + US2 -> T017-T021
```

## Parallel opportunities

- T004 is file-independent from freshness value work after T001.
- T009 is export-only after T008 and does not overlap graph-round tests.
- T014 covers CLI parsing while T011/T012 cover application lifecycle.
- T017 and T018 update separate living-contract and user-guide surfaces.

Only one agent is assumed. `[P]` marks file-independent work, not a requirement
to delegate.

## Implementation strategy

The MVP is Phase 1 plus User Story 1. Stop at either checkpoint if receipt
ownership or exact cache reuse is unreliable. User Story 2 adds only changed and
explicit recovery behavior already supported by the provider; it must not grow
into cache repair, watcher, daemon or custom incremental indexing.

## Format validation

The 21 planned tasks use sequential IDs, exact file paths, story labels only in
user-story phases and `[P]` only for file-independent work.
