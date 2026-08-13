# Capability 005: Codebase Memory MCP Surface

- **Status:** Completed
- **Created:** 2026-08-12
- **Completed:** 2026-08-12
- **Provider:** exact managed `codebase-memory-mcp@0.10.1`

## Outcome

A coding agent can connect to one real AgentBase stdio MCP from any working
directory, explicitly index one selected repository and use familiar Codebase
Memory graph tools. AgentBase owns the exact binary, safe tool surface, private
cache and process lifecycle; Codebase Memory continues to own graph behavior.

This capability also adds one concise skill shim for graph-first agent usage.
It does not build OKF, discover multiple repositories recursively, install
client configuration globally or reimplement Codebase Memory.

Promotion result: the offline suite and fresh external MCP client qualification
passed. The exact surface listed 12 tools, enforced repository/persistence
policy, returned real architecture/search results without source mutation and
closed without a remaining provider process.

## Owner decisions treated as settled

- Part 1 is a thin managed wrapper around Codebase Memory, not a competing graph
  implementation.
- Users do not supply a binary; AgentBase distributes and verifies the exact
  package-private provider version.
- MCP use is independent of the caller's current directory. The caller passes
  one exact repository path to `index_repository`.
- AgentBase does not scan a home/workspace tree for repositories. The skill may
  help the agent resolve a selected repository root before calling the tool.
- Familiar upstream tool names and behavior are preferable to AgentBase-specific
  graph vocabulary.
- Later OKF authoring and enrichment receive separate tools and skills.
- MVP simplicity is more important than universal client installation,
  background refresh or a perfect abstraction.

## User stories

### User Story 1 — Index and inspect one selected repository (P1)

As a coding agent, I can use AgentBase MCP from any current directory, index an
explicit repository path and immediately query its structure using familiar
Codebase Memory tools.

**Independent test:** Start a fresh MCP client process in an unrelated temporary
directory, index one disposable fixture by absolute path, query architecture,
search, trace and snippet tools, then disconnect and prove correct results,
unchanged source and zero remaining child processes.

Acceptance:

- `tools/list` exposes the safe selected upstream names and schemas;
- `index_repository` accepts one explicit repository root and never searches
  sibling/parent directories;
- the controlled index always disables source-local persistence and uses only
  provider-private cache outside source;
- query responses preserve the upstream MCP result shape instead of converting
  them into OKF or AgentBase evidence;
- client disconnect closes the managed provider process.

### User Story 2 — Follow concise graph-first guidance (P2)

As a coding agent, I can load a small AgentBase skill that tells me when and how
to use the managed Codebase Memory graph without learning AgentBase internals.

**Independent test:** Validate the skill structure and exercise its instructions
against the MCP fixture flow, proving it selects/status-checks one repo, uses
graph search/trace/snippets and does not claim automatic watching or invoke a
global installer.

Acceptance:

- the skill records its exact upstream package provenance;
- it delegates graph semantics to the exposed Codebase Memory tools and adds
  only AgentBase safety/lifecycle differences;
- it contains no duplicated tool schema, client-specific global setup, OKF
  authoring workflow or speculative background-refresh guidance.

## Functional requirements

- **AB-MCP-001**: AgentBase MUST provide one local stdio MCP server entrypoint
  usable independently of the caller's current working directory.
- **AB-MCP-002**: The server MUST resolve, verify and launch only AgentBase's
  exact package-private `codebase-memory-mcp@0.10.1` executable; it MUST NOT
  accept a user binary path or search `PATH`.
- **AB-MCP-003**: The MCP surface MUST expose upstream-compatible names,
  input schemas and raw MCP result behavior for the 11 exact `analysis` tools
  plus one controlled `index_repository` tool.
- **AB-MCP-004**: `index_repository` MUST target exactly one caller-supplied
  absolute repository path, bind that MCP connection to the selected root and
  MUST NOT recursively discover repositories; a different root requires a new
  MCP connection.
- **AB-MCP-005**: The controlled index MUST force `persistence:false`, reject
  source-local persistence and exclude cross-repository indexing modes.
- **AB-MCP-006**: The MVP surface MUST NOT expose `delete_project`,
  `manage_adr` or `ingest_traces`.
