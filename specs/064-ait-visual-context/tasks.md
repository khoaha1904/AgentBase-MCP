# Tasks: AIT useful visual context

## Phase 1: Contract foundation

- [x] T001 Record owner decisions and activate capability 064 in `specs/064-ait-visual-context/spec.md` and `specs/CURRENT.md`
- [x] T002 [P] Synchronize AIT visual outcomes and source-projection boundaries in `docs/product/07-ai-sdlc-context.md` and `docs/architecture/flows.md`
- [x] T003 [P] Record diagram priorities/readiness and development fixture authority in `docs/capabilities/14-ai-sdlc-context/07-useful-visual-context.md` and `docs/capabilities/09-ingest-and-refresh/07-domain-enrichment.md`

## Phase 2: User Story 1 — Useful Feature Discovery visual

**Goal**: admit one P0 Discovery Impact Map and only a conditional P1 Flow.

**Independent Test**: the Crawler map has a named discovery decision, Published
authority, affected concepts/relations, Question visibility and explicit gaps.

- [x] T004 [US1] Classify current Crawler Phase 1 data readiness and minimum improvements in `docs/capabilities/14-ai-sdlc-context/07-useful-visual-context.md`

## Phase 3: User Story 2 — Bound the developer planning visual

**Goal**: define the useful Phase 2 map and identify the exact missing packet.

**Independent Test**: the ECS scenario requirements map to existing Code Graph
tools while the absent source-to-diagram projection remains explicit.

- [x] T005 [US2] Classify current Phase 2 data/tool readiness and the minimum disposable projection in `docs/capabilities/14-ai-sdlc-context/07-useful-visual-context.md`

## Phase 4: User Story 3 — Publish realistic provider fixture truth

**Goal**: prepare one ordinary provider-backed Crawler proposal for exact
`hub-3`, then advance it through existing governed publication transitions.

**Independent Test**: real adapter use resolves only the factual queue Question,
wrong targets fail before authoring, and synchronized Hub bytes contain no mock
marker or ownership assertion.

- [x] T006 [US3] Add optional qualification-only `AwsCliAdapter` injection to `src/app/hub-okf/query/runtime-actions.ts`
- [x] T007 [US3] Write target-guard and orchestration tests first in `scripts/qualification/hub3-sqs-fixture.test.mjs`
- [x] T008 [US3] Implement the exact guarded proposal command in `scripts/qualification/hub3-sqs-fixture.mjs`
- [x] T009 [US3] Run the proposal command, inspect, Accept and submit through existing CLI commands, merge externally, synchronize, and verify both Published Question states

## Phase 5: Verification and closure

- [x] T010 Run focused qualification/mock tests, `npm run spec:check`, `npm run verify` and `git diff --check`
- [x] T011 Reconcile implementation with `AB-CONTEXT-VIS-001..008`, `AB-ENRICH-015..018` and `AB-QUESTION-003`, then mark capability 064 complete in `specs/064-ait-visual-context/spec.md` and `specs/CURRENT.md`

## Dependencies and execution order

- T001–T003 precede behavior implementation.
- T004 and T005 are independently reviewable after T003.
- T006 precedes T008; T007 must fail before T008 is implemented.
- T008 precedes the external-state transitions in T009.
- T009 must complete before closure verification T010–T011.

## Implementation strategy

The first useful increment is the accepted phase/data matrix (T001–T005). The
only runtime-adjacent change is the adapter injection and guarded qualification
script for T006–T009. Phase 2 diagram rendering remains a later capability after
its bounded packet contract is approved.
