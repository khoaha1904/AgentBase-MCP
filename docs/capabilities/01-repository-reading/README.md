# 01 — Repository reading

> Status: Core local reading, lazy multi-repository workspace routing and
> Capability 046 remote-default Hub authoring snapshots are implemented;
> arbitrary remote clone/query remains out of scope.

Product Contract:
[Repository understanding](../../product/01-repository-understanding.md)

## Contract map

- [`00-baseline-and-impact.md`](00-baseline-and-impact.md) — graph, evidence and
  skill baseline; identifies reusable parts and gaps.
- [`01-skill-orchestration.md`](01-skill-orchestration.md) — Ingest/Refresh skill
  coordination between Agent and MCP.
- [`02-code-graph-lifecycle.md`](02-code-graph-lifecycle.md) — create, use,
  refresh and discard a Code Graph.
- [`03-source-evidence-resolution.md`](03-source-evidence-resolution.md) — return
  from the graph to source for evidence.
- [`04-reading-boundaries-and-failures.md`](04-reading-boundaries-and-failures.md)
  — local/workspace boundary, read limits and failure outcomes.
- [`05-runtime-requirements.md`](05-runtime-requirements.md) — current graph,
  refresh and MCP `AB-*` requirements.

## Current implementation delta

`agentbase-query`, `use-codebase-memory`, Initial Ingest and Refresh connect the
Published Hub, owned Codebase Memory, exact source reads and evidence
validation. A graph remains private/rebuildable and is used only for a
local/workspace repository. Batch Ingest processes an explicit repository list
sequentially in section 09. Public Scan inventories bounded Git roots; the query
skill selects one explicit root or asks again, and the gateway switches
repository sessions sequentially. There is no combined graph or workspace
registry.

Capability 046 retains this gateway/provider but adds a machine-derived
Discovery Seed, compact signal groups and bounded source census. Hub Init may
materialize the exact remote default commit in a detached worktree/cache; this
does not change ordinary-query authority or auto-clone repositories outside the
selected workflow.
