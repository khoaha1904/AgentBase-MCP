# Implementation Plan: Domain and Metric Concepts

**Branch**: `main` | **Date**: 2026-08-19 | **Spec**: [spec.md](spec.md)

## Summary

Extend the existing static schema catalog additively with `Domain Entity` and
`Metric`, keep one schema type per concept instance, and tighten the existing
host skill with exact live-reference/index rules. Reuse the current definition
builder, selection, validation and colocated tests; add no loader or abstraction.

## Technical Context

**Language/Version**: Node.js 24 and TypeScript 5.9

**Primary Dependencies**: Existing standard library and YAML parser; no new dependency

**Storage**: Existing Git-backed OKF Markdown; no new state or migration

**Testing**: `node:test` focused catalog/MCP/skill tests and `npm run verify`

**Target Platform**: Local AgentBase-MCP stdio/CLI runtime

**Project Type**: Modular monolith and MCP server

**Performance Goals**: Selection remains bounded to 64 signals and current catalog scale

**Constraints**: additive open-world compatibility; one type per instance; no
plugin loader, schema composition, EC2 specialization, network or model call

**Scale/Scope**: Two schemas, two new canonical roots, one skill clarification,
one backward-compatible catalog minor version

## Constitution Check

- **Evidence Before Abstraction — PASS**: both schemas require stable identity
  and semantic evidence and explicitly reject class-by-class or sample-by-sample promotion.
- **Local-First Explicit Authority — PASS**: no runtime, provider, network,
  credential or background behavior changes.
- **Agent-Navigable Ownership — PASS**: core knowledge owns catalog policy;
  the existing host skill owns authoring procedure; focused tests remain colocated.
- **Cumulative Knowledge — PASS**: the change is additive and preserves older
  known and foreign unknown types without rewrite.
- **Specification and Verification — PASS**: AB-SCHEMA-025..029,
  AB-CLAIM-004 and AB-MVP-023 have requirement-linked tests and canonical verification.

Post-design re-check: **PASS**. No dependency, migration, provider, process,
credential boundary or architecture-baseline exception is introduced.

## Project Structure

### Documentation

```text
specs/020-domain-metric-concepts/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── contracts/catalog.md
├── checklists/requirements.md
├── checklists/catalog.md
├── quickstart.md
└── tasks.md
```

### Source Code

```text
src/core/knowledge/
├── schema-definitions.ts       # two additive schema definitions
├── schema-catalog.ts           # catalog minor version
└── schema-catalog.test.ts      # selection, boundaries and compatibility

src/app/codebase-memory-mcp/
└── okf-schema-tools.test.ts    # public catalog version/schema contract

.agents/skills/agentbase-okf/
└── SKILL.md                    # exact concept/live-reference/index language

docs/contracts/okf.md           # accepted catalog and authoring contract
docs/README.md                  # current checkpoint
```

**Structure Decision**: Add definitions beside the existing catalog entries.
Do not introduce pack registries, profile composition, new runtime modules or
technology-specific automotive code.

## Complexity Tracking

No constitution violation or approved exception.
