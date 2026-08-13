# Research: Graph Refresh Reuse

## Decision 1: Delegate changed graph construction

**Decision:** On changed/missing/forced freshness, call the existing provider
`index_repository` operation once. Do not add an AgentBase parser, file delta or
provider-private incremental mode.

**Evidence:** The exact `codebase-memory-mcp@0.10.1` schema exposes full,
moderate, fast and cross-repository index modes, but no explicit incremental
input. A raw scoped-session probe saw an added TypeScript symbol after re-index:
nodes moved `55 -> 58`, edges `76 -> 79`, and raw search returned the symbol.

**Limitation:** The same-session changed re-index took about `3.70s`, close to
the initial `3.52s`; correctness is demonstrated, incremental latency is not.

**Rejected:** Reimplementing incremental parsing duplicates the provider's core
product and multiplies language-specific correctness risk. `detect_changes` is
impact analysis over a Git diff, not a documented graph-refresh operation.

## Decision 2: Reuse only an exact accepted cache identity

**Decision:** Store one private receipt binding source, engine and graph
namespace identities. Skip only the index operation on an exact match; still run
all evidence queries and lifecycle guards.

**Evidence:** An unchanged same-session re-index took `3470.958ms` after an
initial `3494.789ms` index and returned identical counts. A new session using the
same cache returned an existing symbol in `12.830ms` without calling index.

**Rejected:** Always indexing is simple but preserves a measured redundant
stage. Blindly trusting cache existence cannot distinguish source/provider drift.
A long-lived daemon or watcher changes authority, cleanup and failure semantics
far beyond this MVP.

## Decision 3: Fail visible instead of automatic recovery

**Decision:** If a receipt matches but cached graph queries fail, reject the
round with an explicit `--refresh` instruction. Do not index automatically in
the same invocation.

**Rationale:** Automatic retry can double expensive work, hide corruption and
make timing/failure evidence ambiguous. One explicit flag is sufficient MVP
recovery and preserves owner control.

**Rejected:** Cache deletion, generations, garbage collection and repair/status
commands are useful only after measured operational need.

## Decision 4: Keep the receipt outside provider-owned data

**Decision:** Place one AgentBase-owned atomic JSON receipt under the existing
private state root but outside the provider cache subtree. Address it by opaque
repository/scope identity and never publish its local path.

**Rationale:** AgentBase owns acceptance policy, while Codebase Memory may change
its cache layout. Separating ownership prevents either side from interpreting
the other's private files.

## Source notes

- Exact local behavior: [refresh feasibility evidence](../../docs/product/evidence/2026-08-12-refresh-feasibility.md)
- Upstream provider overview: <https://github.com/DeusData/codebase-memory-mcp>
- Historical incremental release: <https://github.com/DeusData/codebase-memory-mcp/releases/tag/v0.5.3>
- Historical freshness caveat: <https://github.com/DeusData/codebase-memory-mcp/issues/277>

Current upstream documentation describes watcher-backed auto-sync and internal
incremental re-indexing. Those claims are informative, not accepted runtime
behavior for AgentBase's exact bounded lifecycle.
