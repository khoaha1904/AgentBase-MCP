---
name: use-codebase-memory
description: Navigate a repository through AgentBase's managed Codebase Memory graph. Use for architecture discovery, symbol relationships, callers/callees, dependency or impact tracing, relevant-code lookup, exact snippets, index freshness, or coverage checks before reading source broadly.
---

# Use the managed code graph

Delegate graph construction and queries to the AgentBase MCP surface backed by
exact `codebase-memory-mcp@0.10.1`. Treat raw graph data as private disposable
working context, not OKF knowledge.

## Workflow

1. Select one repository root explicitly. Resolve its absolute root; never scan
   home or a workspace parent recursively.
2. On a new MCP connection, call `index_repository` for that root. Give the
   project a clear name when useful. Keep `persistence:false`; reconnect before
   selecting a different repository.
3. Start structural discovery with `get_architecture` or `search_graph`. Use
   `trace_path` for callers, callees, impact and data flow instead of text grep.
4. After finding an exact qualified name, use `get_code_snippet` to read the
   authoritative source needed for the task.
5. Check cited files with `check_index_coverage`. Inspect `index_status` or
   `detect_changes` when freshness matters. Explicitly re-run
   `index_repository` when refresh is needed; no watcher is implied.
6. Observe `has_more`, totals, offsets and cursors. Narrow first, then paginate
   until the required coverage is complete.

Use direct source search only for text-only questions, unsupported/partially
indexed regions, or verification after graph discovery. Do not invoke omitted
mutation tools, install Codebase Memory, edit MCP/client/repository
configuration, or author OKF as part of this workflow.

When a separate explicit OKF action begins, use the AgentBase-owned schema
tools on the same MCP to list the catalog, select evidence-relevant types and
validate authored concepts. Schema selection never occurs merely because a
graph query ran, and it does not authorize OKF preparation or submission.

## Route code and shared knowledge deliberately

Use the Code Graph first for source structure, symbols, implementations,
callers/callees, impact and exact snippets in the currently selected
repository. Use `search_hub_okf` and `read_hub_okf_concept` first for business,
domain, system and cross-repository questions. Local Hub queries read only the
exact Published commit already synchronized to the active profile; accepted
Local Draft remains visible through proposal review, not ordinary query.

Some questions need both: start from the Hub concept that explains intent or a
cross-repository relationship, then verify current implementation through the
Code Graph. Keep Hub concept paths/commit identity and source paths distinct in
the answer. Never treat unaccepted authoring workspace bytes or raw graph rows
as shared knowledge.
