# Tasks: ECS Full-stack Qualification

## Phase 1: Setup

- [x] T001 Pin and inspect the ECS full-stack fixture under `../fixtures/source-repos/amazon-ecs-fullstack-app-terraform`
- [x] T002 Record approved model policy, scope and mutation in `specs/024-ecs-fullstack-qualification/spec.md`

## Phase 2: User Story 1 — Sol Initial Ingest

- [x] T003 [US1] Add the Sol Initial Ingest manifest in `benchmark/repos/aws-ecs-fullstack/manifest.json`
- [x] T004 [US1] Add source-curated reference probes in `benchmark/repos/aws-ecs-fullstack/expected/amazon-ecs-fullstack-v16.json`
- [x] T005 [US1] Extend the existing benchmark contract test in `scripts/benchmark/benchmark-okf.test.mjs`
- [x] T006 [US1] Run `npm run verify`, then one owner-authorized Sol Initial Ingest probe and finalize its score
- [x] T007 [US1] Review exact OKF health-contract evidence and record the baseline decision in `specs/024-ecs-fullstack-qualification/verification.md`

## Phase 3: User Story 2 — Terra Refresh

- [x] T008 [US2] Add bounded multi-file mutation support in `scripts/benchmark/benchmark-agent.mjs`
- [x] T009 [US2] Add an immutable ECS Refresh prompt and Terra manifest under `benchmark/prompts/` and `benchmark/repos/aws-ecs-fullstack-refresh/`
- [x] T010 [US2] Add exact `/health` present and `/status` absent benchmark gates in the Refresh manifest and existing contract test
- [x] T011 [US2] Run one Terra Refresh probe and conditionally one sequential replica
- [x] T012 [US2] Compare changed concept bytes and record separated findings in `specs/024-ecs-fullstack-qualification/verification.md`

## Phase 4: Completion

- [x] T013 Promote accepted model/qualification behavior to `docs/contracts/benchmark.md` and `docs/README.md`
- [x] T014 Run `npm run verify`, close `specs/CURRENT.md`, and commit the completed capability

## Dependencies and Execution Order

- T003–T007 establish the only eligible Refresh baseline.
- T008–T012 run only after T007 accepts that baseline.
- Work is sequential; no parallel markers are used because later artifacts depend on reviewed model output.

## Implementation Strategy

Stop after the Sol probe if it is invalid or lacks the health contract. Do not
build the Refresh suite around a weak baseline and do not change product schemas
from one repository result.
