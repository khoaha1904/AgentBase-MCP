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
- [x] T027 Close AB-INGEST-010 by persisting the owner-evidenced Repository primary-Domain edge and deriving new-proposal evidence identity from validated guidance plus exact source state
- [x] T028 Implement immutable catalog-6.0 V13 prompts and an isolated fake-tested Initial Ingest benchmark lifecycle that requires Preflight through Inspect and rejects Accept/Publish operations
- [x] T029 After separate owner authorization and usable account confirmation, run exactly three sequential representative V13 Ingest benchmarks and append validity/reviewability/timing evidence to `specs/022-single-repository-ingest/verification.md`; do not rebuild or publish a Hub PR
- [ ] T030 Mark capability 022 completed in `specs/022-single-repository-ingest/spec.md` and `specs/CURRENT.md` only after every required task, offline gate and authorized qualification pass; otherwise retain `implemented — external qualification pending`
- [x] T031 Record and implement AB-INGEST-011 by rendering deterministic
  Concept Schema → OKF Template → editable Skeleton output during new Initial
  Ingest preparation, with focused authoring/runtime coverage
- [x] T032 Update the Ingest/OKF skills and current OKF contract, run the full
  offline gate and append correction evidence; do not run another model-backed
  benchmark without separate owner authorization
- [x] T033 Correct the V13 inspect schema/dispatcher drift and make changed-set
  relationship guidance follow exact frontmatter type, with focused regression
  coverage and the complete offline gate; leave model requalification pending
- [x] T034 Separate post-qualification OKF/MCP stability from benchmark-only
  scoring, expose candidate-local evidence and full-Markdown tool contracts,
  and score V13 provenance with the durable Hub Repository identity
- [x] T035 Prioritize exact supported structured mappings over incidental
  semantic role words, clarify separate evidenced System candidates and prevent
  contextual benchmark prose from creating false wrong-schema contradictions;
  verify offline without another model run
- [x] T036 Add evidence-bound `suggested_type`, exact/suggested/ambiguous
  precedence, review-limited suggested skeletons and immutable V14 benchmark
  contracts in `src/core/knowledge/schemas/guidance.ts`, MCP adapters,
  `src/app/hub-okf/authoring/initial-ingest-skeleton.ts`, product skills and
  `benchmark/prompts/`; verify offline without running a model benchmark
- [x] T037 After owner authorization, run exactly three sequential V14
  Health → Shopping → Health qualifications, retain the failed evidence and
  record the separate OKF/authoring and benchmark findings without Accept,
  Publish, provider CLI or Hub PR operations
- [x] T038 Update feature 022 requirements, design, MCP contract, requirement
  checklist and tasks for the owner-approved catalog-7 Detect → Promote → Render
  cutover in `specs/022-single-repository-ingest/`
- [x] T039 [US2] Replace catalog-6 authoring roles with the catalog-7 core and
  enrichment split in `src/core/knowledge/schemas/` with requirement-linked tests
- [x] T040 [US2] Separate provider technology detection from standalone
  promotion and add embedded-parent guidance in `src/core/knowledge/schemas/guidance.ts`
  and `src/app/codebase-memory-mcp/okf-schema-tools.ts`
- [x] T041 [US2] Render promoted skeletons plus bounded searchable embedded
  knowledge in `src/app/hub-okf/authoring/initial-ingest-skeleton.ts` and MCP adapters
- [x] T042 [US2] Update Ingest/OKF skills and living OKF/architecture contracts
  for Function, Component, embedded resource and VM-workload boundaries
- [x] T043 [US3] Replace V14 one-file-per-resource benchmark expectations with
  V15 required-concept/embedded-knowledge evidence in `benchmark/` and focused tests
- [x] T044 Run focused catalog/guidance/authoring/benchmark tests, `npm run verify`
  and record exact offline evidence in `verification.md`
- [x] T045 After the offline gate passes, run exactly one owner-authorized V15
  model benchmark, retain its evidence and report OKF issues separately from
  benchmark issues without Accept, Publish, provider CLI or Hub PR operations
- [x] T046 Narrow the current V15 MVP manifest and expectation set to the pinned
  Terraform fixture, retain SAM history without making it selectable, and add
  AB-BENCH-046 regression coverage
- [x] T047 Fix the V15 Flow skeleton preparation gate and failed-versus-absent
  benchmark diagnostic with AB-INGEST-011/AB-BENCH-043 regressions; retain the
  existing Terraform embedded-resource behavior without adding another detector
- [x] T048 Apply the early-development test policy across the repository: retain
  only specification flows, public design contracts, current V15/Catalog 7 and
  selected end-to-end boundaries; remove function-level, meta, routing,
  historical and exhaustive matrix coverage; verify the reduced offline suite
  without changing runtime behavior
- [x] T049 Record and finalize the owner-authorized V15 Terraform Health
  requalification; separate lifecycle success and real OKF findings from the
  mixed-source Terraform expectation mismatch without running another model
- [x] T050 Add AB-SCHEMA-040 truthful Terraform/Terragrunt source validation,
  update the Ingest contract/skill and verify offline without another model run
- [x] T051 Retain owner-authorized V15 run `2026-08-21T135125Z` and classify its
  successful Terraform provenance separately from the Flow authoring-contract
  failure; do not run a replacement benchmark
