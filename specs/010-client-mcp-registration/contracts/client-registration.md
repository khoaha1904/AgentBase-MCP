# Contract: Client MCP Registration

## Interactive installer

The existing `./install.sh [--replace-token]` interface remains authoritative.
After dependency preparation it:

1. requires a non-empty selection of Codex, Claude Code or both;
2. performs the existing optional masked token action;
3. recovers any unfinished registration transaction;
4. preflights and transactionally registers all selected clients;
5. reports credential and per-client registration outcomes.

No new replace/force flag is exposed. A conflicting entry requires deliberate
user removal or rename outside this installer.

## Expected launcher

Each selected client receives the semantic equivalent of:

```text
name      = agentbase
transport = stdio
command   = <absolute current Node executable>
args      = [<absolute AgentBase-MCP checkout>/src/cli.ts, mcp]
scope     = user
env       = empty
```

Arguments are passed as an argv array, never a shell string. The client may
persist provider-specific fields as long as normalized effective behavior is
exactly equivalent.

## Provider operations

For each selected client the registration owner supports:

- `admit`: prove executable/help contract and resolve provider config location;
- `inspect(name)`: return `absent` or one normalized effective entry;
- `add(expected)`: add at user scope only;
- `remove(name)`: remove at user scope only;
- `verify(expected|absent)`: inspect again and compare exactly.

Provider stdout/stderr are bounded and sanitized. Raw unrelated configuration
and credential-like values never enter the installer result or receipt.

## Failure categories

- `CLIENT_UNAVAILABLE`
- `CLIENT_UNSUPPORTED`
- `ENTRY_UNINSPECTABLE`
- `ENTRY_CONFLICT`
- `CHECKOUT_INVALID`
- `CLIENT_COMMAND_FAILED`
- `VERIFY_MISMATCH`
- `CONCURRENT_CONFIG_CHANGE`
- `RECOVERY_STATE_UNSAFE`
- `ROLLBACK_FAILED`

Every failure names the selected client and corrective action. None includes a
token, full client configuration or authenticated URL.

## Non-interactive contract

When input/output are not interactive terminals, dependency preparation remains
the only action. Client selection, client inspection/mutation, credential prompt
and ambient-token persistence are all skipped.
