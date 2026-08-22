# Tasks: Batch Initial Ingest Qualification

## Phase 1: Contract

- [X] T001 Add AB-BENCH batch qualification requirements in `docs/design/12-version-scope/03-benchmark-requirements.md`
- [X] T002 Activate capability 031 in `specs/CURRENT.md` and `.specify/feature.json`

## Phase 2: User Story 1 - Review one real batch proposal (Priority: P1)

- [X] T003 [US1] Add immutable batch prompt and manifest in `benchmark/prompts/okf-batch-ingest-v1.md` and `benchmark/repos/aws-cloud-operations-batch/manifest.json`
- [X] T004 [US1] Reuse isolated Codex execution and add exact batch lifecycle capture in `scripts/benchmark/benchmark-agent.mjs`
- [X] T005 [US1] Add the `batch` command, combined-bundle assessment and retained report in `scripts/benchmark/benchmark-okf.mjs`
- [X] T006 [US1] Add one deterministic batch lifecycle contract without increasing top-level test count in `scripts/benchmark/benchmark-okf.test.mjs`

## Phase 3: Verify and qualify

- [X] T007 Update `benchmark/README.md` with the opt-in batch command and stop rule
- [X] T008 Run focused verification and `npm run verify`, then record results in `specs/031-batch-ingest-qualification/verification.md`
- [X] T009 Run owner-authorized immutable Sol probes under the stop rule and report lifecycle, OKF and benchmark findings separately
- [X] T010 [US1] Fix sequential repository graph rebinding with clean-close failure safety in `src/app/codebase-memory-mcp/gateway-session.ts` and focused coverage in `src/app/codebase-memory-mcp/server.test.ts`
- [X] T011 Run one separately authorized V4 probe after the corrected guidance-repair contract passes offline
- [X] T012 Record the V4 provenance-loss finding and expose the existing skeleton editing constraint through MCP
- [X] T013 Run one separately authorized V5 probe after offline verification
- [X] T014 Restore complete confirmed-Domain System navigation during batch composition and qualify it offline before any replica
- [X] T015 Run one owner-authorized post-fix V5 stability probe under the existing stop rule
