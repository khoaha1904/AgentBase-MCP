# Tasks: Benchmark storage normalization

## Phase 0 — documentation and baseline

- [X] T001 Reconcile high-level, low-level and active capability documents.
- [X] T002 Capture current benchmark/result/source inventory and missing paths.

## Phase 1 — sibling data repository

- [X] T003 Create `AgentBase-Benchmark` with README, registry, prompts, suites,
  expectations, repositories and results boundaries.
- [X] T004 Copy current benchmark data and source checkouts without rewriting
  historical artifacts; classify active versus archived suites.

## Phase 2 — runner and scoring

- [X] T005 Add explicit benchmark-root resolution and path containment checks.
- [X] T006 Update manifests and crawler qualification to the canonical source
  registry; keep MCP fixtures and demo paths unchanged.
- [X] T007 Add source preflight and active-suite selection checks.
- [X] T008 Add three-tier expected priorities and weighted/per-tier metrics.
- [X] T009 Keep all durable output below Benchmark `results/` and verify cleanup
  of OS temporary workspace/runtime state.

## Phase 3 — verification and cutover

- [X] T010 Verify copied bytes, historical immutability and deterministic
  offline behavior.
- [X] T011 Run focused tests, spec check, full verify and diff check.
- [X] T012 Remove superseded MCP benchmark data only after the cutover check and
  leave a migration pointer for historical documentation.
