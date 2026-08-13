# Quickstart: Codebase Memory MCP Surface

Use this interaction after installing AgentBase dependencies.

1. Configure a coding client to launch the AgentBase stdio MCP entrypoint.
2. The client may be started from any cwd; no repository is selected yet.
3. Call `index_repository` with one absolute selected repository root.
4. Use `get_architecture`/`search_graph`, then `trace_path` and
   `get_code_snippet`; check coverage and paginate as required.
5. Re-index explicitly when change/status tools show stale data.
6. Disconnect to close both gateway and managed provider session. Reconnect to
   select another repository.

The runtime never needs a user-provided Codebase Memory binary and does not run
the upstream installer, modify repository files or build OKF.
