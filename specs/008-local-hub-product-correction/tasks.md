# Tasks: Local-First AgentBase Product Correction

**Input**: Design documents under `specs/008-local-hub-product-correction/`

**Tests**: Requirement-linked tests are mandatory because the feature changes Git lifecycle, recovery, schemas, local knowledge visibility and repository migration.

## Phase 1: Product and ownership setup

- [x] T001 Update module ownership for new local Hub/query files in `scripts/module-boundaries.json`
- [x] T002 [P] Add corrected AB-PRODUCT, AB-LOCAL-HUB, AB-SCHEMA, AB-QUERY and AB-MIGRATION living requirements in `docs/specs/agentbase-hub.md`, `docs/specs/okf-schema-catalog.md` and a new `docs/specs/product-identity.md`
- [x] T003 [P] Replace superseded temporary-workspace language in `README.md`, `docs/ARCHITECTURE.md`, `docs/roadmap.md` and `docs/handoff.md`
- [x] T004 Add active naming checks that reject accidental product identities while allowing historical evidence in `scripts/check-specs.mjs` and `scripts/check-specs.test.mjs`

## Phase 2: Foundational local Hub and schema contracts

- [x] T005 [P] Define local Hub identity, owner lock, proposal trailers, pending ancestry, publication and synchronization transitions in `src/core/hub/local-state.ts`, `src/core/hub/proposal.ts` and `src/core/hub/index.ts`
- [x] T006 [P] Add provider-neutral contract tests for accepted/pending/published/conflict/recovery transitions in `src/core/hub/local-state.test.ts` and `src/core/hub/proposal.test.ts`
- [x] T007 [P] Replace the generic producer catalog with common internal rules and concrete catalog 2.0 types in `src/core/knowledge/schema-catalog.ts`
- [x] T008 [P] Add selection-specificity, repeated-instance guidance, no-placeholder and unknown-type preservation tests in `src/core/knowledge/schema-catalog.test.ts`
- [x] T009 Define bounded local OKF search/read contracts in `src/core/knowledge/hub-query.ts`, `src/core/knowledge/hub-query.test.ts` and `src/core/knowledge/index.ts`
- [x] T010 Extend bounded Git primitives for exact local ref transactions, candidate worktrees and proposal trailers in `src/providers/github-hub/git-process.ts` and `src/providers/github-hub/index.ts`
- [x] T011 Add wrong-ref, dirty-tree, concurrent-lock, symlink, cancellation, output-bound and token-canary tests for new Git primitives in `src/providers/github-hub/git-process.test.ts`

## Phase 3: User Story 1 — Accept and query local OKF (P1)

**Goal**: Reviewed knowledge becomes one local-main commit and is immediately queryable with zero remote mutation.

**Independent Test**: Accept a fixture proposal against a disposable local Hub, prove one local commit/no remote change, then search/read its pending concept.

- [x] T012 [P] [US1] Add persistent clone admission and clean local-main tests in `src/app/hub-okf/local-hub.test.ts`
- [x] T013 [P] [US1] Add exact reviewed-tree accept, commit-trailer, no-network and failure atomicity tests in `src/app/hub-okf/accept.test.ts`
- [x] T014 [P] [US1] Add pending-only local Hub search/read and unaccepted-workspace exclusion tests in `src/app/hub-okf/query.test.ts`
- [x] T015 [US1] Implement persistent local Hub admission in `src/app/hub-okf/local-hub.ts` and route configuration through `src/app/hub-okf/configuration.ts`
- [x] T016 [US1] Implement reviewed proposal acceptance to local `main` in `src/app/hub-okf/accept.ts` and atomic state persistence in `src/app/hub-okf/proposal-state.ts`
- [x] T017 [US1] Implement active-tree Hub search/read composition in `src/app/hub-okf/query.ts`
- [x] T018 [US1] Expose accept/search/read MCP and CLI actions in `src/app/hub-okf/mcp-tools.ts`, `src/app/hub-okf/cli.ts`, `src/app/hub-okf/runtime-actions.ts` and `src/cli.ts`
- [x] T019 [US1] Add local acceptance/query journey (covered by the real-Git journey in `src/app/hub-okf/accept.test.ts`)

## Phase 4: User Story 2 — Author concrete evidence-selected concepts (P2)

**Goal**: AgentBase-MCP selects specific useful OKF concept types from evidence and never creates catalog-shaped placeholders.

**Independent Test**: Two Lambda, one SQS and one server fixture selects concrete schemas, supports repeated files and creates no unused-type output.

