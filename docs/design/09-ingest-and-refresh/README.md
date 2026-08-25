# 09 — Ingest và Refresh

> Trạng thái: Single-repository Init/Refresh, Batch Initial Ingest, bounded
> Domain Enrichment, freshness report và Hub CI đã implement theo baseline.
> Capability 046 Initial Ingest discovery runtime cũng đã implement.

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
- [`09-runtime-requirements.md`](09-runtime-requirements.md) — current
  `AB-BATCH-*` contract cho Batch Initial Ingest.
- [`10-workspace-scan.md`](10-workspace-scan.md) — bounded workspace inventory
  và user-directed routing sang Init hoặc sequential Refresh.

## Implementation trace

- Implemented: single-repository Preflight → Discover → Investigate → Author →
  Validate/Inspect; explicit partial outcome; no-change; exact source-state
  check; one repair; Repository observed-source metadata.
- Implemented: Refresh exact commit diff, known gaps + bounded discovery,
  foreign/protected evidence preservation và typed destructive intent.
- Implemented offline: explicit 2..32-repository Batch Initial Ingest,
  sequential checkpoints, retry/membership revision và one atomic proposal.
- Deferred: Batch Refresh, mixed Init/Refresh, additional Domain Enrichment
  profiles, ordinary query age presentation và persisted freshness report.
- Implemented MVP: public bounded `agentbase-scan`.
- Implemented Capability 046: remote-default Init source isolation,
  Discovery Seed → Inventory Receipt → OKF coverage gates, expanded inspection
  and one concise Repository Init activity entry.

Qualification policy hiện dùng Sol cho Initial Ingest và Terra cho Refresh.
Đây là benchmark configuration, không phải runtime model router của MCP.
