# AgentBase-MCP Repository Guide

This checkout is the clean rebuild source for AgentBase-MCP. Its current
directory name is temporary and must not become product identity or a generated
OKF subject.

## Session startup

Read these files in order before interpreting a task:

1. `docs/handoff.md`
2. `docs/product/vision.md`
3. `docs/references/open-knowledge-format.md`
4. `docs/ARCHITECTURE.md`
5. `docs/specs/project-foundation.md`
6. `docs/specs/local-code-intelligence.md`
7. `docs/specs/single-repository-okf.md`
8. `docs/specs/observations.md`
9. `docs/specs/product-identity.md`
10. `docs/specs/okf-schema-catalog.md`
11. `docs/specs/agentbase-hub.md`
12. `specs/CURRENT.md`

Then inspect Git status. The latest user request and live repository state have
priority over stale planning prose.

Communicate with the user in Vietnamese. Keep repository documentation and
source identifiers in English unless the user asks otherwise.

## Development workflow

- Use specification-driven development for product or architecture changes.
- Start with the smallest user-visible outcome and record owner decisions
  before selecting implementation details.
- Keep at most one active capability in `specs/CURRENT.md`; record `None` and the
  most recent completed capability between approved slices.
- Keep current accepted behavior under `docs/specs/`; numbered capability
  artifacts are change records and become historical after completion.
- Keep historical capability artifacts under `specs/<number>-<name>/`.
- Update `docs/handoff.md` at meaningful checkpoints, not after every edit.
- Do not implement a large migration directly from the legacy repositories.
  Extract one verified behavior at a time behind a new contract.

## Architecture rules

- Build a modular monolith until measured evidence justifies distribution.
- Organize source by owned capability, not by generic technical layer.
- Give every capability a small public entrypoint.
- Import another capability only through its public entrypoint.
- Keep tests beside the capability that owns the behavior.
- Treat file-size and dependency-boundary checks as agent navigation controls.
- Treat review-size and import-count findings as prompts to inspect cohesion, not
  as targets to game. Split a file only when the resulting files have distinct,
  nameable responsibilities and can evolve independently. Never add forwarding
  wrappers, artificial barrels or miscellaneous fragments merely to pass the
  architecture check. When a cohesive public entrypoint or composition root is
  intentionally above a review threshold, record one exact, owner-approved,
  non-growing architecture-baseline mark with a reason and review condition.
- Prefer deterministic, local processing for Code Intelligence.
- Keep the detailed local graph disposable and non-canonical.
- Only stable, provenance-bearing observations may cross into OKF workflows.

The intended module layout and dependency direction are defined in
`docs/ARCHITECTURE.md`. Before adding a runtime capability, confirm its active
plan, public entrypoint, registry owner and focused test surface.

## Safety and legacy boundaries

- Never read or expose secrets, credentials, tokens, keys or `.env` files.
- The sibling legacy repositories are historical references, not dependencies.
- Their working trees may be dirty. Do not edit, clean, reset, commit or copy
  them wholesale while working in this repository.
- Do not share raw local graph databases through Git or OKF storage.
- Do not let a missing observation in one ingest implicitly delete accepted
  knowledge.
