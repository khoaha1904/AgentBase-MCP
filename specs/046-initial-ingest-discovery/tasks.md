# Tasks: Initial Ingest discovery quality

**Input**: Approved artifacts in `specs/046-initial-ingest-discovery/`

**Tests**: Required by Capability 046. Keep four focused contract suites plus the
released-skill qualification; do not add helper-by-helper tests.

**Execution policy**: Work sequentially in task order. The boundaries below
share source/session contracts, so no task is marked parallel even when files
differ.

## Phase 1: Setup

**Purpose**: Capture bounded deterministic inputs before runtime changes.

- [x] T001 Add fake GitHub source-authority responses and pinned Codebase Memory architecture/coverage/overflow/secret fixtures under `fixtures/github-hub-source/` and `fixtures/codebase-memory-v0.10.8/discovery/`

---

## Phase 2: Foundational contracts

**Purpose**: Create the provider-neutral values used by every Init slice.

- [x] T002 Define and export SourceSnapshot-linked DiscoveryLane, DiscoveryGroup, DiscoverySeed, InventoryItem/output mapping, QuestionPlan, InventoryReceipt and CoverageResult validation in `src/core/knowledge/discovery.ts` and `src/core/knowledge/index.ts`

**Checkpoint**: Core accepts one origin group per item, derives lane/P0 state,
permits only valid duplicate-covered P0 outcome and rejects unbindable
QuestionPlans before Receipt creation.

---

## Phase 3: User Story 1 — Exact safe Hub source (Priority: P1)

**Goal**: Init, Batch Init and Refresh analyze the exact same-host remote-default
snapshot without changing the user's repository or using ambient credentials.

**Independent Test**: Fake GitHub/API/Git tests prove HTTPS/SSH/SCP normalization,
ambiguous/cross-host denial, API/fetch commit equality, clean-exact reuse,
private-mirror fallback, marker-owned cleanup and `source-advanced` warning.

### Tests for User Story 1

- [x] T003 [US1] Add the exact-source authority, TOCTOU, credential isolation, worktree-preservation and cleanup contract suite in `src/providers/github-hub/source-snapshot.test.ts` and `src/app/hub-okf/workspace/local-only-e2e.test.ts`

### Implementation for User Story 1

- [x] T004 [US1] Normalize unique canonical HTTPS repository identity and resolve default branch/head with the active same-host Hub token in `src/providers/github-hub/github-api.ts` and `src/providers/github-hub/index.ts`
- [x] T005 [US1] Implement profile/source-scoped mode-0700 private bare mirrors, exact-commit verification, detached worktrees and marker-validated cleanup/GC in `src/providers/github-hub/git-process.ts` and `src/providers/github-hub/source-snapshot.ts`
- [x] T006 [US1] Return SourceSnapshot authority for both new Init and existing Refresh while preserving query-only working-tree behavior in `src/app/hub-okf/query/runtime-actions.ts`, `src/app/hub-okf/mcp/mcp-tool-actions.ts` and `src/app/hub-okf/mcp/mcp-tool-call.ts`
- [x] T007 [US1] Bind single Init, Batch-member Init and normal Refresh preflight/drift checks to the resolved SourceSnapshot without changing Refresh's change-first discovery in `src/app/hub-okf/batch-ingest/workflow.ts` and `src/app/hub-okf/query/runtime-actions.ts`

**Checkpoint**: Source selection is independently usable and verified before any
Discovery Seed work.

---

## Phase 4: User Story 2 — Deterministic Init Discovery Seed (Priority: P1)

**Goal**: An armed Init receives one compact MCP-derived Seed that cannot silently
omit P0 because the Agent forgot a graph call; query and normal Refresh remain
unchanged.

**Independent Test**: One provider-to-Seed suite proves the fixed explicit aspect
recipe, terminal paging, diagnostic/overflow behavior, stable grouping, Flow
candidate, secret denial, unchanged provider blocks and no Seed for unarmed
query/Refresh.

