# Tasks: Batch OKF Authoring

**Input**: Design documents in `specs/015-batch-okf-authoring/`

## Phase 1: Batch MCP Surface

- [x] T001 Add failing selected-schema and bundle-validation MCP tests
- [x] T002 Implement `get_okf_authoring_schemas` using the existing selector and catalog
- [x] T003 Implement `validate_okf_bundle` using existing draft, schema and relationship validators
- [x] T004 Update living OKF contract, MCP surface checks and specification checker
- [x] T005 Run canonical verification, record evidence and commit the batch-tool phase

## Phase 2: Immutable v4 Benchmark

- [x] T006 Add immutable v4 prompts without fixture answers
- [x] T007 Require batch tools and retain historical v1-v3 lifecycle behavior
- [x] T008 Measure completed authoring calls and payload bytes in arm/pair artifacts
- [x] T009 Prove v4 rendering, fake lifecycle and measurement offline
- [x] T010 Run canonical verification, record evidence and commit the v4 offline phase

## Phase 3: Heterogeneous Efficiency Evidence

- [x] T011 Run one v4 MCP-only measurement on Health Aware
- [x] T012 Run one v4 MCP-only measurement on shopping cart
- [x] T013 Retain the invalid shopping-cart artifact and isolate the general natural-language selector failure

## Phase 4: Natural Evidence Selection Correction

- [x] T014 Add regression coverage for separated evidence words, admitted plurals and specific-type shadowing
- [x] T015 Update the general selector and catalog to 3.1.0 without repository identities
- [x] T016 Run canonical verification, record evidence and commit the selector-correction phase
- [x] T017 Re-run the unchanged v4 MCP workflow on both repositories with catalog 3.1.0
- [x] T018 Compare reviewability and authoring calls with retained v3/v4 evidence; treat token/time as supporting telemetry
- [x] T019 Close capability only if both corrected outputs are reviewable and call reduction meets SC-006
- [x] T020 Run final verification and commit the corrected evidence phase

## Dependencies

T001 → T002 → T003 → T004 → T005 → T006 → T007 → T008 → T009 → T010 →
T011 → T012 → T013 → T014 → T015 → T016 → T017 → T018 → T019 → T020.
