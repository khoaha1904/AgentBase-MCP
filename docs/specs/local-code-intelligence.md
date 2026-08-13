# Living Requirements: Local Code Intelligence Lifecycle

- **Status:** Active
- **Established by:** Capabilities `003-scoped-graph-session` and `004-graph-refresh-reuse`
- **Last updated:** 2026-08-12

This is the current lifecycle contract for explicit local graph evidence. It
extends the provider and evidence requirements in
`single-repository-okf.md`; it does not add background refresh, a standing
daemon/watcher, shared raw graphs or cloud enrichment.

## Measurement and promotion

### AB-GRAPH-001 — Paired lifecycle benchmark

The opt-in benchmark runs the same disposable fixture source state and bounded
task through one-shot and scoped-session transports in three alternating pairs.

### AB-GRAPH-002 — Complete diagnostics

Each arm records monotonic admission, indexing, query, cleanup and total
durations, exact provider/source/transport identity, normalized fact IDs,
repository-relative source paths, mutation status and cleanup status. Timing is
diagnostic and does not enter the deterministic evidence digest.

### AB-GRAPH-003 — Parity before speed

Promotion requires provider/source identity plus normalized fact/source parity,
all accepted critical facts, existing file/fact bounds, unchanged source and
clean process lifecycle in every arm.

### AB-GRAPH-004 — Measured promotion threshold

Scoped session becomes the default real evidence lifecycle only after three
same-host alternating pairs show a median total duration no more than 50% of
one-shot. The result is fixture/host evidence, not a universal latency promise.

## Scoped session

### AB-GRAPH-005 — Existing managed admission

Every session first resolves and admits the exact AgentBase-owned package-
private executable. It never accepts a user path or searches `PATH`.

### AB-GRAPH-006 — One round, one process

One short-lived stdio MCP session serves index, full-aspect architecture,
bounded search, trace and exact snippets for one evidence round, then closes.

### AB-GRAPH-007 — Private bounded state

The provider receives the exact repository allow root and an isolated private
cache outside the checkout. AgentBase does not enable UI, register MCP, mutate
provider configuration or own background watcher behavior.

### AB-GRAPH-008 — Resource limits

Connection, each request, total session, protocol message, cumulative stderr,
graceful shutdown and forced shutdown have explicit positive bounds and fail
closed when exhausted.

### AB-GRAPH-009 — Cleanup on every path

Success, error and cancellation close the session exactly once. Graceful close
precedes bounded forced termination; an unconfirmed cleanup rejects the round.
Accepted completion leaves zero provider process.

### AB-GRAPH-010 — Neutral evidence preserved

Both transports reuse the same response parsers, task-context adapter and
repository-evidence normalization. MCP protocol values and lifecycle timing do
not leak into core evidence.

### AB-GRAPH-011 — Whole-round source integrity

Forbidden repository-control mutation or source-state drift at any point
rejects the complete evidence result after cleanup.

## Failure, rollback and verification

### AB-GRAPH-012 — Visible typed failures

Admission, connection/protocol, provider tool, malformed output, timeout,
output limit, premature exit, source mutation and cleanup failures remain
distinguishable. A failed round never returns partial successful evidence or
automatically invokes another transport.

### AB-GRAPH-013 — Explicit one-shot rollback

One-shot remains explicitly selectable with Capability 002 arguments and
safety behavior. It is a diagnostic/rollback path, not a hidden retry.

### AB-GRAPH-014 — Offline canonical verification

Mandatory tests use fake sessions and captured provider responses. Real session
and paired benchmark commands are opt-in, require no credential/model call and
remain outside `npm run verify`.

## Current measured boundary

The accepted 2026-08-12 promotion run completed all six alternating arms with
normalized provider/source/fact/path parity, unchanged source and clean process
cleanup. One-shot median total was `67073.047ms`; scoped-session median was
`14405.099ms`, a `4.656x` improvement. Scoped-session is therefore the default
real evidence lifecycle and one-shot remains explicit rollback.

The accepted 12-file fixture is designed to expose repeated process startup,
not to benchmark large-repository indexing throughput. Automatic file-change
detection, refresh scheduling, session sharing and resource budgets for ordinary
repositories require later capabilities and new evidence.

## Explicit freshness reuse

### AB-REFRESH-001 — One private receipt

AgentBase keeps at most one disposable freshness receipt for each repository,
provider and graph namespace. It stays outside the source checkout and outside
provider-owned cache data.

### AB-REFRESH-002 — Exact bounded identity

The versioned receipt binds repository source identity, exact managed engine
identity, an opaque graph namespace and the accepted evidence digest. It stores
no absolute source or receipt path.

### AB-REFRESH-003 — Conservative decision

Only an exact source/engine/namespace match is reusable. Missing, malformed,
unsupported or mismatched state selects provider refresh and may be replaced
only after successful completion.

