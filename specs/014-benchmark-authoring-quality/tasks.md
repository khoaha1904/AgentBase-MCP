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

- [x] T019 [US3] Regenerate deterministic Health Aware derived artifacts and record the exact invalid relationship outcome in `benchmark/results/aws-serverless/aws-health-aware/2026-08-14T184644Z/`
- [x] T020 [US3] Run focused tests and `npm run verify`, updating `specs/014-benchmark-authoring-quality/verification.md`
- [x] T021 [US3] Stop the v2 shopping-cart run after retained evidence exposed a general workflow fault in `specs/014-benchmark-authoring-quality/verification.md`
- [x] T022 [US3] Record that cross-repository evidence is unavailable and preserve the no-context-saving claim in `specs/014-benchmark-authoring-quality/verification.md` and `docs/contracts/benchmark.md`
- [x] T023 [US3] Keep capability 014 active and record the general relationship-validation gap in `specs/CURRENT.md`

## Dependencies & Execution Order

- T001 → T002 → T003.
- T004 → T005 → T006.
- Completed v2 work T001–T010 supplied the evidence for owner amendment T011.
- T012 → T013 → T014.
- T015 → T016 → T017; T018 may follow T017.
- T014 and T017 → T019 → T020 → T021 → T022 → T023.
- T023 → T024 → T025 → T026 → T027 → T028 → T029.
- T029 → T030 → T031 → T032 → T033 → T034.

## Implementation Strategy

The revised MVP is T012–T020: correct reviewability and non-exhaustive scoring,
then re-assess retained evidence offline. T021 is separately opt-in model
evidence. Question management, AWS authority and token optimization remain out
of scope.

Deterministic v2 re-scoring found a real missing relationship link, so the
retained MCP artifact is `invalid`. The v2 shopping-cart expansion was stopped;
new model evidence resumes only after the general v3 validator phase is green.

## Phase 7: General Relationship Validation (User Story 1)

**Goal**: Prevent cross-document relationship faults before an MCP authoring arm
finishes, without fixture knowledge or arbitrary filesystem reads.

**Independent Test**: Bounded in-memory concept sets accept valid/unknown-schema
relationships and reject duplicate identities, missing targets, missing links
and known-schema mismatches through both core and MCP surfaces.

- [x] T024 [US1] Add failing relationship-set core/MCP tests in `src/core/knowledge/okf-relationships.test.ts` and `src/app/codebase-memory-mcp/okf-schema-tools.test.ts`
- [x] T025 [US1] Implement and export bounded content-only relationship validation in `src/core/knowledge/okf-relationships.ts` and `src/core/knowledge/index.ts`
- [x] T026 [US1] Expose `validate_okf_relationships` in `src/app/codebase-memory-mcp/okf-schema-tools.ts` and update the safe surface tests/docs
- [x] T027 [US1] Reuse the core validator in `scripts/benchmark-okf.mjs` without benchmark identity leakage into runtime code
- [x] T028 [US3] Add immutable non-leaking v3 prompts and require MCP tool completion in `benchmark/prompts/`, `benchmark/repos/aws-serverless/manifest.json`, `scripts/benchmark-agent.mjs` and focused tests
- [x] T029 [US3] Run focused tests and `npm run verify`, update verification, then commit the offline validator phase

## Phase 8: v3 Heterogeneous Evidence (User Story 3)

**Goal**: Measure the same corrected workflow on both unlike repositories.

- [x] T030 [US3] Run and compare one v3 Health Aware pair
- [x] T031 [US3] Run and compare one v3 shopping-cart pair
- [x] T032 [US3] Record cross-repository quality/efficiency and limitations in current docs and verification
- [x] T033 [US3] Close capability only if both MCP arms are reviewable; otherwise retain the exact general failure
- [x] T034 [US3] Run final verification and commit the v3 evidence phase
