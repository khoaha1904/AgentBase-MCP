# Implementation Plan: Explicit Observation Command

**Branch**: `main` | **Date**: 2026-08-12 | **Spec**: [spec.md](spec.md)

## Summary

Expose the already accepted repository-evidence round as an explicit `observe`
CLI action. Reuse the exact managed Codebase Memory adapter and normalized
evidence bundle; keep every OKF operation behind the separate `okf` command.

## Technical Context

**Language/Version**: Node.js 24 erasable TypeScript

**Primary Dependencies**: existing exact `codebase-memory-mcp@0.10.1`

**Storage**: stdout JSON plus existing private disposable provider state

**Testing**: `node:test`, captured/fake providers, opt-in real MCP evidence

**Target Platform**: current Linux x64 deployment target

**Project Type**: local CLI and modular monolith

**Performance Goals**: no additional graph round; CLI wrapper overhead negligible

**Constraints**: offline canonical verification; no model, credential, watcher,
new dependency, parallel graph schema or implicit OKF action

**Scale/Scope**: one repository, one symbol, one bounded evidence round

## Constitution Check

- Evidence Before Abstraction: pass; reuses measured provider evidence.
- Local-First Explicit Authority: pass; both observation and OKF are explicit.
- Agent-Navigable Ownership: pass; CLI composition and existing observation owner only.
- Cumulative Knowledge: pass; this slice does not mutate knowledge.
- Specification and Verification: pass; AB-OBS IDs precede implementation.

Post-design re-check: pass. No dependency, provider, process-lifecycle or
architecture exception is introduced.

## Project Structure

```text
src/
├── cli.ts
├── app/repository-okf/real-evidence.ts
└── core/observations/
docs/specs/observations.md
specs/006-explicit-observation-command/
```

**Structure Decision**: retain the existing graph-round and evidence owners.
The small CLI surface does not justify moving accepted implementation files;
living requirements make the product boundary explicit.
