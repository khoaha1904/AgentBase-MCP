# Tasks: Codebase Memory MCP Surface

**Input:** design documents under `specs/005-codebase-memory-mcp-surface/`
**Status:** Complete

## Phase 1: Dependency and manifest admission

- [x] T001 After owner approval, install exact `@modelcontextprotocol/server@2.0.0`, verify its lockfile integrity/Node compatibility and stop if stdio requires an unapproved adapter in `package.json` and `package-lock.json`
- [x] T002 Capture the sanitized exact 12-tool names/descriptions/input schemas and representative raw results for AB-MCP-003/013 in `fixtures/codebase-memory-v0.10.1/mcp-surface.json`
- [x] T003 Write approved-set, omitted-mutation and exact schema-drift tests for AB-MCP-003/006/014 in `src/app/codebase-memory-mcp/tool-manifest.test.ts`
- [x] T004 Implement the immutable version-bound safe tool manifest in `src/app/codebase-memory-mcp/tool-manifest.ts`
- [x] T005 Register the new application owner and exact architecture ceilings in `scripts/module-boundaries.json` and `scripts/architecture-baseline.json`

**Checkpoint:** official SDK is admitted and the public contract is pinned; no
server or provider child behavior exists yet.

## Phase 2: User Story 1 — index and inspect one repository (P1)

**Independent test:** a fake official client starts unbound from an unrelated
cwd, indexes one exact fixture root, forwards approved reads and closes cleanly.

- [x] T006 [US1] Write relative/missing path, source persistence, cross-repo mode, same-root and different-root binding policy tests for AB-MCP-004/005 in `src/app/codebase-memory-mcp/tool-policy.test.ts`
- [x] T007 [US1] Implement canonical exact-root controlled-index policy with `persistence:false` in `src/app/codebase-memory-mcp/tool-policy.ts`
- [x] T008 [US1] Extend the provider public contract with generic approved raw-tool discovery/invocation while preserving exact admission and bounded cleanup in `src/providers/codebase-memory/session.ts` and `src/providers/codebase-memory/index.ts`
- [x] T009 [US1] Write lazy admission, index-first, raw forwarding, schema drift, timeout, provider error, disconnect and idempotent cleanup tests for AB-MCP-001/002/007–010 in `src/app/codebase-memory-mcp/gateway-session.test.ts`
- [x] T010 [US1] Implement the unbound/binding/bound/closing gateway state and one scoped provider child in `src/app/codebase-memory-mcp/gateway-session.ts`
- [x] T011 [US1] Write official stdio server list/call/protocol-only-stdout and close tests for AB-MCP-001/003/008/010 in `src/app/codebase-memory-mcp/server.test.ts`
- [x] T012 [US1] Compose and export the official stdio server/entrypoint in `src/app/codebase-memory-mcp/server.ts`, `src/app/codebase-memory-mcp/index.ts`, and `src/cli.ts`

**Checkpoint:** one real AgentBase MCP connection can safely bind and query one
repository without Codebase Memory or AgentBase graph reimplementation.

## Phase 3: User Story 2 — graph-first skill shim (P2)

**Independent test:** structural validation plus a fixture workflow proves the
skill selects/indexes one repo, queries graph before source and performs no
installer, watcher, OKF or config behavior.

- [x] T013 [US2] Initialize `use-codebase-memory` with the skill-creator initializer under `.agents/skills/` and generate only required UI metadata
- [x] T014 [US2] Write the concise pinned-provider graph-first workflow for AB-MCP-011/012 in `.agents/skills/use-codebase-memory/SKILL.md`
- [x] T015 [US2] Validate skill structure and add a focused content/workflow test without duplicating tool schemas in `scripts/check-skills.test.mjs`

**Checkpoint:** agents receive correct upstream-oriented usage guidance without
global installation or OKF coupling.

## Phase 4: Exact qualification and closure

- [x] T016 Run a fresh official client and AgentBase server as isolated processes from an unrelated cwd; verify exact list/index/query/reject/disconnect/source-integrity behavior and record AB-MCP-001–013 evidence in `specs/005-codebase-memory-mcp-surface/verification.md`
- [x] T017 [P] Add accepted `AB-MCP-001–014` behavior to `docs/specs/local-code-intelligence.md`, route stable IDs in `AGENTS.md`, and update `scripts/check-specs.mjs` with focused tests
- [x] T018 [P] Document manual MCP configuration preview, one-repo connection behavior and skill usage in `README.md` and `specs/005-codebase-memory-mcp-surface/quickstart.md`
- [x] T019 Update ownership/lifecycle/non-goals in `docs/ARCHITECTURE.md`, `docs/roadmap.md`, `docs/handoff.md`, and add an ADR for the filtered gateway boundary
- [x] T020 Capture only a newly proven reusable gateway/skill lesson, if any, in `/home/khoa/workspace/agentstack/`
- [x] T021 Run offline `npm run verify`, production audit and opt-in exact lifecycle qualification, then reconcile `spec.md`, `plan.md`, `tasks.md`, `specs/CURRENT.md`, and verification evidence

## Dependencies

```text
owner approval -> T001
T001 -> T002/T003 -> T004 -> T005
T004/T005 -> T006/T009/T011
T006 -> T007
T008 + T009 -> T010
T007 + T010 + T011 -> T012 -> US1 complete
US1 -> T013 -> T014 -> T015 -> US2 complete
US1 + US2 -> T016 -> T017-T021
```

## Parallel opportunities

- Manifest fixture/tests and architecture registration touch separate files.
- Policy and gateway-session tests are independent after the manifest exists.
- Living contract and user documentation updates are file-independent after
  exact qualification.

Only one agent is assumed. `[P]` marks file-independent work, not delegation.

## MVP stop rules

Stop and return to the owner instead of expanding scope if the official SDK
requires another runtime framework, exact schemas cannot be admitted reliably,
one-root provider isolation cannot be preserved or cleanup cannot be confirmed.
Do not substitute a broad allow-root, global upstream installer, unsafe full
tool exposure, custom protocol framing or a multi-repository process registry.
