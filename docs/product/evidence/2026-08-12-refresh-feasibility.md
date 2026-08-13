# Evidence: Code Graph Refresh Feasibility

- **Captured:** 2026-08-12
- **Provider:** exact managed `codebase-memory-mcp@0.10.1`
- **Host:** accepted Linux x64 development host
- **Purpose:** bound Capability 004 before specifying refresh behavior

## Product question

Can AgentBase safely offer a cheap incremental graph refresh after source
changes without activating the provider's watcher/daemon or trusting stale
cache state?

## Provider surface

One read-only MCP schema probe against the exact managed binary showed:

- `index_repository` accepts `full`, `moderate`, `fast` and
  `cross-repo-intelligence`; it exposes no explicit incremental mode;
- `detect_changes` maps a Git diff to changed files and graph impact. It does
  not claim to update the graph;
- `index_status` reports graph counts, source root, Git context and coverage;
- `auto_index`/`auto_watch` are provider configuration and watcher behavior,
  not explicit refresh tool inputs.

The probe used an isolated private cache and allowed root, did not index, did
not modify provider configuration, closed the session and left no process.

## Exact-fixture behavior

Disposable copies of the 12-file TypeScript fixture were indexed with the same
bounded scoped-session lifecycle accepted by Capability 003.

### Re-index in one session

1. Connect: `10185.174ms`.
2. Initial fast index: `3692.236ms`.
3. Add one authored TypeScript file containing unique `refreshProbe` symbol.
4. Invoke the same fast index again: `3683.893ms`.
5. An initial bounded adapter probe appeared not to find `refreshProbe`.

That apparent miss was a probe error: `maximumFacts=2` allowed two architecture
facts to consume the bound before the search fact was selected. A raw provider
probe then showed nodes increasing from `55` to `58`, edges from `76` to `79`
and `search_graph` returning `refreshProbe` from the added file. Changed-source
refresh correctness is therefore demonstrated on the fixture.

### Re-index in a new session with the same cache

1. First connect/index: `10641.465ms` / `3696.630ms`; close was clean.
2. Add the same unique authored file.
3. Open a second session using the same private cache: `10788.233ms`.
4. Re-index: `3879.423ms`.
5. The same bounded adapter query appeared not to return `refreshProbe` for the
   same fact-selection reason above; it is not provider freshness evidence.

All probes used temporary source/cache directories that were removed afterward.

### No-change and cache-reuse behavior

A raw same-session no-change re-index took `3470.958ms` after an initial
`3494.789ms` index. Both returned the same `55` nodes and `76` edges. The exact
binary therefore did not reproduce the upstream near-instant no-op claim in
this lifecycle.

After closing the initial indexing session, a new session queried the same
private graph cache without calling `index_repository`. The existing
`inspectWorkspace` symbol was returned in `12.830ms`; cleanup remained bounded.
This proves AgentBase can safely avoid a known no-op index when its own source
identity still matches the graph receipt.

## Upstream comparison

The upstream project documentation describes automatic watcher-backed graph
freshness and incremental re-index behavior. Its historical release notes claim
near-instant no-op and one-file refresh. Refresh correctness is reproduced, but
the claimed no-op/single-file latency is not reproduced by the exact
AgentBase-owned binary and lifecycle above.

An upstream Windows issue from an older provider version reports the same class
of symptom: indexing reports success while symbols from newly added files stay
absent. It is not proof of the Linux v0.10.1 cause, but it confirms that a
successful index response alone is insufficient freshness evidence.

Primary sources consulted:

- <https://github.com/DeusData/codebase-memory-mcp>
- <https://github.com/DeusData/codebase-memory-mcp/releases>
- <https://github.com/DeusData/codebase-memory-mcp/issues/277>

## Review conclusion

AgentBase has evidence that explicit provider-owned refresh updates the graph,
but not that it is materially cheaper than initial indexing. AgentBase must not
reimplement the provider's incremental algorithm, and must not enable
`auto_watch`, mutate provider configuration or keep a standing process to
inherit upstream auto-sync implicitly.

The smallest safe next slice is:

1. store one private graph receipt binding accepted source and provider identity;
2. skip `index_repository` when that exact source/provider receipt still matches;
3. call the provider-owned `index_repository` refresh when source changed or the
   caller explicitly forces refresh;
4. update the receipt only after complete queries, source-integrity checks and
   clean provider shutdown;
5. fail visibly and require explicit forced refresh if a supposedly reusable
   cache cannot be queried;
6. defer automatic/background refresh and performance claims until a measured
   lifecycle justifies them.

This conclusion is a feasibility boundary, not authorization to implement the
new lifecycle. Owner-visible product decisions belong in Capability 004.
