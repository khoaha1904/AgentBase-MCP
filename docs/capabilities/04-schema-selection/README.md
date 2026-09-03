# 04 — Schema selection

> Status: Catalog 7 is implemented; the catalog 6 design is superseded.

Product Contract:
[Repository understanding](../../product/01-repository-understanding.md)

## Contract map

- [`00-baseline-and-impact.md`](00-baseline-and-impact.md) — baseline, gap,
  impact and clean-cutover scope.
- [`01-provider-neutral-catalog.md`](01-provider-neutral-catalog.md) — schema
  catalog by general architecture role.
- [`02-selection-and-fallback.md`](02-selection-and-fallback.md) — schema
  selection pipeline, fallback, limitation and Question.
- [`03-cloud-provider-profiles.md`](03-cloud-provider-profiles.md) — map AWS
  products to common schemas and metadata.
- [`04-source-detector-profiles.md`](04-source-detector-profiles.md) — detector
  for Terraform and future source types.
- [`05-catalog-cutover.md`](05-catalog-cutover.md) — replace the current catalog
  and rebuild a draft without content migration.
- [`06-node-eligibility-and-provider-coverage.md`](06-node-eligibility-and-provider-coverage.md)
  — gate for a concept to become a graph node and coverage rollout for common
  providers.
- [`07-capability-requirements.md`](07-capability-requirements.md) — normative
  routes to the current `AB-SCHEMA-*` definitions.

## Current behavior and boundary

Catalog `7.0.0` keeps eight Initial Ingest roles: Repository, Domain, System,
Component, Function, Interface, Flow and Resource. Entity/Metric are
enrichment-only. AWS Profile v2 plus Terraform-family Detector v1 separate
technology from concept role; internal resources default to embedded, while
shared/independently operated resources may promote to Resource through the
node-eligibility gate. Terraform/Terragrunt are supported; SAM/CloudFormation
are not. Legacy/foreign types remain readable, but AgentBase no longer authors
the retired type.
