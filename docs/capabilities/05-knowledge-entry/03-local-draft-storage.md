# 05.03 — Local Draft storage and Published query boundary

> Status: Implemented baseline (capability 056).

## No additional storage layer

The local storage root is not a second knowledge authority. New MCP runtime
state uses one owner-private `AGENTBASE_HOME`/`~/.agentbase` root:

```text
~/.agentbase/
  config/   Hub configuration and owner-private credentials
  hubs/     durable Hub checkout, Draft `main` and Published ref
  state/    proposals, sessions, transactions and enrichment checkpoints
  cache/    rebuildable Code Graph/provider/query cache
  tmp/      disposable checkout/workspace staging
```

The root is created with mode `0700`; credential files use `0600`. Repository
proposal bundles use `state/repositories/<stable-root-digest>/`; a source
checkout may contain a short-lived `.agentbase/okf.lock` and atomic-switch
backups during apply. Legacy XDG directories remain readable and untouched. A
safe legacy `/tmp/agentbase-<uid>/hub-runtime` is copied once to durable
`state/hub-runtime` only when the new target is absent; collision or symlink
input fails closed and the source is never deleted.

Each remote Hub profile has independent Git state for the publication lifecycle:

```text
remoteBase ── Published baseline
     └── pending proposal commits ── Local Draft / In Review
                                  ↑ activeHead (review/authoring tree)
```

- `remoteBase`: exact remote `main` that was synchronized.
- `activeHead`: Published baseline plus all accepted local proposals.
- `remoteBase..activeHead`: ordered pending proposal commits.
- An authoring workspace before Accept is not a Local Draft.

## State mapping

| Product state | Git/lifecycle evidence |
|---|---|
| Local Draft | accepted proposal commit is in pending ancestry |
| In Review | pending proposal has a publication receipt/PR being tracked |
| Published | synchronize recognizes the proposal on remote history/patch |

`In Review` details and PR closure/retry belong to section 11. Do not poll
GitHub in the background; normal query reads the exact synchronized Published
boundary.

## Query boundary

Ordinary search/read uses exact `remoteBase`. `activeHead` and proposal commits
remain available only to inspect/review/PR workflows.

Without a remote profile, do not initialize a local-only OKF authority: Hub
query, Ingest, Refresh and Draft operations do not run. Local Code Graph remains
independent and usable. Switching profiles selects state by normalized remote URL
+ branch; it does not silently overlay or migrate Drafts between profiles.

## Failure rule

If the Published anchor cannot be admitted exactly, query fails closed. It does
not substitute a Local Draft or remote working state.
