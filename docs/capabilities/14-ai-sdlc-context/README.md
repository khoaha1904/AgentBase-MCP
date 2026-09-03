# 14 — Context for AI SDLC workflows

> Status: The explicit Phase 1 context skill and Phase 2 planning and
> implementation qualification harnesses are implemented.

Product Contract:
[`AI SDLC context`](../../product/07-ai-sdlc-context.md)

Architecture Contract:
[Query and context flow](../../architecture/flows.md#query-and-context-flow).

## Scope

Phase 1 tests whether BA/PO/DM Discovery benefits from Published Hub without
source. Phase 2 separately tests whether developer Task Planning and actual
implementation benefit from bounded local Code Graph/source evidence.

## Contract map

- **Qualification design:**
  [`01-feature-discovery-qualification.md`](01-feature-discovery-qualification.md)
  — on-demand Hub session, fixed Crawler Feature, A/B arms and no-worse gate.
- **Normative Capability Contract:**
  [`02-runtime-requirements.md`](02-runtime-requirements.md) — current
  `AB-CONTEXT-*` authority for qualification and future runtime admission.
  [`04-task-planning-runtime-requirements.md`](04-task-planning-runtime-requirements.md)
  and [`06-end-to-end-contract.md`](06-end-to-end-contract.md) — task-planning
  and full-lifecycle benchmark behavior.
- **Qualification design and evidence summary:**
  [`03-task-planning-qualification.md`](03-task-planning-qualification.md) —
  developer/source boundary, impact and non-goals.
  [`05-end-to-end-qualification.md`](05-end-to-end-qualification.md) — full
  Feature → US → Tasks comparison and its impact.
- **Implementation outcome evidence:**
  [`09-implementation-outcome-qualification.md`](09-implementation-outcome-qualification.md)
  — editable source/graph pair, independent verification and patch replay.
- **Visual-context decision and readiness:**
  [`07-useful-visual-context.md`](07-useful-visual-context.md) — the small
  phase-prioritized diagram portfolio, current data support and missing slices.

Qualification pages define bounded scenarios and summarize results. Durable run
artifacts live in AgentBase-Benchmark; tests and retained reports are Validation
Evidence and do not override the `AB-CONTEXT-*` requirements.

The first qualification exposes only current Published search/read to the
assisted arm and reuses the existing Crawler fixture. It does not prebuild
context or add a new MCP tool, search system, Hub schema, storage layer or
installed skill before the result demonstrates value.
