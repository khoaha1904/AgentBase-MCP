# Codebase Memory MCP Surface Evidence

- **Date:** 2026-08-12
- **Subject:** exact managed `codebase-memory-mcp@0.10.1`
- **Purpose:** decide the smallest safe AgentBase MCP and skill boundary

## What the exact package owns

The package contains its native MCP server, CLI wrapper and a broad installer.
The default executable serves MCP over stdio. Its installer can configure many
coding clients and generate client-specific skills, instruction files, hooks,
agents and PATH entries.

Dry-run probes confirmed that the installer is intentionally machine-wide in
scope. AgentBase therefore must not invoke it silently: doing so would exceed
the requested repository operation and duplicate AgentBase's ownership of
version, policy and client integration.

## Exact tool evidence

An isolated MCP client listed 15 tools from the exact binary:

```text
index_repository search_graph query_graph trace_path get_code_snippet
get_graph_schema get_architecture search_code list_projects delete_project
index_status check_index_coverage detect_changes manage_adr ingest_traces
```

The package's own restricted profiles expose:

- `analysis`: 11 read-only tools — `search_graph`, `query_graph`, `trace_path`,
  `get_code_snippet`, `get_graph_schema`, `get_architecture`, `search_code`,
  `list_projects`, `index_status`, `check_index_coverage`, `detect_changes`;
- `scout`: seven read-only discovery tools.

Neither restricted profile includes `index_repository`. The full profile also
exposes mutations that AgentBase Part 1 does not need. In particular,
`index_repository` accepts `persistence:true`, which writes
`.codebase-memory/graph.db.zst` into the indexed repository; `delete_project`,
`manage_adr` and `ingest_traces` mutate provider state.

## Skill evidence

The exact binary embeds useful graph-first guidance: inspect project/status,
index when missing or stale, prefer structural graph search, trace paths, fetch
exact snippets, check coverage and paginate bounded results. It does not ship a
stable standalone skill file to import. Instead, its installer synthesizes
different client files and also assumes upstream watcher behavior.

AgentBase cannot truthfully copy the watcher claim because its accepted graph
lifecycle is explicit refresh/reuse. A literal installer delegation would also
mutate unrelated global configuration.

## MCP SDK evidence

The official TypeScript SDK publishes `@modelcontextprotocol/server@2.0.0` as
the server package paired with the already-managed
`@modelcontextprotocol/client@2.0.0`. It supports stdio servers without requiring
AgentBase to implement MCP framing itself.

Primary references:

- <https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/server.md>
- <https://www.npmjs.com/package/@modelcontextprotocol/server>

## Decision supported by the evidence

Build a thin stdio gateway rather than reimplementing graph construction or
publishing the full upstream surface:

1. resolve the exact package-private Codebase Memory binary already owned by
   AgentBase;
2. expose the 11 upstream `analysis` tools with familiar names and compatible
   request/result behavior;
3. add a controlled `index_repository` that accepts one explicit repository
   path, forces private persistence and excludes cross-repository indexing;
4. forward calls to one bounded child provider session owned by the gateway;
5. close the child whenever the MCP client disconnects;
6. provide one concise AgentBase skill shim that preserves upstream graph-first
   semantics and records the pinned source/version, without running the broad
   upstream installer.

This is a wrapper and policy boundary, not a new graph engine. OKF authoring,
cross-repository linkage and client-specific installers remain later work.

## Known risk and release guard

The server SDK is a new production dependency and the public MCP process is a
new lifecycle boundary. Both require owner approval before application code or
dependency installation. Promotion also requires an isolated fresh-client
process test from a directory unrelated to the indexed fixture, proof of no
source writes and proof that both gateway and provider processes terminate.
