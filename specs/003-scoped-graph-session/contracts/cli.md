# Contract: Graph Lifecycle CLI

## Explicit evidence round

```text
npm run integration:codebase-memory -- <repository-root> <function-name> --transport <one-shot|scoped-session>
```

- `--transport` is optional only after a default is accepted. Before promotion,
  omission retains `one-shot`.
- Output is one JSON object containing the existing evidence bundle and graph
  round diagnostics.
- Errors go to stderr with local repository roots redacted and exit non-zero.
- A scoped-session failure is not retried through one-shot.

## Paired fixture benchmark

```text
npm run benchmark:codebase-memory
```

- Uses the checked-in 12-file TypeScript fixture and accepted
  `inspectWorkspace` task only.
- Runs three alternating pairs with isolated private cache namespaces.
- Emits one JSON benchmark report with six raw arms, medians, parity,
  speed ratio, promotion eligibility and limitations.
- Does not mutate application defaults automatically.

## Exit behavior

- `0`: all requested work completed; benchmark may still report
  `promotionEligible: false` for a measured speed miss.
- `1`: provider, protocol, parity, mutation or cleanup failure.
- `2`: invalid CLI arguments.

Both commands are opt-in native integrations and remain outside
`npm run verify`.
