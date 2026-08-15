# Tasks: Canonical OKF Graph

**Input**: Design documents in `specs/016-canonical-okf-graph/`

## Phase 1: Specification baseline

- [x] T001 Record approved owner decisions in `specs/016-canonical-okf-graph/spec.md`
- [x] T002 Record proposal, concept and assessment design in `specs/016-canonical-okf-graph/plan.md` and `data-model.md`
- [x] T003 Validate requirement quality in `specs/016-canonical-okf-graph/checklists/requirements.md`
- [x] T004 Update active capability routing in `specs/CURRENT.md` and commit the specification baseline

## Phase 2: Canonical proposal lifecycle

- [x] T005 [US2] Add requirement-linked cross-root and cross-source lifecycle tests in `src/app/hub-okf/prepare.test.ts` and `refresh.test.ts`
- [x] T006 [US2] Admit logical canonical subjects in `src/core/hub/proposal.ts` and `src/app/hub-okf/mcp-tools.ts`
- [x] T007 [US2] Decouple refresh mutation from the subject subtree while preserving foreign evidence and protected bytes in `src/app/hub-okf/refresh.ts`
- [x] T008 [US2] Update current Hub contract in `docs/contracts/hub.md`
- [x] T009 [US2] Run canonical verification and commit the proposal lifecycle phase

## Phase 3: System-centered authoring

- [x] T010 [P] [US1] Add canonical schema selection tests in `src/core/knowledge/schema-catalog.test.ts`
- [x] T011 [P] [US1] Add open-world/absolute-link relationship tests in `src/core/knowledge/okf-relationships.test.ts`
- [x] T012 [US1] Implement catalog 4.0.0 canonical schemas and useful-unit guidance in `src/core/knowledge/schema-definitions.ts` and `schema-infrastructure-definitions.ts`
- [x] T013 [US1] Update relationship validation in `src/core/knowledge/okf-relationships.ts`
- [x] T014 [US1] Update `.agents/skills/agentbase-okf/SKILL.md` and `docs/contracts/okf.md`
- [x] T015 [US1] Run canonical verification and commit the system-centered authoring phase

## Phase 4: Benchmark v5

- [x] T016 [P] [US3] Add v5 prompt and lifecycle tests in `scripts/benchmark-agent.test.mjs`
- [x] T017 [P] [US3] Add usefulness and benchmark-metadata boundary tests in `scripts/benchmark-okf.test.mjs`
- [x] T018 [US3] Implement v5 semantic matching and owner-review assessment in `scripts/benchmark-okf.mjs`
- [x] T019 [US3] Add immutable v5 prompts and suite identity in `benchmark/prompts/` and `benchmark/repos/aws-serverless/manifest.json`
- [x] T020 [US3] Add deterministic three-source sequential qualification using the Hub lifecycle tests
- [x] T021 [US3] Update `benchmark/README.md` and `docs/contracts/benchmark.md`
- [x] T022 [US3] Run canonical verification and commit the offline v5 phase

## Phase 5: Convergence

- [x] T023 Reconcile implementation with `specs/016-canonical-okf-graph/spec.md` and append any missing work here
- [x] T024 Record verification in `specs/016-canonical-okf-graph/verification.md`
- [x] T025 Mark capability completed in `specs/CURRENT.md`, run `npm run verify` and commit completion

## Dependencies

T001–T004 → T005–T009 → T010–T015 → T016–T022 → T023–T025.

US2 establishes safe cross-source mutation before US1 emits canonical concepts;
US3 then measures the accepted behavior.

## Phase 6: Convergence

- [x] T026 Require V5 semantic anchors instead of shared-schema/source fallback per AB-BENCH-037 (partial)
- [x] T027 Assess explicit limitations for boundary types that require them per AB-BENCH-037 (partial)
