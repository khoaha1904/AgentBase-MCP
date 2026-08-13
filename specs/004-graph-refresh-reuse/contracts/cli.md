# Contract: Explicit Graph Refresh CLI

## Evidence round

```text
npm run integration:codebase-memory -- <repository-root> <function-name> [--transport one-shot|scoped-session] [--refresh]
```

- Default behavior is automatic freshness selection: exact accepted identity
  reuses cache; all other states refresh once.
- `--refresh` forces exactly one provider index before queries even when source
  is unchanged.
- `--transport` retains Capability 003 behavior and is independent of freshness.
- Successful JSON adds `diagnostics.preparation.mode` and `.reason`.
- Normalized `evidence` and its digest do not include freshness diagnostics.
- A reuse query failure exits non-zero and stderr recommends the same command
  with `--refresh`; it does not retry automatically.

## Exit behavior

- `0`: evidence, integrity, cleanup and receipt commit completed.
- `1`: provider, receipt commit, source-integrity or cleanup failure.
- `2`: invalid CLI arguments, including repeated/valued `--refresh`.

The command remains opt-in native integration and outside `npm run verify`.

## Qualification

The exact-provider qualification uses disposable fixture source/cache, covers
initial/add/modify/delete/reuse/forced rounds, records index-call decision and
clean lifecycle, and removes temporary state. It makes no provider-incremental
or repository-scale latency promise.
