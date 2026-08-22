# Implementation Plan: Batch Initial Ingest Qualification

**Branch**: `031-batch-ingest-qualification` | **Date**: 2026-08-22 | **Spec**: [spec.md](spec.md)

## Summary

Extend the existing opt-in benchmark runner with one batch workflow and one
immutable prompt/manifest. Reuse the production MCP, runtime isolation, Codex
event capture and proposal validation; do not add a model SDK, scorer framework
or production dependency.

## Technical Context

**Language/Version**: Node.js 22 JavaScript benchmark scripts and TypeScript product runtime

**Primary Dependencies**: Existing Node standard library, Codex CLI and AgentBase MCP

**Storage**: Immutable files under `benchmark/results/`

**Testing**: Existing Node lifecycle-contract tests; `npm run verify`

**Target Platform**: Linux host, explicitly opt-in model execution

**Project Type**: Modular-monolith MCP plus repository-owned benchmark utility

**Performance Goals**: One bounded sequential process within the existing 15-minute timeout

**Constraints**: Terraform-only, Sol medium, no Accept/Publish/provider access,
one probe before any replica, no new top-level test case

**Scale/Scope**: Exactly two pinned repositories and one combined proposal

## Constitution Check

- Evidence Before Abstraction: passes; one real batch is retained with limits.
- Local-First Explicit Authority: passes; model execution is explicit opt-in.
- Agent-Navigable Ownership: passes; benchmark scripts own orchestration and
  production Batch Init remains unchanged.
- Cumulative Knowledge: passes; isolated Hub and proposal-only execution.
- Specification and Verification: passes; AB-BENCH requirements and fake gate precede the real run.

## Project Structure

```text
benchmark/
├── prompts/okf-batch-ingest-v1.md
├── repos/aws-cloud-operations-batch/
│   └── manifest.json
└── results/aws-cloud-operations-batch/<run-id>/

scripts/benchmark/
├── benchmark-agent.mjs
├── benchmark-okf.mjs
└── benchmark-okf.test.mjs
```

**Structure Decision**: Keep batch qualification beside the existing benchmark
runner and reuse product MCP tools through their public server surface.

## Complexity Tracking

None. No production dependency, provider, migration or architecture exception.
