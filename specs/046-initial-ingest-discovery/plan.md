# Implementation Plan: Initial Ingest discovery quality

**Branch**: `046-initial-ingest-discovery` | **Date**: 2026-08-25 | **Spec**: [spec.md](spec.md)

**Input**: Approved decisions D01–D34 in [decisions.md](decisions.md).

## Summary

Keep the five-stage Initial Ingest and catalog 7, but move selectivity after
discovery. Preflight binds an exact remote-default source snapshot through a
private mirror without mutating the user's checkout. After indexing, MCP runs
one deterministic provider/census recipe to create a compact Discovery Seed.
The Agent interprets its groups in an Inventory; MCP owns lane/P0 coverage,
schema guidance freezes a Receipt and Prepare creates one idempotent authoring
session from it. Validation proves Seed-to-OKF coverage and OKF integrity.
Inspection and activity logs expose useful decisions without publishing raw
graph/inventory state.

## Technical Context

**Language/Version**: TypeScript 5.9 on Node.js `>=24.12 <25`, strict ESM

**Primary Dependencies**: Node standard library, pinned owned Codebase Memory
`0.10.8`, MCP server/client `2.0.0`; no new production dependency

**Storage**: Existing private filesystem state for graph cache, profile-scoped
source bare mirrors/worktrees, authoring sessions and proposals; Git-backed Hub

**Testing**: Node test runner with focused colocated contract/integration tests,
captured provider fixtures and fake Git/GitHub boundaries

**Target Platform**: Qualified Linux x64; existing macOS arm64 release gate is
unchanged

**Project Type**: Modular-monolith local stdio MCP server and CLI

**Performance Goals**: One index per exact source snapshot; reuse exact graph
cache; compact repeated signals before model context; measure real Sol elapsed
time/tokens before setting numeric budgets

**Constraints**: No new public tool, schema, provider, model router, daemon,
watcher, database, source-repository control mutation, provider CLI call,
automatic Accept or Publish; same-host Hub token is the only network credential;
ordinary query receives no remote-source materialization authority

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
- **Specification/Verification — PASS**: capability 046, `AB-MCP-019..024`,
  `AB-INGEST-016`, `AB-BATCH-011..013` and `AB-BENCH-074..075` precede
  implementation.

### Post-design gate

PASS. Phase 1 adds no dependency, process, credential kind, public tool or
storage service. The only new durable private authority is the existing
authoring session containing a compact Receipt. Private mirrors, source
worktrees and graph caches stay reconstructable and non-canonical.

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
└── git-process.ts           # private mirror fetch + detached source worktree

src/providers/codebase-memory/
├── admission-deny.ts        # owned hard deny before provider file open
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
├── discovery.ts             # pure Seed/Inventory/QuestionPlan contracts
└── documents/               # existing validated log grammar/rendering

