# Tasks: Installer Terminal UI

## Phase 1: Living Contract

- [x] T001 Extend installation requirement enforcement through `AB-INSTALL-024` in `scripts/check-specs.mjs` and `scripts/check-specs.test.mjs`
- [x] T002 Add current terminal UI requirements to `docs/specs/installation.md`

## Phase 2: User Story 1 - Navigate Setup (Priority: P1)

- [x] T003 [US1] Add failing brand, arrow/Space, split-escape, empty-selection, no-color, narrow and dumb-terminal tests in `scripts/install.test.mjs`
- [x] T004 [US1] Implement terminal capability detection, branding, quiet dependency state, logical key parsing and bounded picker redraw in `scripts/install.mjs`

## Phase 3: User Story 2 - Follow and Finish (Priority: P1)

- [x] T005 [US2] Add failing token-action, preserved-token, result mapping, next-step and cursor/raw restoration tests in `scripts/install.test.mjs`
- [x] T006 [US2] Implement GitHub-access, registration and completion presentation while preserving existing safety behavior in `scripts/install.mjs`

## Phase 4: Documentation and Verification

- [x] T007 Update installer guidance and specialist design rationale in `README.md`, `docs/ARCHITECTURE.md` and `docs/handoff.md`
- [x] T008 Run focused/full verification and close Capability 011 in `specs/011-installer-terminal-ui/verification.md`, `specs/011-installer-terminal-ui/spec.md` and `specs/CURRENT.md`

## Dependencies

T001-T002 precede UI work. T003 precedes T004; T005 precedes T006. Documentation
follows stable behavior, and T008 is last. Runtime tasks are sequential because
they share one cohesive installer owner.
