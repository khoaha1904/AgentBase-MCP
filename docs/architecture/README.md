# Architecture Contract

This directory owns SYSTEM HOW for AgentBase-MCP: capability ownership,
dependency direction, cross-capability flows, state and trust boundaries, and
runtime composition. Product outcomes live under
[`docs/product/`](../product/README.md), capability behavior and stable
requirements live under [`docs/capabilities/`](../capabilities/README.md), and
CODE HOW remains with the owning source modules and adjacent tests.

## Contract routes

- [Ownership](ownership.md) — modular-monolith shape and responsibility map.
- [Dependencies](dependencies.md) — allowed dependency direction and public
  entrypoint rules.
- [Cross-capability flows](flows.md) — repository knowledge, query, enrichment
  and publication sequences.
- [State and trust](state-and-trust.md) — authority transitions, local state,
  credentials and trust boundaries.
- [Runtime](runtime.md) — MCP, provider, Hub, CLI and qualification composition.

Implementation paths in these documents identify the current ownership
baseline. They are architectural evidence, not a substitute for Capability
Contracts or verified source behavior.

## Change rule

Start at [`docs/README.md`](../README.md) and inspect only the affected boundary
and Capability Contract. Changes to ownership, dependency direction, state flow
or runtime shape update this Architecture Contract before implementation. The
mandatory consistency and verification gates remain in
[`AGENTS.md`](../../AGENTS.md).
