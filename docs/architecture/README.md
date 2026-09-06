# Architecture Contract

This directory owns SYSTEM HOW for AgentBase-MCP: capability ownership,
dependency direction, cross-capability flows, state and trust boundaries, and
runtime composition. Product outcomes live under
[`docs/product/`](../product/README.md), capability behavior and stable
requirements live under [`docs/capabilities/`](../capabilities/README.md), and
CODE HOW remains with the owning source modules and adjacent tests.

## Contract routes

| Question | Read | Owns |
|---|---|---|
| Where should this responsibility or code live? | [Ownership](ownership.md) | Modular-monolith responsibility map |
| Which modules may depend on which? | [Dependencies](dependencies.md) | Allowed imports and public entrypoints |
| In what order do capabilities collaborate? | [Flows](flows.md) | Query, authoring, enrichment and publication sequences |
| Which state is authoritative, and who may change it? | [State and trust](state-and-trust.md) | Storage, credentials, authority and recovery boundaries |
| How are CLI, MCP and providers composed? | [Runtime](runtime.md) | Process/runtime composition and adapters |

Read only the row relevant to the task, then its linked Capability contract.
Business outcomes belong to Product; detailed requirements belong to Capability.

Implementation paths in these documents identify the current ownership
baseline. They are architectural evidence, not a substitute for Capability
Contracts or verified source behavior.

## Change rule

Start at [`docs/README.md`](../README.md) and inspect only the affected boundary
and Capability Contract. Changes to ownership, dependency direction, state flow
or runtime shape update this Architecture Contract before implementation. The
mandatory consistency and verification gates remain in
[`AGENTS.md`](../../AGENTS.md).