### AB-REFRESH-004 — Reuse skips only indexing

An exact match invokes zero provider index operations. The bounded evidence
queries, whole-round source-integrity checks and clean process shutdown still
run every time.

### AB-REFRESH-005 — Changed and forced refresh

Missing/mismatched freshness, changed source or explicit `--refresh` invokes
exactly one provider-owned index operation before evidence queries.

### AB-REFRESH-006 — Provider owns graph construction

AgentBase does not compute file graph deltas, parse languages for refresh or
interpret provider-private incremental state.

### AB-REFRESH-007 — Commit after safe completion

A new private receipt is atomically committed only after complete normalized
evidence, unchanged source through cleanup and confirmed clean shutdown.

### AB-REFRESH-008 — Failure does not advance freshness

Index, query, source-integrity, cleanup or receipt-commit failure returns no
partial successful evidence and leaves any previous receipt unchanged.

### AB-REFRESH-009 — Explicit cache recovery

If a supposedly reusable cache cannot answer the query, the round fails visibly
with `--refresh` recovery guidance. It never performs a hidden index retry.

### AB-REFRESH-010 — Observable, non-canonical decision

Diagnostics report `reused` or `refreshed` and a bounded reason. Freshness
paths and timing remain outside normalized evidence and its digest.

### AB-REFRESH-011 — Existing authority boundary

Freshness preserves the exact managed binary, private cache, repository allow
root and short-lived process. It adds no watcher, daemon, UI, provider config,
network, credential or model call.

### AB-REFRESH-012 — Offline and exact evidence

Mandatory tests use fakes and captured responses. Opt-in exact-provider
qualification covers initial, reuse, add, modify, delete and forced rounds and
discloses measured limitations.

## Current refresh boundary

The accepted fixture qualification saw unchanged reuse invoke no index and
finish in `650.714ms` versus `4373.481ms` for its initial round. Add, modify and
delete refreshes returned current facts with clean cleanup, while changed index
time remained `3.61–3.77s`; forced index took `4.83s`. This proves the reuse and
freshness contract for the exercised fixture, not incremental index speed or
large-repository performance.

Refresh occurs only when an evidence command runs. Background watching,
refresh scheduling, cache repair/generations and cross-repository graph linkage
remain later work.

## Agent-facing MCP surface

### AB-MCP-001 — Local stdio entrypoint

`node src/cli.ts mcp` serves one local MCP connection independently of caller
cwd. It starts without selecting or indexing a repository.

### AB-MCP-002 — Exact managed provider

The gateway resolves and verifies only AgentBase's package-private
`codebase-memory-mcp@0.10.1`; no user binary or `PATH` discovery is accepted.

### AB-MCP-003 — Familiar safe manifest

The public surface preserves the pinned upstream names and input schemas for 11
analysis tools plus controlled `index_repository`, and forwards raw MCP result
blocks without OKF normalization.

### AB-MCP-004 — One explicit repository

The first index call requires one absolute existing root and binds that
connection to it. No surrounding directories are scanned; selecting another
root requires reconnect.

### AB-MCP-005 — Controlled index authority

The gateway forces `persistence:false` and rejects source persistence,
cross-repository mode and target-project arguments before provider invocation.

### AB-MCP-006 — Mutation tools omitted

`delete_project`, `manage_adr` and `ingest_traces` are not exposed.

### AB-MCP-007 — Provider-owned graph behavior

Codebase Memory remains the graph builder/query engine. The gateway does not
parse source, reconstruct graph data or turn raw tool results into OKF.

### AB-MCP-008 — Private state and clean protocol

Graph state stays in AgentBase-owned private cache outside source. MCP stdout is
protocol-only; bounded diagnostics use stderr.

### AB-MCP-009 — Bounded visible failures

Connection, request, total-session, message, stderr and shutdown limits fail
visibly without hidden retry or partial success.

### AB-MCP-010 — Connection-scoped lifecycle

One client connection owns at most one provider child. Normal close, error and
disconnect converge on idempotent bounded cleanup.

### AB-MCP-011 — Thin graph-use skill

`use-codebase-memory` guides repository selection, graph-first discovery,
tracing, exact snippets, coverage and pagination with pinned provider
provenance.

### AB-MCP-012 — No installer or watcher claim

The runtime and skill do not run the upstream installer, edit client/source
configuration or imply a watcher/daemon is active.

### AB-MCP-013 — Offline and isolated evidence

Canonical tests use fake sessions and captured schemas/results. Exact native
qualification uses a fresh client/gateway process and disposable source copy.

### AB-MCP-014 — Exact official server SDK

The stdio gateway uses lockfile-bound `@modelcontextprotocol/server@2.0.0`; it
does not implement MCP framing or require a web framework adapter.
