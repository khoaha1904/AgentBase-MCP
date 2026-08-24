# Installation requirements

`./install.sh` prepares exact dependencies, optionally stores one Hub token,
installs released product skills and transactionally registers the current
checkout as user-global stdio MCP in selected clients. Installation never
selects or creates a Hub.

## Credential and non-interactive behavior

- **AB-INSTALL-001** — Interactive selection changes exactly available selected
  Codex and/or Claude Code clients; unselected clients remain unchanged.
- **AB-INSTALL-002** — Each accepted token character/paste displays one `*`;
  Backspace removes one; completion, EOF, interrupt and failure restore terminal
  state without printing token bytes.
- **AB-INSTALL-003** — Empty Enter keeps tokenless local operation.
  Non-interactive installation only prepares dependencies and never prompts,
  selects clients or persists an ambient token. Hub choice stays lazy.
- **AB-INSTALL-004** — An explicit token is atomically stored only at
  `$XDG_CONFIG_HOME/agentbase-mcp/env` or `~/.config/agentbase-mcp/env` in a
  `0700` directory and `0600` regular non-symlink file.
- **AB-INSTALL-005** — Existing credential bytes are preserved unless
  `--replace-token` succeeds; skip, invalid input, failure or interruption leaves
  prior bytes unchanged.
- **AB-INSTALL-006** — A non-empty process token wins; otherwise runtime admits
  the exact global file. Unsafe owner/permissions/type/symlink/keys/content fails
  closed without exposing bytes.

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
- **AB-INSTALL-016** — Credential persistence is independent of registration;
  client failure never erases an accepted token and tokens never enter entries.
- **AB-INSTALL-017** — Canonical tests use isolated homes and deterministic
  client doubles, never real installed-client state.

## Terminal UI

- **AB-INSTALL-018** — Interactive setup shows AgentBase-MCP identity followed
  by Clients, optional GitHub access and Registration actions.
- **AB-INSTALL-019** — ANSI terminals use Up/Down, Space and Enter multi-select;
  at least one client is required and output order is stable. Plain terminals
  use an append-only fallback.
- **AB-INSTALL-020** — Pointer, checkbox and text carry all state; cyan color is
  supplemental only.
- **AB-INSTALL-021** — Narrow/no-color modes preserve labels and controls; dumb
  and non-interactive modes emit no cursor/color ANSI.
- **AB-INSTALL-022** — Completion maps provider results to readable client
  outcomes and tells the user to start a new selected client session.
- **AB-INSTALL-023** — Rich rendering preserves masking, paste, Backspace,
  skip, credential independence, transaction recovery, secret-free failure and
  terminal restoration.
- **AB-INSTALL-024** — Deterministic tests cover chunked key sequences,
  multi-select, validation, color/narrow/dumb fallbacks, token/results and
  non-interactive output without real configuration mutation.

## Product skills

- **AB-INSTALL-025** — Every interactively selected client receives exactly the
  seven released product skills named by `.agents/skills/README.md`.
- **AB-INSTALL-026** — A fixed allowlist is release authority; `speckit-*` and
  every other repository-development skill are never installed.
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
- **AB-INSTALL-031** — Non-interactive setup remains dependency-only and never
  installs product skills.
