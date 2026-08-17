# Tasks: Live Evidence and Governed Questions

**Input**: Design documents from `/specs/019-live-evidence-questions/`

**Tests**: Requirement-linked tests are mandatory because the feature changes
persistence, acceptance, recovery and MCP behavior.

## Phase 1: Setup

No project initialization is required. This feature adds no dependency, service,
credential or migration; the active selector and design artifacts already exist.

---

## Phase 2: Foundation — validated live claims

**Purpose**: Establish one portable reference contract before query or question work.

- [X] T001 Add failing AB-CLAIM-001..003 validation tests for bounded live references, duplicate identities, source linkage and forbidden observed scalar fields in `src/core/knowledge/live-claims.test.ts`
- [X] T002 Implement and export the minimal `agentbase.live_claims` reader/validator in `src/core/knowledge/live-claims.ts` and `src/core/knowledge/index.ts` until T001 passes
- [X] T003 Integrate live-claim validation into new and refresh proposal checks, including preservation of foreign claims, in `src/app/hub-okf/prepare.ts`, `src/app/hub-okf/refresh.ts`, `src/app/hub-okf/prepare.test.ts` and `src/app/hub-okf/refresh.test.ts`

**Checkpoint**: Accepted OKF can carry validated source references but no volatile scalar copy.

---

## Phase 3: User Story 1 — Query current source-backed values (Priority: P1) 🎯 MVP

**Goal**: Return validated references and make the agent resolve them only from the currently authorized repository.

**Independent Test**: Change a referenced setting without re-ingest and verify the next combined Hub + graph/snippet workflow reports the current observation; missing or mismatched source returns an explicit status and no fallback value.

- [X] T004 [P] [US1] Add failing AB-QUERY-006..008 tests for accepted live-evidence extraction, bounded output and Hub commit identity in `src/app/hub-okf/query.test.ts`
- [X] T005 [US1] Implement structured accepted-reference extraction in `src/app/hub-okf/query.ts` and export it through `src/app/hub-okf/index.ts`
- [X] T006 [P] [US1] Add failing MCP contract tests for `read_hub_live_evidence`, repository mismatch and changed/dirty source identities in `src/app/hub-okf/mcp-tools.test.ts` and `src/app/codebase-memory-mcp/server.test.ts`
- [X] T007 [US1] Expose `read_hub_live_evidence` and compose its source-binding status with the existing gateway repository in `src/app/hub-okf/mcp-tools.ts`, `src/app/hub-okf/runtime-actions.ts` and `src/app/codebase-memory-mcp/server.ts`
- [X] T008 [US1] Update the host-agent live resolution and conflict-presentation procedure without adding a parser or cache in `.agents/skills/agentbase-okf/SKILL.md`

**Checkpoint**: US1 is independently usable with existing `index_repository`, `search_graph` and `get_code_snippet` tools.

---

## Phase 4: User Story 2 — Review and answer conflicting evidence (Priority: P1)

**Goal**: Admit one durable governed question with accepted evidence and turn one attributed answer into a reviewable guidance proposal.

**Independent Test**: Accept two incompatible claims and one declaration, list one pending question, answer it as a maintainer, then inspect one guidance proposal while both source claims remain unchanged.

- [X] T009 [P] [US2] Add failing AB-QUESTION-001..003/005 ledger tests for deterministic reuse, bounded merges, restart persistence, stale revision, attribution, conflicting human answers and append-only history in `src/app/hub-okf/questions.test.ts`
- [X] T010 [US2] Implement private atomic question records and transitions using existing mutation/JSON helpers in `src/app/hub-okf/questions.ts` and export them through `src/app/hub-okf/index.ts`
- [X] T011 [US2] Add failing declaration inspection/digest coupling and interrupted-accept recovery tests in `src/app/hub-okf/authoring-session.test.ts`, `src/app/hub-okf/accept.test.ts` and `src/app/hub-okf/questions.test.ts`
- [X] T012 [US2] Validate/stage question declarations during finalize, apply them after accept and idempotently reconcile accepted attachments in `src/app/hub-okf/authoring-session.ts`, `src/app/hub-okf/accept.ts` and `src/app/hub-okf/question-recovery.ts`
- [X] T013 [P] [US2] Add failing AB-QUESTION-004 tests for one human-attributed Maintainer Guidance file, unchanged accepted Hub bytes, exact diff review and stale-Hub rejection in `src/app/hub-okf/guidance-proposal.test.ts`
- [X] T014 [US2] Implement the bounded answer-to-guidance proposal specialization with existing bundle/diff/proposal state primitives in `src/app/hub-okf/guidance-proposal.ts`
- [X] T015 [US2] Add `questions` finalize input plus `list_hub_questions` and `answer_hub_question` MCP contracts/actions in `src/app/hub-okf/mcp-tools.ts`, `src/app/hub-okf/runtime-actions.ts`, `src/app/hub-okf/mcp-tools.test.ts` and `src/app/hub-okf/runtime-actions.test.ts`

