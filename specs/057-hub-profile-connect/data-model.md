# Data Model — AgentBase CLI Surface and Hub Connect

## Public command

```text
abs status
abs hub connect --url <https-repository-url> --branch <exact-branch>
abs hub sync
```

These are presentation-level commands. They do not introduce a new Hub object,
profile format or MCP tool.

## Hub profile identity

- `host`: normalized GitHub hostname
- `repository`: exact `owner/repository`
- `targetBranch`: exact non-empty branch
- `localHubId`: deterministic identity digest

Validation and persistence remain owned by the existing Hub identity and
configuration modules.

## Shared credential state

AgentBase keeps one owner-private default Hub token. Hub profile identity still
separates checkout and configuration, but does not select a different token.
The token is reused across repositories and branches; the remote permission
check decides whether it is valid for a destination.

```text
existing + blank input ──→ reuse ──→ validate/activate
legacy active token + blank ─→ promote to shared ─→ validate/activate
missing + entered token ─→ staged ─→ validate/activate
entered token + failure → restored → prior profile/token unchanged
staged token + process kill → private staged state; destination inactive
```

The token value is transient process memory plus the existing owner-private
credential file. It never becomes a CLI argument, response field, receipt,
profile metadata or Hub record.

## Active profile transition

```text
previous active ──destination fully admitted──→ destination active
previous active ──any earlier failure─────────→ previous active
```

`hub connect` performs no synchronization or Published/Draft state transition;
`hub sync` is the separate explicit operation.
