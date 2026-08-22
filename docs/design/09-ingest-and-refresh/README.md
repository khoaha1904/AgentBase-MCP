# 09 — Ingest và Refresh

> Trạng thái: Single-repository Init/Refresh implemented; batch/enrichment/freshness deferred.

High-level decision:
[Ingest và Refresh](../../present/09-ingest-and-refresh.md)

## Phân rã

- [`00-baseline-and-impact.md`](00-baseline-and-impact.md) — current authoring
  baseline, orchestration gap và impact.
- [`01-initial-ingest.md`](01-initial-ingest.md) — workflow lần đọc đầu của
  canonical repository.
- [`02-refresh-and-change-detection.md`](02-refresh-and-change-detection.md) —
  so sánh source với knowledge đã có và mở rộng coverage dần.
- [`03-batch-processing.md`](03-batch-processing.md) — sequential isolated
  repository processing và batch outcome.
- [`04-repository-identity.md`](04-repository-identity.md) — Repository ID,
  aliases, lineage, fork và mirror.
- [`05-incomplete-runs-and-retry.md`](05-incomplete-runs-and-retry.md) —
  isolation, checkpoint và retry idempotent.
- [`06-refresh-reconciliation.md`](06-refresh-reconciliation.md) — contribution
  ownership, evidence-backed removal và PR change summary.
- [`07-domain-enrichment.md`](07-domain-enrichment.md) — atomic batch hậu
  publish cho provider evidence, Questions và cross-repository relations.
- [`08-okf-freshness.md`](08-okf-freshness.md) — warning age/revision trong MCP
  query và derived CI report.

## Implementation trace

- Implemented: single-repository Preflight → Discover → Investigate → Author →
  Validate/Inspect; explicit partial outcome; no-change; exact source-state
  check; one repair; Repository observed-source metadata.
- Implemented: Refresh exact commit diff, known gaps + bounded discovery,
  foreign/protected evidence preservation và typed destructive intent.
- Deferred: multi-repository batch/checkpoints, Domain Enrichment/provider CLI,
  query age presentation và scheduled freshness report.

Qualification policy hiện dùng Sol cho Initial Ingest và Terra cho Refresh.
Đây là benchmark configuration, không phải runtime model router của MCP.
