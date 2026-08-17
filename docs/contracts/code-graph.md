# Code Graph contract

Current contract for managed Codebase Memory, graph evidence, freshness and the
agent-facing stdio MCP. The graph remains detailed, private and disposable.

## Managed provider and evidence

- **AB-MVP-001, AB-GRAPH-005, AB-MCP-002** — AgentBase owns exact dependency
  `codebase-memory-mcp@0.10.1`, resolves only its package-private executable and
  never requests a user path or searches `PATH`.
- **AB-MVP-002** — Admission binds package integrity, executable SHA-256 and
  reported version before use; missing, corrupt, offline or unsupported state
  fails closed.
- **AB-MVP-003, AB-GRAPH-013** — Bounded shell-free one-shot invocation remains
  explicit diagnostic rollback only. It never installs, updates, configures or
  starts a standing provider and is never an automatic retry.
- **AB-MVP-004** — Sanitized exact-provider architecture, search, trace, snippet,
  failure, mutation and lifecycle fixtures define the offline adapter contract.
- **AB-MVP-005** — Evidence collection uses index, full-aspect architecture,
  bounded search/trace and exact snippets rather than materializing the full
  graph in AgentBase memory.
- **AB-MVP-006** — Evidence identifies exact engine and source revision plus safe
  dirty digest, queries, normalized facts, relative sources, limitations and a
  deterministic digest without absolute checkout/cache paths.
- **AB-MVP-007** — Canonical verification replays captured output and fake
  processes; native integration is opt-in.

## Scoped-session promotion and lifecycle

- **AB-GRAPH-001, AB-GRAPH-002** — The promotion benchmark compares three
  alternating one-shot/scoped pairs and records bounded phase timings,
  provider/source/transport identity, normalized facts/paths, mutation and
  cleanup; timing never enters the evidence digest.
- **AB-GRAPH-003, AB-GRAPH-004** — Promotion requires exact semantic/source
  parity, accepted fact/file bounds, unchanged source, clean cleanup and scoped
  median total time no greater than 50% of one-shot on the exercised host.
- **AB-GRAPH-006** — The current default is one short-lived stdio session for
  index plus bounded queries in one repository evidence round, then close.
- **AB-GRAPH-007** — The exact repository allow root and private cache outside
  the checkout are bounded; AgentBase enables no UI, global registration,
  provider configuration or watcher.
- **AB-GRAPH-008** — Connection, request, session, message, stderr and graceful/
  forced shutdown have positive limits and fail closed.
- **AB-GRAPH-009** — Success, error and cancellation close exactly once;
  unconfirmed cleanup rejects the round and accepted completion leaves no
  provider process.
- **AB-GRAPH-010** — Scoped and rollback transports share response parsing and
  neutral evidence normalization; protocol/timing details never enter evidence.
- **AB-GRAPH-011** — Source or repository-control mutation at any point rejects
  the whole round after cleanup.
- **AB-GRAPH-012** — Admission, protocol, tool, malformed output, timeout,
  output-limit, exit, mutation and cleanup failures remain distinguishable and
  never return partial evidence.
- **AB-GRAPH-014** — Mandatory lifecycle tests use fakes/captured responses;
  native paired benchmarks remain explicit and credential/model-free.

Accepted promotion evidence: one-shot median `67073.047ms`, scoped median
`14405.099ms` (`4.656x`) with parity and clean cleanup. This is fixture/host
evidence, not a large-repository promise.

## Exact freshness reuse

- **AB-REFRESH-001, AB-REFRESH-002** — One disposable atomic receipt per
  repository/provider/graph namespace binds source, exact engine, opaque
  namespace and accepted evidence digest without absolute paths.
- **AB-REFRESH-003** — Only an exact source/engine/namespace match is reusable;
  missing, malformed, unsupported or mismatched state selects refresh.
- **AB-REFRESH-004** — Reuse invokes zero index operations but still performs
  every bounded query, source-integrity check and clean shutdown.
- **AB-REFRESH-005** — Missing/mismatched state, source change or `--refresh`
  invokes exactly one provider-owned index before queries.
- **AB-REFRESH-006** — Codebase Memory owns parsing, graph construction and
  internal full/incremental behavior; AgentBase computes no graph delta.
- **AB-REFRESH-007, AB-REFRESH-008** — A receipt commits atomically only after
  complete evidence, unchanged source and confirmed cleanup; failure returns no
  partial success and leaves the previous receipt unchanged.
- **AB-REFRESH-009** — Reuse-selected cache failure stops with explicit
  `--refresh` guidance and never triggers a hidden index retry.
- **AB-REFRESH-010** — Diagnostics expose `reused`/`refreshed` plus a bounded
  reason; private paths and timings remain non-canonical.
- **AB-REFRESH-011** — Freshness adds no watcher, daemon, UI, provider config,
  network, credentials or model call.
- **AB-REFRESH-012** — Offline tests use fakes; opt-in exact-provider evidence
  covers initial, reuse, add, modify, delete and forced refresh.

Accepted fixture evidence: exact reuse performed no index and completed in
`650.714ms` versus `4373.481ms` initially. Changed indexing remained near full
fixture cost, so no incremental-speed or scale claim is accepted.

## Agent-facing MCP

- **AB-MCP-001** — `node src/cli.ts mcp` serves one local stdio connection from
  any caller cwd and starts without selecting a repository.
- **AB-MCP-003** — The graph surface preserves the pinned schemas/names for 11
  safe analysis tools plus controlled `index_repository`, forwarding raw result
  blocks without OKF normalization.
- **AB-MCP-004** — First indexing binds the connection to one absolute existing
  repository; selecting another repository requires reconnecting.
- **AB-MCP-005** — Indexing forces `persistence:false` and rejects source
  persistence, cross-repository mode and target-project arguments.
- **AB-MCP-006** — `delete_project`, `manage_adr` and `ingest_traces` are absent.
- **AB-MCP-007** — Codebase Memory owns graph semantics; the gateway neither
  parses source nor converts raw graph output into OKF.
- **AB-MCP-008** — Graph state stays in private cache; stdout is protocol-only
  and bounded diagnostics use stderr.
- **AB-MCP-009, AB-MCP-010** — Limits fail visibly without retry/partial success;
  each connection owns at most one provider child and idempotent cleanup.
- **AB-MCP-011** — The `use-codebase-memory` skill guides graph-first map/search,
  trace, exact snippets, coverage and pagination with pinned provenance.
- **AB-MCP-012** — Runtime and skill never run the upstream installer, edit
  source/client configuration or claim a watcher/daemon.
- **AB-MCP-013** — Canonical MCP tests are isolated; native qualification uses a
  fresh gateway/client and disposable source.
- **AB-MCP-014** — The gateway uses exact official
  `@modelcontextprotocol/server@2.0.0`, not hand-written framing or a web adapter.
- **AB-MCP-015** — A live-evidence read may bind accepted Hub references only to
  the one repository already authorized by the connection. AgentBase returns
  reference/status metadata; the host uses existing `search_graph` and
  `get_code_snippet` calls for current values. No AgentBase source parser,
  durable live-value cache, hidden re-index or second graph is introduced.
