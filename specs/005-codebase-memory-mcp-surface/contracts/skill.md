# Contract: `use-codebase-memory` Skill

The skill MUST:

- trigger for code architecture, symbol relationship, dependency/call-path,
  relevant-code and graph freshness tasks;
- instruct the agent to select one repository root explicitly, then use
  `index_repository` before graph reads for a new MCP connection;
- prefer `search_graph`, `get_architecture` and `trace_path` for structural
  discovery, then `get_code_snippet` for exact source;
- use status/change/coverage tools and paginate bounded queries when needed;
- describe refresh as explicit indexing, never as an active watcher;
- identify `codebase-memory-mcp@0.10.1` as the delegated graph provider;
- state that raw graph data is private working context, not OKF.

The skill MUST NOT install software, change client/repository configuration,
duplicate tool schemas, invoke omitted mutation tools or author OKF.
