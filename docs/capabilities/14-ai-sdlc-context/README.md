# 14 — Context for AI SDLC workflows

> Status: Phase 1 Feature Discovery and Phase 2 Task Planning qualification
> harnesses are implemented; no context skill or runtime behavior is added.

High-level decision:
[`Context for AI workflows in the SDLC`](../../product/14-context-for-ai-sdlc-workflows.md)

## Scope

Phase 1 tests whether BA/PO/DM Discovery benefits from Published Hub without
source. Phase 2 separately tests whether developer Task Planning benefits from
bounded local Code Graph/source evidence.

## Design routes

- [`01-feature-discovery-qualification.md`](01-feature-discovery-qualification.md)
  — on-demand Hub session, fixed Crawler Feature, A/B arms and no-worse gate.
- [`02-runtime-requirements.md`](02-runtime-requirements.md) — current
  `AB-CONTEXT-*` authority for qualification and future runtime admission.
- [`03-task-planning-qualification.md`](03-task-planning-qualification.md) —
  developer/source boundary, impact and non-goals.
- [`04-task-planning-runtime-requirements.md`](04-task-planning-runtime-requirements.md)
  — paired runner, output contract, scoring and current evidence.
- [`05-end-to-end-qualification.md`](05-end-to-end-qualification.md) — full
  Feature → US → Tasks comparison and its impact.
- [`06-end-to-end-contract.md`](06-end-to-end-contract.md) — end-to-end tool,
  output and scoring contract.

The first qualification exposes only current Published search/read to the
assisted arm and reuses the existing Crawler fixture. It does not prebuild
context or add a new MCP tool, search system, Hub schema, storage layer or
installed skill before the result demonstrates value.
