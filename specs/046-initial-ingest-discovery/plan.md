# Implementation Plan: Initial Ingest discovery quality

**Branch**: `046-initial-ingest-discovery` | **Date**: 2026-08-25 | **Spec**: [spec.md](spec.md)

**Input**: Approved decisions D01–D28 in [decisions.md](decisions.md).

## Summary

Keep the five-stage Initial Ingest and catalog 7, but move selectivity after
discovery. Preflight binds an exact remote-default source snapshot without
mutating the user's checkout. The existing Codebase Memory gateway captures a
compact Discovery Seed and bounded file census. The Agent closes five lanes in
an Inventory; schema guidance freezes a Receipt and Prepare consumes that exact
receipt. Validation proves Seed-to-OKF coverage as well as OKF integrity.
Inspection and activity logs expose useful decisions without publishing raw
graph/inventory state.

## Technical Context

**Language/Version**: TypeScript 5.9 on Node.js `>=24.12 <25`, strict ESM

**Primary Dependencies**: Node standard library, pinned owned Codebase Memory
`0.10.8`, MCP server/client `2.0.0`; no new production dependency

**Storage**: Existing private filesystem state for graph cache, source
worktrees, authoring sessions and proposals; Git-backed remote Hub

**Testing**: Node test runner with focused colocated contract/integration tests,
captured provider fixtures and fake Git/GitHub boundaries

**Target Platform**: Qualified Linux x64; existing macOS arm64 release gate is
unchanged

**Project Type**: Modular-monolith local stdio MCP server and CLI

**Performance Goals**: One index per exact source snapshot; reuse exact graph
cache; compact repeated signals before model context; measure real Sol elapsed
time/tokens before setting numeric budgets

**Constraints**: No new public tool, schema, provider, model router, daemon,
watcher, database, source mutation, provider CLI call, automatic Accept or
Publish; ordinary query receives no remote-source materialization authority

**Scale/Scope**: One Git root per graph; sequential 2–32 member Batch; bounded
64-item authoring surfaces and five discovery lanes

## Constitution Check

### Pre-design gate

- **Evidence Before Abstraction — PASS**: uses audited `0.10.8` output and the
  measured Sock Shop miss; no second parser or unmeasured scale claim.
- **Local-First Explicit Authority — PASS**: source access is explicit Hub Init
  authority, token-bound and worktree-isolated; Code Intelligence remains local.
- **Agent-Navigable Ownership — PASS**: source snapshot, gateway capture,
  discovery state, authoring and review retain separate existing owners.
- **Cumulative Knowledge — PASS**: dispositions prevent silent omission without
  turning graph state into Hub content; no implicit deletion is added.
- **Specification/Verification — PASS**: capability 046, `AB-MCP-019..021`,
  `AB-BATCH-011..012` and `AB-BENCH-074..075` precede implementation.

### Post-design gate

PASS. Phase 1 adds no dependency, process, credential kind, public tool or
storage service. The only new durable private value is a compact prepared
Receipt inside the existing authoring checkpoint. Source worktrees and graph
caches stay reconstructable and non-canonical.

## Project Structure

### Documentation

```text
specs/046-initial-ingest-discovery/
├── spec.md
├── decisions.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── mcp.md
└── tasks.md                 # generated after plan approval
```

### Source ownership

```text
src/providers/github-hub/
├── github-api.ts            # generic repository/default-branch lookup
└── git-process.ts           # namespaced fetch + detached source worktree

src/providers/codebase-memory/
└── response-parser.ts       # normalized Seed-driving provider facts

src/app/codebase-memory-mcp/
├── gateway-session.ts       # per-connection source binding/capture lifecycle
├── discovery-session.ts     # new private Seed/Inventory/Receipt owner
├── okf-schema-tools.ts      # Inventory validation and receipt-producing guidance
└── server.ts                # inject one discovery session; tool count unchanged

src/app/hub-okf/
├── authoring/
│   ├── authoring-session.ts # persist prepared compact Receipt
│   ├── prepare.ts           # consume resolved Receipt, not mutable guidance
│   └── initial-ingest-skeleton.ts
├── batch-ingest/            # isolated per-member source/receipt checkpoints
├── review/inspect.ts        # coverage/disposition inspection
├── publication/review-summary.ts
└── query/runtime-actions.ts # Hub source preflight and drift checks

src/core/knowledge/
└── documents/               # existing validated log grammar/rendering

.agents/skills/
├── agentbase-ingest/SKILL.md
├── agentbase-batch-ingest/SKILL.md
├── agentbase-okf/SKILL.md
└── use-codebase-memory/SKILL.md
```

