# Tasks: Refresh change accounting

## Phase 1: Contract foundation

- [x] T001 Record owner decisions and activate capability 065 in `specs/065-refresh-change-accounting/spec.md` and `specs/CURRENT.md`
- [x] T002 [P] Synchronize lifecycle and proposal-flow boundaries in `docs/product/03-knowledge-lifecycle.md` and `docs/architecture/flows.md`
- [x] T003 [P] Add `AB-REFRESH-013..016` and changed-path behavior to `docs/capabilities/09-ingest-and-refresh/02-refresh-and-change-detection.md`, `06-refresh-reconciliation.md` and `docs/capabilities/11-review-and-publish/01-runtime-requirements.md`

## Phase 2: User Story 1 — Prevent silent Refresh omissions

**Goal**: require one truthful outcome for every returned changed path.

**Independent Test**: missing/duplicate/extra/unsupported accounting fails in a repairable session; corrected exact evidence succeeds.

- [x] T004 [US1] Add failing requirement-linked validation tests in `src/app/hub-okf/authoring/refresh-change-accounting.test.ts`
- [x] T005 [US1] Implement normalization and evidence validation in `src/app/hub-okf/authoring/refresh-change-accounting.ts`
- [x] T006 [US1] Freeze source changes and enforce accounting in `src/app/hub-okf/authoring/authoring-session.ts` and `src/app/hub-okf/query/runtime-actions.ts`
- [x] T007 [US1] Expose and parse `change_accounting` in `src/app/hub-okf/mcp/mcp-tools.ts`, `mcp-tool-call.ts` and `mcp-tool-actions.ts`

## Phase 3: User Story 2 — Review truthful partial coverage

**Goal**: retain path outcomes and bounded incompleteness in proposal review.

**Independent Test**: ignored-only changes create a reviewable observation proposal, inspection exposes partial metadata and true zero-delta remains no-op.

- [x] T008 [US2] Extend proposal inspection context in `src/app/hub-okf/review/inspect.ts`
- [x] T009 [US2] Add runtime integration and no-change regression coverage in `src/app/hub-okf/authoring/initial-ingest.test.ts` and `refresh-change-accounting.test.ts`
- [x] T010 [US2] Update released workflow instructions in `.agents/skills/agentbase-refresh/SKILL.md`

## Phase 4: Verification and closure

- [x] T011 Run focused tests, type/architecture/spec checks, `npm run verify` and `git diff --check`
- [x] T012 Reconcile `AB-REFRESH-013..016`, record verification and close capability 065 in `specs/065-refresh-change-accounting/verification.md` and `specs/CURRENT.md`

## Dependencies and execution order

- T001–T003 precede runtime code.
- T004 precedes T005–T007.
- T005–T007 precede T008–T010.
- T011 precedes closure T012.

## Implementation strategy

The MVP is one authoring validator plus additive session, inspection and MCP fields. Adaptive/full discovery, semantic grouping and benchmark automation stay outside this branch until this smaller invariant proves useful.
