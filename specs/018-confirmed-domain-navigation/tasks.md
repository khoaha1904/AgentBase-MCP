# Tasks: Confirmed Domain Navigation

**Input**: Design documents in `specs/018-confirmed-domain-navigation/`

## Phase 1: Specification baseline

- [x] T001 Record owner decisions and acceptance behavior in `specs/018-confirmed-domain-navigation/spec.md`
- [x] T002 Record implementation design and MCP contract in `specs/018-confirmed-domain-navigation/plan.md`, `research.md`, `data-model.md`, `contracts/mcp.md` and `quickstart.md`
- [x] T003 Validate requirement quality in `specs/018-confirmed-domain-navigation/checklists/requirements.md`

## Phase 2: User Story 1 — Confirmed Domain authoring

**Goal**: Carry one explicit owner-confirmed Domain through prepare and final validation without inference.

**Independent Test**: Valid context returns exact Domain guidance and finalizes an evidenced Domain membership; malformed or absent context never invents one.

- [x] T004 [P] [US1] Add AB-SCHEMA-024 value and provenance tests in `src/core/knowledge/confirmed-domain.test.ts`
- [x] T005 [US1] Implement confirmed Domain normalization and bundle validation in `src/core/knowledge/confirmed-domain.ts` and `src/core/knowledge/index.ts`
- [x] T006 [P] [US1] Add prepare input/routing tests in `src/app/hub-okf/mcp-tools.test.ts`
- [x] T007 [US1] Carry confirmed Domain through `src/app/hub-okf/mcp-tools.ts`, `runtime-actions.ts` and `authoring-session.ts`
- [x] T008 [US1] Enforce confirmed Domain authoring during new/refresh finalization in `src/app/hub-okf/prepare.ts`, `refresh.ts` and focused tests
- [x] T009 [US1] Update Domain authoring guidance in `.agents/skills/agentbase-okf/SKILL.md` and `docs/contracts/okf.md`

## Phase 3: User Story 2 — Shared index preservation

**Goal**: Allow additive navigation without letting one repository rename or rewrite shared Hub indexes.

**Independent Test**: Additive root/Domain links finalize; heading replacement, deletion and reordering fail.

- [x] T010 [P] [US2] Add AB-LOCAL-HUB-015 new-proposal index regression tests in `src/app/hub-okf/prepare.test.ts`
- [x] T011 [US2] Enforce ordered nonblank-line preservation in `src/app/hub-okf/prepare.ts`
- [x] T012 [US2] Update shared-root guidance in `.agents/skills/agentbase-okf/SKILL.md` and `docs/contracts/hub.md`

## Phase 4: Qualification and publication

- [x] T013 Add immutable V10 confirmed-Domain prompts and manifest input in `benchmark/prompts/`, `benchmark/repos/aws-serverless/manifest.json` and `scripts/benchmark-agent.test.mjs`
- [x] T014 Run focused checks, `npm run verify` and commit the offline implementation phase
- [x] T015 Run the real Shopping Cart V10 qualification and commit immutable evidence under `benchmark/results/`
- [ ] T016 Rebuild the Shopping Cart proposal from remote Hub `main`, replace PR #7 with one unmerged PR and record it in `docs/contracts/benchmark.md`
- [ ] T017 Complete `specs/018-confirmed-domain-navigation/verification.md`, `docs/README.md`, `specs/CURRENT.md`, run `npm run verify` and commit completion

### Qualification review checkpoint

- V10 is retained as invalid evidence in commit `68a00a8`; it exposed a generic
  OKF list-marker error rather than a repository-specific knowledge gap.
- V11 corrected only that generic grammar rule. Run `2026-08-15T172701Z` is
  valid and reviewable, but owner review remains `needs_revision` because the
  TTL source conflict is absent from the authored `Limitations` evidence.
- Stop here for owner review. Do not start V12 or T016 implicitly. The owner must
  first decide whether V11 is accepted or whether one explicitly bounded
  conflict-retention improvement is required.

## Dependencies

T001–T003 → T004–T009 → T010–T012 → T013–T017.

US1 establishes trustworthy Domain context before US2 and qualification prove
the final Hub layout. T004 and T006 can proceed independently; T010 can be
written alongside US1 tests because it owns a separate behavior boundary.

## Implementation strategy

Implement one bounded value and reuse existing prepare/session/finalize paths.
Do not add automatic Domain discovery, a new persistence layer, multi-Domain
input or lifecycle semantic changes. The requested useful slice is complete
only after the real proposal visibly preserves the Hub root and includes
Commerce → Shopping Cart navigation.
