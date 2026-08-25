# Tasks: Visualize Published Hub

**Input**: [spec.md](spec.md), [plan.md](plan.md), [research.md](research.md),
[data-model.md](data-model.md) and [visualization-tool.md](contracts/visualization-tool.md)

**Execution rule**: Run sequentially. Deterministic projection and packet gates
must pass before renderer/model qualification or Hub knowledge reset.

## Phase 1: Shared Published projection

- [X] T001 Add the canonical predicate display-direction registry in `src/core/knowledge/visualization/predicate-descriptors.ts`.
- [X] T002 Add deterministic one-Domain Published projection, direct non-expandable cross-Domain boundaries, governance filtering, Question badges, Flow steps, omissions and hard bounds in `src/core/knowledge/visualization/published-projection.ts`.
- [X] T003 Add one requirement-linked projection fixture covering direction, Domain isolation/boundaries, candidate exclusion, active/resolved Questions, determinism and bounds in `src/app/hub-okf/visualization/visualization.test.ts`.

**Checkpoint**: Same commit/Domain produces byte-equivalent truthful data and no presentation state enters OKF.

## Phase 2: User Story 1 — Focused diagram (P1)

- [X] T004 [US1] Implement Architecture, Dependency and Sequence packet selection plus explicit insufficient outcomes in `src/app/hub-okf/visualization/diagram-packet.ts`.
- [X] T005 [US1] Add `diagram` mode for `prepare_hub_visualization` in `src/app/hub-okf/mcp/mcp-tools.ts`, `src/app/hub-okf/mcp/mcp-tool-actions.ts` and `src/app/hub-okf/mcp/mcp-tool-call.ts`.
- [X] T006 [US1] Create the narrow internal renderer wrapper in `.agents/skills/use-diagram-design/SKILL.md`, activate only its approved offline profile in `vendor/diagram-design/agentbase/static-profile.json` and reconcile `scripts/upstream/check-inactive-foundations.mjs` without exposing the full upstream skill.
- [X] T007 [US1] Create the public lightweight workflow in `.agents/skills/agentbase-diagram/SKILL.md`, add both skills to `scripts/installation/product-skills.mjs` and update exact installation behavior in `scripts/installation/product-skills.test.mjs`.
- [X] T008 [US1] Extend `src/app/hub-okf/visualization/visualization.test.ts`, `src/app/codebase-memory-mcp/server.test.ts` and `scripts/benchmark/qualify-codebase-memory-mcp.mjs` for ready/insufficient packets, the exact 44-tool schema and no Hub mutation.

**Checkpoint**: Diagram data is truthful and released through one lightweight skill; no Domain site path runs implicitly.

## Phase 3: User Story 2 — Static Domain site (P2)

- [X] T009 [US2] Add pinned `three@0.183.0` and registry/offline dependency checks in `package.json`, `package-lock.json`, `scripts/installation/install.mjs` and `scripts/upstream/check-inactive-foundations.mjs`, while retaining the React/Vite/browser-download prohibitions.
- [X] T010 [US2] Add dependency-light static 3D browser assets with seeded layout, lazy expansion, search, filters, focus, sidebar, Question badges and WebGL fallback in `src/app/hub-okf/visualization/domain-site-assets/`.
- [X] T011 [US2] Implement safe staged generation, local Three.js asset copy, reproducible receipt/digests and no-overwrite recovery in `src/app/hub-okf/visualization/domain-site.ts`.
- [X] T012 [US2] Add visibility acknowledgment and `domain-site` mode for `prepare_hub_visualization` to the existing MCP files without adding another tool.
- [X] T013 [US2] Create the explicit heavy workflow and visibility warning in `.agents/skills/agentbase-domain-site/SKILL.md`, add it to `scripts/installation/product-skills.mjs` and update `scripts/installation/product-skills.test.mjs`.
- [X] T014 [US2] Extend `src/app/hub-okf/visualization/visualization.test.ts` for receipt digests, secret/path scanning, static operation, unsafe/non-empty targets and interrupted-build recovery.

**Checkpoint**: One self-contained static site builds explicitly and runs without Hub/MCP/token/source access.

## Phase 4: Reconcile and qualify

- [X] T015 Update `docs/design/13-visualization`, released skill/tool counts and `specs/CURRENT.md` to the exact implemented behavior; stop for owner review if implementation exposes a broad gap.
- [X] T016 Run deterministic quickstart qualification, static-host smoke, fresh-process 44-tool qualification and `npm run verify`; record results in `specs/045-visualize-published-hub/verification.md`.
- [X] T017 After T016 passes, create one recoverable knowledge-only reset commit in `../AgentBase-Hub/` while preserving README, CI and history.
- [ ] T018 Sequentially ingest and publish the eight selected Sock Shop repositories into `../AgentBase-Hub/`.
- [ ] T019 Invoke released `agentbase-diagram` once per supported type and qualify one static Domain site against that Published multi-repository Domain; record only explained variance in `specs/045-visualize-published-hub/verification.md`.
- [ ] T020 Audit `specs/045-visualize-published-hub/` against implementation and close capability 045 in `specs/CURRENT.md` only when no required work remains.

## Dependencies and stopping rules

- T001–T003 block both user stories.
- US1 completes before US2 so packet truth is proven before adding presentation weight.
- T017 is destructive knowledge replacement and is forbidden before T016 passes.
- T019 requires the T018 Published Domain; the old three-repository Hub is not a
  substitute because it contains no accepted runtime edge or Flow.
- No AWS CLI, Domain-Hub repository creation, Pages publication, full-Hub 2D UI,
  watcher, daemon or automatic refresh belongs to these tasks.
- Add the optional Sock Shop deployment repository only after owner review of an
  evidence gap in the eight-service qualification.

## Minimal implementation strategy

Reuse current Hub parsing and product-skill installer. Add one projection, one
tool and one design-level test owner. Keep both renderers replaceable consumers;
do not make presentation a knowledge schema or a new service.
