# Tasks: Single-Repository Refresh

**Input**: Design documents in `specs/023-single-repository-refresh/`

**Tests**: Focused requirement-linked design and lifecycle scenarios are
required. Extend existing cohesive tests; do not add function-level matrices.

## Phase 1: Contract and Foundation

- [x] T001 Record approved Refresh behavior in `docs/contracts/hub.md` and `docs/contracts/okf.md`
- [x] T002 Define typed lifecycle intent in core and explicit Refresh baseline/result values across continuity and authoring
- [x] T003 Extend bounded Hub continuity with current-source observed state and known gaps in `src/core/knowledge/query/hub-continuity.ts`
- [x] T004 Add requirement-linked baseline/context assertions to the existing cohesive Hub query/authoring scenarios

**Checkpoint**: Core values describe one bounded Refresh without changing Hub state.

## Phase 2: User Story 1 — Refresh changed knowledge (P1)

**Goal**: Produce one evidence-backed update draft or successful no-change for a
known Repository.

**Independent Test**: One changed fixture returns a reviewable draft; identical
input returns no-change without another proposal.

- [x] T005 [US1] Bind Refresh to active local `main` and its exact Published/pending ancestry without absorbing unaccepted proposals in `src/app/hub-okf/authoring/authoring-session.ts`
- [x] T006 [US1] Derive and expose bounded source change/gap context for Refresh in `src/app/hub-okf/mcp/mcp-tool-actions.ts` and `src/app/hub-okf/mcp/mcp-tool-call.ts`
- [x] T007 [US1] Make unchanged finalized bytes return `no_change` without proposal persistence and bind observed source state only to successful results in `src/app/hub-okf/authoring/authoring-session.ts`
- [x] T008 [US1] Add changed-update and no-change scenarios to `src/app/hub-okf/authoring/canonical-graph-e2e.test.ts`
- [x] T009 [US1] Publish bounded Refresh Prepare and Finalize input/output, including lifecycle intents at Finalize, in `src/app/hub-okf/mcp/mcp-tools.ts` and extend `src/app/codebase-memory-mcp/server.test.ts`

**Checkpoint**: A normal single-repository Refresh is independently usable for
add/update/no-change and never Accepts or publishes.

## Phase 3: User Story 2 — Reconcile known gaps (P2)

**Goal**: Let unchanged source improve Questions, limitations and references
without completeness requirements.

**Independent Test**: An unchanged fixture with a known gap returns a bounded
partial draft or retained Question with explicit limitations.

- [x] T010 [US2] Include repository-scoped Questions, limitations and broken/aging reference summaries in `src/core/knowledge/query/hub-continuity.ts`
- [x] T011 [US2] Preserve partial coverage and question attachments through Refresh Finalize in `src/app/hub-okf/authoring/authoring-session.ts`
- [x] T012 [US2] Add known-gap/partial behavior to the existing cohesive authoring scenarios
- [x] T013 [US2] Create the Changed Source → Known Gaps → Bounded Discovery workflow and bounded correction/repair rules in `.agents/skills/agentbase-refresh/SKILL.md` and align `.agents/skills/agentbase-okf/SKILL.md`

**Checkpoint**: Refresh can build knowledge gradually without a source diff or
false completeness claim.

## Phase 4: User Story 3 — Explicit destructive reconciliation (P2)

**Goal**: Replace omission deletion with explicit, evidenced and reviewable
contribution lifecycle actions.

**Independent Test**: Exact replacement/removal is grouped in inspection while
omission-only and foreign-evidence cases preserve knowledge.

- [x] T014 [US3] Implement typed lifecycle-intent validation in `src/core/knowledge/proposals/refresh.ts` and export it through `src/core/knowledge/index.ts`
- [x] T015 [US3] Remove whole-subject omission authorization and reconcile only explicit current-repository contributions in `src/app/hub-okf/authoring/refresh.ts`
- [x] T016 [US3] Group Added, Updated, Removed, Superseded/Retracted and Questions/Limitations with evidence/reasons in `src/app/hub-okf/review/inspect.ts`
- [x] T017 [US3] Validate every added/changed current-repository source span during Refresh Finalize in `src/app/hub-okf/authoring/authoring-session.ts`
- [x] T018 [US3] Cover explicit replacement/removal, omission preservation, foreign evidence and invalid source spans in `src/app/hub-okf/authoring/canonical-graph-e2e.test.ts`

**Checkpoint**: No destructive Refresh outcome is inferred from absence or hidden
from proposal review.

## Phase 5: Integration and Qualification

- [x] T019 Run focused tests, `npm run verify`, and record exact offline evidence in `specs/023-single-repository-refresh/verification.md`
- [x] T020 Review source dependency changes with `npm run depcruise` and update `docs/ARCHITECTURE.md` only if ownership actually changed
- [x] T021 Validate all scenarios in `specs/023-single-repository-refresh/quickstart.md` and reconcile drift in `specs/023-single-repository-refresh/spec.md`, `plan.md` and `tasks.md`
- [x] T022 After separate owner authorization, run one model-backed Terraform Refresh probe and conditionally one sequential replica; record separated OKF/benchmark findings in `specs/023-single-repository-refresh/verification.md` without Accept, Publish, CLI enrichment or Hub PR
- [x] T023 Promote the accepted behavior to living contracts, complete `specs/023-single-repository-refresh/verification.md`, and close `specs/CURRENT.md`

## Dependencies and Execution Order

- T001–T004 establish the contract and core context.
- US1 (T005–T009) is the executable MVP.
- US2 depends on the US1 baseline/result but not destructive intent.
- US3 depends on the foundational lifecycle values and may proceed after US1.
- T019–T023 follow all selected user stories.
- Work is sequential by owner preference; `[P]` markers are intentionally absent.

## Implementation Strategy

Implement the smallest vertical path first: exact Repository → bounded baseline
→ changed update/no-change → preview. Then add known gaps, then replace deletion.
Stop on any baseline ambiguity or evidence rule that would materially change the
approved product contract and return to owner review.
