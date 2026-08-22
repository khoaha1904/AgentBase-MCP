# Tasks: Independent Hub Pull Requests

## Phase 1: Contract

- [x] T001 Record owner decisions in `docs/present/11-review-accept-and-publish.md`
- [x] T002 Amend `AB-PUBLISH-006..011` in `docs/design/11-review-and-publish/01-runtime-requirements.md`

## Phase 2: User Story 1 — Independent Init PRs

- [x] T003 [US1] Select exact dependency-safe proposal IDs in `src/app/hub-okf/review/pending.ts`
- [x] T004 [US1] Replay each Init patch on Published main in `src/app/hub-okf/publication/publish.ts`
- [x] T005 [US1] Cover two independent Init PRs in `src/app/hub-okf/publication/publish.test.ts`

## Phase 3: User Story 2 — Same-Repository Refresh

- [x] T006 [US2] Resolve only the prior same-Repository proposal base in `src/app/hub-okf/publication/publish.ts`
- [x] T007 [US2] Cover mixed independent Init and Refresh in `src/app/hub-okf/publication/publish.test.ts`

## Phase 4: User Story 3 — Existing PR reconciliation

- [x] T008 [US3] Add bounded existing-PR update support in `src/providers/github-hub/github-api.ts`
- [x] T009 [US3] Reconcile compatible open branches without replacing PRs in `src/app/hub-okf/publication/publish.ts`
- [x] T010 [US3] Cover main advance, preserved PR and conflict stop in `src/app/hub-okf/publication/publish.test.ts`

## Phase 5: Convergence

- [x] T011 Update MCP wording and living status in `src/app/hub-okf/mcp/mcp-tools.ts`, `docs/README.md` and `specs/CURRENT.md`
- [x] T012 Run focused tests, analyze, converge and `npm run verify`; record `specs/026-independent-hub-prs/verification.md`

## Dependencies

Work is sequential. US1 is the independently useful MVP; US2 reuses its replay
unit; US3 reuses the same unit for post-merge recovery. No parallel tasks.

## Phase 6: Convergence

- [x] T013 Preserve only selected append-only index navigation during independent replay in `src/app/hub-okf/publication/publish.ts` and cover it in `src/app/hub-okf/publication/publish.test.ts`
