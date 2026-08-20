# Hub OKF

This application capability owns local Hub work and explicit publication. Its
public API is [`index.ts`](index.ts); [`cli.ts`](cli.ts) and `mcp/` adapt that API
for users and agents.

## Areas

- `configuration/` — Hub settings and credentials.
- `workspace/` — checkout, setup, bootstrap and local Hub admission.
- `authoring/` — proposal preparation, refresh and Questions.
- `review/` — inspection, acceptance and pending state.
- `publication/` — submit, publish, synchronize and recovery.
- `query/` — accepted-Hub reads and composed runtime actions.
- `mcp/` — MCP tool definitions and call adapters.

Keep GitHub transport in `providers/github-hub` and provider-neutral OKF rules
in `core/knowledge`.
