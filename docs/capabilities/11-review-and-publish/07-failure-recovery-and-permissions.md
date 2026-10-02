# 11.07 — Failure, recovery and permissions

> Status: Publication and Hub Initialization authority/recovery are implemented.

## Outcome

A failure retains private work and returns the exact recovery point. Only MCP
publication actions use the dedicated Hub token; there is no second permission
or retry system.

## Permission boundary

- Hub query, authoring, Finalize, Inspect run locally without a token.
- Attach/bootstrap/Publish/synchronize and explicit Hub Initialization
  preview/initialize are the only actions allowed to use the Hub token.
- The token resides in owner-private MCP configuration and never enters tool
  arguments, a Git URL, the Hub, a receipt, an error or model context.
- MCP publication authority includes bounded proposal-branch push, pull-request
  creation/adoption and fetch, plus a confirmed complete target commit under Direct policy
  or exact-empty support bootstrap.
  It does not include merge, approve, close, force-push, branch deletion or
  repository settings.
- Source/provider credentials are separate authority and cannot be borrowed for publication.
- A classic GitHub token needs `repo` for private Hub access. Add `workflow`
  when reviewed initialization or upgrade writes the Hub CI workflow. The
  four-file empty-remote bootstrap does not write CI and needs no `workflow`
  scope. A push refusal naming that scope requests the exact missing permission
  and retains the prepared checkpoint for retry.

## Failure classes

| Failure | Result |
|---|---|
| Invalid/stale proposal, base or digest | Stop before mutation. |
| Missing/denied token | Keep private work; repair credential then retry. |
| Network/timeout before completion | Keep checkpoint; inspect exact remote state on retry. |
| Existing matching branch/PR | Adopt only after exact identity validation. |
| Multiple/mismatched branch/PR | Fail closed; do not overwrite. |
| Git/content conflict | Preserve current state and exact conflict paths. |
| Direct remote success, local recognition failure | Report split outcome; retry exact recognition without republishing. |
| Interrupted validated sync | Explicit recovery advances candidate or restores original. |
| Existing initialization branch has extra/drifted bytes | Stop; never overwrite or adopt it. |

Attachment reports HTTP 401 as a rejected, expired or wrong-host token, HTTP 403
as insufficient repository permission, and Git exit failures as remote, branch
or network failures with redacted details. These classifications preserve the
prior admitted profile and never expose credential values.

## Retry and recovery

- Same request is idempotent by proposal, branch, base/head and PR identity.
- Retry never creates a second PR merely because the first response was lost.
- One exact profile-scoped mutation lock serializes Maintainer-answer proposal
  creation, Publish, Synchronize, Initialization, Bootstrap and Recovery.
  Another Hub profile has an independent lock; the former global lock remains a
  safe upgrade exclusion boundary until a dead owner is proven.
- Successful recovery removes temporary worktree/transaction state.
- Recovery never resets Published state, closes PRs or rewrites remote
  `main`.

No hidden retry loop, queue, daemon or distributed lock is required for MVP.