- [x] T020 [P] [US2] Update schema MCP list/read/select/validate contracts and tests in `src/app/codebase-memory-mcp/okf-schema-tools.ts` and `src/app/codebase-memory-mcp/okf-schema-tools.test.ts`
- [x] T021 [P] [US2] Add concrete schema validation fixtures for Repository, Service, Server, API Endpoint, Event, Database Table, Queue, AWS Lambda, AWS SQS Queue, Terraform Module, Business Flow and Cross-Repository Relationship under `fixtures/okf-schema-catalog/`
- [x] T022 [US2] Implement specificity-ranked evidence selection and limitation guidance in `src/core/knowledge/schema-catalog.ts`
- [x] T023 [US2] Update Hub prepare/finalize validation for catalog 2.0 and multiple same-type concepts in `src/app/hub-okf/prepare.ts`, `src/app/hub-okf/refresh.ts` and `src/app/hub-okf/authoring-session.ts`
- [x] T024 [US2] Add an end-to-end concrete AWS/server authoring rehearsal in `src/app/hub-okf/concrete-schema-e2e.test.ts`

## Phase 5: User Story 3 — Publish selected pending proposals (P3)

**Goal**: List ordered pending commits and publish one selected contiguous prefix through exactly one branch and PR.

**Independent Test**: Accept four proposals from three sources, publish the first three to a disposable remote/fake API, and retain the fourth locally.

- [x] T025 [P] [US3] Add pending ancestry, metadata and dependency-safe prefix tests in `src/app/hub-okf/pending.test.ts`
- [x] T026 [P] [US3] Add multi-proposal exact-branch/one-PR, drift, bad-selection and retry tests in `src/app/hub-okf/publish.test.ts`
- [x] T027 [US3] Implement ancestry-derived pending inventory in `src/app/hub-okf/pending.ts`
- [x] T028 [US3] Replace one-workspace submit with contiguous-prefix publication in `src/app/hub-okf/publish.ts` and adapt `src/app/hub-okf/recovery.ts`
- [x] T029 [US3] Expose list/submit-many contracts through `src/app/hub-okf/mcp-tools.ts`, `src/app/hub-okf/cli.ts` and `src/app/hub-okf/runtime-actions.ts`
- [x] T030 [US3] Add four-proposal, three-source publication acceptance (covered in `src/app/hub-okf/publish.test.ts`)

## Phase 6: User Story 4 — Synchronize after collaboration (P4)

**Goal**: Recognize merged proposals and transactionally rebase remaining pending knowledge without loss.

**Independent Test**: Exercise merge recognition, contributor drift, clean rebase, conflict and interrupted recovery against disposable Git repositories.

- [x] T031 [P] [US4] Add merge/trailer/patch-identity recognition tests in `src/app/hub-okf/synchronize.test.ts`
- [x] T032 [P] [US4] Add conflict, cancellation and each transaction checkpoint recovery test in `src/app/hub-okf/synchronization-recovery.test.ts`
- [x] T033 [US4] Implement fetch/recognize/candidate-rebase/validate/advance transaction in `src/app/hub-okf/synchronize.ts`
- [x] T034 [US4] Extend recovery dispatch for synchronization manifests in `src/app/hub-okf/recovery.ts` and `src/app/hub-okf/proposal-state.ts`
- [x] T035 [US4] Expose synchronize/recover contracts through `src/app/hub-okf/mcp-tools.ts`, `src/app/hub-okf/cli.ts` and `src/app/hub-okf/runtime-actions.ts`
- [x] T036 [US4] Add real-Git clean and conflicting synchronization journeys (covered in `src/app/hub-okf/synchronization-recovery.test.ts`)

## Phase 7: User Story 5 — Use official product repositories (P5)

**Goal**: Establish canonical AgentBase-MCP and AgentBase-Hub working directories without damaging current repositories, then separately cut over external identity/configuration after approval.

**Independent Test**: Run preflight and additive migration against disposable dirty sources/colliding targets; verify sources remain unchanged and canonical targets are independent.

- [x] T037 [P] [US5] Add migration preflight, collision, dirty-source preservation and independent-Git-state tests in `scripts/migrate-product-repositories.test.mjs`
- [x] T038 [US5] Implement report-first additive canonical directory migration in `scripts/migrate-product-repositories.mjs`
- [x] T039 [US5] Add exact launcher/remotes/rollback qualification steps to `specs/008-local-hub-product-correction/quickstart.md` and `README.md`
- [x] T040 [US5] After owner approval, stabilize the current source commit and create `/home/khoa/workspace/AgentBase/AgentBase-MCP` without deleting or modifying `/home/khoa/workspace/AgentBase/agentbase-next`
- [x] T041 [US5] After T042 admits the official remote, clone it into `/home/khoa/workspace/AgentBase/AgentBase-Hub` without modifying `/home/khoa/workspace/AgentBase/agentbase-hub`
- [x] T042 [US5] With separate external approval, create/rename GitHub repositories, update canonical remotes and repoint the installed MCP while recording exact rollback values

