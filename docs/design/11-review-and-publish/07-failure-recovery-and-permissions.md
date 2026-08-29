# 11.07 — Failure, recovery and permissions

> Status: Publication and Hub Initialization authority/recovery are implemented.

## Outcome

A failure retains Local Draft and returns the exact recovery point. Only MCP
publication actions use the dedicated Hub token; there is no second permission
or retry system.

## Permission boundary

- Hub query, authoring, Finalize, Inspect and Accept run locally without a token.
- Attach/bootstrap/submit/synchronize and explicit Hub Initialization
  preview/initialize are the only actions allowed to use the Hub token.
- The token resides in owner-private MCP configuration and never enters tool
  arguments, a Git URL, the Hub, a receipt, an error or model context.
- MCP publication authority includes bounded proposal-branch push, pull-request
  creation/adoption/update and fetch, plus an exact-empty one-time baseline bootstrap.
  It does not include merge, approve, close, force-push, branch deletion or
  repository settings.
- Source/provider credentials are separate authority and cannot be borrowed for publication.

## Failure classes

| Failure | Result |
|---|---|
| Invalid/stale proposal, base or digest | Stop before mutation. |
| Missing/denied token | Keep Local Draft; repair credential then retry. |
| Network/timeout before completion | Keep checkpoint; inspect exact remote state on retry. |
| Existing matching branch/PR | Adopt only after exact identity validation. |
| Multiple/mismatched branch/PR | Fail closed; do not overwrite. |
| Git/content conflict | Preserve current state and exact conflict paths. |
| Partial multi-PR submit | Keep completed PRs and retry remaining units. |
| Interrupted validated sync | Explicit recovery advances candidate or restores original. |
| Existing initialization branch has extra/drifted bytes | Stop; never overwrite or adopt it. |

## Retry and recovery

- Same request is idempotent by proposal, branch, base/head and PR identity.
- Retry never creates a second PR merely because the first response was lost.
- One mutation lock serializes Accept, Publish, Synchronize and Recovery.
- Successful recovery removes temporary worktree/transaction state.
- Recovery never resets accepted Local Drafts, closes PRs or rewrites remote
  `main`.

No hidden retry loop, queue, daemon or distributed lock is required for MVP.
