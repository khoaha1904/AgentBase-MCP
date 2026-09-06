---
name: agentbase-context
description: Explicit-only AgentBase compatibility entry. Use only when the user names $agentbase-context to use the shared AgentBase read workflow; prefer $agentbase-query for new requests.
---

# AgentBase context compatibility

Read and follow [the shared AgentBase use instructions](../agentbase-query/SKILL.md).
This explicit invocation authorizes that read workflow without requiring the
user to invoke a second skill. If both names are present, execute it only once.

An active primary workflow keeps its deliverable and approvals. When invoked
alone, return concise context for the requested question. This alias grants no
source, provider, preparation or publication permission beyond the shared
workflow's normal boundaries. If the linked skill is unavailable, report an
incomplete installation; do not invent a fallback workflow.
