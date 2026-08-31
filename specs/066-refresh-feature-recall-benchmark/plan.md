# Implementation Plan: Refresh feature-recall benchmark

**Branch**: `feature/refresh-change-accounting` | **Date**: 2026-08-31 | **Spec**: [spec.md](spec.md)

## Summary

Reuse the existing Refresh runner, add only deterministic created-file
mutations, suite-relative baseline input, retained proposal inspection and a
small priority assessment. Run one Crawler retry/DLQ probe after deterministic
verification and stop before C2 unless C1 is sound.

## Upstream Contracts

- **Product Contract**: `docs/product/07-ai-sdlc-context.md`.
- **Architecture Contract**: `docs/architecture/flows.md`.
- **Capability Contract**: `docs/capabilities/12-version-scope/03-benchmark-requirements.md`.
- **Affected Requirements**: `AB-BENCH-088..090`.
- **Baseline Commit**: `c2fe125d91e6154891e37a8344abc719747ab71c`.

## Technical Context

**Language/Version**: JavaScript/TypeScript on Node.js 24.12

**Primary Dependencies**: existing benchmark runner and OKF parser; no new package

**Storage**: immutable suite input in AgentBase-Benchmark and timestamped result evidence

**Testing**: Node test runner plus `npm run verify`

**Constraints**: no operator Hub mutation, Accept, Publish, provider CLI or second model run after a blocker

## Constitution Check

- **Evidence Before Abstraction**: pass; semantic probes require changed concept bytes and exact repository sources.
- **Local-First Explicit Authority**: pass; all runtime state is disposable and the source/Hub inputs are copied.
- **Agent-Navigable Ownership**: pass; the MCP repository owns the runner and the Benchmark repository owns inputs/results.
- **Cumulative Knowledge Without Implicit Destruction**: pass; the benchmark uses ordinary Refresh review semantics.
- **Specification and Deterministic Verification**: pass; offline gates precede one opt-in model run.

## Implementation Decisions

| Concern | Choice | Rationale and trade-off |
|---|---|---|
| C0 | Copy exact Published Hub bytes into the suite | Measures current data without paying for or varying Initial Ingest |
| C1 | Retry + DLQ + alarm + partial batch response | Crosses code, infrastructure and failure semantics used by AIT |
| Scoring | Three critical probes plus important supporting probes | Tests usefulness without requiring a fixed concept shape |
| Evidence | Retain proposal, inspection, bundle, trace, duration and usage | Makes omissions and cost independently reviewable |

## Validation Mapping

| Requirement | Implementation surface | Evidence |
|---|---|---|
| `AB-BENCH-088` | Refresh seeding and suite baseline | source/Hub integrity checks |
| `AB-BENCH-089` | mutation/accounting capture | focused runner tests and inspection |
| `AB-BENCH-090` | priority assessment | focused probe tests and real C1 report |

## Complexity Tracking

No dependency, service, schema or production-runtime addition.
