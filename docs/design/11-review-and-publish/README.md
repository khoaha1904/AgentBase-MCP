# 11 — Review và Publish

> Trạng thái: Independent Init PR, same-Repository Init/Refresh stack, atomic
> Batch Initial Ingest PR và existing-PR reconciliation implemented.

High-level decision:
[Review và Publish](../../present/11-review-accept-and-publish.md)

## Phân rã dự kiến

- [`01-runtime-requirements.md`](01-runtime-requirements.md) — current Local Hub,
  setup, publication và synchronization `AB-*` requirements. Query authority
  lives in [`../10-query-routing/07-runtime-requirements.md`](../10-query-routing/07-runtime-requirements.md).
- [`02-review-preview.md`](02-review-preview.md) — chỉnh item trước Finalize,
  atomic review/Accept và optional static HTML sau MVP.
- [`03-dependency-validation.md`](03-dependency-validation.md) — hard structure
  gates, allowed incompleteness và AI/MCP responsibilities.
- [`04-git-and-pr-workflow.md`](04-git-and-pr-workflow.md) — exact replay,
  independent Init PR, same-Repository stack và reconciliation.
- [`05-publication-state-machine.md`](05-publication-state-machine.md) — trạng
  thái suy ra từ Git/matching PR, không có state store thứ hai.
- [`06-verification-and-cleanup.md`](06-verification-and-cleanup.md) — reuse ba
  validation gate và chỉ dọn temporary state an toàn trong MVP.
- [`07-failure-recovery-and-permissions.md`](07-failure-recovery-and-permissions.md) — retry, partial outcome và Git authority.
- [`08-domain-enrichment-changes.md`](08-domain-enrichment-changes.md) — một dependency-safe Draft/PR chứa updates
  của nhiều repository trong cùng Domain.
- [`09-profile-migration-changes.md`](09-profile-migration-changes.md) — impact scan, Migration Draft và một Hub PR
  cho semantic profile upgrade.

## Cross-section decision từ Refresh

PR review phải group `Added`, `Updated`, `Removed` và `Questions/Limitations`.
Destructive changes hiển thị reason, source revision/
diff evidence, affected relations và replacement; Git diff một mình không đủ
giải thích vì sao Agent đề xuất xóa. Technical shape chi tiết sẽ được breakout
khi phần 11 được review.

## PR review template requirement

MCP—not the calling agent or `gh`—owns branch push and PR creation with the
dedicated MCP Hub token. A created PR must summarize:

1. **Purpose** — why this proposal exists and its Init/Refresh/Batch Init/Enrichment mode.
2. **Scope** — Domain, repositories, source revisions and proposal IDs.
3. **Knowledge changes** — Added, Updated, Removed.
4. **Uncertainty** — Questions, Limitations, conflicts and unresolved evidence.
5. **Evidence and validation** — important sources, catalog/profile versions,
   deterministic validation and qualification status.
6. **Reviewer action** — what needs confirmation and what was intentionally not
   verified/published.

The body is derived from immutable proposal/inspection metadata; it must not
invent a model narrative or include credentials/local paths.

## Stacked Init/Refresh requirement

`submit_hub_okf_proposals` mở các publication unit dependency-safe theo từng
Repository. Eligible same-Repository chains support:

```text
Init branch ──PR──→ main
Refresh branch ──PR──→ Init branch
```

The Refresh PR shows only its Repository delta. An unrelated Init always gets
its own branch/PR from Published `main`; local accepted ancestry is storage
order only. After `main` advances, MCP merges the admitted new base into each
remaining branch sequentially and updates the same PR/base when needed. A
conflict stops before push. Exact-empty bootstrap writes only the complete
support baseline directly and opens no PR; all knowledge changes use PRs. All
paths remain MCP-owned and must not be bypassed with `gh` or another token.