### Tests for User Story 2

- [x] T008 [US2] Add a single provider-to-Seed contract suite covering fixed calls, pagination, P0/P1/P2 grouping, overflow, malformed output, Flow candidates, secret paths and unarmed roots in `src/app/codebase-memory-mcp/discovery-session.test.ts` and `src/providers/codebase-memory/owned-runtime.test.ts`

### Implementation for User Story 2

- [x] T009 [US2] Add the shared hard-deny policy as the owned overlay `vendor/codebase-memory/agentbase/patches/0001-parser-profile.patch`, targeting main discovery plus independent env/infra walkers while preserving the pinned upstream tree byte-for-byte
- [x] T010 [US2] Extend normalized pinned-provider parsing for explicit architecture aspects, index totals, skipped/partial/not-indexed pages and truncation diagnostics in `src/providers/codebase-memory/response-parser.ts` and `src/providers/codebase-memory/index.ts`
- [x] T011 [US2] Implement the Init-armed fixed recipe, bounded safe census, stable groups, lane/P0 derivation, overflow and compact Seed summary in `src/app/codebase-memory-mcp/discovery-session.ts`
- [x] T012 [US2] Arm only exact Init/Batch roots, invoke the private recipe after successful indexing and append the bounded Seed block without changing provider blocks or other graph results in `src/app/codebase-memory-mcp/gateway-session.ts` and `src/app/codebase-memory-mcp/server.ts`
- [x] T013 [US2] Verify and preserve the released public tool names/count/input schemas while admitting the owned provider security patch in `src/app/codebase-memory-mcp/server.test.ts`, `src/providers/codebase-memory/owned-runtime.ts` and upstream management checks

**Checkpoint**: The Agent can see every Seed group ID requiring an outcome, but no Hub
proposal behavior has changed yet.

---

## Phase 5: User Story 3 — Receipt-bound reviewable Init proposal (Priority: P1)

**Goal**: The Agent assigns one outcome to every important group, then MCP freezes a
Receipt and deterministically materializes/validates compact OKF, Questions,
provenance and one Repository Init log.

**Independent Test**: One Seed-to-Receipt-to-proposal suite proves coverage,
multiple outputs from one group, QuestionPlan binding, idempotent Prepare,
base replacement, exact-revision sources, one repair, Ready/Incomplete behavior,
inspection and Repository-only log output.

### Tests for User Story 3

- [x] T014 [US3] Extend the Initial Ingest contract suite for Inventory validation, Receipt/session recovery, Question materialization, exact-revision evidence, Hub-base replacement, inspection and activity log in `src/app/hub-okf/authoring/receipt-authoring.test.ts`, `src/app/hub-okf/authoring/initial-ingest.test.ts` and `src/app/hub-okf/workspace/local-only-e2e.test.ts`

### Implementation for User Story 3

