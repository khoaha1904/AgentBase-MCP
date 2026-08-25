# Tasks: Bundled provider installation

**Input**: Design documents in `specs/047-bundled-provider-installation/`

**Tests**: One focused bundle lifecycle suite plus the existing installer
transaction suite. No helper-by-helper test expansion.

## Phase 1: Foundational verification boundary

- [x] T001 Refactor explicit-directory artifact verification while preserving active-runtime resolution in `src/providers/codebase-memory/owned-runtime.ts`, `src/providers/codebase-memory/index.ts` and `src/providers/codebase-memory/owned-runtime.test.ts`

---

## Phase 2: User Story 1 — One-command ordinary install (Priority: P1)

**Goal**: `./install.sh` activates a valid local platform bundle without native
build prerequisites and fails before client mutation otherwise.

**Independent Test**: Tiny fake bundles prove selection, validation, no-op,
replacement and recovery; the installer transaction proves ordering.

- [x] T002 [US1] Add local bundle selection, verification and atomic activation in `scripts/installation/provider-bundle.mjs`
- [x] T003 [US1] Add the focused success/no-op/corrupt/missing/interruption contract in `scripts/installation/provider-bundle.test.mjs`
- [x] T004 [US1] Replace ordinary source preparation with bundle activation in `scripts/installation/install.mjs` and `scripts/installation/product-skills.test.mjs`

---

## Phase 3: User Story 2 — Trusted platform release (Priority: P2)

**Goal**: A maintainer explicitly packages one verified current-platform build
without disturbing another platform bundle.

**Independent Test**: Package a fake prepared runtime transactionally, then run
the real Linux preparation and admission gate.

- [x] T005 [US2] Add atomic current-target packaging around the existing native build in `scripts/upstream/package-codebase-memory.mjs`, `scripts/upstream/prepare-codebase-memory.mjs` and `package.json`
- [x] T006 [US2] Add packaging preservation coverage in `scripts/upstream/prepare-codebase-memory.test.mjs`
- [x] T007 [US2] Build and add the verified Linux bundle under `vendor/codebase-memory/artifacts/linux-x64/`

---

## Phase 4: Current contracts and release gate

- [x] T008 Update installation/runtime truth in `README.md`, `docs/README.md`, `docs/design/00-architecture.md` and `docs/design/12-version-scope/02-installation-requirements.md`
- [x] T009 Add current-platform bundle integrity to the canonical offline gate in `package.json` and `scripts/upstream/check-codebase-memory-bundle.mjs`
- [x] T010 Run capability consistency analysis, `npm run verify`, and record the Linux result plus deferred company macOS gate in `specs/047-bundled-provider-installation/verification.md`

## Dependencies & execution order

```text
T001 → T002–T004 → T005–T007 → T008–T010
```

Tasks are sequential because provider verification, installer activation and
packaging share one artifact contract. The smallest useful slice is T001–T004;
the release is not complete until a real current-platform bundle passes T007.
