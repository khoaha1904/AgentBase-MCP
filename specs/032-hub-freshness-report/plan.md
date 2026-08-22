# Implementation Plan: Hub Freshness Report

**Branch**: `032-hub-freshness-report` | **Date**: 2026-08-22 | **Spec**: [spec.md](spec.md)

## Summary

Add one read-only Repository freshness projection beside existing Hub query
code, compose it over the admitted local Hub, and expose it through CLI and MCP.
GitHub Actions, persisted reports and source probing stay out of this slice.

## Technical Context

**Language/Version**: Node.js 24 TypeScript executed directly

**Primary Dependencies**: Existing Node standard library and YAML-backed OKF parser

**Storage**: None; report is derived in memory from one Git commit

**Testing**: Existing Node design-level and local-Hub end-to-end cases; `npm run verify`

**Target Platform**: Local AgentBase-MCP stdio/CLI runtime

**Project Type**: Modular-monolith MCP and CLI

**Performance Goals**: One bounded pass over at most 512 Repository concepts

**Constraints**: Read-only, offline, no threshold, no new test case or dependency

**Scale/Scope**: Repository freshness only; per-value query already exists

## Constitution Check

- Evidence Before Abstraction: passes; uses exact existing observed-source metadata.
- Local-First Explicit Authority: passes; no credential, source probe or background work.
- Agent-Navigable Ownership: passes; core query owns projection and Hub app owns admitted-view composition.
- Cumulative Knowledge: passes; no proposal or accepted state is mutated.
- Specification and Verification: passes; AB-QUERY requirement and existing test journeys carry evidence.

Post-design check: all gates still pass; no exception is required.

## Project Structure

```text
src/core/knowledge/query/
└── hub-freshness.ts              bounded provider-neutral projection
src/app/hub-okf/
├── query/query.ts                admitted Hub/layer composition
├── query/runtime-actions.ts      runtime action
├── mcp/                          MCP schema and dispatch
└── cli.ts                        local CLI adapter
```

**Structure Decision**: Extend the existing query ownership instead of adding a
freshness subsystem. Reuse `HubQueryReader`, Repository identity parsing and
the fixed Hub runtime action boundary.

## Complexity Tracking

None.

