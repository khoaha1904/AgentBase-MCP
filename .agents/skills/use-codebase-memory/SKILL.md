---
name: use-codebase-memory
description: Support an AgentBase workflow with bounded Code Graph navigation for one authorized local repository. Use when a public AgentBase workflow needs architecture, symbol, caller/callee, impact, snippet, freshness, or coverage evidence; ordinary user questions belong to agentbase-query.
---

# Use the managed code graph

Delegate graph construction and queries to the AgentBase MCP surface backed by
exact `codebase-memory-mcp@0.10.1`. Treat raw graph data as private disposable
working context, not OKF knowledge.

Use only `index_repository`, `get_architecture`, `search_graph`, `trace_path`,
`get_code_snippet`, `search_code`, `index_status`, `check_index_coverage` and
`detect_changes`. Raw graph query/schema and global project inventory are not
AgentBase tools.

## Workflow

1. Select one repository root explicitly. Resolve its absolute root; never scan
   home or a workspace parent recursively.
2. On a new MCP connection, call `index_repository` for that root. Give the
   project a clear name when useful. A later explicit index may switch the
   connection sequentially after clean provider closure; never combine graphs.
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

This support workflow does not select between Hub and code, answer ordinary
cross-source questions, author OKF or authorize any Hub lifecycle action.
