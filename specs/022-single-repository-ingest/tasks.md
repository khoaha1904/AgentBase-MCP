# Tasks: Single-Repository Initial Ingest

**Input**: Design documents from `/specs/022-single-repository-ingest/`

**Tests**: Requirement-linked unit, contract and integration tests are required
before each behavior becomes current. Real model qualification remains opt-in.

## Phase 1: Contract foundation

**Purpose**: Establish the evidence-bearing types and version boundaries shared
by identity, guidance and authoring without adding a workflow framework.

- [x] T001 Define bounded candidate, semantic/resource observation, mapping-version and Initial Ingest outcome contracts for AB-INGEST-003/005/007 and AB-SCHEMA-031/034 in `src/app/repository-okf/workflow/initial-ingest.ts` and `src/core/knowledge/schemas/guidance.ts`
- [x] T002 Export only the new shared contracts through `src/app/repository-okf/index.ts` and `src/core/knowledge/index.ts`, then prove dependency direction with `npm run depcruise`

---

## Phase 2: User Story 1 — Confirm repository and Domain (Priority: P1) 🎯 MVP

**Goal**: Resolve one authorized checkout to one durable Hub Repository identity
and present evidence-backed Domain confirmation before graph investigation.

**Independent Test**: A fixture proves new assignment, stored-alias reuse,
rename/organization transfer, Domain mismatch and ambiguous fork outcomes with
no proposal or Hub mutation during preflight.

- [x] T003 [P] [US1] Add failing AB-INGEST-001 and AB-LOCAL-HUB-016 source-hint/rename/fork cases in `src/app/repository-okf/evidence/source-state.test.ts` and `src/core/knowledge/governance/repository-identity.test.ts`
- [x] T004 [US1] Refactor checkout discovery to expose source state plus non-canonical identity hints without deriving the Hub ID from the current path/name/remote in `src/app/repository-okf/evidence/source-state.ts` and `src/core/observations/repository-evidence.ts`
- [x] T005 [US1] Implement strong-alias matching, initial canonical ID assignment and ambiguous lineage outcomes in `src/core/knowledge/governance/repository-identity.ts`
- [x] T006 [US1] Integrate canonical Repository resolution and bounded active Domain summaries through the Hub query/prepare public boundary in `src/app/hub-okf/query/query.ts`, `src/app/hub-okf/query/runtime-actions.ts` and `src/app/hub-okf/mcp/`
- [x] T007 [US1] Add AB-INGEST-002 MCP/Hub integration coverage for existing/new/ambiguous Domain and Repository preflight in `src/app/hub-okf/query/runtime-actions.test.ts` and `src/app/codebase-memory-mcp/server.test.ts`
- [x] T008 [US1] Author the bounded README/docs inspection, mismatch warning and explicit confirmation stage in `.agents/skills/agentbase-ingest/SKILL.md` and its minimal routed reference file

**Checkpoint**: Preflight can be demonstrated independently and cannot start
authoring, Accept or Publish.

---

## Phase 3: User Story 2 — Produce a sparse evidence-backed proposal (Priority: P1)

**Goal**: Turn qualified exact evidence into one provider-neutral catalog 6.0
proposal preview without copying source/graph or invoking a provider CLI.

**Independent Test**: A representative application/Terraform fixture produces
generic Function/Queue/Server guidance, exact-source claims and one valid
inspection with no Accept/Publish/network event.

- [x] T009 [P] [US2] Replace catalog expectations with failing AB-SCHEMA-030/035 coverage for all 22 roles, generic Server meaning, `runs-on`, retired AgentBase types and foreign unknown types in `src/core/knowledge/schemas/catalog.test.ts` and `src/core/knowledge/documents/okf-relationships.test.ts`
- [x] T010 [US2] Cut schema definitions over to catalog `6.0.0`, add Function/Database/Object Storage/Infrastructure Module, remove vendor/source-tool types and update canonical relation targets in `src/core/knowledge/schemas/definitions/`, `src/core/knowledge/schemas/definition.ts`, `src/core/knowledge/schemas/catalog.ts` and `src/core/knowledge/documents/relationship-vocabulary.ts`
- [x] T011 [P] [US2] Add failing AB-SCHEMA-031..034 fixtures for AWS six-product mapping and Terraform exact/ambiguous/unsupported normalization in `src/core/knowledge/schemas/guidance.test.ts`
- [x] T012 [US2] Implement versioned profile data and deterministic one-call mapping in `src/core/knowledge/schemas/profiles/definition.ts`, `src/core/knowledge/schemas/profiles/aws.ts`, `src/core/knowledge/schemas/profiles/terraform.ts` and `src/core/knowledge/schemas/guidance.ts`
- [x] T013 [US2] Replace source-less authoring signals with the bounded evidence-bearing guidance request/response and retired-type diagnostics in `src/app/codebase-memory-mcp/okf-schema-tools.ts` and `src/app/codebase-memory-mcp/okf-schema-tools.test.ts`
- [x] T014 [P] [US2] Add failing AB-CLAIM-005 cases for optional small snapshots, provenance, non-current semantics, unknown fields, multiline/large and secret-like rejection in `src/core/knowledge/governance/live-claims.test.ts`
- [x] T015 [US2] Extend live-claim observation parsing/validation with the optional bounded snapshot contract in `src/core/knowledge/governance/live-claims.ts`
- [x] T016 [US2] Bind canonical Repository identity, confirmed Domain, evidence-bearing recommendations and catalog/profile provenance into the isolated new-proposal session in `src/app/hub-okf/authoring/authoring-session.ts`, `src/app/hub-okf/authoring/prepare.ts`, `src/app/hub-okf/mcp/mcp-tool-actions.ts` and `src/app/hub-okf/mcp/mcp-tools.ts`
- [x] T017 [US2] Update the OKF authoring subworkflow and complete the Discover/Investigate/Author/Validate routes with both candidate gates, one Hub match pass and proposal-preview stop in `.agents/skills/agentbase-okf/` and `.agents/skills/agentbase-ingest/`
- [x] T018 [US2] Update existing schema/Hub/benchmark offline fixtures atomically from vendor/source-tool types and `signals` to generic types and evidence observations in `src/app/hub-okf/`, `scripts/benchmark/` and `scripts/checks/check-skills.test.mjs`
- [x] T019 [US2] Add an AB-INGEST-004..006/008 end-to-end offline proposal preview scenario in `src/app/hub-okf/authoring/initial-ingest.test.ts`

