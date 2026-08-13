# Data Model: Codebase Memory MCP Surface

## Safe tool descriptor

- `name`: one approved upstream tool name
- `description`: captured upstream description
- `inputSchema`: captured exact-version JSON Schema
- `policy`: `read` or `controlled-index`

The collection is immutable and version-bound. Provider admission requires the
captured public schema to match; omitted mutation tools never enter the model.

## Connection binding

- state: `unbound | binding | bound | closing | closed | failed`
- repository root: canonical absolute path, present only after binding starts
- private cache root: AgentBase-owned directory derived from source identity
- provider session: at most one bounded child while bound/closing

Transitions:

```text
unbound --index(selected root)--> binding --admitted--> bound
unbound --read tool-----------> unbound + visible "index first" error
bound --index(same root)------> bound
bound --index(other root)-----> bound + visible "reconnect" error
any active --disconnect/error-> closing -> closed | failed
```

No persistent multi-repository registry is introduced.

## Controlled index request

The public request preserves compatible upstream index fields. Policy derives a
canonical selected root and a sanitized provider request. It always sets
`persistence:false` and permits only single-repository modes accepted by the
contract. Policy errors occur before provider invocation.

## Raw provider result

MCP content/error blocks returned by Codebase Memory are forwarded at the
gateway boundary. They are not core Code Intelligence values, normalized
repository evidence or OKF records.

## Graph usage skill

- directory/name: `use-codebase-memory`
- trigger metadata: structural code discovery, dependency/call tracing,
  architecture lookup and graph freshness checks
- body: select root, index/status, graph-first query, snippets, coverage,
  pagination and explicit refresh guidance
- provenance: exact upstream package/version and evidence reference

The skill owns no scripts, schemas, hooks or client configuration.