.agents/skills/
├── agentbase-ingest/SKILL.md
├── agentbase-batch-ingest/SKILL.md
├── agentbase-okf/SKILL.md
└── use-codebase-memory/SKILL.md
```

**Structure Decision**: Put pure discovery contracts/validation in Core and one
small connection owner in the Codebase Memory app. Pass a resolved Receipt into
Hub authoring through a narrow internal port; do not import one app layer from
another. Do not add a public scanner, workflow engine or database. Reuse current
Git/GitHub, authoring, Batch and review entrypoints.

## Implementation Slices

### 1. Exact Hub-authoring source snapshot

- Normalize HTTPS/SSH/SCP remotes to a credential-free canonical HTTPS identity.
  Choose the remote matching strong identity; ask on multiple distinct matches
  rather than assuming `origin`. Require exact Hub/source host equality.
- Resolve default branch/head through the configured API, fetch with askpass
  token into a profile/source-scoped private bare mirror outside the source repo,
  and verify the fetched commit equals the API result.
- Reuse the current checkout only when clean and exact; otherwise create a
  deterministic detached worktree under private state. Never use source-repo
  refs/filters, checkout/stash, SSH/ambient credentials, hooks, submodules or LFS.
- Use marker-owned, non-symlink, mode-0700 paths with validated cleanup and
  bounded mirror/graph-cache GC.
- Bind Init, Batch and Refresh Preflight, authoring and final drift checks to the
  snapshot identity. Working-tree graphs remain query-only.

### 2. Provider capture and bounded census

- After an Init/Batch-member Preflight arms the exact analysis root and
  `index_repository` succeeds for it, MCP privately runs `index_status`, paged
  `check_index_coverage`, and explicit `get_architecture` aspects: `overview`,
  `structure`, `dependencies`, `routes`, `languages`, `packages`,
  `entry_points`, `hotspots`, `boundaries`, `layers`, `clusters`. Exclude
  `file_tree` and `cycles`; raw public provider results/tools remain unchanged.
- Extend the `0.10.8` response adapter for those results and their totals,
  skipped/partial/truncation diagnostics. Packages/layers/hotspots/clusters are
  hints, not semantic truth.
- Build one bounded safe census. Search/trace remain Agent investigation calls
  and do not accumulate into Seed.
- Preserve provider index result blocks and append one bounded AgentBase Seed
  summary with group IDs/lanes/limitations so the Agent can build Inventory.
- Ordinary query and normal change-first Refresh do not arm/run this recipe or
  create a Seed. Future Full Discovery Refresh remains deferred.
- Patch the pinned owned provider admission/read boundary to hard-deny
  secret-like paths before file open, without modifying the exact worktree.
  Include the patch in owned-runtime integrity and compatibility fixtures.

### 3. Discovery Seed, Inventory and Receipt

- Create deterministic compact groups, MCP-owned five-lane diagnostics and fixed
  P0 classes tied to exact repository/source/engine identity. Include explicit
  operations signals such as CODEOWNERS, build/test/release/deploy/runbook when
  present, normally embedded under Repository/System.
- Page/narrow P0 checks to terminal status or mark limited. P0 diagnostics able
  to hide required evidence and P0 group overflow above 64 make the member
  Incomplete; group/disclose lower-priority overflow.
- Permit P0 ignore only as `duplicate-covered` pointing to a materialized
  non-ignored Inventory item; classify generated/out-of-scope signals below P0
  during Seed creation rather than using them as pass reasons.
- Extend `get_okf_authoring_schemas` with an Inventory envelope. Validate every
  important Seed group has one disposition and exact source/limitation. Do not
  split/merge coverage groups; each item has one origin group and may map to
  multiple explicit output candidates.
- Generate bounded P1 Flow candidates for explicit outbound/trigger/datastore
  boundaries and allow one representative trace per group.
- Normalize QuestionPlans onto existing SharedQuestion/candidate-evidence types;
  bind target, property, scope, source revision and missing evidence. Convert an
  unbindable uncertainty to limitation before Receipt freeze; afterward missing
  Question materialization is Incomplete.
- Freeze guidance input/output plus coverage into a digest-bound Receipt and
  return `discovery_receipt_id`.
- Change new-mode `prepare_hub_okf` to accept only that receipt ID. Refresh keeps
  its change-first/guidance behavior but uses the same remote-default source
  authority as Init.

### 4. Authoring materialization and gates

- Prepare atomically persists one existing authoring session from the immutable
  Receipt; identical retry returns that session and mismatch rejects it.
- Validate `concept` and `embedded` materialization, Receipt-rendered
  SharedQuestions, bounded machine-valid ignored reasons and lane limitations
  before Finalize. Bind every Init/Refresh repository source entry to exact
  observed revision; a newer observation uses a revision-distinct source ID so
  retained claims cannot be relabeled.
- Extend the core validator and its standalone Hub-CI artifact with the same
  backward-compatible `sources[].observed_revision` rule.
- Keep P1/P2 gaps review-ready; make authority, mutation, integrity and
  unresolved P0 coverage failures Incomplete.
- Render only Repository activity for successful Init. Reuse the existing log
  document grammar; do not create routine Domain, raw-run or failure logs.
- On Init Hub-base advance before Finalize, reuse unchanged source/Seed/Inventory
  but rematch, issue a new base-bound Receipt and create a replacement session.
  Normal Refresh reruns its existing prepare/guidance on the new base without a
  Receipt. Both use publication reconciliation after Finalize; rerun discovery
  only when source snapshot changes.

### 5. Batch and review integration

- Apply source selection and discovery state sequentially per Batch member.
- Persist only compact completed member checkpoints; never use one member's Seed
  or evidence for another.
- Continue after a confirmed-clean member-local failure; stop on uncertain
  cleanup/process/shared authority failure. Finalize only when all members are
  complete or membership is explicitly revised.
- Extend inspection and deterministic PR summary with lane coverage, embedded
  groups, relations/Flows, Questions, ignored counts/reasons and limitations.
- Revalidate exact source and Hub base before finalization/submission.

### 6. Skills and qualification

- Update the four existing internal/public skills to execute the same five
  stages and new receipt handoff. Add no skill or public tool.
- Correct the internal `use-codebase-memory` runtime note to owned `0.10.8`.
- Add focused offline fixtures for provider-shape compatibility, deterministic
  Seed recipe, secret-path exclusion, source isolation/TOCTOU, paging/overflow,
  QuestionPlan/receipt/session gates, Hub-base retries, Batch continuation,
  Repository logs and inspection.
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
