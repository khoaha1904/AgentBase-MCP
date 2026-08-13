# CLI Contract

```text
node src/cli.ts observe <absolute-repository-root> <symbol>
  [--transport one-shot|scoped-session] [--refresh]
```

- Success: exit 0 and one normalized observation JSON value on stdout.
- Invalid input: exit 2, exact usage on stderr, no provider invocation.
- Runtime failure: exit 1, redacted error on stderr, no partial JSON.
- Side effects: private disposable graph/cache state only; no `okf/` or proposal
  operation, no watcher and no standing process after exit.
- `node src/cli.ts okf ...` remains the only OKF command family.
