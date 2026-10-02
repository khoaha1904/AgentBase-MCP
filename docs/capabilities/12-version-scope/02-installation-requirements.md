# Installation requirements

`./install.sh` prepares exact dependencies, installs released product skills and
transactionally registers the current checkout as user-global stdio MCP in
selected clients. Installation never selects/creates a Hub or asks for a token.

> Status: Installation is implemented. Group 1 treats the existing runtime
> shared token as the built-in trusted-enterprise credential provider; Group 2
> owns transactional skill upgrade/uninstall and release-integrity changes from
> the accepted Product Contract sequence.

## Credential and non-interactive behavior

- **AB-INSTALL-001** — Interactive selection changes exactly available selected
  Codex and/or Claude Code clients; unselected clients remain unchanged.
- **AB-INSTALL-002 (retired)** — Installer token masking UI is removed.
- **AB-INSTALL-003 (retired)** — Installer token skip/local-Hub choice is removed.
- **AB-INSTALL-004 (retired)** — Installer global token persistence is removed.
- **AB-INSTALL-005 (retired)** — Installer token replacement is removed.
- **AB-INSTALL-006 (retired)** — Installer-owned ambient/global token precedence
  is removed. Runtime credential reuse belongs to the configured provider and is
  owned by `AB-HUB-SETUP-032..037`.

Token entry and replacement belong only to the later owner-private Hub
connection flow. Installation does not collect credentials; runtime may reuse
one provider credential across Hub profiles.

## Client registration transaction

- **AB-INSTALL-007** — Registration mutates only explicitly selected supported
  clients at user scope.
- **AB-INSTALL-008** — Each `agentbase` entry uses the current absolute Node
  executable and checkout `src/cli.ts mcp`; no Hub identity, token or shell
  command enters the entry.
- **AB-INSTALL-009** — All selected clients, checkout entrypoint and existing
  same-name entries pass preflight before the first mutation.
- **AB-INSTALL-010** — Exact existing entries are no-op success; different or
  uninspectable same-name entries fail before mutation and are never replaced.
- **AB-INSTALL-011** — Codex and Claude Code use their supported user-scope MCP
  management commands and independently verify the effective entry.
- **AB-INSTALL-012** — Selected clients form one transaction; later failure
  removes/verifies every entry newly added by that transaction and preserves
  entries that existed beforehand.
- **AB-INSTALL-013** — Unrelated/concurrent configuration is preserved. Snapshot
  restore is allowed only when current bytes exactly match installer-produced
  state.
- **AB-INSTALL-014** — Owner-private non-secret phase evidence enables
  deterministic recovery; unsafe, malformed or mismatched state blocks mutation.
- **AB-INSTALL-015** — Missing clients, conflicts, command/verification failure,
  concurrency and unresolved rollback remain distinguishable and secret-free.
- **AB-INSTALL-016** — Registration never reads, writes or removes Hub
  credentials, and tokens never enter client MCP entries.
- **AB-INSTALL-017** — Canonical tests use isolated homes and deterministic
  client doubles, never real installed-client state.

## Terminal UI

- **AB-INSTALL-018** — Interactive setup shows AgentBase-MCP identity followed
  by Clients and Registration actions; GitHub/Hub setup is absent.
- **AB-INSTALL-019** — ANSI terminals use Up/Down, Space and Enter multi-select;
  at least one client is required and output order is stable. Plain terminals
  use an append-only fallback.
- **AB-INSTALL-020** — Pointer, checkbox and text carry all state; cyan color is
  supplemental only.
- **AB-INSTALL-021** — Narrow/no-color modes preserve labels and controls; dumb
  and non-interactive modes emit no cursor/color ANSI.
- **AB-INSTALL-022** — Completion maps provider results to readable client
  outcomes and tells the user to start a new selected client session.
- **AB-INSTALL-023** — Rich rendering preserves client selection, transaction
  recovery, secret-free failure and terminal restoration without a credential UI.
- **AB-INSTALL-024** — Deterministic tests cover chunked key sequences,
  multi-select, validation, color/narrow/dumb fallbacks, client results and
  non-interactive output without real configuration mutation.

## Product skills

- **AB-INSTALL-025** — Every interactively selected client receives exactly
  thirteen released product skills named by `.agents/skills/README.md`: ten
  public entry names including one Context compatibility entry and visualization, and
  three internal supporting workflows.
- **AB-INSTALL-026** — A fixed allowlist is release authority; no skill outside
  the released product catalog is installed.
- **AB-INSTALL-027** — Codex uses `$CODEX_HOME/skills` with
  `~/.codex/skills` fallback; Claude Code uses `~/.claude/skills`.
- **AB-INSTALL-028** — An exact installed copy is a no-op. A different,
  non-directory or symbolic-link same-name target fails before mutation and is
  never replaced.
- **AB-INSTALL-029** — All selected client/skill destinations pass preflight
  before the first missing skill is copied; unselected clients remain unchanged.
- **AB-INSTALL-030** — If MCP registration later fails, rollback removes only
  unchanged skill directories created by that run and preserves every
  pre-existing destination.
- **AB-INSTALL-031** — Non-interactive setup remains preparation-only and never
  installs product skills or registers clients.

## Source-only installation

Dependencies and client/skill setup require no native graph binary, provider
activation or parser build. Retired provider-only requirements AB-INSTALL-032
through AB-INSTALL-036 are no longer release obligations. Source/runtime bounds
are owned by [Repository discovery](../01-repository-reading/05-runtime-requirements.md).
