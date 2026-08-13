# Implementation Plan: Scoped Graph Session

**Branch**: `003-scoped-graph-session` | **Date**: 2026-08-12 | **Spec**: [spec.md](spec.md)

**Status**: Implemented; promotion and verification evidence recorded

**Input**: Feature specification from
`/specs/003-scoped-graph-session/spec.md`

## Summary

Replace repeated cold provider CLI startups inside one repository evidence
round with one short-lived stdio MCP session. Preserve the exact managed binary,
private cache, existing provider adapter, source-mutation guard and normalized
evidence. Keep one-shot explicit for rollback and promote the session only after
three paired real rounds prove fact parity, clean shutdown and at least a 2×
median end-to-end improvement.

## Technical Context

**Language/Version**: TypeScript 5.9 executed directly by Node.js `>=24.12 <25`
**Primary Dependencies**: existing exact `codebase-memory-mcp@0.10.1`; proposed
exact `@modelcontextprotocol/client@2.0.0`; existing exact `yaml@2.9.0` unchanged
**Storage**: existing disposable private provider cache outside the repository;
diagnostics are emitted, not canonical shared state
**Testing**: colocated `node:test`, fake/captured offline fixtures, opt-in real
managed-provider integration
**Target Platform**: existing accepted Linux x64 walking-skeleton host
**Project Type**: local-first modular-monolith CLI/tooling application
**Performance Goals**: scoped-session median total time at most 50% of one-shot
across three alternating paired fixture rounds
**Constraints**: zero standing process; no watcher/daemon/UI; no source mutation;
no hidden fallback; no network/credential/model call in mandatory verification
**Scale/Scope**: one TypeScript repository, one evidence task, five accepted
critical facts within three of 12 fixture files

## Constitution Check

*GATE: Passed before Phase 0 research; re-checked after Phase 1 design.*

- **Evidence Before Abstraction**: real one-shot timing exists; the session
  surface receives an exact compatibility spike before adapter changes.
- **Local-First Explicit Authority**: session lifetime is one explicit evidence
  round. No provider install/config command, watcher, UI, credential or network
  runtime path is added.
- **Agent-Navigable Ownership**: protocol code remains in the registered
  Codebase Memory provider; orchestration stays in the registered repository-OKF
  application owner; public core contracts remain unchanged.
- **Cumulative Knowledge**: the graph/evidence layer changes no OKF apply or
  protection semantics.
- **Specification and Deterministic Verification**: `AB-GRAPH-*` requirements,
  fake-session tests, explicit error/recovery tests and offline canonical gate
  precede implementation.
- **Material approval**: the exact production MCP client dependency and process
  lifecycle are documented for owner approval before application changes.

Post-design check: passed. No principle deviation or exception is required.

## Project Structure

### Documentation (this feature)

```text
specs/003-scoped-graph-session/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── cli.md
│   └── provider-session.md
├── checklists/
│   ├── requirements.md
│   └── lifecycle.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── providers/codebase-memory/
│   ├── session.ts
│   ├── session.test.ts
│   ├── adapter.ts
│   ├── errors.ts
│   └── index.ts
├── app/repository-okf/
│   ├── graph-round.ts
│   ├── graph-round.test.ts
│   ├── real-evidence.ts
│   └── index.ts
└── cli.ts

fixtures/codebase-memory-v0.10.1/
├── responses/
└── session.json
```

**Structure Decision**: extend the two existing owners. The provider owns MCP
transport/protocol lifecycle; the application owns an observable complete graph
round and paired benchmark. No new generic lifecycle or benchmark capability is
created for one current consumer.

## Phase 0: Compatibility Research

1. Pin the approved official client package exactly and verify lock integrity.
2. Start the exact admitted provider in default stdio-server mode against a
   disposable fixture and private cache.
3. Negotiate, list/call only the required tools, close, and capture sanitized
   response/error/process evidence.
4. Stop the slice if clean shutdown requires a standing daemon, provider config
   mutation or a hand-written protocol replacement.

Decision records are consolidated in [research.md](research.md).

## Phase 1: Design and Contracts

### Provider session

`src/providers/codebase-memory/session.ts` owns exact executable transport
parameters, minimal environment, negotiated calls, timeout/output bounds,
tool-error normalization, idempotent close and cleanup diagnostics. It provides
the existing `ProviderInvoker` function to `CodebaseMemoryAdapter`.

The official stdio transport supplies protocol framing and exposes the direct
child PID. AgentBase attaches its own stderr byte cap and whole-round deadline,
and real integration proves that provider descendants do not survive close.

### Observable graph round

`src/app/repository-okf/graph-round.ts` owns source identity, workspace creation,
transport selection, stage timing, evidence preparation and post-round
source/process checks. Durations use a monotonic clock and stay outside the
deterministic evidence digest.

The paired benchmark alternates order:

```text
round 1: one-shot -> scoped-session
round 2: scoped-session -> one-shot
round 3: one-shot -> scoped-session
```

Each arm gets an isolated cache namespace under the same private state policy.
Promotion requires every arm safe/complete, normalized fact/source parity and a
session median no greater than half the one-shot median.

### Failure and rollback

1. Admission failure starts no session.
2. Connection/protocol failure closes transport and returns a typed failure.
3. Tool error, malformed content, limit or timeout rejects the whole round.
4. Source drift/mutation rejects after cleanup.
5. Close first attempts graceful completion, then bounded termination. Cleanup
   uncertainty makes the real arm unacceptable.
6. No automatic transport fallback occurs; callers select one-shot explicitly.

Interface details are in [provider-session.md](contracts/provider-session.md)
and [cli.md](contracts/cli.md). Entities and states are in
[data-model.md](data-model.md); runnable proof is in
[quickstart.md](quickstart.md).

## Phase 2: Implementation Shape

- Add fake-driven session lifecycle and typed-failure tests before session code.
- Reuse the existing adapter/parser/evidence path without transport schema
  changes.
- Add deterministic graph-round measurement tests with an injected monotonic
  clock.
- Add explicit CLI transport selection and a separate opt-in paired benchmark.
- Run the real spike/benchmark only after offline behavior passes.

## Phase 3: Promotion and Closure

- Record raw paired durations, medians, parity, mutation and cleanup evidence.
- Promote scoped session only if every requirement gate passes; otherwise retain
  one-shot and close the spike with the rejected reason.
- Update a separate living Part 1 contract, ADR, README, architecture ownership,
  handoff and AgentStack pattern evidence.
- Re-measure review budgets, run production audit and `npm run verify`.

## Complexity Tracking

No constitution violation is planned. One new exact dependency is preferred to
a custom MCP client because protocol negotiation, message framing, request
correlation and cancellation are not AgentBase product differentiators. The
dependency remains contingent on the Phase 0 compatibility and audit gate.
