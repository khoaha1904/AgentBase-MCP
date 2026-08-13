# Implementation Plan: Graph Refresh Reuse

**Branch**: `004-graph-refresh-reuse` | **Date**: 2026-08-12 | **Spec**: [spec.md](spec.md)

**Status**: Implemented and exact-provider qualified

**Input**: Feature specification from `/specs/004-graph-refresh-reuse/spec.md`

## Summary

Add one private, atomic graph-freshness receipt to the existing bounded graph
round. An exact source/provider/cache-namespace match skips only the provider
index call; changed, missing or explicitly forced freshness calls the provider's
existing index operation exactly once. Preserve all queries, source-integrity
checks and cleanup, with no watcher, daemon, custom graph delta or hidden retry.

## Technical Context

**Language/Version**: TypeScript 5.9 executed directly by Node.js `>=24.12 <25`
**Primary Dependencies**: existing exact `codebase-memory-mcp@0.10.1`, exact
`@modelcontextprotocol/client@2.0.0` and `yaml@2.9.0`; no new dependency
**Storage**: one atomic private JSON receipt beside, not inside, provider-owned
cache data under the existing AgentBase state root
**Testing**: colocated `node:test`, injected fake provider/receipt store,
captured provider responses and opt-in exact-provider qualification
**Target Platform**: existing accepted Linux x64 walking-skeleton host
**Project Type**: local-first modular-monolith CLI/tooling application
**Performance Goals**: unchanged rounds invoke no index and remove the measured
approximately `3.47s` no-op index stage on the accepted fixture
**Constraints**: explicit command only; no watcher/daemon/UI; no source mutation;
atomic private state; no hidden retry; zero standing provider process
**Scale/Scope**: one repository graph namespace, one receipt and one explicit
evidence round; fixture qualification covers add/modify/delete/reuse

## Constitution Check

*GATE: Passed before Phase 0 research; re-checked after Phase 1 design.*

- **Evidence Before Abstraction**: exact-provider probes demonstrate changed
  refresh correctness, full-cost no-op re-index and successful cache query
  without index. Limitations are recorded in the feasibility evidence.
- **Local-First Explicit Authority**: only an already explicit graph round may
  read/write the receipt or invoke refresh. No config, daemon, watcher, network,
  credential or model boundary changes.
- **Agent-Navigable Ownership**: freshness policy stays in the registered
  repository-OKF application owner; provider transport and graph internals stay
  in the registered Codebase Memory provider.
- **Cumulative Knowledge**: the receipt is private disposable graph state and
  does not enter OKF or proposal/apply behavior.
- **Specification and Deterministic Verification**: `AB-REFRESH-*` requirements,
  offline fake tests, failure/recovery scenarios and exact opt-in qualification
  precede promotion.
- **Material approval**: this plan changes persistent private state and the
  index lifecycle, so application implementation waits for owner approval.

Post-design check: passed. No constitution deviation, new dependency or
architecture exception is required.

## Project Structure

### Documentation (this feature)

```text
specs/004-graph-refresh-reuse/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── cli.md
│   └── freshness-receipt.md
├── checklists/
│   ├── requirements.md
│   └── simplicity-lifecycle.md
└── tasks.md
```

### Source Code (repository root)

```text
src/app/repository-okf/
├── graph-freshness.ts
├── graph-freshness.test.ts
├── graph-round.ts
├── graph-round.test.ts
├── provider-workspace.ts
├── provider-workspace.test.ts
├── real-evidence.ts
├── real-evidence.test.ts
└── index.ts

fixtures/codebase-memory-v0.10.1/
└── refresh.json
```

**Structure Decision**: extend only the existing repository-OKF owner. The new
`graph-freshness.ts` is a narrow private-state policy/value seam; it does not
become a generic cache framework. Existing provider code remains unchanged
unless exact qualification reveals a response-parser correction.

## Phase 0: Evidence and decisions

1. Use the exact accepted binary/session against disposable source and cache.
2. Confirm changed-source re-index updates raw graph results.
3. Confirm unchanged re-index cost and cross-session cache query without index.
4. Record why AgentBase skips known no-op indexing but delegates all changed
   graph construction to the provider.

Completed evidence and alternatives are in [research.md](research.md) and
`docs/product/evidence/2026-08-12-refresh-feasibility.md`.

## Phase 1: Design and contracts

### Freshness decision

`graph-freshness.ts` compares a validated receipt with the current source,
engine and namespace identities. It returns only:

```text
reused: exact match
refreshed: missing-receipt | source-changed | provider-changed | forced
```

Malformed or unsupported receipt data behaves like missing state and may be
replaced only after a successful round. The decision does not inspect source
files beyond the existing source identity and never computes graph deltas.

### Round composition

`graph-round.ts` retains its current lifecycle. After provider admission it
loads the receipt and either supplies a no-op index step or the existing provider
index step to evidence preparation. All graph queries run in both modes. Cleanup
and post-cleanup integrity complete before an atomic receipt commit.

If reuse-selected queries fail, the typed graph-round failure adds explicit
`--refresh` guidance. It does not retry, delete cache or mutate the receipt.

### Private state

`provider-workspace.ts` derives an opaque namespace ID and receipt path under a
separate AgentBase-owned metadata directory. The receipt file is mode `0600` in
an existing mode `0700` state tree. Atomic replace uses a same-directory bounded
temporary filename. Neither absolute path enters the receipt or diagnostics.

Contracts are in [freshness-receipt.md](contracts/freshness-receipt.md) and
[cli.md](contracts/cli.md); states are in [data-model.md](data-model.md).

## Phase 2: Implementation shape

- Write receipt validation/decision/atomic-commit tests before implementation.
- Add graph-round tests proving zero/one index calls and unchanged receipt bytes
  across every declared failure.
- Add optional `--refresh` parsing and diagnostic fields without changing the
  default transport or normalized evidence contract.
- Capture sanitized add/modify/delete/reuse exact-provider qualification only
  after offline tests pass.

## Phase 3: Promotion and closure

- Stop without added recovery machinery if exact reuse/refresh is unreliable.
- Otherwise update the living Part 1 contract, ADR, README, architecture,
  roadmap and handoff with measured limitations.
- Capture a reusable receipt pattern in AgentStack only if implementation proves
  a genuinely new general lesson.
- Run canonical offline verification, production audit and opt-in lifecycle
  cleanup qualification, then converge spec/plan/tasks with implementation.

## Complexity Tracking

No violation is planned. Complexity is intentionally capped at one receipt,
one decision and one optional CLI flag. Watchers, locks, cache generations,
repair/status commands and provider configuration remain out of scope.