- [x] T015 [US3] Extend `get_okf_authoring_schemas` with the final Inventory/outputs/QuestionPlan envelope, active-Seed validation and Receipt result without adding a tool in `src/app/codebase-memory-mcp/okf-schema-tools.ts`, `src/app/hub-okf/mcp/mcp-tools.ts` and `src/app/hub-okf/mcp/mcp-tool-call.ts`
- [x] T016 [US3] Reuse SharedQuestion/candidate-evidence types to normalize Receipt QuestionPlans and reject unbindable plans before freeze in `src/core/knowledge/governance/questions.ts` and `src/app/hub-okf/authoring/questions.ts`
- [x] T017 [US3] Freeze base/source/engine-bound Receipts and expose them to Hub authoring through a narrow injected internal resolver rather than app-to-app imports in `src/app/codebase-memory-mcp/discovery-session.ts`, `src/app/codebase-memory-mcp/server.ts` and `src/app/hub-okf/authoring/prepare.ts`
- [x] T018 [US3] Make new-mode Prepare receipt-only and atomically idempotent by Receipt/request digest, including persisted-session-first crash retry and base-bound replacement in `src/app/hub-okf/authoring/authoring-session.ts`, `src/app/hub-okf/authoring/prepare.ts` and `src/app/hub-okf/authoring/initial-ingest-skeleton.ts`
- [x] T019 [US3] Require revision-distinct `sources[].observed_revision` for Capability 046 Init/Refresh in the core and generated standalone Hub validator in `src/core/knowledge/documents/okf-document.ts`, `assets/hub-ci/hub-validator.mjs` and `scripts/build-hub-validator.mjs`
- [x] T020 [US3] Enforce Receipt concept/embedded/Question materialization, P0 coverage, P1/P2 limitations and one repair at Finalize in `src/app/hub-okf/authoring/authoring-session.ts`, `src/app/hub-okf/authoring/prepare.ts` and `src/app/hub-okf/authoring/questions.ts`
- [x] T021 [US3] Render exactly one newest-first Repository Init activity entry and expose bounded discovery/ignored/Question/Flow inspection without raw Seed or local paths in `src/core/knowledge/documents/activity-log.ts`, `src/app/hub-okf/review/inspect.ts` and `src/app/hub-okf/publication/review-summary.ts`
- [x] T022 [US3] Implement pre-Finalize Init base rematch/new Receipt/replacement session and receiptless Refresh re-prepare while preserving post-Finalize publication reconciliation in `src/app/hub-okf/query/runtime-actions.ts`

**Checkpoint**: Single-repository Initial Ingest satisfies Capability 046 and is
independently releasable only after the offline gate; catalog/tool count remain
unchanged.

---

## Phase 6: User Story 4 — Recoverable atomic Batch Init (Priority: P2)

**Goal**: Batch applies the same source/Seed/Receipt contract per member,
continues after confirmed-clean member-local failure and still publishes only one
complete or explicitly revised atomic proposal.

**Independent Test**: A three-member fixture makes the middle member fail,
confirms the third completes, verifies cross-member evidence rejection, retries
only the failed member and blocks Finalize until all current members complete.

### Tests for User Story 4

- [x] T023 [US4] Add the Batch isolation/liveness/retry contract to `src/app/hub-okf/workspace/local-only-e2e.test.ts`

### Implementation for User Story 4

- [x] T024 [US4] Store exact per-member source/Seed/Receipt/session digests, continue only after confirmed-clean local failure and stop on shared/uncertain failure in `src/app/hub-okf/batch-ingest/manifest.ts` and `src/app/hub-okf/batch-ingest/workflow.ts`
- [x] T025 [US4] Compose only complete current membership, reject cross-member Receipt/evidence and include bounded per-member coverage in atomic inspection/PR summary in `src/app/hub-okf/batch-ingest/composition.ts`, `src/app/hub-okf/review/inspect.ts` and `src/app/hub-okf/publication/review-summary.ts`

**Checkpoint**: Batch remains sequential, isolated and atomic without introducing
a parallel runner or workflow database.

---

## Phase 7: User Story 5 — Released-skill qualification (Priority: P2)

**Goal**: The installed product skills execute the new strict Init path and one
real Sol probe demonstrates useful, stable OKF without exact concept-count bias.

**Independent Test**: `npm run verify` passes, then the released-skill probe
independently confirms representative source P0 entered the Seed and received a
valid proposal outcome; a replica runs only when the first run has no clear
blocker.

### Implementation and qualification for User Story 5