## Phase 8: Hub data correction and closure

- [x] T043 Prepare, inspect and locally accept a governed deletion of qualification-only `repositories/agentbase-next` from AgentBase-Hub without inventing replacement product knowledge
- [x] T044 With separate owner authorization, publish the Hub data-correction commit through one PR and record exact refs/receipt in `specs/008-local-hub-product-correction/verification.md`
- [x] T045 [P] Update the coding-agent MCP guidance so code questions prefer Code Graph and business/system questions prefer local Hub in `.agents/skills/use-codebase-memory/SKILL.md` and relevant README sections
- [x] T046 Run focused core/provider/app/migration suites and token/naming audits; record results in `specs/008-local-hub-product-correction/verification.md`
- [x] T047 Run every quickstart journey and `npm run verify`, reconcile FR-001..025 and SC-001..008, then close `specs/CURRENT.md` only when no implementation or authorized migration task remains

## Phase 9: User Story 6 — Prepare a local multi-client installation (P1)

**Goal**: Prepare the checkout and one optional global Hub credential while
truthfully deferring Codex and Claude Code MCP registration.

**Independent Test**: Exercise all client selections and credential lifecycle
paths against disposable config/client homes; prove masked feedback, exact
permissions/runtime admission and zero client-config mutation.

- [x] T048 [P] [US6] Add global credential path, parse, precedence, permission, symlink and redaction tests in `src/app/hub-okf/credential-file.test.ts` and `src/app/hub-okf/configuration.test.ts`
- [x] T049 [P] [US6] Add installer multi-selection, masked paste/backspace/interrupt, non-interactive, preservation and replacement tests in `scripts/install.test.mjs`
- [x] T050 [US6] Implement exact global credential admission in `src/app/hub-okf/credential-file.ts` and compose it privately in `src/app/hub-okf/configuration.ts`
- [x] T051 [US6] Implement the testable installer interaction, atomic credential writer and deferred-client summary in `scripts/install.mjs`
- [x] T052 [US6] Add the stable executable entrypoint and repository dependency preparation in `install.sh` without client configuration mutation
- [x] T053 [US6] Document installation, local-only skip, explicit replacement and deferred client registration in `README.md` and `specs/008-local-hub-product-correction/quickstart.md`
- [x] T054 [US6] Run focused installer/runtime security journeys and `npm run verify`, then record FR-020..025 and SC-008 evidence in `specs/008-local-hub-product-correction/verification.md`
- [x] T055 [US6] After owner runs the interactive installer, resume separately authorized T044 publication without reading or logging the token

## Dependencies and execution order

- T001–T011 establish ownership and provider-neutral foundations.
- US1 is the smallest useful product correction and blocks US3/US4.
- US2 can proceed after foundations and may run alongside US1.
- US3 depends on accepted local commits from US1.
- US4 depends on pending/publication identity from US3.
- US5 code/preflight can begin after foundations. T040 requires the application
  to be green and owner approval; T042 then admits the official GitHub identity
  before T041 can clone the canonical Hub. External and launcher changes retain
  separate owner approval.
- Hub data correction uses the corrected local lifecycle; T044 is separately authorized and never implicit in offline verification.
- US6 may be implemented independently of Hub content, but T048–T054 must
  complete before the interactive credential run and T044 publication. T047
  remains the final closure task despite its earlier stable task ID.

## Parallel opportunities

- Core state, schema catalog and Git primitive tests (T006, T008, T011) touch separate owners.
- US1 acceptance and query test drafting (T013, T014) are parallel before composition.
- US2 schema fixtures and MCP contract tests (T020, T021) are parallel.
- US3 pending and publication tests (T025, T026) are parallel.
- US4 recognition and recovery tests (T031, T032) are parallel.
- Migration rehearsal (T037–T039) is independent of real external cutover.
- Installer credential/runtime tests (T048, T049) touch separate owners and may
  be drafted in parallel before their implementation tasks.

## Implementation strategy

1. Deliver local accept/query first; it provides value without GitHub.
2. Correct schema specificity and prove useful multi-concept authoring.
3. Add batch publication without changing local visibility.
4. Add transactional synchronization/recovery.
5. Qualify naming migration additively, then request separate approval for filesystem, GitHub and launcher cutovers.
6. Correct current Hub data through the new governed lifecycle, not by direct remote-main editing.
7. Add the honest installer slice, then use its explicit credential setup to
   unblock the already-authorized Hub publication checkpoint.
