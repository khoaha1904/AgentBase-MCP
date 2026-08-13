# Tasks: AgentBase Hub PR Lifecycle

**Input**: Design documents under `specs/007-agentbase-hub-pr-lifecycle/`

**Tests**: Security, recovery and exact external-state tests are mandatory.

## Phase 1: Setup and provider-neutral contracts

- [x] T001 Add Hub capability ownership entries for `src/core/hub`, `src/providers/github-hub` and `src/app/hub-okf` in scripts/module-boundaries.json
- [x] T002 [P] Define AB-HUB identity, proposal phase and publication receipt tests in src/core/hub/identity.test.ts and src/core/hub/proposal.test.ts
- [x] T003 Implement immutable Hub configuration, proposal and transition contracts in src/core/hub/identity.ts, src/core/hub/proposal.ts and src/core/hub/index.ts

## Phase 2: User Story 1 - Prepare and review new Hub proposal (Priority: P1)

**Goal**: Produce a complete local `new` OKF diff from an exact private Hub base with zero remote writes.

**Independent Test**: Prepare against a disposable bare remote and verify exact base/evidence/schema/tree identities, absent remote branch changes and no token leakage.

- [x] T004 [P] [US1] Add sanitized Git environment, remote admission, hooks/submodule/URL-rewrite and token-canary tests in src/providers/github-hub/git-process.test.ts
- [x] T005 [US1] Implement bounded Git process and memory-only askpass authentication in src/providers/github-hub/git-process.ts and src/providers/github-hub/index.ts
- [x] T006 [P] [US1] Add fixed configuration, private checkout and no-remote-write tests in src/app/hub-okf/configuration.test.ts and src/app/hub-okf/checkout.test.ts
- [x] T007 [US1] Implement fixed Hub configuration admission and private clone/worktree ownership in src/app/hub-okf/configuration.ts and src/app/hub-okf/checkout.ts
- [x] T008 [P] [US1] Add `new` precondition, sparse schema selection, locked diff and failure tests in src/app/hub-okf/prepare.test.ts
- [x] T009 [US1] Implement `new` preparation by composing observations, schema catalog and OKF proposal policy in src/app/hub-okf/prepare.ts and src/app/hub-okf/index.ts

## Phase 3: User Story 2 - Prepare non-destructive refresh (Priority: P2)

**Goal**: Refresh existing Hub knowledge without implicit destruction.

**Independent Test**: Refresh a bundle with reviewed/unknown/generated concepts and verify protected byte preservation plus explicit conflicts/supersessions/deletions.

- [x] T010 [P] [US2] Add refresh precondition, protected-byte, unknown-field and anti-feedback tests in src/app/hub-okf/refresh.test.ts
- [x] T011 [US2] Implement refresh preparation and visible lifecycle classifications in src/app/hub-okf/refresh.ts and src/app/hub-okf/prepare.ts
- [x] T012 [US2] Extend full proposal inspection for created/modified/preserved/conflict/supersession/prohibited deletion in src/app/hub-okf/inspect.ts and src/app/hub-okf/inspect.test.ts

## Phase 4: User Story 3 - Submit exactly one reviewed PR (Priority: P3)

**Goal**: Push one immutable proposal branch and open or recover one exact PR.

**Independent Test**: Submit through a disposable Git remote/fake API, simulate drift and every failure phase, and prove exact idempotent recovery without target writes or force push.

