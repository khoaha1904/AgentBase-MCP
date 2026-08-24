---
type: System
title: Serverless Data Pipeline
description: Provides the capability-level entry point for the repository's cooperating ingestion, cataloging, ETL, query, and analysis workloads.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-24T15:21:16.293Z
sources:
  - id: sem-system-readme
    resource: repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/README.md#L11-L34
  - id: sem-system-orchestration
    resource: repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/step_fn.tf#L9-L230
  - id: owner-domain
    resource: agentbase://owner-guidance/domains/crawler
relationships:
  - kind: part-of
    target: domains/crawler
    evidence:
      - owner-domain
  - kind: implemented-in
    target: repositories/serverless-data-pipelines-demo
    evidence:
      - sem-system-readme
---

# Purpose

The system ingests public API data into a layered data lake, catalogs each data zone, transforms landing JSON into Parquet, creates analytical views, and derives entity analytics.[^sem-system-readme]

Primary Domain: [Crawler](../domains/crawler.md).

Implemented in [serverless-data-pipelines-demo](../repositories/serverless-data-pipelines-demo.md).

# Architecture

The [Scheduled API Data Pipeline](../flows/scheduled-api-data-pipeline.md) coordinates four Lambda functions and one Glue ETL workload through Step Functions.[^sem-system-orchestration]

* [API Sourcing](../components/api-sourcing.md) pages the external API and writes landing JSON.
* [Glue Crawler Initiation](../components/glue-crawler-initiation.md) starts and waits for zone catalog crawlers.
* [API Glue ETL](../components/api-glue-etl.md) converts landing JSON to partitioned Parquet.
* [Athena Query Execution](../components/athena-query-execution.md) creates analytical views.
* [Comprehend Analysis](../components/comprehend-analysis.md) derives entity data and writes analytics JSON.

# Limitations

Suggested type `System` is evidence-bound agent intent and requires proposal review.

The source describes a broader serverless data-pipeline demonstration than the owner-confirmed Crawler Domain. This draft records only this repository's contributed scope and does not claim a complete Domain definition or a live AWS deployment.

# Embedded Knowledge

| Name | Role | Kind | Technology | Exact sources |
|---|---|---|---|---|
| Encrypted data zones | Searchable infrastructure context for where pipeline stages store data and artifacts. | object-storage | aws / s3; terraform:aws_s3_bucket | sem-data-zones: `repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/s3.tf#L1-L57`<br>res-data-zone-bucket: `repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/s3_bucket/main.tf#L1-L15` |

[^sem-system-readme]: [`README.md` lines 11-34](repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/README.md#L11-L34)
[^sem-system-orchestration]: [`step_fn.tf` lines 9-230](repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/step_fn.tf#L9-L230)
