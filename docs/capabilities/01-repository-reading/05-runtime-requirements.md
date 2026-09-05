# 01.05 — Capability requirements

These `AB-MVP-*`, `AB-GRAPH-*`, `AB-GRAPH-REFRESH-*` and `AB-MCP-*`
requirements are the normative Repository Reading Capability Contract. The
graph remains detailed, private and disposable.

> Status: The provider/runtime baseline and Group 1 dynamic source resolution
> are implemented and verified.

## Owned provider and evidence

- **AB-MVP-001, AB-GRAPH-005, AB-MCP-002** — AgentBase owns the attributed
  Codebase Memory `v0.10.8` source snapshot and one explicit 12-language parser
  profile. Runtime resolves only the current-platform artifact prepared from
  those bytes and never accepts a user path or searches `PATH`.
- **AB-MVP-002** — Admission binds upstream commit, source/profile digests,
  platform, adapter/tool-surface identity, executable SHA-256 and reported
  version before use; missing, corrupt, stale or unsupported state fails closed.
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
  processes. Explicit native qualification owns Linux x64 and macOS arm64
  evidence; both must pass before a source migration closes.
- Provider preparation follows
  [`AB-INSTALL-039..041`](../12-version-scope/02-installation-requirements.md#owned-native-provider-bundle): it verifies pristine inventories, applies the
  AgentBase patch only in disposable staging, probes the accepted private
  provider surface and atomically publishes an ignored artifact. Ordinary MCP
  startup never builds, downloads, updates or recovers the provider.
- The UI boundary follows
  [`AB-INSTALL-038`](../12-version-scope/02-installation-requirements.md#owned-native-provider-bundle): the Codebase Memory Graph UI frontend is excluded from the
  released source snapshot. Its upstream C runtime scaffolding may remain only
  where shared by the core build and receives no HTTP/UI authority.
  diagram-design remains an attributed inactive source foundation; no diagram
  skill or renderer is installed by capability 044.

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
- **AB-GRAPH-007** — The source resolver derives the exact real Git root from the
  selected readable path and the private cache stays outside the checkout.
  AgentBase enables no UI, global registration, provider configuration or
  watcher.
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

- **AB-GRAPH-REFRESH-001, AB-GRAPH-REFRESH-002** — One disposable atomic receipt per
  repository/provider/graph namespace binds source, exact engine, opaque
  namespace and accepted evidence digest without absolute paths.
- **AB-GRAPH-REFRESH-003** — Only an exact source/engine/namespace match is reusable;
  missing, malformed, unsupported or mismatched state selects refresh.
- **AB-GRAPH-REFRESH-004** — Reuse invokes zero index operations but still performs
  every bounded query, source-integrity check and clean shutdown.
- **AB-GRAPH-REFRESH-005** — Missing/mismatched state, source change or `--refresh`
  invokes exactly one provider-owned index before queries.
- **AB-GRAPH-REFRESH-006** — Codebase Memory owns parsing, graph construction and
  internal full/incremental behavior; AgentBase computes no graph delta.
- **AB-GRAPH-REFRESH-007, AB-GRAPH-REFRESH-008** — A receipt commits atomically only after
  complete evidence, unchanged source and confirmed cleanup; failure returns no
  partial success and leaves the previous receipt unchanged.
- **AB-GRAPH-REFRESH-009** — Reuse-selected cache failure stops with explicit
  `--refresh` guidance and never triggers a hidden index retry.
- **AB-GRAPH-REFRESH-010** — Diagnostics expose `reused`/`refreshed` plus a bounded
  reason; private paths and timings remain non-canonical.
- **AB-GRAPH-REFRESH-011** — Freshness adds no watcher, daemon, UI, provider config,
  network, credentials or model call.
- **AB-GRAPH-REFRESH-012** — Offline tests use fakes; opt-in exact-provider evidence
  covers initial, reuse, add, modify, delete and forced refresh.

Accepted fixture evidence: exact reuse performed no index and completed in
`650.714ms` versus `4373.481ms` initially. Changed indexing remained near full
fixture cost, so no incremental-speed or scale claim is accepted.

## Agent-facing MCP

- **AB-MCP-001** — `node src/cli.ts mcp` serves one local stdio connection from
  any caller cwd and starts without selecting a repository.
- **AB-MCP-003** — The graph surface exposes eight goal-level analysis tools
  plus controlled `index_repository`, forwarding raw result blocks without OKF
  normalization. Raw Cypher, graph-schema introspection and global project
  inventory are not released AgentBase workflows.
- **AB-MCP-004** — First indexing resolves the selected readable path to one
  exact real Git repository and binds that root to the connection. A later
  sequential `index_repository` for another explicit repository
  closes the prior provider session cleanly before binding the new root. Cleanup
  failure stops the switch; one connection never owns two provider children or
  combines their graph state.
- **AB-MCP-005** — Public indexing accepts one `repo_path`, one optional
  `full`/`moderate`/`fast` mode and one optional name. In the trusted-enterprise
  profile, `repo_path` selects any readable local Git repository. The gateway
  forces private non-persistent provider state and defensively rejects source
  persistence, cross-repository mode and target-project arguments.
- **AB-MCP-006** — `query_graph`, `get_graph_schema`, `list_projects`,
  `delete_project`, `manage_adr` and `ingest_traces` are absent.
- **AB-MCP-007** — Codebase Memory owns graph semantics; the gateway neither
  parses source nor converts raw graph output into OKF.
- **AB-MCP-008** — Graph state stays in private cache; stdout is protocol-only
  and bounded diagnostics use stderr.
- **AB-MCP-009, AB-MCP-010** — Limits fail visibly without retry/partial success;
  each connection owns at most one provider child and idempotent cleanup.
- **AB-MCP-011** — The internal supporting `use-codebase-memory` skill names the
  exact nine-tool public graph surface and guides graph-first map/search, trace,
  exact snippets, coverage and pagination with pinned provenance.
- **AB-MCP-012** — Runtime and skill never run the upstream installer, edit
  source/client configuration or claim a watcher/daemon.
- **AB-MCP-013** — Canonical MCP tests are isolated; native qualification uses a
  fresh gateway/client and disposable source.
- **AB-MCP-014** — The gateway uses exact official
  `@modelcontextprotocol/server@2.0.0`, not hand-written framing or a web adapter.
- **AB-MCP-015** — Snapshot query returns observed metadata without probing a
  source. Only an explicit current-value request may bind its accepted file
  reference to the one repository already bound to the connection; the
  host uses existing `search_graph` and `get_code_snippet` calls. No AgentBase
  source parser, durable live-value cache, hidden re-index or second graph is
  introduced.
- **AB-MCP-016** — AgentBase's public descriptor layer never recommends an
  omitted provider action. The eight non-indexing graph actions are advertised
  as read-only, non-destructive and idempotent; controlled indexing remains a
  private-state mutation that is non-destructive and idempotent. Curating these
  hints does not alter pinned provider schema drift checks or forwarding.
- **AB-MCP-017** — One Git root is one graph unit. A monorepo's subprojects are
  scopes inside that graph; a directory containing independent Git repositories
  is only routing scope. Repository selection uses an explicit target, the Git
  root containing current context, or one uniquely known local
  checkout; ambiguity asks the user. Multi-repository source work switches
  repositories sequentially after clean session shutdown and never combines
  graphs or recursively scans arbitrary workspace paths.
- **AB-MCP-018** — Graph creation and reuse are lazy. Opening a workspace and
  Hub-only query create no graph. A workflow indexes or reuses only after exact
  source from a resolved repository is required, with existing source/engine/
  namespace receipt rules deciding reuse versus refresh. No prewarming,
  background indexing, watcher or daemon is introduced.
- **AB-MCP-019** — Capability 046 Hub-bound Init, Batch and Refresh resolve the exact selected remote
  default-branch commit before indexing. Canonical remote must uniquely resolve
  on the active Hub host; API/fetch use credential-provider-backed HTTPS into a
  profile/source-scoped private bare mirror outside the source repo and verify
  the same commit. It reuses a checkout only when clean/exact, otherwise uses a
  detached private worktree. It never mutates source refs/worktree or uses local
  filters, hooks, submodules or LFS. Ordinary query never materializes a remote
  repository automatically.
- **AB-MCP-020** — After exact Init/Batch-member Preflight arms one analysis root
  and indexing that root succeeds, the gateway itself derives a private Seed
  by running index status, terminal/paged coverage, explicit architecture
  aspects `overview|structure|dependencies|routes|languages|packages|
  entry_points|hotspots|boundaries|layers|clusters` and a bounded safe census.
  `file_tree`, `cycles` and Agent search/trace do not enter the Seed. The index
  result preserves provider blocks and appends one bounded AgentBase Seed
  summary with the IDs the Agent must disposition; no new tool/schema input is
  added. Ordinary query and normal change-first Refresh never arm this recipe or
  create a Seed; future Full Discovery Refresh is deferred.
- **AB-MCP-021** — Provider response-shape fixtures cover every Seed-driving
  field on source/provider upgrades. Unsupported or partial output produces an
  explicit lane limitation or failure according to P0 impact; it never silently
  appears as an empty repository.
- **AB-MCP-022** — An AgentBase-owned hard-deny patch at the pinned provider's
  admission/read boundary excludes symlink escapes, generated/vendor/build output
  and secret-like paths (including `.env*`, credential/key/cert and Agent state)
  before any file open/index/census. It does not dirty the exact worktree and is
  covered by owned-runtime integrity/compatibility fixtures; tests prove denied
  paths never appear in Seed-driving output.
- **AB-MCP-023** — MCP owns five-lane status and fixed P0 classification. A
  non-terminal page cannot prove absence; a diagnostic able to hide P0 or more
  than 64 P0 groups makes the member Incomplete. P1/P2 overflow is grouped and
  disclosed rather than dropped.
- **AB-MCP-024** — Private mirror/worktree cleanup accepts only non-symlink,
  mode-0700, marker-owned validated paths. Completion/cancel/invalidation cleans
  worktrees unless an exact resumable checkpoint owns them; bounded crash GC may
  remove only validated reconstructable state.
- **AB-MCP-025** — Discovery source hints are content-redacted before they enter
  a Seed or Agent-facing response. Credential-like values in otherwise admitted
  files are not emitted verbatim; redaction is deterministic and preserves the
  path/line evidence needed for review.
- **AB-MCP-026** — Architecture sections captured by the fixed discovery
  baseline are either promoted into bounded discovery groups or reported as
  explicitly not promoted. Boundary/layer promotion cannot create an unbounded
  source crawl, candidate list or model context.
- **AB-SOURCE-RESOLVE-001** — Source resolution canonicalizes the selected path,
  resolves its containing Git root and records exact source state before graph
  work. Missing, unreadable or non-Git paths fail before provider start or cache
  creation.
- **AB-SOURCE-RESOLVE-002** — Workspace inventory starts from the explicit path
  or active workspace selected for that run and retains skipped-directory,
  repository-count and traversal bounds. Selecting another readable workspace
  or repository requires no persistent allowlist or AgentBase reconfiguration.
- **AB-SOURCE-RESOLVE-003** — Focused tests cover direct and nested paths,
  canonical/symlink identity, nested repositories, source change, bounded
  workspace discovery and sequential repository switching with clean provider
  shutdown.

`AB-MCP-017` and `AB-MCP-018` are accepted product contracts. Capability 046
adds `AB-MCP-019..024`; Capability 051 adds `AB-MCP-025..026`. Each addition is
shipped only with its implementation and qualification evidence.
