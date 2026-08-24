# Tasks: Unify Product Skills

## Phase 1: Catalog foundation

- [x] T001 Record the six-public/two-internal contract in `docs/design/00-architecture.md` and `docs/design/12-version-scope/02-installation-requirements.md`.

## Phase 2: User Story 1 — Ask without choosing a source

- [x] T002 [US1] Create the read-only routing workflow and UI metadata in `.agents/skills/agentbase-query/`.
- [x] T003 [US1] Move ordinary Hub-versus-code routing ownership out of `.agents/skills/use-codebase-memory/SKILL.md` and align `docs/design/10-query-routing/`.

## Phase 3: User Story 2 — Coherent public catalog

- [x] T004 [US2] Classify and describe six public plus two internal workflows in `.agents/skills/README.md` and affected `.agents/skills/*/SKILL.md` files.
- [x] T005 [US2] Update the fixed eight-entry catalog and requirement-linked installation assertions in `scripts/installation/product-skills.mjs` and `scripts/installation/product-skills.test.mjs`.

## Phase 4: User Story 3 — Accurate client invocation

- [x] T006 [US3] Standardize public and internal UI metadata under `.agents/skills/*/agents/openai.yaml` without adding alias artifacts.
- [x] T007 [US3] Update `README.md` installation/usage wording with exact Codex `$skill` and Claude `/skill` invocation.

## Phase 5: Verification and closure

- [x] T008 Run focused skill/installer checks and `npm run verify`, record `verification.md`, align `specs/CURRENT.md` and close Feature 041.

## Dependencies and execution order

- T001 establishes current contract before implementation.
- T002–T003 establish the query owner before catalog descriptions change.
- T004–T007 then align distribution and presentation.
- T008 runs only after every behavior and living requirement agrees.

## Implementation strategy

Implement sequentially in the listed order. Add no dependency, MCP tool, model
benchmark or client-specific command alias.
