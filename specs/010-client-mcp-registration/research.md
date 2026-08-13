# Research: Client MCP Registration

## Official client management surfaces

**Decision**: Register both clients through their supported MCP management
commands rather than editing their configuration formats directly.

**Rationale**: OpenAI documents Codex stdio registration as
`codex mcp add <name> -- <command>...` and stores user configuration in
`~/.codex/config.toml`. Anthropic documents Claude Code stdio registration as
`claude mcp add --transport stdio --scope user <name> -- <command>...` and its
user scope in `~/.claude.json`. The installed CLIs expose matching add/get/remove
surfaces. Letting each client write its own format avoids treating a
provider-owned file schema as AgentBase policy.

**Sources**:

- [OpenAI Codex MCP documentation](https://learn.chatgpt.com/docs/extend/mcp)
- [Anthropic Claude Code MCP documentation](https://code.claude.com/docs/en/mcp)

**Alternatives considered**: Direct TOML/JSON editing creates two format owners,
can discard unknown provider fields and couples AgentBase to undocumented
migrations. Project-scoped files would either affect only one repository or
enter version control, contrary to machine installation.

## Entry identity and checkout binding

**Decision**: Use stable name `agentbase`, current absolute Node executable and
current checkout's absolute `src/cli.ts` plus `mcp`; configure no token or Hub
environment on the entry.

**Rationale**: Absolute values make the configured process independent of the
coding client's working directory and remove shell quoting ambiguity. It also
makes an old checkout visibly conflict after a move instead of silently changing
authority. AgentBase runtime already reads its private global token fallback, so
duplicating the token in client config would widen secret exposure.

**Alternatives considered**: Relative paths break outside the checkout. `npx`
introduces package/network resolution. A wrapper copied elsewhere creates a new
installer/updater lifecycle. PATH-only `node` is less exact than the runtime that
successfully launched installation.

## Existing entry policy

**Decision**: Normalize the exact named entry to command, ordered arguments,
transport and effective user scope. Exact is a no-op; absent may be added;
different or uninspectable is a preflight conflict.

**Rationale**: The owner chose coexistence without silent takeover. Treating a
moved checkout as conflict keeps user intent visible and avoids deleting another
tool's entry merely because its name matches.

**Alternatives considered**: Automatic replace is surprising and requires
uninstall ownership. Numeric suffixes would create multiple ambiguous AgentBase
servers. Name-only idempotency can conceal a stale launcher.

## Transaction and recovery

**Decision**: Preflight the full selection, persist a private non-secret receipt,
add missing entries in stable order, verify each, and compensate newly added
entries in reverse order on failure. Capture raw config snapshots only as guarded
recovery evidence; restore one only when the current bytes still match the exact
known post-add identity.

**Rationale**: Official CLI add/remove is safest for ordinary mutation, while a
receipt covers interruption between commands. Digest-gated snapshot restore is a
last recovery path that cannot overwrite unrelated concurrent changes.

**Alternatives considered**: Best-effort partial success violates the settled
all-selected behavior. Blind whole-file restore can destroy concurrent changes.
In-memory rollback alone cannot recover after SIGKILL or power loss.

## Verification boundary

**Decision**: Canonical tests use fake client executables and isolated home/config
roots. Real registration is a separately authorized smoke action.

**Rationale**: Repository verification must not mutate the developer's installed
Codex or Claude Code configuration. Fakes can deterministically cover every
phase, output shape, interruption and rollback failure.

**Alternatives considered**: Testing only helper functions would miss process and
transaction integration. Mutating real configs in `npm run verify` violates the
local deterministic gate.
