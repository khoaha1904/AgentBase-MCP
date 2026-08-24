# Tasks: Correct Tool Guidance

## Phase 1: User Story 1 — Trust public Code Graph guidance

- [x] T001 [US1] Record curated descriptor requirements in `docs/design/01-repository-reading/05-runtime-requirements.md`.
- [x] T002 [US1] Correct public Code Graph descriptions and annotations in `src/app/codebase-memory-mcp/tool-manifest.ts` and extend the existing assertions in `src/app/codebase-memory-mcp/server.test.ts`.

## Phase 2: User Story 2 — Review Questions through one public owner

- [x] T003 [US2] Assign Question review to `.agents/skills/agentbase-hub/SKILL.md`, its UI metadata and `.agents/skills/README.md`, then align `docs/design/11-review-and-publish/01-runtime-requirements.md`.

## Phase 3: Verification and closure

- [x] T004 Validate the Hub skill, run the focused MCP test and `npm run verify`, record `verification.md`, align `specs/CURRENT.md` and close Feature 042.

## Dependencies and execution order

- T001 precedes the matching public descriptor implementation in T002.
- T003 is independent of T001–T002 but runs sequentially to preserve the dirty
  worktree and one-owner review.
- T004 runs after both user stories are complete.

## Implementation strategy

Use the existing descriptor adapter, Hub skill and MCP listing test. Add no
tool, test case, dependency or generic metadata registry.
