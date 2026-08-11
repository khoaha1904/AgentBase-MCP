# AgentDocks Architecture Reference

The clean foundation is inspired by the separate AgentDocks repository at
`/home/khoa/workspace/AgentDocks`. This document captures the relevant patterns
so routine AgentBase work remains self-contained.

## Patterns to adopt

- A short root `AGENTS.md` routes sessions to authoritative documents.
- `docs/ARCHITECTURE.md` explains ownership and dependency direction.
- A modular monolith uses owner zones and capability-level public entrypoints.
- A machine-readable module registry exhaustively owns source and test files.
- Automated checks reject private cross-module imports, reverse dependencies,
  cycles, unknown ownership, stale allowances and uncontrolled file growth.
- Tests are discovered recursively and live beside the capability they protect.
- Deterministic shared test setup lives in capability-owned test support.
- Current requirements live in concise docs; historical feature artifacts live
  under numbered `specs` directories.
- Work, status and release gates are scripted rather than remembered manually.
- File-size limits are review signals backed by a baseline, not style theater.

## Patterns not copied blindly

- Runtime and dependency choices must be selected for AgentBase requirements.
- AgentDocks module names do not define AgentBase domain boundaries.
- Scripts, specs and source files are not bulk-copied.
- Background services or automatic installation require an explicit AgentBase
  product decision.
