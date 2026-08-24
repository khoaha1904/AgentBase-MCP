# MCP Contract: Hub Control

## Configuration

Remote connect accepts only credential-free `repository_url` and
`target_branch`. Token, local path, API base and branch/ref names are not tool
arguments. Local-only setup remains internal/lazy for authoring.

## Status

Status is read-only and returns a partial result:

```text
kind: unconfigured | local-only | remote
hub: { host, repository, branch }?
local: { published_head, active_head, draft_count?, state, detail? }
credential: not-required | ready | missing | invalid
remote: { state: current | updates-available | unavailable, head?, detail? }?
open_pr_count: { count: number, truncated: boolean } | unavailable
sync: { state: ready | blocked | recovery-required, bounded context? }
```

No machine-local root, token or unbounded provider error is returned.

## Synchronization

Synchronization has no hidden status trigger. It fetches the configured target
into candidate state, validates exact replay, then atomically admits Published
and active state. Conflict returns recoverable bounded context and preserves all
pre-call refs.