- [x] T052 Fix AB-SCHEMA-041 by publishing the exact Flow-step field shape and
  actionable malformed-step diagnostic in the existing schema contract
- [x] T053 Retain owner-authorized V15 run `2026-08-21T142407Z` and separate
  its successful Flow parsing from invalid embedded endpoints and repair
- [x] T054 Clarify AB-SCHEMA-041 Flow guidance with concept-only endpoint
  identities while preserving embedded-resource granularity
- [x] T055 Retain owner-authorized V15 run `2026-08-21T143803Z`, record its
  successful lifecycle separately from Domain/provenance and over-promotion
  owner-review findings, and do not run a replacement
- [x] T056 [US2] Record AB-SCHEMA-042 promotion evidence and AB-INGEST-012
  Domain navigation contracts in `docs/contracts/okf.md`,
  `specs/022-single-repository-ingest/contracts/initial-ingest-mcp.md` and the
  active design artifacts
- [x] T057 [US2] Enforce candidate-owned semantic promotion for standalone
  Interface/Resource guidance in `src/core/knowledge/schemas/guidance.ts` and
  `src/app/codebase-memory-mcp/okf-schema-tools.ts`, extending the existing
  guidance design test
- [x] T058 [US2] Render new Domain-to-System navigation and publish complete
  Flow provenance guidance in `src/app/hub-okf/authoring/initial-ingest-skeleton.ts`
  and `src/core/knowledge/schemas/definitions/infrastructure.ts`, extending
  existing authoring/catalog tests
- [x] T059 [US3] Implement truthful AB-BENCH-047 ratio, unjudged identity and
  final validation-coverage reporting in `scripts/benchmark/benchmark-okf.mjs`
  and `scripts/benchmark/benchmark-agent.mjs`, then make Flow optional in the
  current single-runtime expectation
- [x] T060 Run focused tests and `npm run verify`, record offline evidence,
  converge the active artifacts and do not run a model benchmark
- [x] T061 Retain owner-authorized run `2026-08-21T150816Z`, classify its
  Function promotion-field rejection as an AB-SCHEMA-042 contract-usability
  defect, permit non-authoritative promotion intent on other suggested roles
  and verify offline without a replacement run
- [x] T062 Retain replacement run `2026-08-21T151424Z`, distinguish the fixed
  role restriction from the remaining Function semantic-only restriction and
  CloudFormation source-label error, then permit non-authoritative structured
  evidence on other roles without weakening the Interface/Resource gate
- [x] T063 Retain run `2026-08-21T151815Z`, fix promotion-field drift between
  guidance and Prepare parsing in `src/app/hub-okf/mcp/mcp-tool-call.ts`, and
  extend the existing public MCP design test
- [x] T064 Record AB-BENCH-048 sequential probe/replica/acceptance policy in the
  living benchmark contract and active capability; do not parallelize runs or
  repeat a probe with a hard or obvious blocker
- [x] T065 Retain sequential probe `2026-08-21T152548Z`, manually inspect its
  scored bundle, classify duplicate generated category entries as an OKF
  authoring defect plus validator/scorer blind spot, and stop before a replica
- [x] T066 [US2] Record AB-INGEST-013, reject repeated index targets in the
  shared OKF bundle loader, clarify prepared-navigation ownership in product and
  qualification guidance, and cover the observed reproduction in the existing
  lifecycle test without adding a new test case
- [x] T067 Retain post-fix probe `2026-08-21T154146Z`, confirm duplicate
  navigation is resolved, classify optional Flow/source-selection and embedded
  coverage regression separately from lifecycle/scorer behavior, and stop
  before a replica under AB-BENCH-048
- [x] T068 [US2] Record AB-SCHEMA-043/044, require available supported IaC in
  investigation guidance, exclude the single-contained-runtime Flow case from
  released guidance and extend the existing catalog test without a new engine
  or test case
- [x] T069 Retain probe `2026-08-21T155217Z`, confirm source/Flow corrections,
  trace the missing System to source-container wording in its semantic signal,
  classify downstream Domain navigation separately and stop before a replica
- [x] T070 [US2] Add explicit invalid/valid-partial/review-ready acceptance,
  make semantic keywords diagnostic, allow sparse Domain-to-Repository
  navigation, and remove repository-specific Terraform and Flow completeness
  gates without weakening source, shape, safety or relation integrity

---

## Dependencies & Execution Order

- T001–T002 establish shared contracts and block all user-story implementation.
- US1 runs T003 → T004/T005 → T006/T007 → T008.
- After T002, catalog/profile tests T009 and T011 plus snapshot test T014 can be
  prepared independently; implementation follows T010 → T012/T13 and T15.
- T016 depends on US1 identity resolution and US2 guidance/snapshot contracts.
- T017–T019 complete the first full proposal flow after T016.
- US3 follows the working proposal flow: T020 → T021/T022 → T023/T024.
- T025–T028 require all offline story checkpoints. T029 is separately
  authorized external qualification, and T030 keeps the capability open until
  that accepted success criterion is evidenced. T033 corrects deterministic
  defects found by T029 without treating offline guidance tests as a new
  accepted model qualification. T034 corrects benchmark measurement and shared
  authoring contracts but likewise leaves model stability pending.

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
