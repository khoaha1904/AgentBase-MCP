# Contract: AgentBase Codebase Memory MCP

## Transport and entrypoint

- local stdio only;
- stdout is MCP protocol only; diagnostics use bounded stderr;
- caller cwd does not select a repository;
- server starts unbound and without a provider child.

## Tool manifest

The exact public set is:

```text
index_repository
search_graph query_graph trace_path get_code_snippet get_graph_schema
get_architecture search_code list_projects index_status
check_index_coverage detect_changes
```

Names, descriptions, input schemas and result blocks follow the pinned upstream
`0.10.1` contract. `delete_project`, `manage_adr` and `ingest_traces` are absent.

## Binding and index policy

The first `index_repository` call MUST provide an absolute existing directory.
The gateway canonicalizes it, creates private state outside source and starts an
exact provider scoped to that root. It rejects before forwarding when:

- path is relative, missing or not a directory;
- mode requests cross-repository indexing;
- persistence is `true`;
- the connection is already bound to a different root.

The forwarded request always contains canonical `repo_path` and
`persistence:false`. Re-index of the same bound root remains an upstream call.

## Read calls

Before binding, every read tool fails with actionable `index_repository`-first
guidance. Once bound, approved read tools forward arguments/result blocks
unchanged, subject only to lifecycle and size/time limits.

## Lifecycle

Provider admission verifies exact executable identity and the pinned tool/schema
manifest. One connection owns at most one provider child. Disconnect, server
error, cancellation, signal and normal close converge on idempotent bounded
cleanup. A process whose death cannot be confirmed prevents a clean result.
