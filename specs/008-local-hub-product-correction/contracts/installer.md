# Installer Contract

## Entry point

`./install.sh [--replace-token]`

The entrypoint prepares the current checkout and invokes an interactive flow
when attached to a terminal. Unknown options fail before dependency or
credential mutation.

## Client selection

The user may select Codex, Claude Code or both. In this capability the selection
is echoed in the final non-secret summary with registration state `deferred`.
No Codex or Claude Code configuration path may be created, edited or removed.

## Credential interaction

If no credential exists, an interactive run asks for the dedicated Hub token.
Every accepted non-control character emits `*`; token characters never reach
terminal output. Backspace removes the last accepted character and mask.
Interruption or EOF restores terminal state and writes nothing. Empty Enter
completes local-only setup. A non-interactive run prepares dependencies without
client selection, does not ask and does not persist an ambient environment token.

An existing credential is preserved without prompting unless
`--replace-token` is explicit. Failed or interrupted replacement retains exact
prior bytes.

## Global storage

The path is `$XDG_CONFIG_HOME/agentbase-mcp/env`, or
`~/.config/agentbase-mcp/env` when XDG configuration is absent. The directory is
`0700`; the regular non-symlink file is `0600` and contains exactly one
`AGENTBASE_HUB_GITHUB_TOKEN=<opaque value>` assignment plus a final newline.

Runtime uses a non-empty environment value first and reads the file only as a
fallback. Unsafe type, link, mode, key or syntax fails closed without returning
file content.

## Deferred behavior

This capability does not install, remove or reconfigure an MCP registration for
Codex or Claude Code. Those client-specific mutations require a later contract
and acceptance evidence.
