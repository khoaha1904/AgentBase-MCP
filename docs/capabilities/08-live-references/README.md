# 08 — Observed snapshots and source references

> Status: Repository snapshots, bounded AWS/SQS observations, freshness
> projection and read-only Hub CI are implemented; remote repository reads with
> an MCP token remain outside the MVP.

Product Contract:
[Observed snapshots and source references](../../product/08-live-references-for-change-prone-values.md)

## Contract map

- [`00-baseline-and-impact.md`](00-baseline-and-impact.md) — implemented
  clean-cut baseline and the broad capabilities still deferred.
- [`01-reference-format.md`](01-reference-format.md) — shared file reference,
  observed-value contract, source revision and line hint.
- [`02-observed-snapshots.md`](02-observed-snapshots.md) — useful bounded values and provenance.
- [`03-freshness-and-broken-sources.md`](03-freshness-and-broken-sources.md) — age/revision warnings and Question outcomes.
- [`04-access-and-current-source-reads.md`](04-access-and-current-source-reads.md) — snapshot response, normal MCP source
  reads and permission degradation.
- [`05-sensitive-value-filtering.md`](05-sensitive-value-filtering.md) — preventing secrets from entering Local Draft and the Hub.
- [`06-provider-observations.md`](06-provider-observations.md) — provider values are observed only during
  Domain Enrichment, not during Ingest.
- [`07-capability-requirements.md`](07-capability-requirements.md) — normative
  routes for observation, value safety, freshness and degraded reads.
