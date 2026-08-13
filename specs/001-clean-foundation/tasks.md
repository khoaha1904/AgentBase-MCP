# Tasks: Clean Foundation

## Planning checkpoint already completed

- Clean repository, product vision, observation boundary and legacy boundaries
  are recorded.
- AgentDocks-derived agent-first mechanisms are recorded locally and in the
  AgentStack candidate pattern library.
- The owner accepted the combined map/query demo, 25% context benchmark,
  five-run determinism requirement and 12-file TypeScript fixture.
- Runtime research, public contract design and architecture requirements are
  ready for implementation approval.

## Phase 1: Runtime and verification setup

Goal: establish the smallest offline Node/TypeScript project and recursive test
surface without adding production dependencies.

- [x] T001 Accept ADR 0004 after owner approval and add Node/TypeScript metadata, scripts and locked development dependencies in `docs/decisions/0004-foundation-runtime.md`, `package.json`, `package-lock.json`, and `tsconfig.json`
- [x] T002 [P] Add recursive `node:test` discovery with self-tests in `scripts/run-tests.mjs` and `scripts/run-tests.test.mjs`
- [x] T003 [P] Add current-selector, living-ID and unresolved-marker checks with self-tests in `scripts/check-specs.mjs` and `scripts/check-specs.test.mjs`

Independent evidence: type checking runs with no emitted `dist/`, recursive test
discovery finds nested script tests, and specification checks reject a broken
fixture document tree.

## Phase 2: Architecture enforcement foundation

Goal: build and test the architecture mechanism before the application source
tree grows.

- [x] T004 [P] Write requirement-linked negative architecture fixtures for unknown/overlapping ownership, private imports, reverse dependencies, cycles, review growth and stale baselines in `scripts/check-architecture.test.mjs`
- [x] T005 Implement ownership, public-boundary, dependency, cycle, review-budget and stale-baseline validation in `scripts/check-architecture.mjs`
- [x] T006 Add the schema-valid empty-exception baseline and initial capability registry contract in `scripts/architecture-baseline.json` and `scripts/module-boundaries.json`

Independent evidence: temporary fixture repositories produce the exact expected
`AB-FND-010` through `AB-FND-013` failure codes and are cleaned through their
explicit temporary paths.

## Phase 3: User Story 1 — Trustworthy session context (P1)

Goal: a new agent reaches the current living contract and active change record
without loading a legacy repository.

- [x] T007 [US1] Create the living foundation contract with stable `AB-FND-*` IDs in `docs/specs/project-foundation.md`
- [x] T008 [US1] Route sessions through living requirements and clarify historical feature artifacts in `AGENTS.md`, `docs/ARCHITECTURE.md`, `README.md`, and `specs/CURRENT.md`
- [x] T009 [US1] Add `AB-FND-001` through `AB-FND-003` document-tree acceptance fixtures to `scripts/check-specs.test.mjs`

Independent test: a temporary document tree with the ordered route passes; a
missing living requirement, broken active selector or legacy runtime dependency
fails with a stable diagnostic.

## Phase 4: User Story 2 — Visible Code Intelligence value (P1)

Goal: one offline flow shows the full repository map and then the accepted small
neighborhood through a deterministic fake.

- [x] T010 [P] [US2] Create the 12-file representative source tree and expected-evidence manifest in `fixtures/typescript-modular-monolith/src/` and `fixtures/typescript-modular-monolith/fixture.json`
- [x] T011 [US2] Write reusable `AB-FND-004` through `AB-FND-009` and `AB-FND-016` through `AB-FND-018` contract scenarios in `src/core/code-intelligence/contract.test.ts`
- [x] T012 [US2] Implement provider-neutral identities, map/query result unions, normalization and validation in `src/core/code-intelligence/contract.ts`, `src/core/code-intelligence/normalize.ts`, and `src/core/code-intelligence/index.ts`
- [x] T013 [P] [US2] Write fake-provider conformance and invalid-data tests in `src/providers/fake-code-intelligence/fake-provider.test.ts`
- [x] T014 [US2] Implement explicit fixture snapshot data and the in-memory provider in `src/providers/fake-code-intelligence/fixture-snapshot.ts`, `src/providers/fake-code-intelligence/fake-provider.ts`, and `src/providers/fake-code-intelligence/index.ts`
- [x] T015 [P] [US2] Write the application-flow test for map output, typed failures, three-file limit and five-run byte equivalence in `src/app/foundation-demo/run-demo.test.ts`
- [x] T016 [US2] Implement the public demonstration flow and explicit root composition in `src/app/foundation-demo/run-demo.ts`, `src/app/foundation-demo/index.ts`, and `src/cli.ts`

