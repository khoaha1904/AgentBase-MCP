# Freshness report contracts

## MCP

`read_hub_freshness {}` returns one `HubFreshnessReport`. It accepts no target,
credential, threshold or mutation argument.

## CLI

```sh
node src/cli.ts okf hub freshness
```

The command prints the same report as JSON. Missing Hub configuration returns
the ordinary non-zero Hub workflow failure.

## Future CI

CI is not part of capability 032. A later workflow may adapt a checked-out
Published Hub to the same core report contract; it must not reimplement age or
sorting policy.

