# AgentBase Next Repository Guide

This repository is the clean foundation for the next AgentBase implementation.
It intentionally starts with product and architecture context before runtime
code.

## Session startup

Read these files in order before interpreting a task:

1. `docs/handoff.md`
2. `docs/product/vision.md`
3. `docs/ARCHITECTURE.md`
4. `specs/CURRENT.md`

Then inspect Git status. The latest user request and live repository state have
priority over stale planning prose.

Communicate with the user in Vietnamese. Keep repository documentation and
source identifiers in English unless the user asks otherwise.

## Development workflow

- Use specification-driven development for product or architecture changes.
- Start with the smallest user-visible outcome and record owner decisions
  before selecting implementation details.
- Keep one active capability in `specs/CURRENT.md`.
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
- Prefer deterministic, local processing for Code Intelligence.
- Keep the detailed local graph disposable and non-canonical.
- Only stable, provenance-bearing observations may cross into OKF workflows.

The intended module layout and dependency direction are defined in
`docs/ARCHITECTURE.md`. Do not create runtime folders before the active feature
plan selects a runtime and establishes automated boundary checks.

## Safety and legacy boundaries

- Never read or expose secrets, credentials, tokens, keys or `.env` files.
- The sibling legacy repositories are historical references, not dependencies.
- Their working trees may be dirty. Do not edit, clean, reset, commit or copy
  them wholesale while working in this repository.
- Do not share raw local graph databases through Git or OKF storage.
- Do not let a missing observation in one ingest implicitly delete accepted
  knowledge.
