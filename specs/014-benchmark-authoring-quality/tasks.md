# Tasks: Benchmark Authoring Quality

**Input**: Design documents in `specs/014-benchmark-authoring-quality/`

## Phase 1: Shared Prompt Contract (User Story 1)

**Goal**: Both arms receive equivalent, non-leaking authoring rules.

**Independent Test**: Render both prompts and compare their shared contract;
assert representative expectation-only values are absent.

- [x] T001 [US1] Add failing shared-contract, immutable-identity and leakage tests in `scripts/benchmark-agent.test.mjs`
- [x] T002 [US1] Add equivalent v2 prompt contracts in `benchmark/prompts/okf-author-v2.md` and `benchmark/prompts/okf-author-direct-v2.md`
- [x] T003 [US1] Select and retain both prompt identities in `benchmark/repos/aws-serverless/manifest.json`, `scripts/benchmark-agent.mjs` and `scripts/benchmark-okf.mjs`

## Phase 2: Explicit Readiness (User Story 2)

**Goal**: Every scored arm states whether its output is good enough.

**Independent Test**: Exercise exact-boundary, below-boundary, failed-
conformance and unavailable-metric inputs.

- [x] T004 [US2] Add failing authoring-readiness and report tests in `scripts/benchmark-okf.test.mjs`
- [x] T005 [US2] Derive and retain per-arm readiness in `scripts/benchmark-okf.mjs`
- [x] T006 [US2] Show readiness before efficiency without an overall winner in `scripts/benchmark-okf.mjs`

## Phase 3: Fair Repeatable Evidence (User Story 3)

**Goal**: Prove v2 pairing offline, then capture one explicit real pair.

**Independent Test**: Fake pair preserves v2 prompt identities and passes the
canonical repository gate before the real opt-in command runs.

- [x] T007 [US3] Extend fake paired lifecycle coverage in `scripts/benchmark-okf.test.mjs`
- [x] T008 [P] [US3] Update accepted behavior and commands in `docs/contracts/benchmark.md`, `benchmark/README.md` and `docs/README.md`
- [x] T009 [US3] Run focused tests and `npm run verify`, recording results in `specs/014-benchmark-authoring-quality/verification.md`
- [x] T010 [US3] Run and compare one real `aws-health-aware` v2 pair under `benchmark/results/aws-serverless/aws-health-aware/`
- [x] T011 [US3] Record the owner-amended evidence-first contract and revise design artifacts in `specs/014-benchmark-authoring-quality/`

## Phase 4: Evidence-First Assessment (User Story 1)

**Goal**: Reviewability fails only for deterministically proven authoring faults,
not incomplete reference coverage.

**Independent Test**: Hard-failure fixtures are invalid while conformant sparse
fixtures with missing coverage remain reviewable.

- [x] T012 [US1] Add failing reviewable/invalid hard-gate tests in `scripts/benchmark-okf.test.mjs`
- [x] T013 [US1] Replace the 80% readiness function with explicit authoring assessment in `scripts/benchmark-okf.mjs`
- [x] T014 [US1] Validate declared target/link/schema relationship integrity in `scripts/benchmark-okf.mjs` and `scripts/benchmark-okf.test.mjs`

## Phase 5: Non-Exhaustive Reference Scoring (User Story 2)

**Goal**: Separate confirmed, contradicted, unjudged and missing knowledge.

**Independent Test**: Every deterministic fixture item receives one category;
unjudged/missing items do not invalidate the draft.

- [x] T015 [US2] Add classification and below-80%-coverage regressions in `scripts/benchmark-okf.test.mjs`
- [x] T016 [US2] Replace false-positive precision semantics with non-exhaustive classifications and diagnostics in `scripts/benchmark-okf.mjs`
- [x] T017 [US2] Update arm/pair JSON and Markdown reports with assessment, classifications, limitations and separate efficiency in `scripts/benchmark-okf.mjs`
- [x] T018 [P] [US2] Update accepted terminology and interpretation in `benchmark/README.md` and `docs/contracts/benchmark.md`

## Phase 6: Heterogeneous Evidence (User Story 3)

**Goal**: Prove the unchanged general v2 workflow beyond one repository.

**Independent Test**: Health Aware retained output and one current shopping-cart
run are assessed by the same contract without fixture hints.

- [ ] T019 [US3] Regenerate only deterministic Health Aware derived artifacts and record reviewable incomplete evidence in `benchmark/results/aws-serverless/aws-health-aware/2026-08-14T184644Z/`
- [x] T020 [US3] Run focused tests and `npm run verify`, updating `specs/014-benchmark-authoring-quality/verification.md`
- [ ] T021 [US3] Run and compare one explicit v2 pair for `aws-serverless-shopping-cart` under `benchmark/results/aws-serverless/aws-serverless-shopping-cart/`
- [ ] T022 [US3] Record cross-repository quality and efficiency without a universal/context-saving claim in `specs/014-benchmark-authoring-quality/verification.md` and `docs/contracts/benchmark.md`
- [ ] T023 [US3] Close capability 014 only if both repository artifacts are reviewable, otherwise record the general hard failure and leave it active in `specs/CURRENT.md`

## Dependencies & Execution Order

- T001 → T002 → T003.
- T004 → T005 → T006.
- Completed v2 work T001–T010 supplied the evidence for owner amendment T011.
- T012 → T013 → T014.
- T015 → T016 → T017; T018 may follow T017.
- T014 and T017 → T019 → T020 → T021 → T022 → T023.

## Implementation Strategy

The revised MVP is T012–T020: correct reviewability and non-exhaustive scoring,
then re-assess retained evidence offline. T021 is separately opt-in model
evidence. Question management, AWS authority and token optimization remain out
of scope.

T019 was executed but remains unchecked because deterministic re-scoring found
a real missing relationship link, so the retained MCP artifact is `invalid`
rather than the task's expected `reviewable`. T021 is deferred; do not spend a
shopping-cart model pair while this general workflow gap is known.
