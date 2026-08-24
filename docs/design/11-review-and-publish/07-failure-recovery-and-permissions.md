# 11.07 — Failure, recovery and permissions

> Trạng thái: Publication and Hub Initialization authority/recovery implemented.

## Outcome

Failure giữ Local Draft và trả exact recovery point. Chỉ MCP publication actions
dùng dedicated Hub token; không có quyền hay retry system thứ hai.

## Permission boundary

- Hub query, authoring, Finalize, Inspect và Accept chạy local, không cần token.
- Attach/bootstrap/submit/synchronize và explicit Hub Initialization preview/initialize là các
  action duy nhất được dùng Hub token.
- Token nằm trong owner-private MCP configuration, không vào tool arguments,
  Git URL, Hub, receipt, error hoặc model context.
- MCP publication authority gồm bounded proposal-branch push, PR
  create/adopt/update và fetch, plus exact-empty one-time baseline bootstrap. Nó
  không gồm merge, approve, close, force-push, branch delete hay repository
  settings.
- Source/provider credentials là authority khác và không được mượn để publish.

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
