# 04 — Schema selection

## Bounded infrastructure support

The [approved SAM/Terraform scope](../../product/01-repository-understanding.md#coverage-expansion)
includes SAM Function, Api/HttpApi and API/SQS/schedule events; basic
CloudFormation Lambda, API Gateway, SQS and event-source mappings; Terraform
ECS service/task definitions, API Gateway and Lambda event-source mappings.
Reuse provider-neutral knowledge roles rather than adding per-resource schemas.

Support only defined Globals properties and direct same-template references;
preserve unresolved expressions as limitations. Evidence needs exact path/span
and source-format attribution. Never label SAM as Terraform, infer interaction
from IAM permission, or treat a mapping as standalone promotion. Do not execute
SAM/CloudFormation transforms, deploy, resolve remote stacks or call AWS.

Exact types and Globals rules live in the detector/provider profiles below;
AB-SCHEMA-061/062 in section 05 own the runtime requirements. Adjacent tests
cover positive and ambiguous fixtures, source citations, equivalent IaC roles,
embedding and unchanged Terraform behavior.

> Status: Catalog 7 and G5-C1 type-neutral placement/dossier materialization are
> implemented and verified; the catalog 6 design is
> superseded. G5-C2 semantic promotion admission is deferred and inactive.

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
  for Terraform/Terragrunt and bounded SAM/CloudFormation evidence.
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
enrichment-only. AWS Profile v2.1 plus Terraform-family and CloudFormation-family Detectors v1 separate
technology from concept role; internal resources default to embedded, while
shared/independently operated resources may promote to Resource through the
node-eligibility gate. Terraform/Terragrunt and bounded SAM/CloudFormation
observations are supported. Legacy/foreign types remain readable, but AgentBase no longer authors
the retired type. Under the accepted compact Profile target, these roles select
frontmatter/body guidance only; they never select a directory or require a
standalone file.
