# Tasks: Local-first Hub Control

## Phase 1 — Specification and baseline

- [x] T001 Record owner decisions in `docs/present/00-product-scope-and-authority.md` and `docs/present/11-review-accept-and-publish.md`
- [x] T002 Record stable lifecycle requirements in `docs/design/11-review-and-publish/01-runtime-requirements.md` and `04-git-and-pr-workflow.md`
- [x] T003 Create and validate capability artifacts under `specs/037-local-first-hub-control/`

## Phase 2 — Foundational identity and state

- [ ] T004 Refactor host-aware Hub identity in `src/core/hub/identity.ts` and `src/providers/github-hub/github-api.ts`
- [ ] T005 Implement isolated profile and active-pointer persistence in `src/app/hub-okf/configuration/configuration-file.ts`
- [ ] T006 Implement per-profile credential persistence/migration in `src/app/hub-okf/configuration/credential-file.ts`
- [ ] T007 Establish and migrate the dedicated Published ref in `src/app/hub-okf/workspace/local-hub.ts` and `src/core/hub/local-state.ts`

## Phase 3 — User Story 1: local-first authoring

- [ ] T008 [US1] Lazy-create local-only Hub for the first authoring mutation in `src/app/hub-okf/query/runtime-actions.ts`
- [ ] T009 [US1] Keep status and graph state-free in `src/app/hub-okf/mcp/mcp-tool-call.ts` and existing server journey tests
- [ ] T010 [US1] Qualify restart/Accept/query local-only behavior in `src/app/hub-okf/workspace/local-only-e2e.test.ts`

## Phase 4 — User Story 2: remote profiles

- [ ] T011 [US2] Accept exact repository URL and target branch in `src/app/hub-okf/workspace/setup.ts` and MCP adapters
- [ ] T012 [US2] Stage, admit, activate and reuse isolated profiles in `src/app/hub-okf/configuration/` and `workspace/`
- [ ] T013 [US2] Route GitHub.com and Enterprise API/PR origins in `src/providers/github-hub/github-api.ts`
- [ ] T014 [US2] Replace remote `main` literals across bootstrap, publication, initialization and CI rendering owners
- [ ] T015 [US2] Prove two-profile isolation, invalid activation and non-main targets in existing journey tests

## Phase 5 — User Story 3: status and synchronization

- [ ] T016 [US3] Make pending ancestry derive from Published ref in `src/app/hub-okf/review/pending.ts`
- [ ] T017 [US3] Make sync candidate/admission transactional in `src/app/hub-okf/publication/synchronize.ts`
- [ ] T018 [US3] Correct transaction-based recovery surface in `src/app/hub-okf/publication/recovery.ts` and MCP adapters
- [ ] T019 [US3] Add bounded remote-head/open-PR inspection in `src/providers/github-hub/github-api.ts`
- [ ] T020 [US3] Compose partial compact status in `src/app/hub-okf/query/runtime-actions.ts`
- [ ] T021 [US3] Reproduce and qualify fetch-conflict/status/recovery without increasing the 50-test inventory

## Phase 6 — User Story 4: product workflow and qualification

- [ ] T022 [US4] Add `.agents/skills/agentbase-hub/SKILL.md` and register it in `.agents/skills/README.md`
- [ ] T023 [US4] Run sequential offline qualification for Init, Refresh, Questions, Batch, captured Enrichment and CI
- [ ] T024 [US4] Recover the current production state without resetting Local Drafts, then run status/sync/query evidence
- [ ] T025 [US4] Run one real Init/Refresh publication loop where external merge authorization is available

## Phase 7 — Convergence and release

- [ ] T026 Synchronize living docs/tool descriptions with implemented behavior and run `npm run verify`
- [ ] T027 Perform defect-first convergence review and resolve every critical/high finding
- [ ] T028 Record real/captured/deferred evidence in `specs/037-local-first-hub-control/verification.md` and close capability 037

## Dependencies

`T004..T007 → US1/US2/US3 → US4 → T026..T028`. US1 can qualify after profile
storage; US2 and US3 share identity/Published foundations and then converge
before production recovery. External merge never blocks offline qualification.

## Implementation Strategy

Keep the canonical suite at 50 by expanding existing server, local lifecycle and
publication journeys. Implement Published-ref recovery first because current
status/sync is a release blocker; profile switching and Enterprise transport
reuse the same identity boundary rather than adding another provider.
