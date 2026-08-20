# Tasks: AgentStack Foundation

**Input**: Design documents from `/specs/021-agentstack-foundation/`

**Tests**: Focused dependency-rule conformance and the canonical offline gate
are required by AB-FND-011/012/015.

## Phase 1: Setup

**Purpose**: Add only the reviewed development tools before changing gates.

- [x] T001 Install exact `dependency-cruiser@18.2.0`, `@swc/core@1.16.0` and `knip@6.32.2` development dependencies in `package.json` and `package-lock.json`

---

## Phase 2: User Story 1 — Change code without metric debt (Priority: P1) 🎯 MVP

**Goal**: Preserve real dependency rules while removing the custom metric engine and baselines.

**Independent Test**: The real tree and allowed public-entrypoint fixture pass;
cycle, reverse-layer and cross-capability-private fixtures fail.

- [x] T002 [US1] Add failing native-tool conformance scenarios for AB-FND-011/012 in `scripts/dependency-rules.test.mjs`
- [x] T003 [US1] Define cycle, layer-direction and cross-capability public-entrypoint rules in `.dependency-cruiser.cjs`
- [x] T004 [US1] Replace `architecture:check`/`architecture:changed` with native `depcruise` wiring in `package.json`
- [x] T005 [US1] Remove `scripts/check-architecture.mjs`, `scripts/check-architecture.test.mjs`, `scripts/architecture-baseline.json` and `scripts/module-boundaries.json`
- [x] T006 [US1] Amend architecture ownership and AB-FND-010..013 requirements in `AGENTS.md`, `docs/ARCHITECTURE.md` and `docs/contracts/foundation.md`

**Checkpoint**: `npm run depcruise` and `node --test scripts/dependency-rules.test.mjs` pass with no metric baseline.

---

## Phase 3: User Story 2 — Run one complete offline repository gate (Priority: P1)

**Goal**: Add bounded dead-code and redacted secret checks to the canonical gate.

**Independent Test**: Each native command and the complete `npm run verify` pass without network or source mutation.

- [x] T007 [P] [US2] Define explicit runtime/script/test entrypoints and initial file/dependency-only policy in `knip.json`
- [x] T008 [P] [US2] Extend native default secret rules in `.gitleaks.toml` without broad allowlists
- [x] T009 [US2] Add native `knip` and redacted `gitleaks` scripts and compose AB-FND-015 verification in `package.json`
- [x] T010 [US2] Resolve only evidenced native-tool findings and requirement-linked config cases in `knip.json`, `.gitleaks.toml` and focused owning files

**Checkpoint**: `npm run knip`, `npm run gitleaks` and `npm run verify` pass.

---

## Phase 4: Close capability

**Purpose**: Make the accepted native-tool foundation current without duplicating history.

- [x] T011 Update the current checkpoint and completed capability selector in `docs/README.md` and `specs/CURRENT.md`
- [x] T012 Record exact focused and canonical evidence in `specs/021-agentstack-foundation/verification.md`

---

## Dependencies & Execution Order

- T001 blocks every native Node tool task.
- US1 executes T002 → T003 → T004/T005 → T006 and is independently useful.
- After T001, T007 and T008 may proceed in parallel; T009 depends on both.
- T010 follows the first real native-tool runs and must not introduce broad suppressions.
- T011–T012 run only after the complete canonical gate passes.

## Implementation Strategy

Implement US1 first and validate the architecture replacement before adding the
other gates. Then add knip and gitleaks as native configs, close only after the
composed offline gate is green. Do not add ESLint, Biome, shared config loading,
an installer or another wrapper engine.