**Checkpoint**: US2 preserves every evidence role and requires normal proposal acceptance before guidance enters shared Hub knowledge.

---

## Phase 5: User Story 3 — Preserve history as evidence changes (Priority: P2)

**Goal**: Prove incomplete re-ingest, moved source and restarts never erase accepted evidence or question/guidance history.

**Independent Test**: Resolve and accept guidance, refresh from incomplete evidence, restart runtime and verify prior claims/history remain while current resolution honestly reports moved or missing source.

- [X] T016 [US3] Add AB-REFRESH-013 coverage for incomplete ingest, moved reference proposal, accepted guidance and restart reconciliation in `src/app/hub-okf/refresh.test.ts` and `src/app/hub-okf/local-only-e2e.test.ts`
- [X] T017 [US3] Add AB-BENCH-042 offline qualification scoring/fixtures for reference coverage, live-resolution statuses, role separation and zero durable volatile scalars in `scripts/benchmark-okf.mjs`, `scripts/benchmark-okf.test.mjs` and `benchmark/repos/aws-serverless/expected/aws-serverless-shopping-cart.json`

**Checkpoint**: All three stories are independently verified without a model call, watcher or network access.

---

## Phase 6: Contracts and canonical verification

- [X] T018 Update current behavior and ownership in `docs/contracts/okf.md`, `docs/contracts/hub.md`, `docs/contracts/code-graph.md`, `docs/contracts/benchmark.md`, `docs/ARCHITECTURE.md` and `docs/README.md`
- [X] T019 Execute [quickstart.md](quickstart.md), run `npm run verify`, record requirement-linked evidence in `specs/019-live-evidence-questions/verification.md` and close `specs/CURRENT.md` only when every required task passes

Real model qualification, V12, PR #7 rebuild and remote publication remain
deferred pending separate owner approval and are not implementation tasks.

---

## Dependencies & Execution Order

- T001 → T002 → T003 establishes the shared reference contract.
- US1 starts after T003. T004 and T006 may be written in parallel; T005 precedes T007; T008 follows the stable MCP contract.
- US2 starts after T003. T009 and T011 may be written before implementation; T010 precedes T012 and T014; T013 precedes T014; T012/T014 precede T015.
- US3 depends on US1 and US2 behavior. T016 and T017 validate preservation and qualification independently.
- T018–T019 follow the implemented stories. No real model run, V12 or PR mutation is part of these tasks.

## Parallel Examples

- After T003, T004 and T006 can establish the Hub and MCP query contracts in
  separate test files before T005/T007 implement them.
- After T010, T013 can specify guidance proposal behavior while T011/T012 cover
  declaration admission and interrupted-accept recovery.
- T016 and T017 use separate end-to-end and scorer fixtures after US1/US2 pass.

## Implementation Strategy

1. Deliver T001–T008 as the smallest useful slice: accepted references and live
   agent-side resolution with explicit unavailable/mismatch states.
2. Add question persistence and answer governance in T009–T015 without changing
   the query contract or accepted source claims.
3. Prove cumulative recovery and offline qualification in T016–T019, then stop;
   external qualification/publication requires a new owner decision.

## Phase 7: Convergence

- [X] T020 Add one deterministic combined Hub + fake graph/snippet workflow that observes a changed source value without re-ingest and reports missing, mismatched and dirty source states with no stale fallback per US1/AC1–3 and SC-001/003 (partial)
- [X] T021 Add acceptance evidence that an accepted Maintainer Guidance answer and conflicting current documentation/implementation observations are presented as separate roles with no automatic winner per US2/AC3, US3/AC3 and SC-002 (partial)
