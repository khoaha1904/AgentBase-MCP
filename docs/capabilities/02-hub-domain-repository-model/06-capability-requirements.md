# 02.06 — Capability requirement routes

This page is the normative requirement index for the Hub, Domain and Repository
model. The requirement definitions remain with the runtime boundary that
enforces them; this index does not copy or renumber shared requirements.

| Behavior | Normative requirements |
|---|---|
| Stable Repository identity and aliases | [`AB-LOCAL-HUB-016`](../11-review-and-publish/01-runtime-requirements.md#local-active-knowledge) |
| Confirmed home and evidenced Domain participation | [`AB-INGEST-010`](../05-knowledge-entry/06-runtime-requirements.md#single-repository-initial-ingest) |
| Optional, owner-confirmed Domain selection | [`AB-SCHEMA-018`, `AB-SCHEMA-024`](../05-knowledge-entry/06-runtime-requirements.md#concrete-schema-catalog) |
| Batch membership and Domain assignment | [`AB-BATCH-001..016`](../09-ingest-and-refresh/09-runtime-requirements.md) |
| Workspace discovery without a second registry | [`AB-LOCAL-HUB-019`](../11-review-and-publish/01-runtime-requirements.md#local-active-knowledge) |
| AgentBase OKF Profile 1.0 and Domain Capsule layout admission | [`AB-PROFILE-001..010`](07-profile-layout-requirements.md) |
| Profile 1.0 bootstrap and grouped-home Initial Ingest | [`AB-HOME-001..012`](08-profile-bootstrap-home-plan-requirements.md) |
| Profile Repository Refresh and Question guidance | [`AB-PROFILE-LIFECYCLE-001..010`](09-profile-refresh-guidance-requirements.md) |
| Profile Domain query/visualization projection | [`AB-PROFILE-READ-001..010`](../10-query-routing/08-profile-domain-projection-requirements.md) |
| Profile-aware Domain Enrichment | [`AB-PROFILE-ENRICH-001..011`](../06-cross-repository-relations/09-profile-enrichment-requirements.md) |
| Compact Profile 1.0, Repository dossiers and no Published activity logs | [`AB-COMPACT-001..015`](10-compact-profile-layout-requirements.md#requirements) |

Monorepo subproject automation remains deferred. One Git root remains one
Repository identity and one graph unit until a later accepted capability
changes that boundary.
