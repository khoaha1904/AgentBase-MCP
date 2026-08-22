# 08 — Observed snapshots and source references

> Trạng thái: Repository snapshots, bounded AWS/SQS observations, local freshness report và read-only Hub CI đã implement.

High-level decision:
[Observed snapshots và source references](../../present/08-live-references-for-change-prone-values.md)

## Phân rã dự kiến

- [`00-baseline-and-impact.md`](00-baseline-and-impact.md) — implemented
  clean-cut baseline và phần broad capability còn deferred.
- [`01-reference-format.md`](01-reference-format.md) — shared file reference,
  observed-value contract, source revision và line hint.
- [`02-observed-snapshots.md`](02-observed-snapshots.md) — useful bounded values và provenance.
- [`03-freshness-and-broken-sources.md`](03-freshness-and-broken-sources.md) — age/revision warning và Question outcome.
- [`04-access-and-current-source-reads.md`](04-access-and-current-source-reads.md) — snapshot response, normal MCP source
  read và permission degradation.
- [`05-sensitive-value-filtering.md`](05-sensitive-value-filtering.md) — ngăn secret vào Local Draft và Hub.
- [`06-provider-observations.md`](06-provider-observations.md) — provider values chỉ được observed trong
  Domain Enrichment, không trong Ingest.
