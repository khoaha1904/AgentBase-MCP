# Living Requirements: Installation and Global Credential

- **Status:** Active
- **Established by:** Capability `008-local-hub-product-correction`
- **Last updated:** 2026-08-13

### AB-INSTALL-001 — Multi-client selection is honest

Interactive installation lets the user select Codex, Claude Code or both. Each
selected available client receives one verified user-global `agentbase` stdio
entry; unselected clients remain unchanged.

### AB-INSTALL-002 — Masked input remains observable

Every accepted token character produces one `*`; pasted input follows the same
rule. Backspace removes the last character and mask. Completion, interruption,
EOF and failure restore terminal input state without printing token bytes.

### AB-INSTALL-003 — Local-only and non-interactive paths are explicit

Empty Enter completes interactive preparation without an empty credential.
Non-interactive installation prepares code without client selection, waiting
for input or persisting an ambient token.

Installation never asks for, derives or creates an AgentBase-Hub. Hub selection
is deferred until the first Hub-dependent OKF action; Code Graph remains usable
with no Hub configuration.

### AB-INSTALL-004 — One global private credential

An explicitly entered token is atomically stored at
`$XDG_CONFIG_HOME/agentbase-mcp/env`, falling back to
`~/.config/agentbase-mcp/env`. Its directory is `0700`; its regular file is
`0600`, contains only the admitted Hub token assignment and is never a symlink.

### AB-INSTALL-005 — Existing bytes are preserved

Installation preserves an existing global credential by default. Replacement
requires `--replace-token`; skip, validation failure, interruption or failed
replacement leaves prior bytes unchanged.

### AB-INSTALL-006 — Runtime fallback fails closed

A non-empty process token takes precedence. Otherwise Hub runtime may read the
exact global credential. Unsafe ownership, permissions, type, symlink, unknown
key or malformed content fails without exposing credential bytes.

### AB-INSTALL-007 — Exact selected clients

Interactive registration changes exactly the selected supported clients at
user scope. Non-interactive preparation and unselected clients remain unchanged.

### AB-INSTALL-008 — Absolute admitted launcher

The `agentbase` entry uses the current absolute Node executable and current
AgentBase-MCP `src/cli.ts mcp` entrypoint. It contains no Hub identity, token or
shell-composed command.

### AB-INSTALL-009 — Complete preflight

Every selected client, checkout entrypoint and existing same-name entry is
admitted before the first client mutation.

### AB-INSTALL-010 — Idempotence without takeover

An exact existing entry is an unchanged success. A differing or uninspectable
`agentbase` entry fails before mutation and is never silently replaced.

### AB-INSTALL-011 — Supported client authority

Codex and Claude Code registration uses their supported user-scope MCP
management surfaces and independently verifies the resulting effective entry.

### AB-INSTALL-012 — One selected-client transaction

All selected clients form one transaction. Failure after mutation removes and
verifies every entry newly added by that transaction while preserving entries
that existed beforehand.

### AB-INSTALL-013 — Concurrent configuration preservation

Registration preserves unrelated configuration. Snapshot restoration is
permitted only when current bytes exactly match the known installer-produced
state; concurrent bytes are never overwritten.

### AB-INSTALL-014 — Durable private recovery

Owner-private non-secret phase evidence supports deterministic next-run
recovery. Unsafe, malformed or mismatched recovery state blocks new mutation.

### AB-INSTALL-015 — Visible secret-free failures

Unavailable clients, conflicts, command/verification failures, concurrent
changes and unresolved rollback remain distinguishable without exposing
credentials or unrelated configuration values.

### AB-INSTALL-016 — Credential independence

Masked token persistence remains independent of the client transaction. A
client registration failure does not erase an already accepted credential and
the token never enters a client MCP entry.

### AB-INSTALL-017 — Isolated canonical proof

Canonical verification covers selections, reruns, conflicts, failures,
interruption, rollback and concurrency with isolated homes and deterministic
client doubles. It never mutates real installed-client configuration.
