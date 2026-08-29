# Tasks: AgentBase CLI Surface and Hub Connect

**Input**: Design documents from `specs/057-hub-profile-connect/`

## Phase 1: Setup

- [x] T001 Record owner approval for the three-command `abs` surface and the
  connect credential/recovery boundary in `spec.md`.

## Phase 2: Foundational regression coverage

- [x] T002 [US1] Add failing tests for `abs --help`, public dispatch, compact
  status, explicit sync and hidden internal routes in `src/cli.test.ts` (or the
  existing CLI test file).
- [x] T003 [US2] Add failing tests for masked token entry, blank-input reuse,
  replacement-token rollback, prior-profile preservation, token redaction and
  absence of implicit sync in the Hub CLI tests.

**Checkpoint**: Tests describe the complete public-surface and one-command
security/recovery contract before runtime mutation.

## Phase 3: User Story 1 — Understand and use the small CLI (Priority: P1)

- [x] T004 [US1] Implement `abs` help and dispatch for `status`, `hub connect`
  and `hub sync`; omit `okf`, proposal, benchmark and `mcp` from help while
  retaining hidden compatibility routes in `src/cli.ts`.
- [x] T005 [US1] Expose the existing dispatcher as the `abs` package executable
  in `package.json`; do not add a wrapper or second implementation.

## Phase 4: User Story 2 — Connect or switch Hub once (Priority: P1)

- [x] T006 [US2] Implement masked shared-token entry/reuse and reported-failure
  rollback in the existing Hub orchestration; do not invoke GitHub CLI or accept
  token arguments.
- [x] T007 [US2] Update `.agents/skills/agentbase-hub/SKILL.md` and `README.md`
  to use the public `abs` flow and identify lifecycle commands as internal.

## Phase 5: Completion gate

- [x] T008 Run focused CLI/Hub tests and verify the secret fixture appears in no
  output, error, Git configuration or repository file.
- [x] T009 Run `npm run spec:check`, `npm run depcruise`, `git diff --check` and
  `npm run verify` from the repository root.
- [x] T010 Mark capability 057 complete with exact verification evidence and
  restore the no-active-capability state in `specs/CURRENT.md`.

## Dependencies and execution order

- T001 requires owner approval and precedes implementation.
- T002–T003 must fail against the current runtime before T004–T006.
- T004–T005 establish the public surface; T006 then wires the credential-safe
  connect flow; T007 updates guidance.
- T008–T010 close only after all focused and repository gates pass.
- No parallel runtime tasks are marked because all changes touch one CLI and
  credential-sensitive boundary.

## Implementation strategy

Reuse the current dispatcher, owner-private credential root and atomic attach
action. Do not add a shell wrapper, second skill, MCP token input, GitHub CLI
lookup, login flow, crash journal, dependency or credential-provider
abstraction.
