# Tasks: Domain and Metric Concepts

**Input**: Design documents from `/specs/020-domain-metric-concepts/`

**Tests**: Requirement-linked tests are required for catalog selection,
compatibility and host-skill contract behavior.

## Phase 1: Setup

- [X] T001 Activate feature 020 and complete approved design artifacts in `specs/CURRENT.md` and `specs/020-domain-metric-concepts/`

---

## Phase 2: User Story 1 — Recognize business entities and metrics (Priority: P1) 🎯 MVP

**Goal**: Select and validate generic Domain Entity and Metric instances.

**Independent Test**: Representative business-entity and metric-definition
signals return complete schemas and valid authored instances.

- [X] T002 [US1] Add failing AB-SCHEMA-025..028 selection, boundary, repeated-instance and relationship guidance tests in `src/core/knowledge/schema-catalog.test.ts`
- [X] T003 [US1] Implement Domain Entity and Metric definitions plus catalog 5.1.0 in `src/core/knowledge/schema-definitions.ts` and `src/core/knowledge/schema-catalog.ts`
- [X] T004 [US1] Add public MCP catalog/version coverage for both schemas in `src/app/codebase-memory-mcp/okf-schema-tools.test.ts`

**Checkpoint**: Automotive and analytics knowledge is represented with generic schemas and no domain-specific runtime code.

---

## Phase 3: User Story 2 — Author valid repository knowledge (Priority: P1)

**Goal**: Make the real authoring skill state the structural rules that V12 missed.

**Independent Test**: A deterministic skill check finds the schema/instance
terminology, all four target kinds and the no-frontmatter category-index rule.

- [X] T005 [US2] Add failing AB-CLAIM-004 and AB-MVP-023 authoring-skill contract checks in `scripts/check-skills.test.mjs`
- [X] T006 [US2] Clarify schema versus instance, exact live target kinds and root/category frontmatter rules in `.agents/skills/agentbase-okf/SKILL.md`

**Checkpoint**: The installed skill cannot reasonably substitute concept types for live-reference kinds or add category-index frontmatter.

---

## Phase 4: User Story 3 — Preserve compatible open-world knowledge (Priority: P2)

**Goal**: Prove the additive catalog keeps prior known and foreign unknown knowledge valid.

**Independent Test**: Existing specialization and unknown-type tests remain
green under catalog 5.1.0 without migration.

- [X] T007 [US3] Extend compatibility assertions for AB-SCHEMA-029 and execute focused catalog/MCP/skill tests in `src/core/knowledge/schema-catalog.test.ts`, `src/app/codebase-memory-mcp/okf-schema-tools.test.ts` and `scripts/check-skills.test.mjs`

---

## Phase 5: Living contracts and verification

- [X] T008 Update accepted terminology, schema vocabulary, canonical roots and skill rules in `docs/PRODUCT.md`, `docs/contracts/okf.md` and the current checkpoint in `docs/README.md`
- [X] T009 Execute `specs/020-domain-metric-concepts/quickstart.md` and canonical `npm run verify`
- [X] T010 Record verification in `specs/020-domain-metric-concepts/verification.md` and close `specs/CURRENT.md` only when all requirements pass

Real model benchmarking, V13, PR #7 changes, concept-pack loading, EC2
specialization and publication are not implementation tasks.

## Dependencies & Execution Order

- T001 precedes implementation.
- T002 → T003 → T004 delivers US1.
- T005 → T006 delivers US2 and may proceed independently of T002–T004.
- T007 follows US1 and US2 behavior.
- T008–T010 follow all user stories.

## Implementation Strategy

1. Reuse the existing schema builder and selector for exactly two definitions.
2. Tighten one existing skill and one existing skill test.
3. Update the narrow living contract, run the full offline gate and stop.
