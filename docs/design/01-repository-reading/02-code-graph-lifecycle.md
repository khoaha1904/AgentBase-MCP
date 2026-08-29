# 01.02 — Code Graph lifecycle

> Status: Local managed graph lifecycle and lazy host routing are implemented.

## Decision

Code Graph has a temporary process/session and reusable local cache. The graph
is not Hub knowledge and is never published. One Git root is one graph unit: a
monorepo uses one graph, while independent Git repositories do not share one.

```text
start workflow that needs exact source
        ↓
check repository identity + source state + engine identity
        ↓
fresh → reuse cache        changed/forced → refresh graph
        ↓
multiple bounded queries in the same repository run
        ↓
close process/session; retain cache and freshness receipt
```

## Identity and freshness

- Each repository/provider workspace has its own local namespace.
- Freshness is based on repository identity, commit or dirty digest, graph
  engine identity and cache namespace.
- Reuse the graph when source is unchanged; re-index when source changes, the
  receipt is invalid or the owner requests refresh.
- Reuse skips indexing only. Query and source-integrity checks still run.

## Lifetime

- Opening a workspace or querying the Published Hub does not create a graph.
- One repository evidence round binds exactly one admitted source root/revision;
  Hub Init may use the detached remote-default worktree selected by Preflight.
- The Agent may query repeatedly in a round; if another repository is needed,
  the old session must close cleanly before binding the next one.
- Provider process/session must close on success, failure and cancellation.
- Cache and freshness receipts remain outside authored source for later reuse.
- Missing or corrupt cache only requires rebuilding the graph; it does not lose
  Hub knowledge.

## Boundary

- No default watcher or daemon.
- Do not prebuild every graph in a workspace or combine multiple graphs.
- Do not copy a raw graph, provider cache or freshness receipt into a Local
  Draft/Hub.
- Do not clone a remote repository for ordinary query/arbitrary discovery.
  Exact remote-default materialization for Hub Init is a bounded workflow input,
  not background clone authority.
- Do not reuse a graph across two repository identities merely because their
  source looks similar.
- A failed refresh must not mark a new cache as fresh; the caller receives a
  clear failure and may retry explicitly.

## Baseline reuse

The design preserves the current owned provider workspace, graph freshness
receipt and cleanup contract. Low-level implementation only needs the umbrella
skill to route into the correct lifecycle; it does not need a new cache manager.
