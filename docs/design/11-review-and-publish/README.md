# 11 — Review và Publish

> Trạng thái: Reviewable batch publication và exact same-Repository Init/Refresh stack implemented.

High-level decision:
[Review và Publish](../../present/11-review-accept-and-publish.md)

## Phân rã dự kiến

- [`01-runtime-requirements.md`](01-runtime-requirements.md) — current Local Hub,
  query, setup, publication và synchronization `AB-*` requirements.
- `02-review-preview.md` — nhóm, chọn và bỏ knowledge item.
- `03-dependency-validation.md` — selection hợp lệ trước PR.
- `04-git-and-pr-workflow.md` — pull, reconcile, branch, commit và PR.
- `05-publication-state-machine.md` — Local Draft, In Review và Published.
- `06-verification-and-cleanup.md` — verify item và dọn local an toàn.
- `07-failure-recovery-and-permissions.md` — retry, partial outcome và Git authority.
- `08-domain-enrichment-changes.md` — một dependency-safe Draft/PR chứa updates
  của nhiều repository trong cùng Domain.
- `09-profile-migration-changes.md` — impact scan, Migration Draft và một Hub PR
  cho semantic profile upgrade.

## Cross-section decision từ Refresh

PR review phải group `Added`, `Updated`, `Removed`, `Superseded/Retracted` và
`Questions/Limitations`. Destructive changes hiển thị reason, source revision/
diff evidence, affected relations và replacement; Git diff một mình không đủ
giải thích vì sao Agent đề xuất xóa. Technical shape chi tiết sẽ được breakout
khi phần 11 được review.

## PR review template requirement

MCP—not the calling agent or `gh`—owns branch push and PR creation with the
dedicated MCP Hub token. A created PR must summarize:

1. **Purpose** — why this proposal exists and its Init/Refresh/Enrichment mode.
2. **Scope** — Domain, repositories, source revisions and proposal IDs.
3. **Knowledge changes** — Added, Updated, Removed, Superseded/Retracted.
4. **Uncertainty** — Questions, Limitations, conflicts and unresolved evidence.
5. **Evidence and validation** — important sources, catalog/profile versions,
   deterministic validation and qualification status.
6. **Reviewer action** — what needs confirmation and what was intentionally not
   verified/published.

The body is derived from immutable proposal/inspection metadata; it must not
invent a model narrative or include credentials/local paths.

## Stacked Init/Refresh requirement

`submit_hub_okf_proposals` mở một dependency-safe proposal prefix. Eligible
same-Repository chains support:

```text
Init branch ──PR──→ main
Refresh branch ──PR──→ Init branch
```

The Refresh PR then shows only the delta from the Init knowledge. Both branches
and PRs remain MCP-owned, non-force-pushed and unmerged until maintainer action.
If Init closes/changes, Refresh publication stops with recoverable guidance; it
does not silently retarget or flatten the stack. Other selections retain one
batch PR into `main`; unrelated Init proposals are not independently rebased.
All paths remain MCP-owned and must not be bypassed with `gh` or another token.
