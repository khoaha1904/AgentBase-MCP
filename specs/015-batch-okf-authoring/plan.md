# Implementation Plan: Batch OKF Authoring

**Branch**: `main` | **Date**: 2026-08-15 | **Spec**: [spec.md](spec.md)

## Summary

Add one selected-schema batch tool and one bundle-validation tool, both backed
by existing pure OKF logic. Keep all legacy tools. Then add immutable v4 prompts
and benchmark instrumentation before measuring the same workflow on the two
retained heterogeneous fixtures.

## Technical Context

**Language/Version**: Node.js 24 and TypeScript

**Dependencies**: Existing standard library, OKF parser and schema catalog only

**Testing**: `node:test`, fake Codex lifecycle and `npm run verify`

**Constraints**: no arbitrary filesystem reads, new dependencies, gold leakage,
fixture-specific behavior or external authority

## Constitution Check

- **Evidence Before Abstraction — PASS**: retained v3 traces isolate repeated
  schema/validation turns and content as the measured overhead.
- **Local-First Explicit Authority — PASS**: both tools accept bounded supplied
  values and perform no I/O.
- **Agent-Navigable Ownership — PASS**: core selection/validation remains under
  `core/knowledge`; MCP composition remains under `app/codebase-memory-mcp`.
- **Cumulative Knowledge — PASS**: legacy tools, prompts and v3 evidence remain
  immutable and available.
- **Specification and Verification — PASS**: capability 015 records behavior
  and measurable gates before implementation.

Post-design re-check: **PASS**. The smallest useful surface is two batch tools:
one before authoring and one after authoring. Combining graph investigation or
filesystem output would expand authority and is not justified by the evidence.

## Design

### Selected schema guidance

`get_okf_authoring_schemas({ signals })` applies the existing deterministic
selector and joins each recommendation with its complete catalog definition.
The response contains only selected types plus catalog/OKF version and remains
advisory. Empty, excessive or invalid signals fail.

### Bundle validation

`validate_okf_bundle({ concepts })` accepts the same bounded
`{ identity, path, content }` values as relationship validation. Parse each
concept once; return its type, known-schema status and merged draft/schema
failures, then run the existing relationship-set validator over the same parsed
documents. The top-level result is valid only when both layers pass.

### Benchmark v4

The MCP prompt replaces list/select/get plus per-file/relationship validation
with the two batch tools. Source investigation and the shared direct authoring
contract do not change. Instrument completed calls and serialized argument/
result bytes from the retained JSONL trace; do not reinterpret these bytes as
model tokens.

## Complexity Tracking

No constitutional violations or complexity exceptions.