**Checkpoint**: One supported repository produces a valid sparse preview with
no automatic state transition beyond immutable proposal creation.

---

## Phase 4: User Story 3 — Finish safely with partial evidence (Priority: P2)

**Goal**: Preserve valid sparse output when coverage is limited and fail closed
when source integrity, cleanup or proposal safety is uncertain.

**Independent Test**: Unsupported coverage yields a partial valid preview;
source mutation, cleanup uncertainty and exhausted repair yield distinct
Incomplete results that cannot be accepted.

- [x] T020 [P] [US3] Add failing AB-INGEST-007 partial/no-change/Incomplete transition and one-repair-budget cases in `src/app/repository-okf/workflow/initial-ingest.test.ts`
- [x] T021 [US3] Implement deterministic Initial Ingest outcome validation and repair-count guards without persistent candidate/run storage in `src/app/repository-okf/workflow/initial-ingest.ts`
- [x] T022 [US3] Preserve recoverable graph coverage limitations while retaining fail-closed source mutation/provider cleanup behavior in `src/app/repository-okf/evidence/prepare-evidence.ts`, `src/app/repository-okf/graph/graph-round.ts` and their focused tests
- [x] T023 [US3] Carry partial coverage, known limitations and Incomplete diagnostics through proposal preparation/inspection without authorizing Accept in `src/app/hub-okf/authoring/authoring-session.ts`, `src/app/hub-okf/review/inspect.ts` and `src/app/hub-okf/authoring/initial-ingest.test.ts`
- [x] T024 [US3] Encode the single repair, explicit retry and no-progress stop rules in `.agents/skills/agentbase-ingest/SKILL.md` and enforce them in `scripts/checks/check-skills.test.mjs`

**Checkpoint**: Partial knowledge and unsafe failure are mechanically distinct;
neither missing evidence nor a second automatic reasoning loop is hidden.

---

## Phase 5: Close capability

**Purpose**: Make the implemented Initial Ingest behavior current exactly once
and record reproducible evidence.

- [x] T025 Update `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `docs/contracts/okf.md`, `docs/contracts/hub.md`, `docs/README.md`, `.agents/skills/README.md` and `scripts/checks/check-specs.mjs` with accepted AB-INGEST-001..009, AB-SCHEMA-030..035, AB-CLAIM-005 and AB-LOCAL-HUB-016 behavior
- [x] T026 Run the focused quickstart plus `npm run verify`, fix only requirement-linked failures and record exact offline evidence in `specs/022-single-repository-ingest/verification.md`
- [ ] T027 After separate owner authorization and usable account confirmation, run exactly three opt-in representative Ingest benchmarks and append validity/reviewability/timing evidence to `specs/022-single-repository-ingest/verification.md`; do not rebuild or publish a Hub PR
- [ ] T028 Mark capability 022 completed in `specs/022-single-repository-ingest/spec.md` and `specs/CURRENT.md` only after every required task, offline gate and authorized qualification pass; otherwise retain `implemented — external qualification pending`

---

## Dependencies & Execution Order

- T001–T002 establish shared contracts and block all user-story implementation.
- US1 runs T003 → T004/T005 → T006/T007 → T008.
- After T002, catalog/profile tests T009 and T011 plus snapshot test T014 can be
  prepared independently; implementation follows T010 → T012/T13 and T15.
- T016 depends on US1 identity resolution and US2 guidance/snapshot contracts.
- T017–T019 complete the first full proposal flow after T016.
- US3 follows the working proposal flow: T020 → T021/T022 → T023/T024.
- T025–T026 require all offline story checkpoints. T027 is separately
  authorized external qualification and never blocks deterministic application
  implementation, but T028 keeps the capability open until that accepted
  success criterion is evidenced.

## Parallel Opportunities

- T003, T009, T011 and T014 touch separate owners and may be authored in
  parallel after the shared type contract is stable.
- T012 profile data and T015 snapshot parsing are independent after their tests.
- T008 preflight prose and T009 catalog tests are independent, but implementation
  remains sequential at integration boundaries to avoid artificial merge work.

## Implementation Strategy

1. Make Repository/Domain preflight independently correct.
2. Replace catalog selection at its core owner and prove mapping contracts.
3. Connect the existing graph and Hub proposal boundaries through the skill.
4. Add partial/Incomplete outcome handling and one repair ceiling.
5. Update living contracts only when behavior and focused tests pass, then run
   the complete offline gate.

No compatibility converter, workflow engine, candidate database, provider SDK,
cloud CLI integration, Batch, Refresh or freshness report is added in this
capability.
