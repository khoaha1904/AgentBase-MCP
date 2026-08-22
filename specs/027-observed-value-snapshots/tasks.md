# Tasks: Observed Value Snapshots

## Phase 1: Contract foundation

- [x] T001 [US1] Replace legacy live-claim types/parser with repository observed-value validation, ID/source-state normalization and deterministic owned-section rendering in `src/core/knowledge/governance/`
- [x] T002 [US1] Replace requirement-linked governance cases without increasing test count in `src/core/knowledge/governance/`
- [x] T003 [US1] Update core exports and proposal mutable-field handling in `src/core/knowledge/index.ts` and `src/core/knowledge/proposals/proposal.ts`

## Phase 2: User Story 2 — Snapshot query

- [x] T004 [US2] Replace live-evidence query types/action with snapshot-only observed-value output in `src/app/hub-okf/query/`
- [x] T005 [US2] Replace MCP tool/action/gateway exposure and focused assertions in `src/app/hub-okf/mcp/` and `src/app/codebase-memory-mcp/`

## Phase 3: User Story 3 — Refresh and Questions

- [x] T006 [US3] Add item-owned pre-validation reconciliation for Prepare/Finalize/Refresh, including optional-span source checks and foreign observation preservation, in `src/app/hub-okf/authoring/`
- [x] T007 [US3] Adapt private Question natural-reference resolution, evidence replacement and lifecycle coverage in `src/app/hub-okf/authoring/`

## Phase 4: Convergence

- [x] T008 Update runtime wording/status in `docs/README.md`, `docs/design/` and `specs/CURRENT.md`
- [x] T009 Run focused checks, cross-artifact analysis and `npm run verify`; record `specs/027-observed-value-snapshots/verification.md`

## Dependencies

T001–T003 define the contract. T004–T005 then replace query exposure. T006–T007
adapt lifecycle consumers. T008–T009 close only after runtime and living truth
agree. Work is sequential because the clean cutover renames one shared contract.
