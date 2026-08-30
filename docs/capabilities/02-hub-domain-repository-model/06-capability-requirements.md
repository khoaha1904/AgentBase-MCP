# 02.06 — Capability requirement routes

This page is the normative requirement index for the Hub, Domain and Repository
model. The requirement definitions remain with the runtime boundary that
enforces them; this index does not copy or renumber shared requirements.

| Behavior | Normative requirements |
|---|---|
| Stable Repository identity and aliases | [`AB-LOCAL-HUB-016`](../11-review-and-publish/01-runtime-requirements.md#local-active-knowledge) |
| Confirmed primary Domain materialization | [`AB-INGEST-010`](../05-knowledge-entry/06-runtime-requirements.md#single-repository-initial-ingest) |
| Optional, owner-confirmed Domain selection | [`AB-SCHEMA-018`, `AB-SCHEMA-024`](../05-knowledge-entry/06-runtime-requirements.md#concrete-schema-catalog) |
| Batch membership and Domain assignment | [`AB-BATCH-001..015`](../09-ingest-and-refresh/09-runtime-requirements.md) |
| Workspace discovery without a second registry | [`AB-LOCAL-HUB-019`](../11-review-and-publish/01-runtime-requirements.md#local-active-knowledge) |

Monorepo subproject automation remains deferred. One Git root remains one
Repository identity and one graph unit until a later accepted capability
changes that boundary.
