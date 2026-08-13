# Quickstart: Graph Refresh Reuse

These commands describe the accepted Capability 004 behavior.

## Canonical offline gate

```bash
npm run verify
```

Uses fakes and captured responses; it does not launch the native provider.

## First explicit round

```bash
npm run integration:codebase-memory -- /path/to/repository inspectWorkspace
```

With no accepted receipt, diagnostics report `refreshed / missing-receipt`.

## Repeat unchanged

Run the same command again. Diagnostics report `reused / exact-match`; indexing
is skipped, but evidence queries and all source/cleanup checks still run.

## Explicit recovery or qualification

```bash
npm run integration:codebase-memory -- /path/to/repository inspectWorkspace --refresh
```

Diagnostics report `refreshed / forced`. Use this after a visible reusable-cache
query failure or when explicitly qualifying provider freshness.

Neither command starts a watcher/daemon, changes provider configuration or
publishes private graph/receipt state.