Independent test: the demo reports all 12 fixture files, returns 100% of the
manifest's expected nodes and edges from no more than three files, produces the
same normalized bytes five times and distinguishes all typed failure outcomes.

## Phase 5: User Story 3 — Navigable and replaceable capabilities (P2)

Goal: every new source/test file has one owner and all dependency/review rules
fail automatically when violated.

- [x] T017 [US3] Finalize exhaustive capability roots, public entrypoints and `src/cli.ts` composition ownership in `scripts/module-boundaries.json`
- [x] T018 [US3] Measure the clean source/test metrics, retain an empty exception set and document proposed budget evidence in `scripts/architecture-baseline.json` and `specs/001-clean-foundation/research.md`
- [x] T019 [US3] Add focused capability, architecture, demo and canonical offline verification commands in `package.json`
- [x] T020 [US3] Add real-tree `AB-FND-010` through `AB-FND-015` acceptance assertions to `scripts/check-architecture.test.mjs` and `scripts/run-tests.test.mjs`

Independent test: all authored `src/**/*.ts` paths resolve to exactly one owner;
mutation fixtures for each prohibited boundary fail while the real clean tree
passes with no architecture exception.

## Phase 6: Documentation, convergence and closure

- [x] T021 [P] Update the runnable validation guide and user-facing foundation status in `specs/001-clean-foundation/quickstart.md` and `README.md`
- [x] T022 Run every quickstart scenario and record the exact verification evidence in `specs/001-clean-foundation/verification.md`
- [x] T023 Reconcile living requirements, feature artifacts, code and tests; update completion status in `docs/specs/project-foundation.md`, `specs/001-clean-foundation/spec.md`, and `specs/001-clean-foundation/tasks.md`
- [x] T024 Update the active capability selector and next-session checkpoint in `specs/CURRENT.md` and `docs/handoff.md`

## Dependencies

```text
T001
  -> T002, T003, T004
T004 -> T005 -> T006
T003 -> US1 (T007-T009)
T002 + T006 -> US2 (T010-T016)
US2 + T005 -> US3 (T017-T020)
US1 + US2 + US3 -> closure (T021-T024)
```

User Story 1 documentation and the fixture authoring part of User Story 2 can
proceed independently after setup. User Story 3 depends on the real source tree
so exhaustive ownership and the clean baseline describe actual files.

## Parallel opportunities

- T002, T003 and T004 touch separate script surfaces after T001.
- T010 can be authored while the core contract scenarios begin at T011.
- T013 and T015 can be drafted from the accepted contract before their
  implementations at T014 and T016.
- T021 may begin after the commands stabilize while verification runs continue.

## MVP implementation strategy

The smallest independently useful implementation is User Stories 1 and 2 plus
the architecture foundation required to keep their files owned. Stop before any
real provider. User Story 3 completes the foundation acceptance gate in the same
reviewable capability but does not broaden product behavior.

## Format validation

All executable tasks use sequential IDs, exact file paths, story labels in story
phases and `[P]` only where work can proceed on separate files after its stated
dependencies.

## Phase 7: Convergence

- [x] T025 Add empty-map, missing-repository and duplicate-edge acceptance evidence in `src/core/code-intelligence/contract.test.ts` and `src/providers/fake-code-intelligence/fake-provider.test.ts` per AB-FND-009 and specification edge cases (partial)
- [x] T026 Implement and test `maxDepth` and optional relationship-kind filtering in `src/providers/fake-code-intelligence/fake-provider.ts` and `src/providers/fake-code-intelligence/fake-provider.test.ts` per `data-model.md` Neighborhood query (partial)
- [x] T027 Require complete fixture map/neighborhood results in conformance and add negative evidence in `src/core/code-intelligence/conformance.ts` and `src/core/code-intelligence/contract.test.ts` per AB-FND-005 and AB-FND-017 (partial)

## Phase 8: Convergence

- [x] T028 Move the testable CLI execution helper behind `src/app/foundation-demo/index.ts`, keep `src/cli.ts` composition-only, and reject reverse imports into composition in `src/app/foundation-demo/run-demo.ts`, `src/app/foundation-demo/run-demo.test.ts`, `src/cli.ts`, `scripts/check-architecture.mjs`, and `scripts/check-architecture.test.mjs` per plan dependency direction (partial)

## Phase 9: Convergence

- [x] T029 Refresh final measured review metrics and verification evidence in `specs/001-clean-foundation/research.md` and `specs/001-clean-foundation/verification.md` after convergence tasks per plan review-baseline decision (partial)
