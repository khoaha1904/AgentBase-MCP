# 10 — Query routing

> Status: Published-only Hub query, MiniSearch retrieval, Repository-aware Domain
> scope, bounded relation discovery and Capability 051 failure visibility/
> qualification hardening are implemented; G3-C1 additive freshness is
> implemented and MCP remains deterministic. G4-C4 Profile Domain projection
> and G5-C1 compact layout are implemented and verified. G5-C2 private
> draft-quality probes are deferred and inactive.

Product Contract:
[Query and context](../../product/05-query-and-context.md)

## Contract map

- [`00-baseline-and-impact.md`](00-baseline-and-impact.md) — current query surfaces,
  reusable boundaries, gaps and impact checkpoint.
- [`01-source-selection.md`](01-source-selection.md) — selecting the Hub,
  source or both without adding a reasoning router to MCP.
- [`02-published-and-draft-overlay.md`](02-published-and-draft-overlay.md) —
  superseded overlay and the exact Published-only query boundary.
- [`03-source-access-and-degradation.md`](03-source-access-and-degradation.md) —
  explicit source authority, failure states and snapshot fallback.
- [`04-conflict-aware-responses.md`](04-conflict-aware-responses.md) — bounded
  positions, provenance, Questions and Guidance without selecting a truth winner.
- [`05-observed-and-current-values.md`](05-observed-and-current-values.md) —
  snapshot-default stopping rule and current-source comparison outcomes.
- [`06-hub-search-and-ranking.md`](06-hub-search-and-ranking.md) — OKF/Markdown
  search-then-read, heading-aware sections, established lexical relevance,
  Domain context, relation results and bounds.
- [`07-runtime-requirements.md`](07-runtime-requirements.md) — current
  `AB-QUERY-*` authority; query requirements no longer reside under Review/Publish.
- [`08-profile-domain-projection-requirements.md`](08-profile-domain-projection-requirements.md)
  — Profile selector and shared home/participation/boundary projection.
- [Deferred semantic quality design](../09-ingest-and-refresh/11-semantic-quality-admission-requirements.md)
  — retained future draft-probe design; no current query behavior.
- [Uniform context freshness](../08-live-references/08-freshness-envelope-requirements.md)
  — G3-C1 additive freshness metadata returned by Published search/read.
