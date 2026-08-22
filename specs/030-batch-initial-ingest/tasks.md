# Tasks: Batch Initial Ingest

**Input**: [spec.md](spec.md), [plan.md](plan.md), [data-model.md](data-model.md),
[MCP contract](contracts/mcp.md)

**Verification policy**: Extend existing design-level cases; keep the canonical
suite at 50 tests and stop before model or real-Hub qualification.

## Phase 1: Living Contract and Foundation

- [X] T001 Add AB-BATCH-001..010 and exact Batch Initial Ingest status to `docs/design/09-ingest-and-refresh/09-runtime-requirements.md`, `docs/design/09-ingest-and-refresh/README.md` and `docs/README.md`
- [X] T002 Extend `src/core/hub/proposal.ts` with an exact `batch-new` proposal scope while retaining Repository and Enrichment reconstruction
- [X] T003 Add batch-ingest ownership and confirm the existing generic dependency direction in `docs/design/00-architecture.md` and `.dependency-cruiser.cjs`

## Phase 2: User Story 1 — Confirm and Compose a Batch (Priority: P1)

**Independent test**: Three explicit repositories produce one atomic proposal;
an unresolved outlier blocks all authoring.

- [X] T004 [US1] Implement exact preflight/confirmed immutable manifests and duplicate/nested/existing-repository rejection in `src/app/hub-okf/batch-ingest/manifest.ts`
- [X] T005 [US1] Implement per-member session admission and source/base/evidence checkpoint validation in `src/app/hub-okf/batch-ingest/workflow.ts`
- [X] T006 [US1] Implement ordered diff composition, append-only shared-index and confirmed-Domain navigation regeneration, plus all other overlap rejection in `src/app/hub-okf/batch-ingest/composition.ts`
- [X] T007 [US1] Implement batch prepare/confirm/record/finalize orchestration and public exports in `src/app/hub-okf/batch-ingest/workflow.ts` and `src/app/hub-okf/batch-ingest/index.ts`
- [X] T008 [US1] Expose bounded batch tools and typed actions in `src/app/hub-okf/mcp/mcp-tools.ts`, `src/app/hub-okf/mcp/mcp-tool-call.ts` and `src/app/hub-okf/mcp/mcp-tool-actions.ts`
- [X] T009 [US1] Extend `src/app/hub-okf/workspace/local-only-e2e.test.ts` with three isolated members, outlier blocking, one composed proposal and zero pre-Accept mutation

## Phase 3: User Story 2 — Retry or Revise Membership (Priority: P1)

**Independent test**: Retry only one failed member or remove it explicitly;
unchanged siblings are reused and dangling output blocks Finalize.

- [X] T010 [US2] Add failed/invalidated member state, explicit retry and exact checkpoint reuse in `src/app/hub-okf/batch-ingest/workflow.ts`
- [X] T011 [US2] Add immutable membership revision and attributable-output invalidation in `src/app/hub-okf/batch-ingest/manifest.ts`
- [X] T012 [US2] Reject stale source/base/session state and dangling relations, Questions or indexes during recomposition in `src/app/hub-okf/batch-ingest/composition.ts`
- [X] T013 [US2] Extend the existing lifecycle E2E with failure/retry, source drift, member removal, reuse and duplicate prevention in `src/app/hub-okf/workspace/local-only-e2e.test.ts`

## Phase 4: User Story 3 — Review and Publish One Unit (Priority: P2)

**Independent test**: Accepted batch reconstructs as one indivisible PR unit to
main with complete member attribution.

- [X] T014 [US3] Extend inspection, Accept trailers and pending reconstruction for `batch-new` scope in `src/app/hub-okf/review/inspect.ts`, `src/app/hub-okf/review/accept.ts` and `src/app/hub-okf/review/pending.ts`
- [X] T015 [US3] Publish one independent main-based batch unit and render per-member/shared change scope in `src/app/hub-okf/publication/publish.ts` and `src/app/hub-okf/publication/review-summary.ts`
- [X] T016 [US3] Extend `src/app/hub-okf/publication/publish.test.ts` for indivisible batch publication and exact PR summary

## Phase 5: Skill, Current Truth and Offline Gate

- [X] T017 Add sequential host workflow and stop/recovery rules to `.agents/skills/agentbase-batch-ingest/SKILL.md` and `.agents/skills/README.md`
- [X] T018 Backfill implemented status and retained deferrals in `docs/present/02-hub-domains-and-repositories.md`, `docs/present/09-ingest-and-refresh.md`, `docs/present/11-review-accept-and-publish.md`, `docs/design/02-hub-domain-repository-model/03-batch-domain-assignment.md`, `docs/design/09-ingest-and-refresh/03-batch-processing.md`, `docs/design/09-ingest-and-refresh/05-incomplete-runs-and-retry.md` and `docs/design/11-review-and-publish/02-review-preview.md`
- [X] T019 Run focused tests, `npm run depcruise` and `npm run verify`; record exact offline evidence in `specs/030-batch-initial-ingest/verification.md`
- [X] T020 Stop at the owner checkpoint before any model benchmark or real Hub PR in `specs/030-batch-initial-ingest/verification.md`

## Dependencies

```text
Contract/proposal scope (T001–T003)
  → confirmed batch + composition (US1, T004–T009)
    → retry/membership revision (US2, T010–T013)
      → review/publication (US3, T014–T016)
        → skill/docs/offline gate (T017–T020)
```

Implementation is sequential because the affected files and state transitions
overlap. No subagent or parallel authoring is planned for this slice.

## MVP Strategy

Implement US1 first as one independently testable atomic batch. Add recovery
before publication. Do not add Batch Refresh, parallelism or another test case.

## Phase 6: Convergence

- [X] T021 Retain safe per-member versus shared-path attribution in batch inspection and PR review per AB-BATCH-009 and US3/AC1 (partial)
- [X] T022 Exercise exact source drift rejection and a removed-member recomposition before the three-member final proposal in `src/app/hub-okf/workspace/local-only-e2e.test.ts` per AB-BATCH-007, AB-BATCH-008 and SC-003..004 (partial)