**Structure Decision**: Add one private `discovery-session.ts` because it owns a
real connection-scoped lifecycle shared by graph capture and authoring guidance.
Do not add a public scanner module, generic workflow engine or new core layer.
Reuse current Git/GitHub, authoring, batch and review entrypoints.

## Implementation Slices

### 1. Exact Init source snapshot

- Generalize the existing GitHub repository lookup enough to resolve the local
  source remote's host/repository/default branch with the configured MCP token.
- Fetch the exact branch commit into a bounded `refs/agentbase/...` namespace.
- Reuse the current checkout only when clean and exact; otherwise create a
  deterministic detached worktree under private state. Never checkout/stash or
  run hooks/submodules in the user's worktree.
- Bind Preflight, authoring and final drift checks to the snapshot identity.

### 2. Provider capture and bounded census

- Extend the `0.10.8` response adapter for routes, entrypoints, service
  boundaries, source groups and partial diagnostics; retain packages/layers/
  hotspots/clusters as hints.
- Capture provider calls in the connection-scoped discovery owner while still
  forwarding raw public results unchanged.
- Build one bounded safe file census after source selection. Exclude secrets,
  symlink escapes, vendor/generated/build output and arbitrary recursive reads.

### 3. Discovery Seed, Inventory and Receipt

- Create deterministic compact groups and five lane diagnostics tied to exact
  repository/source/engine identity.
- Extend `get_okf_authoring_schemas` with an Inventory envelope. Validate every
  important Seed group has one disposition and exact source/limitation.
- Freeze guidance input/output plus coverage into a digest-bound Receipt and
  return `discovery_receipt_id`.
- Change new-mode `prepare_hub_okf` to accept only that receipt ID. Refresh keeps
  its existing signal/guidance behavior.

### 4. Authoring materialization and gates

- Persist the compact Receipt only after Prepare in the existing authoring
  session; discard pre-Prepare connection state on switch/close/drift.
- Validate `concept` and `embedded` materialization, rendered grouped Questions,
  bounded ignored reasons and lane limitations before Finalize.
- Keep P1/P2 gaps review-ready; make authority, mutation, integrity and
  unresolved P0 coverage failures Incomplete.
- Render Repository activity for successful Init. Reuse the existing log
  document grammar; do not create raw-run or failure logs.

### 5. Batch and review integration

- Apply source selection and discovery state sequentially per Batch member.
- Persist only compact completed member checkpoints; never use one member's Seed
  or evidence for another.
- Extend inspection and deterministic PR summary with lane coverage, embedded
  groups, relations/Flows, Questions, ignored counts/reasons and limitations.
- Revalidate exact source and Hub base before finalization/submission.

### 6. Skills and qualification

- Update the four existing internal/public skills to execute the same five
  stages and new receipt handoff. Add no skill or public tool.
- Add focused offline fixtures for provider-shape compatibility, source
  isolation, coverage/receipt gates, retry, batch isolation, logs and inspection.
- Run the released-skill Sol probe. Stop on a hard blocker; otherwise run one
  identical sequential replica and report quality delta, regressions, time and
  token use.

## Verification Strategy

1. Run focused tests after each slice at its owner boundary.
2. Run `npm run spec:check`, `npm run typecheck` and `npm run depcruise` after
   interface/dependency changes.
3. Run `npm run verify` before the real benchmark.
4. Run the exact released-skill qualification only after the offline gate is
   green; qualification never Accepts, publishes, calls provider CLI or mutates
   fixture source.

## Complexity Tracking

No constitutional violation or exception is required. The connection-scoped
discovery owner is the smallest stateful boundary that can prove graph signal
coverage across existing graph, schema-guidance and Hub-prepare calls.
