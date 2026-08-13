# Living Requirements: Installation and Global Credential

- **Status:** Active
- **Established by:** Capability `008-local-hub-product-correction`
- **Last updated:** 2026-08-13

### AB-INSTALL-001 — Multi-client selection is honest

Interactive installation lets the user select Codex, Claude Code or both. In
the initial slice selection is reported with registration state `deferred` and
neither client configuration is changed.

### AB-INSTALL-002 — Masked input remains observable

Every accepted token character produces one `*`; pasted input follows the same
rule. Backspace removes the last character and mask. Completion, interruption,
EOF and failure restore terminal input state without printing token bytes.

### AB-INSTALL-003 — Local-only and non-interactive paths are explicit

Empty Enter completes interactive preparation without an empty credential.
Non-interactive installation prepares code without client selection, waiting
for input or persisting an ambient token.

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
