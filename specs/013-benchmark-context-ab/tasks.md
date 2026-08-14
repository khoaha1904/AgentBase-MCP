# Tasks: Benchmark Context A/B

**Input**: Design documents from `/specs/013-benchmark-context-ab/`

**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/benchmark-comparison.md`

**Tests**: Requirement-linked fake-process tests are mandatory because paired external-process lifecycle and partial recovery are observable behavior.

## Phase 1: Arm Contract Foundation

**Purpose**: Define the smallest shared arm inputs before paired orchestration.

- [x] T001 [P] Add the direct-source authoring workflow with the same semantic output goal and no AgentBase MCP instructions in `benchmark/prompts/okf-author-direct-v1.md` [AB-BENCH-009, AB-BENCH-010]
- [x] T002 Add failing arm-isolation and usage-normalization cases for MCP/direct arguments, required tools, elapsed time and missing token fields in `scripts/benchmark-agent.test.mjs` [AB-BENCH-010, AB-BENCH-011, AB-BENCH-012, AB-BENCH-013, AB-BENCH-014]
- [x] T003 Implement explicit `mcp`/`direct` modes, versioned prompt selection, final-turn usage capture and observed activity in `scripts/benchmark-agent.mjs`; retain legacy MCP defaults for existing callers [AB-BENCH-010, AB-BENCH-011, AB-BENCH-012, AB-BENCH-013, AB-BENCH-014]

**Checkpoint**: Either arm can run independently with the correct process authority and measurement semantics.

---

## Phase 2: User Story 1 — Run a Comparable Pair (Priority: P1)

**Goal**: Run exactly one MCP arm and one direct arm against the same common inputs.

**Independent Test**: A fake paired invocation records identical fixture/model/effort/expectation/goal identity, separate arm workspaces and no direct-arm MCP configuration.

- [x] T004 [US1] Add failing paired-invocation tests for shared identity, sequential arm execution, isolated artifact directories and unchanged fixtures in `scripts/benchmark-agent.test.mjs` and `scripts/benchmark-okf.test.mjs` [AB-BENCH-009, AB-BENCH-010, AB-BENCH-011, AB-BENCH-017]
- [x] T005 [US1] Add the `pair` command, write the common `pair.json` envelope before execution, capture AgentBase and expectation identities, and run both arms sequentially in `scripts/benchmark-okf.mjs` [AB-BENCH-009, AB-BENCH-012, AB-BENCH-017]

**Checkpoint**: A fake pair produces sibling MCP/direct evidence without modifying the source fixture.

---

## Phase 3: User Story 2 — Compare Quality and Efficiency Honestly (Priority: P1)

**Goal**: Finalize both arms with existing scoring and report quality and cost separately.

**Independent Test**: Controlled completed arms with different semantic metrics and usage values produce side-by-side values and comparable deltas, with no scalar winner.

- [x] T006 [US2] Add failing comparison tests for per-arm semantic metrics, token categories, duration, `mcp - direct` deltas, unavailable values and absence of an overall winner in `scripts/benchmark-okf.test.mjs` [AB-BENCH-013, AB-BENCH-014, AB-BENCH-015]
- [x] T007 [US2] Extract reusable single-arm finalization without changing scoring semantics, then implement `compare`, `comparison.json` and pair `report.md` in `scripts/benchmark-okf.mjs` [AB-BENCH-012, AB-BENCH-013, AB-BENCH-014, AB-BENCH-015]

**Checkpoint**: A complete fake pair has separate auditable quality and efficiency evidence.

---

## Phase 4: User Story 3 — Preserve Reproducible Partial Evidence (Priority: P2)

**Goal**: Keep useful artifacts and explicit incompleteness when either external arm fails.

**Independent Test**: Failure, timeout, malformed events, missing output and source-drift fixtures retain both terminal arm records and produce an unsuccessful incomplete comparison.

- [x] T008 [US3] Add failing partial-pair recovery tests for first-arm failure with second-arm continuation, timeout, malformed usage, missing output and fixture immutability in `scripts/benchmark-agent.test.mjs` and `scripts/benchmark-okf.test.mjs` [AB-BENCH-016, AB-BENCH-017]
- [x] T009 [US3] Complete pair-state transitions, exact failure aggregation, retry-safe existing-result rejection and incomplete comparison output in `scripts/benchmark-okf.mjs` [AB-BENCH-016, AB-BENCH-017]

**Checkpoint**: Every fake process outcome leaves honest, inspectable pair evidence.

---

## Phase 5: Living Contract and Verification

**Purpose**: Make current behavior discoverable and validate the whole repository.

- [x] T010 [P] Update `docs/contracts/benchmark.md` and `benchmark/README.md` with requirements `AB-BENCH-009` through `AB-BENCH-017`, paired commands, artifact layout and interpretation limits
- [x] T011 Run the focused benchmark tests and `npm run verify`; record exact evidence in `specs/013-benchmark-context-ab/verification.md`
- [x] T012 Run one opt-in real `aws-health-aware` pair, finalize it, record the bounded quality/token/time conclusion in the living benchmark contract, and preserve the result artifacts [AB-BENCH-017, SC-005]
- [x] T013 Re-run `npm run verify`, mark the capability complete, and update `specs/CURRENT.md` only if all required offline and real-pair evidence is present

---

## Dependencies & Execution Order

- T001 and T002 can start independently; T003 depends on T002.
- T004 depends on T003; T005 depends on T001, T003 and T004.
- T006 can start after the arm artifact shape is stable at T003; T007 depends on T005 and T006.
- T008 depends on T005; T009 depends on T007 and T008.
- T010 depends on T009. T011 depends on T010.
- T012 requires explicit owner approval for model-backed execution and depends on T011.
- T013 depends on T012 and closes the capability only after all evidence passes.

## Implementation Strategy

Deliver one narrow vertical slice: arm isolation, paired execution, comparison,
then partial recovery. Reuse the existing scorer and process adapter throughout.
Do not add provider abstractions, new dependencies, file-read tracing, prompt
optimization or scoring changes.

## Phase 6: Convergence

- [x] T014 Update the living current checkpoint and next bounded improvement in `docs/README.md` when closing Capability 013 per SC-005 and the repository current-truth rule (partial)
