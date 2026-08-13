# Tasks: Explicit Observation Command

## Phase 1: Contract

- [x] T001 Record owner graph and OKF authority decisions in specs/006-explicit-observation-command/spec.md
- [x] T002 [P] Record CLI contract in specs/006-explicit-observation-command/contracts/cli.md
- [x] T003 [P] Record reuse decisions in specs/006-explicit-observation-command/research.md

## Phase 2: User Story 1 - Explicit observation without OKF (Priority: P1)

**Independent Test**: The observe CLI emits the prepared bundle, rejects bad
input, and invokes no OKF workflow.

- [x] T004 [US1] Add failing AB-OBS CLI routing and non-OKF tests in src/app/repository-okf/real-evidence.test.ts and src/cli.test.ts
- [x] T005 [US1] Implement the explicit observe command in src/app/repository-okf/real-evidence.ts and src/cli.ts
- [x] T006 [US1] Add current AB-OBS living requirements in docs/specs/observations.md
- [x] T007 [US1] Document command separation in README.md

## Phase 3: Verification and closure

- [x] T008 [US2] Add versioned schema catalog and validation in src/core/knowledge/schema-catalog.ts
- [x] T009 [US2] Expose list/read/select/validate tools in src/app/codebase-memory-mcp/okf-schema-tools.ts
- [x] T010 [US2] Add AB-SCHEMA living requirements in docs/specs/okf-schema-catalog.md

- [x] T011 Run focused tests and real opt-in observation evidence
- [x] T012 Run npm run verify and record specs/006-explicit-observation-command/verification.md
- [x] T013 Close specs/CURRENT.md and update docs/handoff.md

## Dependencies

T004 precedes T005. T006 and T007 follow the accepted behavior. T008–T010
follow implementation.

## Implementation Strategy

Deliver only User Story 1. Do not add automatic OKF, a watcher, new graph model,
storage service or new dependency.
