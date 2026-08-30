# 09 — Ingest and Refresh

> Status: Single-repository Init/Refresh, Batch Initial Ingest, bounded Domain
> Enrichment, the freshness report and Hub CI are implemented under the baseline.
> The Capability 046 Initial Ingest discovery runtime is also implemented.

Product Contract:
[Ingest and Refresh](../../product/09-ingest-and-refresh.md)

## Contract map

- [`00-baseline-and-impact.md`](00-baseline-and-impact.md) — current authoring
  baseline, orchestration gap and impact.
- [`01-initial-ingest.md`](01-initial-ingest.md) — the first-read workflow for a
  canonical repository.
- [`02-refresh-and-change-detection.md`](02-refresh-and-change-detection.md) —
  comparing source with existing knowledge and expanding coverage incrementally.
- [`03-batch-processing.md`](03-batch-processing.md) — sequential isolated
  repository processing and batch outcomes.
- [`04-repository-identity.md`](04-repository-identity.md) — Repository ID,
  aliases, lineage, forks and mirrors.
- [`05-incomplete-runs-and-retry.md`](05-incomplete-runs-and-retry.md) —
  isolation, checkpoints and idempotent retry.
- [`06-refresh-reconciliation.md`](06-refresh-reconciliation.md) — contribution
  ownership, evidence-backed removal and pull-request change summaries.
- [`07-domain-enrichment.md`](07-domain-enrichment.md) — an atomic post-publication
  batch for provider evidence, Questions and cross-repository relations.
- [`08-okf-freshness.md`](08-okf-freshness.md) — age/revision warnings in MCP
  query and derived CI reports.
- [`09-runtime-requirements.md`](09-runtime-requirements.md) — current
  `AB-BATCH-*` contract for Batch Initial Ingest.
- [`10-workspace-scan.md`](10-workspace-scan.md) — bounded workspace inventory
  and user-directed routing to Init or sequential Refresh.

## Implementation trace

- Implemented: single-repository Preflight → Discover → Investigate → Author →
  Validate/Inspect; explicit partial outcome; no-change; exact source-state
  check; one repair; Repository observed-source metadata.
- Implemented: Refresh exact commit diff, known gaps + bounded discovery,
  foreign/protected evidence preservation and typed destructive intent.
- Implemented offline: explicit 2..32-repository Batch Initial Ingest,
  sequential checkpoints, retry/membership revision and one atomic proposal.
- Deferred: Batch Refresh, mixed Init/Refresh, additional Domain Enrichment
  profiles, ordinary query age presentation and a persisted freshness report.
- Implemented MVP: public bounded `agentbase-scan`.
- Implemented Capability 046: remote-default Init source isolation,
  Discovery Seed → Inventory Receipt → OKF coverage gates, expanded inspection
  and one concise Repository Init activity entry.

The qualification policy currently uses Sol for Initial Ingest and Terra for
Refresh. This is benchmark configuration, not MCP's runtime model router.
