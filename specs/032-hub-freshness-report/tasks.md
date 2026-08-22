# Tasks: Hub Freshness Report

## Phase 1: Contract

- [X] T001 Activate capability 032 in `specs/CURRENT.md` and `.specify/feature.json`
- [X] T002 Add warning-only freshness requirements in `docs/design/08-live-references/03-freshness-and-broken-sources.md`, `docs/design/09-ingest-and-refresh/08-okf-freshness.md` and `docs/design/11-review-and-publish/01-runtime-requirements.md`

## Phase 2: User Story 1 - Review Hub freshness (Priority: P1)

- [X] T003 [US1] Add bounded Repository freshness projection and exports in `src/core/knowledge/query/hub-freshness.ts` and `src/core/knowledge/index.ts`
- [X] T004 [US1] Compose the exact admitted Hub layer in `src/app/hub-okf/query/query.ts` and `src/app/hub-okf/index.ts`
- [X] T005 [US1] Extend an existing query contract case for known, unknown, ordering and future-clock behavior in `src/core/knowledge/query/hub-query.test.ts`

## Phase 3: User Story 2 - Use CLI and MCP (Priority: P2)

- [X] T006 [US2] Expose one runtime action through `src/app/hub-okf/query/runtime-actions.ts` and `src/app/hub-okf/mcp/mcp-tool-actions.ts`
- [X] T007 [US2] Add `read_hub_freshness` schema/dispatch and CLI `freshness` in `src/app/hub-okf/mcp/mcp-tools.ts`, `src/app/hub-okf/mcp/mcp-tool-call.ts` and `src/app/hub-okf/cli.ts`
- [X] T008 [US2] Extend the existing local-Hub end-to-end journey with report and no-mutation evidence in `src/app/hub-okf/workspace/local-only-e2e.test.ts`

## Phase 4: Verify and close

- [X] T009 Update current documentation status, run focused checks and `npm run verify`, then record evidence in `specs/032-hub-freshness-report/verification.md`
- [X] T010 Close capability 032 in `specs/CURRENT.md` only after code, living requirements and verification agree
