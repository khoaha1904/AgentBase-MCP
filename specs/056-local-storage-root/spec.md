# Local storage root normalization

## Outcome

AgentBase-MCP creates new local application data below one owner-private
`AGENTBASE_HOME` root, defaulting to `~/.agentbase`, with predictable durable,
rebuildable and temporary children.

## Scope

- Use `config/` for Hub configuration and credentials.
- Use `hubs/` for durable Hub checkouts and Published/Draft Git state.
- Use `state/` for recoverable Hub workflow state.
- Keep repository proposal bundles under `state/repositories/`; only the
  short-lived apply lock/backup markers may touch a source checkout.
- Use `cache/` for rebuildable Code Graph/provider/query data.
- Use `tmp/` for disposable local checkout staging.
- Keep existing XDG-era data untouched and readable; copy safe legacy `/tmp`
  Hub runtime once into durable state without deleting its source.

## Non-goals

- Moving or deleting an operator's existing XDG or `/tmp` directories.
- Changing Hub Git lifecycle, query authority, benchmark ownership or OKF schema.
- Moving portable `.agentbase/ci` files from an AgentBase-Hub repository.

## Acceptance

- Default paths resolve below `~/.agentbase` and an absolute `AGENTBASE_HOME`
  override isolates tests and benchmark runs.
- Hub configuration, credentials, checkout, bootstrap receipts, runtime state,
  provider cache and query cache resolve to the documented children.
- Root and created directories are owner-private; unsafe paths fail closed.
- Existing focused lifecycle, benchmark and repository verification pass.