- **AB-MCP-007**: The gateway MUST forward graph behavior to the exact provider
  without parsing source, constructing graph data or converting raw graph
  results into OKF.
- **AB-MCP-008**: Provider cache/state MUST remain in an AgentBase-owned private
  location outside indexed repositories; MCP stdout MUST contain protocol only.
- **AB-MCP-009**: The gateway MUST enforce positive connection, request,
  message, stderr and shutdown bounds and surface provider failures visibly
  without hidden retry or partial successful results.
- **AB-MCP-010**: One MCP client connection MUST own at most one provider child
  session, and every disconnect/error/cancellation path MUST attempt bounded
  cleanup and leave zero confirmed provider children before clean exit.
- **AB-MCP-011**: The graph skill MUST be a concise valid skill shim with pinned
  upstream provenance, graph-first workflow, coverage/pagination guidance and
  AgentBase's explicit refresh/private-cache constraints.
- **AB-MCP-012**: The skill and runtime MUST NOT call the upstream global
  installer, edit MCP client configuration, create repository instruction files
  or claim a watcher/daemon is active.
- **AB-MCP-013**: Mandatory verification MUST remain offline using a fake
  provider and captured schemas/results; exact-provider/fresh-client process
  qualification MUST be explicit and opt-in.
- **AB-MCP-014**: The new official server dependency MUST be exact-version
  pinned and lockfile-bound before promotion.

## Key entities

- **Safe tool manifest:** pinned allowlist of upstream tool names and compatible
  schemas exposed by the gateway.
- **MCP gateway session:** one client connection, one bounded managed provider
  child and one private cache authority.
- **Selected repository:** exact absolute source root supplied to one index call;
  it is never inferred by scanning surrounding directories.
- **Graph usage skill:** concise agent workflow shim with upstream provenance and
  AgentBase-specific safety differences.

## Edge cases

- Relative, missing or non-directory repository path: reject before provider
  invocation with actionable input guidance.
- Caller requests `persistence:true`, cross-repo mode or an omitted mutation
  tool: reject; never silently widen authority.
- Provider schema drifts from the pinned manifest: fail admission rather than
  expose a partially compatible surface.
- Client starts in home, `/tmp` or a workspace parent: behavior is unchanged
  because repository identity comes only from the explicit tool argument.
- A second index requests a different root on the same connection: reject with
  reconnect guidance and leave the first binding/session intact.
- Provider exits, hangs or emits excessive stderr: fail the call, clean up and
  do not return a successful partial response.
- Existing private graph is stale: use upstream `detect_changes`/status guidance
  and an explicit index call; no watcher is implied.

## Success criteria

- **SC-MCP-001**: A fresh isolated MCP client lists exactly 12 approved tools,
  with zero omitted mutation tools.
- **SC-MCP-002**: From an unrelated cwd, the client indexes and queries the
  accepted fixture with upstream-compatible results and no source-tree change.
- **SC-MCP-003**: Success, injected failure, timeout and client disconnect tests
  leave zero confirmed provider child processes.
- **SC-MCP-004**: Attempts to enable source persistence, cross-repository index
  or omitted mutation tools cause zero provider calls.
- **SC-MCP-005**: The skill passes structural validation and a clean-context
  workflow test without global config/source mutation or OKF output.
- **SC-MCP-006**: Canonical verification stays fully offline; exact provider and
  fresh-process qualification remain separate and disclose limitations.

## Assumptions

- The upstream 11-tool `analysis` profile and captured exact schemas are the
  compatibility baseline for `0.10.1`.
- A coding client supplies an absolute path for the repository it has authority
  to inspect. Client-specific installation/discovery is a later capability.
- Private graph caches are disposable machine-local state and may cover several
  explicitly indexed projects; they are not committed or shared.

## Explicit non-goals

- OKF build, review, enrichment, Hub questions or cross-repository linkage.
- Recursive repository discovery or bulk indexing from home/workspace roots.
- Global Codebase Memory installer, hooks, generated `AGENTS.md`/`CLAUDE.md`,
  client configuration management or universal skill packaging.
- Watcher, daemon, automatic background refresh or AgentBase graph algorithm.
- HTTP/remote MCP, authentication, multi-user service or Windows/macOS support.