- [x] T026 [US5] Update the five-stage Init/Batch receipt handoff and correct the owned runtime note to 0.10.8 in `.agents/skills/agentbase-ingest/SKILL.md`, `.agents/skills/agentbase-batch-ingest/SKILL.md`, `.agents/skills/agentbase-okf/SKILL.md` and `.agents/skills/use-codebase-memory/SKILL.md`
- [x] T027 [US5] Add the non-exhaustive source-to-Seed and Seed-to-proposal capability suite plus regression reporting in `benchmark/repos/initial-ingest-discovery-v1/`, `benchmark/prompts/okf-author-v18.md`, `scripts/benchmark/benchmark-agent.mjs`, `scripts/benchmark/benchmark-okf.mjs` and `scripts/benchmark/benchmark-okf.test.mjs`
- [x] T028 [US5] Run focused contract suites, `npm run typecheck`, `npm run depcruise` and `npm run verify`; record the offline evidence in `specs/046-initial-ingest-discovery/verification.md`
- [x] T029 [US5] Run and finalize one exact released-skill Sol probe with no Accept/Publish/provider CLI/fixture mutation and record quality delta, defects, elapsed time and tokens in `specs/046-initial-ingest-discovery/verification.md`
- [x] T030 [US5] Evaluate the identical sequential replica gate; skip the replica because T029 exposed a clear MCP request-contract blocker, and record that result in `specs/046-initial-ingest-discovery/verification.md`

---

## Phase 8: Closeout

**Purpose**: Reconcile implementation authority only after qualification.

- [x] T031 Update pending/current status and exact shipped behavior in `docs/present/01-how-mcp-reads-a-repository.md`, `docs/present/03-how-concepts-are-identified.md`, `docs/present/09-ingest-and-refresh.md`, `docs/present/11-review-accept-and-publish.md` and affected `docs/design/` requirement files
- [x] T032 Run `npm run spec:check` and the capability consistency analysis against `specs/046-initial-ingest-discovery/spec.md`, `plan.md` and `tasks.md`; append any real remaining delta before closing the active capability

---

## Phase 9: V18 contract correction and requalification

**Purpose**: Remove the Agent-authored provenance formatting failure exposed by
V18 without changing durable Question data, then requalify the released skill
under a new immutable benchmark identity.

- [x] T033 Backfill the approved evidence-ID QuestionPlan behavior into current high/low-level docs, Capability 046 spec/plan/data model/contract/decision and requirements `AB-INGEST-017` plus `AB-BENCH-076`
- [x] T034 [US3] Extend the existing discovery/Receipt contract test with nested-path evidence-ID selection and derived canonical source/revision in `src/app/codebase-memory-mcp/discovery-session.test.ts`
- [x] T035 [US3] Replace caller-authored QuestionPlan URI/revision fields with MCP-derived evidence selection in `src/app/codebase-memory-mcp/okf-schema-tools.ts` and update `.agents/skills/agentbase-ingest/SKILL.md`
- [x] T036 [US5] Add immutable V19 qualification identity and correct missing skill-workspace output reporting in `benchmark/prompts/okf-author-v19.md`, `benchmark/repos/initial-ingest-discovery-v1/manifest.json`, `scripts/benchmark/benchmark-agent.mjs` and `scripts/benchmark/benchmark-okf.test.mjs`
- [x] T037 [US5] Run focused/full gates, then one V19 Sol probe and conditional replica; record results in `specs/046-initial-ingest-discovery/verification.md`

---

## Phase 10: Normalize Inventory ownership after V19

**Purpose**: Remove the whole family of redundant Agent-authored mechanics
before another model run instead of patching the first V19 validation failure.

- [x] T038 Backfill the approved three-outcome Inventory contract into current high/low-level docs, Capability 046 spec/plan/data model/contract/decision and requirements `AB-INGEST-018` plus `AB-BENCH-077`
- [x] T039 [US3] Replace private caller IDs, repeated output parents, item evidence lists and separate QuestionPlan linking with MCP normalization in `src/app/codebase-memory-mcp/okf-schema-tools.ts` and `src/core/knowledge/discovery.ts`
- [x] T040 [US3] Update Receipt authoring/activity consumers and existing focused fixtures for mixed materialized outputs, shared candidates, ignored P0 and nested Question evidence in `src/app/hub-okf/` and `src/app/codebase-memory-mcp/discovery-session.test.ts`
- [x] T041 [US5] Update the released Initial Ingest skill and add immutable V20 qualification identity in `.agents/skills/agentbase-ingest/SKILL.md`, `benchmark/prompts/okf-author-v20.md`, the qualification manifest and benchmark harness tests
- [x] T042 [US5] Run specification/focused/full gates, then one V20 Sol probe and conditional sequential replica; record the result in `specs/046-initial-ingest-discovery/verification.md`

