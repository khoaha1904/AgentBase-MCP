# Tasks: Scalable Hub Navigation

**Input**: Design documents in `specs/017-scalable-hub-navigation/`

## Phase 1: Specification baseline

- [x] T001 Record approved product behavior in `specs/017-scalable-hub-navigation/spec.md`
- [x] T002 Record technical design and interfaces in `specs/017-scalable-hub-navigation/plan.md`, `data-model.md`, `contracts/mcp.md` and `quickstart.md`
- [x] T003 Validate requirement quality in `specs/017-scalable-hub-navigation/checklists/requirements.md`
- [x] T004 Analyze spec/plan/task coverage and update active routing in `specs/CURRENT.md`
- [x] T005 Run specification checks and commit the capability baseline

## Phase 2: Canonical evidenced relationships

- [x] T006 [P] [US2] Add canonical predicate, evidence and open-world compatibility tests in `src/core/knowledge/okf-relationships.test.ts`
- [x] T007 [P] [US2] Add flow-step and inherited component-guidance tests in `src/core/knowledge/schema-catalog.test.ts`
- [x] T008 [US2] Implement catalog 5.0.0 canonical relationship and flow-step guidance in `src/core/knowledge/schema-definition-builder.ts`, `schema-definitions.ts` and `schema-infrastructure-definitions.ts`
- [x] T009 [US2] Validate canonical edge evidence and structured Business Flow steps in `src/core/knowledge/okf-relationships.ts`
- [x] T010 [US2] Update schema MCP validation, authoring guidance and current OKF contract in `src/app/codebase-memory-mcp/okf-schema-tools.ts`, `.agents/skills/agentbase-okf/SKILL.md` and `docs/contracts/okf.md`
- [x] T011 [US2] Run focused/full verification and commit the relationship phase

## Phase 3: Progressive domain retrieval

- [x] T012 [P] [US1] Add ranked domain search, ambiguity and bounded traversal tests in `src/core/knowledge/hub-query.test.ts`
- [x] T013 [P] [US4] Add accepted-commit MCP/CLI contract tests in `src/app/hub-okf/query.test.ts`, `mcp-tools.test.ts` and `cli.test.ts`
- [x] T014 [US1] Implement transient concept summaries, Domain reachability, deterministic ranking and bounded traversal in `src/core/knowledge/hub-query.ts`
- [x] T015 [US1] Expose scoped search and traversal from exact accepted commits in `src/app/hub-okf/query.ts`, `runtime-actions.ts`, `mcp-tools.ts`, `cli.ts` and public entrypoints
- [x] T016 [US4] Update progressive root/Domain/System authoring policy in `.agents/skills/agentbase-okf/SKILL.md` and `docs/contracts/hub.md`
- [x] T017 [US1] Run focused/full verification and commit the retrieval phase

## Phase 4: Bounded continuity and changed-set validation

- [x] T018 [P] [US3] Add changed concepts plus target-summary tests in `src/app/codebase-memory-mcp/okf-schema-tools.test.ts`
- [x] T019 [P] [US3] Add bounded continuity manifest tests in core query ownership and `runtime-actions.test.ts`
- [x] T020 [US3] Implement `validate_okf_changes` without a total-Hub dependency in `src/app/codebase-memory-mcp/okf-schema-tools.ts` and core relationship validation
- [x] T021 [US3] Build exact-base bounded continuity summaries in core query ownership and `runtime-actions.ts`
- [x] T022 [US3] Update MCP/Hub contracts and authoring prompt to consume the manifest and changed-set validator in `docs/contracts/okf.md`, `docs/contracts/hub.md` and `benchmark/prompts/`
- [x] T023 [US3] Run focused/full verification and commit the bounded re-ingest phase

## Phase 5: Scale and Shopping Cart qualification

- [x] T024 [P] [US1] Add generated ten-domain thousand-concept search/traversal qualification beside `src/core/knowledge/hub-query.test.ts`
- [x] T025 [P] [US3] Extend sequential multi-repository qualification in `src/app/hub-okf/canonical-graph-e2e.test.ts`
- [x] T026 [US4] Extend benchmark usefulness gates for progressive navigation, canonical evidenced edges and conflict visibility in `scripts/benchmark-okf.mjs` and tests
- [x] T027 [US4] Add an immutable next authoring prompt and update `benchmark/repos/aws-serverless/manifest.json` plus benchmark documentation
- [x] T027A [US3] Enforce the durable path-derived identity contract in changed-set validation after the first V8 real run exposed ephemeral aliases
- [x] T027B [US4] Add an immutable V9 prompt that obtains schemas after investigation and makes progressive index, parent-boundary and conflict review explicit
- [ ] T028 [US4] Run real Shopping Cart qualification, inspect source conflicts and commit immutable evidence under `benchmark/results/`
- [ ] T029 [US4] Rebuild one Shopping Cart Hub proposal from remote `main` after PR #6 is closed

## Phase 6: Convergence and publication

- [ ] T030 Reconcile implementation against all requirements and append only genuine remaining work below
- [ ] T031 Update `docs/README.md`, affected current contracts and `specs/017-scalable-hub-navigation/verification.md`
- [ ] T032 Mark capability complete in `specs/CURRENT.md`, run `npm run verify` and commit completion
- [ ] T033 Publish the accepted replacement Shopping Cart proposal as one Hub PR and record the result

## Dependencies

T001–T005 → T006–T011 → T012–T017 → T018–T023 → T024–T029 → T030–T033.

US2 establishes reliable graph semantics before US1 traversal consumes them.
US3 then bounds re-ingest context; US4 proves the final navigation product.
