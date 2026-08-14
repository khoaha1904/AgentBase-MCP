# Tasks: Agent-driven OKF Benchmark

**Input**: Design documents from `specs/012-agent-okf-benchmark/`

**Tests**: Requirement-linked offline tests are mandatory; real model qualification is explicit and separate.

## Phase 1: Setup

- [x] T001 Update benchmark suite manifest and add semantic expectation files in `benchmark/repos/aws-serverless/`
- [x] T002 Add the versioned agent authoring prompt in `benchmark/prompts/okf-author-v1.md`

## Phase 2: Foundational Schema Guidance

- [x] T003 [P] [US3] Add schema investigation, metadata and relationship guidance contracts in `src/core/knowledge/schema-definitions.ts`
- [x] T004 [P] [US3] Add requirement-linked catalog/MCP tests in `src/core/knowledge/schema-catalog.test.ts` and `src/app/codebase-memory-mcp/okf-schema-tools.test.ts`
- [x] T005 [US3] Bump and document the schema catalog contract in `src/core/knowledge/schema-catalog.ts` and `docs/specs/okf-schema-catalog.md`

## Phase 3: User Story 1 - Run a Real Agent

- [x] T006 [P] [US1] Add fake-process command, failure and immutability tests in `scripts/benchmark-agent.test.mjs`
- [x] T007 [US1] Implement bounded Codex CLI invocation and artifact capture in `scripts/benchmark-agent.mjs`
- [x] T008 [US1] Route `run` through the benchmark CLI in `scripts/benchmark-okf.mjs` and `package.json`

## Phase 4: User Story 2 - Score Semantic OKF

- [x] T009 [P] [US2] Add controlled complete/shallow/unexpected scoring tests in `scripts/benchmark-okf.test.mjs`
- [x] T010 [US2] Implement expectation loading and concept/schema/metadata/provenance scoring in `scripts/benchmark-okf.mjs`
- [x] T011 [US2] Implement relationship extraction, metrics and report output in `scripts/benchmark-okf.mjs`
- [x] T012 [US2] Replace the manual baseline contract with agent-run documentation in `benchmark/README.md`

## Phase 5: Integration and Verification

- [x] T013 Update architecture/living documentation and active handoff in `docs/ARCHITECTURE.md` and `docs/handoff.md`
- [x] T014 Run focused offline benchmark and schema tests from `specs/012-agent-okf-benchmark/quickstart.md`
- [x] T015 Run one explicit real Codex qualification against `aws-health-aware` and preserve its timestamped artifacts in `benchmark/results/aws-serverless/aws-health-aware/`
- [x] T016 Run `npm run verify`, record verification in `specs/012-agent-okf-benchmark/verification.md`, and close `specs/CURRENT.md`

## Dependencies & Execution Order

- T001-T002 establish immutable benchmark inputs.
- T003-T005 complete schema guidance before the agent prompt is qualified.
- T006 precedes T007; T007 precedes T008.
- T009 precedes T010-T011; T010 precedes T011.
- T013-T016 follow implementation; T015 is opt-in external evidence and is not part of canonical verification.

## Implementation Strategy

Ship one Codex adapter and one Terraform repository real run. The second pinned
AWS repository remains immediately runnable but is not required to prove the
first independently useful agent loop.
