# Implementation Plan: Agent-driven OKF Benchmark

**Branch**: `012-agent-okf-benchmark` | **Date**: 2026-08-14 | **Spec**: [spec.md](spec.md)

## Summary

Turn the existing manual AWS result recorder into an opt-in Codex-driven
benchmark. A small process owner creates an isolated result workspace, invokes
`codex exec` with an explicit AgentBase stdio MCP configuration, captures JSONL
events and proves the fixture remains unchanged. A deterministic scorer matches
agent-authored concept instances against bounded semantic identity expectations.
The existing schema catalog gains investigation guidance; no model SDK,
credential handling, graph copy or LLM judge is added.

## Technical Context

**Language/Version**: Node.js `>=24.12 <25`, TypeScript `5.9.3`

**Primary Dependencies**: Node standard library, existing YAML and MCP SDKs; installed external `codex` CLI `0.147.0` for opt-in runs

**Storage**: Git-tracked benchmark manifests, expectations and timestamped result artifacts; disposable provider graph remains private

**Testing**: `node:test` with a fake Codex executable plus existing OKF validators

**Target Platform**: Local Unix-like development hosts with Codex CLI authentication already configured

**Project Type**: Repository benchmark tooling plus existing MCP schema catalog

**Performance Goals**: one bounded agent process per selected repository; default 15-minute process timeout

**Constraints**: source fixtures read-only; result workspace is the only writable agent path; no secret/config reads; real run excluded from canonical verification

**Scale/Scope**: one AWS serverless suite, two repositories, one Codex adapter and enriched AWS/business schemas

## Constitution Check

- **Evidence Before Abstraction — PASS**: one concrete Codex adapter and two real AWS fixtures; provider-neutral framework deferred.
- **Local-First Explicit Authority — PASS**: model work is optional and explicit; mandatory graph and canonical checks remain local/offline.
- **Agent-Navigable Ownership — PASS**: process lifecycle is isolated in `scripts/benchmark-agent.mjs`; semantic scoring remains in `scripts/benchmark-okf.mjs`; schema policy remains in `src/core/knowledge`.
- **Cumulative Knowledge — PASS**: benchmark output never applies to shared Hub OKF and raw graph data is not committed.
- **Specification and Verification — PASS**: `AB-BENCH-001..008` and `AB-SCHEMA-010..011` have fake-process and deterministic scoring evidence.

Post-design gate passes. The external process is owner-approved by the request
to run a real agent benchmark. No dependency, credential boundary, migration,
daemon or architecture exception is introduced.

## Project Structure

```text
benchmark/
├── README.md
├── prompts/okf-author-v1.md
├── repos/aws-serverless/
│   ├── manifest.json
│   └── expected/*.json
└── results/aws-serverless/<repository>/<run-id>/
    ├── run.json
    ├── prompt.md
    ├── agent-events.jsonl
    ├── agent-final.md
    ├── okf/
    ├── metrics.json
    └── report.md
scripts/
├── benchmark-agent.mjs
├── benchmark-agent.test.mjs
├── benchmark-okf.mjs
└── benchmark-okf.test.mjs
src/core/knowledge/
├── schema-definitions.ts
└── schema-catalog.ts
```

**Structure Decision**: Keep external-process lifecycle separate from pure
scoring because they fail, test and evolve for different reasons. Reuse the
existing OKF loader and catalog; do not add a benchmark runtime capability
under `src/` or an agent-provider interface with one implementation.

## Design

1. Manifest pins `catalogVersion`, `promptVersion`, Codex version/model/effort/timeout and expectation paths.
2. `run` validates source and executable, creates only the result workspace, renders the versioned prompt and invokes Codex in `workspace-write`, `ephemeral`, JSONL mode with AgentBase MCP required.
3. Prompt requires exactly one graph index, schema discovery/read, source investigation and complete OKF output under `okf/`; it forbids source mutation and manual claims sidecars.
4. Expectations list concept `key`, `type`, required metadata fields, required evidence paths and directed relationships.
5. Finalization matches semantic identity terms plus evidence, uses `benchmark_key` for relationships, validates OKF/provenance, resolves Markdown links and emits independent precision/recall/completeness metrics.
6. Fake-process tests prove command isolation, artifacts, explicit failure and source immutability. Real qualification remains opt-in.

## Rollback

Delete only the newly created timestamped result directory after resolving its
exact path. Source fixtures and graph state are never rollback targets. A
failed run remains reviewable and cannot be finalized as passing.

## Complexity Tracking

No violation or exception.
