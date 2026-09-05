# 08.07 — Capability requirement routes

This page is the normative requirement index for observed snapshots and source
references. Definitions stay with the evidence, authoring, query and Hub CI
runtimes that enforce them.

| Behavior | Normative requirements |
|---|---|
| Explicit bounded source observation | [`AB-OBS-001..007`](../05-knowledge-entry/06-runtime-requirements.md#explicit-observations) |
| Observed-value identity, safety and Refresh behavior | [`AB-VALUE-001..009`](../05-knowledge-entry/06-runtime-requirements.md#observed-values) |
| Snapshot-default Published query | [`AB-QUERY-011`](../10-query-routing/07-runtime-requirements.md) and [`AB-FRESH-001..012`](08-freshness-envelope-requirements.md) |
| Warning-only freshness in Hub CI | [`AB-HUB-CI-004`](../11-review-and-publish/01-runtime-requirements.md#hub-ci) |
| Provider observations only through bounded Enrichment | [`AB-ENRICH-011..014`](../06-cross-repository-relations/07-runtime-requirements.md) |

A snapshot is never described as current truth. Missing access or a broken
source degrades visibly and never authorizes a guessed replacement value.
