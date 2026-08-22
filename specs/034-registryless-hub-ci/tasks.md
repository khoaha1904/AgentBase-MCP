# Tasks: Registry-less Hub CI

## Phase 1: Contract

- [x] T001 Record registry-less CI behavior in `specs/034-registryless-hub-ci/` and current Hub requirements.

## Phase 2: Self-contained bundle

- [x] T002 [US1] Add deterministic standalone build entry and artifact under `src/app/hub-okf/ci/`, `scripts/` and `assets/hub-ci/`.
- [x] T003 [US1] Render checksum manifest and registry-less workflow in `src/app/hub-okf/ci/workflow.ts`.
- [x] T004 [US1] Exclude admitted CI support files from knowledge-file policy while validating their integrity in `src/app/hub-okf/ci/validation.ts`.

## Phase 3: Reviewed installation

- [x] T005 [US2] Install all CI files in new Hub setup in `src/app/hub-okf/workspace/setup.ts`.
- [x] T006 [US2] Bind preview, submit and retry to the complete CI bundle in `src/app/hub-okf/ci/upgrade.ts` and MCP adapters.
- [x] T007 [US2] Update existing design-level journeys for exact three-file behavior.

## Phase 4: Verify and close

- [x] T008 Update current high/low-level truth and run `npm run verify`.
