# Implementation Plan: Refresh change accounting

**Branch**: `feature/refresh-change-accounting` | **Date**: 2026-08-31 | **Spec**: [spec.md](spec.md)

## Summary

Freeze the existing bounded source-change result in runtime Refresh sessions,
require one evidenced or explicitly non-materialized outcome for each returned
path at Finalize, and retain the normalized accounting in proposal inspection.
Reuse the existing Repository observed-source proposal update; add no Hub schema,
store, dependency or background work.

## Upstream Contracts

- **Product Contract**: `docs/product/03-knowledge-lifecycle.md` — visible outcomes for the bounded source delta.
- **Architecture Contract**: `docs/architecture/flows.md` — accounting remains proposal-review context.
- **Capability Contract**: `docs/capabilities/09-ingest-and-refresh/02-refresh-and-change-detection.md`, `06-refresh-reconciliation.md` and `docs/capabilities/11-review-and-publish/01-runtime-requirements.md`.
- **Affected Requirements**: `AB-REFRESH-013..016`.
- **Baseline Commit**: `c2fe125d91e6154891e37a8344abc719747ab71c`.

## Technical Context

**Language/Version**: TypeScript on Node.js 24.12

**Primary Dependencies**: existing Hub authoring/review and OKF document parser; no new package

**Storage**: existing private session JSON and proposal `inspection.json`; no new durable store or OKF field

**Testing**: Node test runner plus `npm run verify`

**Target Platform**: supported AgentBase MCP environments

**Project Type**: modular-monolith MCP/CLI server

**Performance Goals**: linear validation over at most 128 returned paths and the already bounded proposal concept set

**Constraints**: no full scan, model call, publication transition, secret-like path exposure, schema migration or dependency

**Scale/Scope**: one Repository Refresh session and its existing bounded delta

## Constitution Check

- **Evidence Before Abstraction**: pass. Materialized outcomes bind to parsed exact repository-source resources and changed concept bytes.
- **Local-First Explicit Authority**: pass. Validation uses already authorized local session/source state and adds no network/process authority.
- **Agent-Navigable Ownership**: pass. Authoring owns normalization/validation; review owns inspection shape; MCP owns wire parsing.
- **Cumulative Knowledge Without Implicit Destruction**: pass. Ignored and unresolved outcomes remain visible; no deletion behavior changes.
- **Specification and Deterministic Verification**: pass. Current contracts and stable requirements precede implementation with focused success/failure/retry tests and the canonical gate.

Post-design recheck: pass with no exception, migration, dependency, daemon, schema or architecture-baseline growth.

## Project Structure

### Documentation (this feature)

```text
specs/065-refresh-change-accounting/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/finalize-mcp.md
└── tasks.md
```

### Source Code

```text
src/app/hub-okf/
├── authoring/
│   ├── refresh-change-accounting.ts
│   ├── refresh-change-accounting.test.ts
│   └── authoring-session.ts
├── mcp/
│   ├── mcp-tool-actions.ts
│   ├── mcp-tool-call.ts
│   └── mcp-tools.ts
├── query/runtime-actions.ts
└── review/inspect.ts

.agents/skills/agentbase-refresh/SKILL.md
```

**Structure Decision**: keep validation in one authoring-owned module, persist only through the existing session/proposal artifacts, and extend the current MCP Finalize boundary rather than adding an orchestration layer.

## Implementation Decisions

| Concern | Choice | Rationale and trade-off |
|---|---|---|
| Ownership and affected modules | Authoring validator, session Finalize, review inspection and MCP parser/schema | Uses existing responsibility boundaries without a new service |
| Interfaces and data contracts | Add optional `change_accounting` to Finalize; runtime Refresh requires it when returned paths are non-empty | Wire-compatible for Init and legacy direct sessions; behavioral enforcement is Refresh-only |
| State, migration and recovery | Store captured delta in private session JSON and accounting in proposal inspection | Optional additive fields need no migration; validation failure keeps the session editable |
| Dependencies, security and compatibility | No dependency or new source access; exact paths are only those already filtered and returned by source discovery | Existing source authority and secret-like path exclusions remain unchanged |

## Validation Mapping

| Requirement | Implementation surface | Verification evidence |
|---|---|---|
| `AB-REFRESH-013` | `runtime-actions.ts`, `authoring-session.ts` | focused session freeze/read test |
| `AB-REFRESH-014` | `refresh-change-accounting.ts`, MCP Finalize parser | missing/duplicate/extra/retry tests |
| `AB-REFRESH-015` | `refresh-change-accounting.ts` | materialized evidence/new-vs-update tests |
| `AB-REFRESH-016` | `inspect.ts`, `authoring-session.ts` | partial inspection and ignored-only proposal tests |

## Complexity Tracking

No constitution violation or complexity exception.
