# Tasks: Shared Question Documents

## Phase 1: Shared contract foundation

- [x] T001 [US1] Add stable identity, exact parser/validator, renderer, typed-reference bounds and transition rules in `src/core/knowledge/governance/questions.ts`
- [x] T002 [US1] Export the dedicated Question contract without adding a selectable Concept Schema in `src/core/knowledge/index.ts`

## Phase 2: User Story 1 — Hub-authored and Hub-read Questions

- [x] T003 [US1] Replace private ledger declaration handling with Question Markdown normalization and deterministic `questions/index.md` rendering in `src/app/hub-okf/authoring/questions.ts`
- [x] T004 [US1] Insert Question rendering before final proposal validation/digest and remove `questions.json` attachment binding in `src/app/hub-okf/authoring/authoring-session.ts` and `src/app/hub-okf/authoring/question-recovery.ts`
- [x] T005 [US1] Read/list exact accepted Question documents without ledger reconciliation and expose `open|resolved|needs-review` in `src/app/hub-okf/review/review-actions.ts` and `src/app/hub-okf/mcp/`
- [x] T006 [US1] Remove post-Accept private ledger mutation while preserving ordinary proposal recovery in `src/app/hub-okf/review/accept.ts`

## Phase 3: User Story 2 — Atomic exact-revision answer

- [x] T007 [US2] Expand Guidance metadata to exact `subject-property` scope and stage Guidance plus Question revision in one proposal in `src/app/hub-okf/authoring/guidance-proposal.ts`
- [x] T008 [US2] Reject stale revision, changed Hub head, unsafe answer and invalid transition before mutation in `src/app/hub-okf/review/review-actions.ts`

## Phase 4: User Story 3 — Clean-cutover safety

- [x] T009 [US3] Add accepted-Guidance orphan preflight with explicit regenerate/migrate recovery and remove obsolete ledger/sidecar exports in `src/app/hub-okf/authoring/`

## Phase 5: Acceptance and convergence

- [x] T010 Adapt the existing Question lifecycle case for cross-state-root recovery, pre-Accept immutability, atomic Accept, stale answer and orphan preflight without increasing test count in `src/app/hub-okf/workspace/local-only-e2e.test.ts`
- [x] T011 Update implemented runtime truth and remove deferred shared-Question wording in `docs/design/`, `docs/README.md` and `specs/CURRENT.md`
- [x] T012 Run focused checks, cross-artifact consistency and `npm run verify`, then record evidence in `specs/028-shared-question-documents/verification.md`

## Dependencies and Execution Order

T001–T002 define the only shared contract. T003–T006 replace creation/read/Accept
authority. T007–T008 then make Answer atomic. T009 closes the cutover. T010–T012
verify and converge living truth. Work is intentionally sequential because the
clean cutover replaces one shared authority and parallel edits would overlap.

## Independent Acceptance

- **US1**: Accepted Question survives removal of all private Question state.
- **US2**: Answer leaves accepted state unchanged until one proposal is Accepted.
- **US3**: Orphan accepted Guidance blocks with explicit recovery direction.

## MVP Strategy

Implement all three stories as one clean cutover. Do not ship a dual-authority
intermediate state. Stop after T012; deferred Part 07/Domain Enrichment/query
features remain in `docs/design/12-version-scope/07-deferred-capabilities.md`.
