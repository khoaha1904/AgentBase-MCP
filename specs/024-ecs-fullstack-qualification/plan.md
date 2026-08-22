# Implementation Plan: ECS Full-stack Qualification

**Branch**: `main` | **Date**: 2026-08-22 | **Spec**: [spec.md](spec.md)

## Summary

Add one pinned full-stack Initial Ingest suite using Sol, review its output as a
possible Refresh baseline, then add a Terra Refresh suite with a deterministic
cross-file `/status` to `/health` mutation and exact knowledge gate. Stop at the
first clear blocker and keep OKF, MCP and benchmark findings separate.

## Technical Context

**Language/Version**: JavaScript ESM benchmark harness; existing TypeScript product

**Primary Dependencies**: Node.js standard library and existing Codex CLI/MCP

**Storage**: Immutable Markdown/JSON benchmark artifacts and isolated temporary Git/Hub state

**Testing**: Existing 50-test suite plus one table entry in the benchmark contract test

**Target Platform**: Local Linux qualification; no AWS connection or deployment

**Project Type**: Benchmark fixture, manifest, prompt and retained evidence

**Performance Goals**: One Sol Init probe; one Terra Refresh probe plus at most one sequential replica

**Constraints**: Pinned clean source; no Accept, Publish, provider CLI, Hub PR, schema type or production dependency

**Scale/Scope**: One full-stack repository, two workflows, one exact cross-file mutation

## Constitution Check

- **Evidence Before Abstraction — PASS**: a real pinned repo precedes any product rule.
- **Local-First Explicit Authority — PASS**: model calls are explicit benchmark actions; AWS is never contacted.
- **Agent-Navigable Ownership — PASS**: existing benchmark runner/scorer remain owners.
- **Cumulative Knowledge — PASS**: Refresh starts only from a retained reviewed baseline and stops before Accept.
- **Specification and Verification — PASS**: capability 024 and deterministic checks precede model runs.

Post-design check: **PASS**. No dependency, provider, schema or architecture boundary is added.

## Design Decisions

### 1. Keep Init and Refresh as separate suites

The existing manifest-level model setting is sufficient: the Init manifest pins
Sol and the later Refresh manifest pins Terra. Do not add per-step orchestration
or a generic workflow engine.

### 2. Extend mutation input only as far as needed

Refresh source preparation accepts the existing single `mutation` or a bounded
`mutations` list. Each entry retains exact path/from/to/count validation and one
synthetic commit contains the complete consistent change.

### 3. Gate the baseline before Refresh

The Sol result must be structurally valid, owner-review useful and include exact
backend health-contract evidence. A merely high aggregate score is insufficient.
The accepted artifact path is then pinned in the Terra Refresh manifest.

### 4. Treat completeness as diagnostic

Repository, confirmed Domain, recognizable system and useful client/server
workloads are reference probes. Supporting ALB, ECS, DynamoDB, S3, SNS and CI/CD
knowledge normally belongs in useful parents; optional additional concepts are
reviewed, not rejected by count.

## Project Structure

```text
benchmark/
├── prompts/                         # existing Init V15; new immutable ECS Refresh prompt
├── repos/aws-ecs-fullstack/         # Sol Init manifest and curated expectation
├── repos/aws-ecs-fullstack-refresh/ # Terra manifest after baseline approval
└── results/                         # retained sequential evidence
scripts/benchmark/
├── benchmark-agent.mjs              # bounded multi-file synthetic mutation
└── benchmark-okf.test.mjs           # manifest/model/mutation contract
specs/024-ecs-fullstack-qualification/
```

**Structure Decision**: Reuse the existing benchmark capability; no production source ownership changes.
