# 11 — Review and Publish

> Status: Independent Init pull requests, same-Repository Init/Refresh stacks,
> atomic Batch Initial Ingest pull requests and existing-PR reconciliation are implemented.

High-level decision:
[Review and Publish](../../present/11-review-accept-and-publish.md)

## Planned breakdown

- [`01-runtime-requirements.md`](01-runtime-requirements.md) — current Local Hub,
  setup, publication and synchronization `AB-*` requirements. Query authority
  lives in [`../10-query-routing/07-runtime-requirements.md`](../10-query-routing/07-runtime-requirements.md).
- [`02-review-preview.md`](02-review-preview.md) — editing items before Finalize,
  atomic review/Accept and optional static HTML after the MVP.
- [`03-dependency-validation.md`](03-dependency-validation.md) — hard structure
  gates, allowed incompleteness and AI/MCP responsibilities.
- [`04-git-and-pr-workflow.md`](04-git-and-pr-workflow.md) — exact replay,
  independent Init pull requests, same-Repository stacks and reconciliation.
- [`05-publication-state-machine.md`](05-publication-state-machine.md) — state
  derived from Git/matching pull requests, without a second state store.
- [`06-verification-and-cleanup.md`](06-verification-and-cleanup.md) — reusing
  three validation gates and cleaning only safe temporary state in the MVP.
- [`07-failure-recovery-and-permissions.md`](07-failure-recovery-and-permissions.md) — retry, partial outcomes and Git authority.
- [`08-domain-enrichment-changes.md`](08-domain-enrichment-changes.md) — a dependency-safe Draft/pull request containing updates
  from multiple repositories in the same Domain.
- [`09-profile-migration-changes.md`](09-profile-migration-changes.md) — an impact scan, Migration Draft and one Hub pull request
  for a semantic profile upgrade.

## Cross-section decision from Refresh

Pull-request review must group `Added`, `Updated`, `Removed` and
`Questions/Limitations`. Destructive changes show the reason, source revision/
diff evidence, affected relations and replacement; a Git diff alone is
insufficient to explain why the Agent proposes deletion. The detailed technical
shape will be broken out when Section 11 is reviewed.

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

`submit_hub_okf_proposals` opens dependency-safe publication units per Repository.
Eligible same-Repository chains support:

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