---

## Phase 11: Evidence-based embedded materialization after V20

**Purpose**: Remove exact prose matching from Receipt materialization without
weakening source truth.

- [x] T043 Backfill V20's embedded identity-hint failure into high/low-level docs, Capability 046 artifacts and requirements `AB-INGEST-019` plus `AB-BENCH-078`
- [x] T044 [US3] Validate embedded output by exact candidate-owned Receipt evidence in its resolved parent and prove renamed labels pass while missing evidence fails in `src/app/hub-okf/authoring/authoring-session.ts` and `src/app/hub-okf/authoring/receipt-authoring.test.ts`
- [x] T045 [US5] Add immutable V21 qualification identity, run the complete gate, then one Sol probe and conditional sequential replica; record the result in `specs/046-initial-ingest-discovery/verification.md`

---

## Phase 12: Receipt-owned embedded restoration after V21

**Purpose**: Stop spending Agent repair on a deterministic prepared embedded row.

- [x] T046 Backfill V21's dropped-row failure into high/low-level docs, Capability 046 artifacts and requirements `AB-INGEST-020` plus `AB-BENCH-079`
- [x] T047 [US3] Preserve evidence-bearing embedded rows and restore only missing canonical rows from the frozen Receipt before Finalize validation, with end-to-end coverage in `src/app/hub-okf/authoring/`
- [x] T048 [US5] Add immutable V22 qualification identity, run the complete gate, then one Sol probe and conditional sequential replica; record the result in `specs/046-initial-ingest-discovery/verification.md`
- [x] T049 Backfill the latent unmapped embedded-candidate contradiction into high/low-level docs, Capability 046 artifacts and requirement `AB-SCHEMA-051`
- [x] T050 [US3] Keep explicit embedded parent/evidence authoritative when technology mapping is absent and cover semantic provider-neutral rendering in `src/core/knowledge/schemas/guidance.ts` and its tests

---

## Dependencies & execution order

```text
Setup T001
  → Foundation T002
  → US1 exact source T003–T007
  → US2 deterministic Seed T008–T013
  → US3 receipt-bound proposal T014–T022
  → US4 Batch integration T023–T025
  → US5 skills/qualification T026–T030
  → Closeout T031–T032
```

- US1 is independently testable source infrastructure, but does not close the
  product omission by itself.
- US2 depends on US1's exact armed analysis root.
- US3 depends on US2's stable Seed and is the smallest complete single-repository
  Capability 046 release slice.
- US4 depends on the complete per-repository US1–US3 contract.
- US5 qualifies US1–US4 through the real released skill.
- Tasks are intentionally sequential to preserve the owner's chosen execution
  model and avoid shared-file conflicts.

## Implementation strategy

### Smallest complete release slice

Complete Setup + Foundation + US1 + US2 + US3, then stop at the offline gate.
This is the first point where Initial Ingest fixes the measured omission without
leaving a legacy bypass. Do not release US1 or US2 alone as Capability 046.

### Incremental completion

1. Prove safe exact source selection.
2. Prove deterministic Seed visibility without changing query/Refresh behavior.
3. Cut new Init over to Receipt-bound authoring and validate a single repo.
4. Reuse the exact member contract in Batch.
5. Update skills and qualify through one Sol probe; run the replica only when
   useful.

## Format validation

Every task uses `- [ ] TNNN`, story tasks carry `[USN]`, and every task names the
files or directories it owns. No speculative UI, database, daemon, model router,
new public tool or exact concept quota is included.
