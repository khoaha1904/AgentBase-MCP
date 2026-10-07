# 04 — Catalog 7 selection

> Status: Implemented; deferred boundaries are stated below.

Technology detection, standalone/embedded disposition and schema selection are
separate decisions. Catalog 7 exposes eight Initial Ingest roles; Entity/Metric are
enrichment-only and governance is workflow-owned. Foreign types remain open-world.
Queue/table/bucket/host usually remain embedded. Azure/GCP and semantic profile
migration are deferred.

## Contract owners

Current bounds and field contracts live in
[07-capability-requirements.md](07-capability-requirements.md) and
[Cutover compatibility](05-catalog-cutover.md).
Changes follow the repository impact gate; Git retains superseded designs.
