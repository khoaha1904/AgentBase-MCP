# Tasks: AgentBase-Hub CI

## Phase 1: Contract and foundation

- [x] T001 Activate 033 and add AB-HUB-CI living requirements in `specs/CURRENT.md` and `docs/design/11-review-and-publish/01-runtime-requirements.md`
- [x] T002 Add deterministic workflow bytes and release pins in `src/app/hub-okf/ci/workflow.ts`
- [x] T003 Add offline integrity/safety/freshness composition in `src/app/hub-okf/ci/validation.ts`

## Phase 2: User Story 1 - Reject invalid Hub changes

- [x] T004 [US1] Add `okf hub-ci` CLI routing in `src/cli.ts` and `src/app/hub-okf/ci/cli.ts`
- [x] T005 [US1] Extend the existing local-Hub journey with valid/custom/broken/secret fixtures in `src/app/hub-okf/workspace/local-only-e2e.test.ts`

## Phase 3: User Story 2 - Install CI in new Hubs

- [x] T006 [US2] Write and commit the exact workflow during new Hub setup in `src/app/hub-okf/workspace/setup.ts`
- [x] T007 [US2] Extend the existing local-Hub journey with exact workflow and no-secret permission assertions in `src/app/hub-okf/workspace/local-only-e2e.test.ts`

## Phase 4: User Story 3 - Upgrade existing Hubs

- [x] T008 [US3] Implement bounded preview and exact workflow-only PR retry in `src/app/hub-okf/ci/upgrade.ts`
- [x] T009 [US3] Expose preview/submit through `src/app/hub-okf/mcp/` and `src/app/hub-okf/query/runtime-actions.ts`
- [x] T010 [US3] Extend the existing fake-GitHub publication journey for missing/current/outdated/conflict/retry behavior in `src/app/hub-okf/publication/publish.test.ts`

## Phase 5: Verify and close

- [x] T011 Update present/design status, run focused checks and `npm run verify`, and record `specs/033-hub-ci/verification.md`
- [x] T012 Close capability 033 only when code, workflow, living requirements and 50-test gate agree