- [x] T013 [P] [US3] Add GitHub API repository/ref/PR identity, token-redaction and permission-failure tests in src/providers/github-hub/github-api.test.ts
- [x] T014 [US3] Implement bounded GitHub REST adapter with exact response admission in src/providers/github-hub/github-api.ts and src/providers/github-hub/index.ts
- [x] T015 [P] [US3] Add proposal revalidation, deterministic commit, non-force push and forbidden-target tests in src/app/hub-okf/submit.test.ts
- [x] T016 [US3] Implement exact reviewed proposal commit/push/PR state machine in src/app/hub-okf/submit.ts
- [x] T017 [P] [US3] Add push-success/PR-failure, exact-existing-PR, conflict and cancellation recovery tests in src/app/hub-okf/recovery.test.ts
- [x] T018 [US3] Implement idempotent publication recovery and receipt validation in src/app/hub-okf/recovery.ts
- [x] T019 [US3] Expose prepare/inspect/submit/recover through fixed-authority MCP tools in src/app/hub-okf/mcp-tools.ts and src/app/hub-okf/mcp-tools.test.ts
- [x] T020 [US3] Route the explicit Hub CLI command family without token/remote arguments in src/app/hub-okf/cli.ts, src/app/hub-okf/cli.test.ts and src/cli.ts

## Phase 5: Documentation, qualification and closure

- [x] T021 Add current AB-HUB-001..015 requirements in docs/specs/agentbase-hub.md and route them from AGENTS.md and docs/handoff.md
- [x] T022 Update operator configuration, prepare/review/submit/recover usage and explicit non-goals in README.md and specs/007-agentbase-hub-pr-lifecycle/quickstart.md
- [x] T023 Run focused core/provider/app suites, architecture checks and token-canary audit; record results in specs/007-agentbase-hub-pr-lifecycle/verification.md
- [x] T024 Run disposable local end-to-end new/refresh/submit/recovery acceptance with zero real GitHub mutation and record exact evidence in specs/007-agentbase-hub-pr-lifecycle/verification.md
- [x] T025 Run npm run verify, reconcile every AB-HUB requirement/task, and close specs/CURRENT.md only when all offline evidence is green
- [x] T026 With separate owner authorization only, run one real disposable/private-Hub qualification and append its exact branch/PR/cleanup evidence to specs/007-agentbase-hub-pr-lifecycle/verification.md

## Phase 6: Convergence

- [x] T027 Persist and validate a normalized source repository identity in every Hub proposal per FR-005 / AB-HUB-005 (partial)
- [x] T028 Reject repository-local Git URL rewrites before Hub fetch or push per FR-004 / AB-HUB-004 (partial)
- [x] T029 Revalidate the effective checkout origin and deterministic non-target proposal branch immediately before publication per FR-009 and FR-010 / AB-HUB-009..010 (partial)
- [x] T030 Admit the exact GitHub PR head repository as well as branch, commit and base identity per FR-013 / AB-HUB-013 (partial)
- [x] T031 Add bounded cancellation propagation and recovery tests across Git and submit phases per FR-014 / AB-HUB-014 (partial)
- [x] T032 Wire an operational production Hub action composition for the registered MCP and CLI surfaces, or obtain an owner-approved contract adjustment if host authoring cannot satisfy the current one-call prepare contract, per US1, US2, T019 and T020 (partial)

## Dependencies and Execution Order

- T001–T003 establish the provider-neutral contract.
- US1 (T004–T009) is the independently useful non-publishing MVP.
- US2 (T010–T012) depends on US1 checkout/proposal composition.
- US3 (T013–T020) depends on immutable proposals from US1/US2.
- T021–T025 close offline implementation. T026 remains separately authorized and does not block offline correctness unless the owner makes real qualification part of release approval.

## Parallel Opportunities

- Core contract tests (T002), Git boundary tests (T004) and configuration tests (T006) touch separate owners after T001.
- Refresh tests (T010) can be drafted while US1 implementation stabilizes.
- GitHub API tests (T013), submission tests (T015) and recovery tests (T017) cover separate files after proposal contracts settle.

## Implementation Strategy

1. Deliver and verify local `new` preparation first with no remote mutation.
2. Add non-destructive `refresh` and re-run preservation evidence.
3. Add credentialed submit/recovery only after the local proposal contract is immutable.
4. Stop before any real GitHub operation until separately authorized.
