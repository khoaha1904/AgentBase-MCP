# Tasks: Reviewable Hub Pull Requests

**Input**: Design documents in `specs/025-reviewable-hub-prs/`

**Tests**: One cohesive publication test covers requirements at the external
Git/GitHub boundary. Work remains sequential by owner preference.

## Phase 1: Contract and metadata foundation

- [x] T001 Record `AB-PUBLISH-001..010` in `docs/design/11-review-and-publish/01-runtime-requirements.md`
- [x] T002 Add backward-compatible accepted mode trailers in `src/core/hub/proposal.ts`, `src/app/hub-okf/review/accept.ts` and `src/app/hub-okf/review/pending.ts`
- [x] T003 Make GitHub PR list/create identity explicit for a requested base branch in `src/providers/github-hub/github-api.ts`

**Checkpoint**: New pending commits can be classified safely and provider calls
admit an exact base without changing configured Hub identity.

## Phase 2: User Story 1 — Reviewable publication (P1)

**Goal**: Create a bounded maintainer-readable PR from one ordinary selection.

**Independent Test**: Fake GitHub captures all six required body sections,
exact proposal/commit metadata and no token/local root.

- [x] T004 [US1] Add deterministic bounded PR summary rendering in `src/app/hub-okf/publication/review-summary.ts`
- [x] T005 [US1] Integrate the summary and explicit publication units into batch mode in `src/app/hub-okf/publication/publish.ts`
- [x] T006 [US1] Cover rich batch PR and retained-metadata fallback in `src/app/hub-okf/publication/publish.test.ts`

**Checkpoint**: Existing batch publication is independently useful and fully reviewable.

## Phase 3: User Story 2 — Init/Refresh stack (P2)

**Goal**: Publish exact same-Repository Init/Refresh commits as a PR stack.

**Independent Test**: Fake GitHub observes `main ← Init ← Refresh`, then exact
retry recovery and safe conflict failure.

- [x] T007 [US2] Detect only exact eligible same-Repository Init/Refresh chains in `src/app/hub-okf/publication/publish.ts`
- [x] T008 [US2] Publish/recover one exact branch and PR per stack unit in `src/app/hub-okf/publication/publish.ts`
- [x] T009 [US2] Cover multi-Refresh stacking, fallback, retry and conflict identity in `src/app/hub-okf/publication/publish.test.ts`

**Checkpoint**: Refresh diffs are isolated without rewriting accepted commits.

## Phase 4: Integration and convergence

- [x] T010 Update MCP description and current high/low-level status in `src/app/hub-okf/mcp/mcp-tools.ts`, `docs/present/11-review-accept-and-publish.md` and `docs/design/11-review-and-publish/README.md`
- [x] T011 Run focused tests, `npm run verify`, reconcile spec/design/code drift, record `verification.md` and close `specs/CURRENT.md`

## Dependencies and execution order

- T001–T003 are foundation work.
- US1 (T004–T006) is the independently useful MVP.
- US2 (T007–T009) reuses US1 units and summary rendering.
- T010–T011 follow both stories.
- No parallel markers are used; implementation is intentionally sequential.

## Implementation strategy

First preserve batch behavior while replacing its one-line PR body. Then add
stack eligibility as a narrow branch in the same publisher. Do not build
independent Init rebasing, merge management or a second publication service.
