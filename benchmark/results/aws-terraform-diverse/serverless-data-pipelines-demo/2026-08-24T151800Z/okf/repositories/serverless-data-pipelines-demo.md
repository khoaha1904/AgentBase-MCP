---
type: Repository
title: serverless-data-pipelines-demo
description: Source repository serverless-data-pipelines-demo
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
  - id: doc-python-version
    resource: repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/README.md#L6-L9
  - id: config-python-runtime
    resource: repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/python_lambda/main.tf#L7-L12
relationships:
  - kind: part-of
    target: domains/crawler
    evidence:
      - owner-domain
agentbase:
  repository:
    id: repository-serverless-data-pipelines-demo-95c2a8f15f93
    display_name: serverless-data-pipelines-demo
    aliases:
      remotes:
        - https://github.com/jhole89/serverless-data-pipelines-demo
      root_commits:
        - 1483d3869ecc148195bce092900d8556332db609
    observed_source:
      commit: 1483d3869ecc148195bce092900d8556332db609
      dirty: false
      dirty_digest: null
      observed_at: 2026-08-24T15:21:16.293Z
  observed_values:
    - id: AB-OBS-b4360e058bae780937f0649b
      subject: repositories/serverless-data-pipelines-demo
      property: runtime.python_version
      role: documentation
      value: "3.8"
      source_id: doc-python-version
      observed:
        commit: 1483d3869ecc148195bce092900d8556332db609
        dirty: false
        dirty_digest: null
        at: 2026-08-24T15:21:16.293Z
    - id: AB-OBS-df670c2777cf5b7d15b344bc
      subject: repositories/serverless-data-pipelines-demo
      property: runtime.python_version
      role: configuration
      value: python3.7
      source_id: config-python-runtime
      observed:
        commit: 1483d3869ecc148195bce092900d8556332db609
        dirty: false
        dirty_digest: null
        at: 2026-08-24T15:21:16.293Z
---

# Purpose

This repository defines a Terraform-provisioned AWS data-lake demonstration and the Python and Scala workloads that ingest public API data, catalog it, transform it to Parquet, query it, and derive analytics.[^sem-system-readme]

Primary Domain: [Crawler](../domains/crawler.md).

The Step Functions definition is the main runtime composition point for the deployed workloads.[^sem-system-orchestration]

## Source layout

* Root Terraform files declare orchestration and AWS infrastructure.
* `lambdas/` contains the independently deployed Python handlers.
* `glue_scripts/` contains the Scala Glue ETL implementation.

# Canonical Knowledge

* [Serverless Data Pipeline](../systems/serverless-data-pipeline.md) - System
* [API Sourcing](../components/api-sourcing.md) - Function
* [Glue Crawler Initiation](../components/glue-crawler-initiation.md) - Function
* [Athena Query Execution](../components/athena-query-execution.md) - Function
* [Comprehend Analysis](../components/comprehend-analysis.md) - Function
* [API Glue ETL](../components/api-glue-etl.md) - Component
* [Scheduled API Data Pipeline](../flows/scheduled-api-data-pipeline.md) - Flow

# Embedded Knowledge

| Name | Role | Kind | Technology | Exact sources |
|---|---|---|---|---|
| Encrypted data zones | Searchable infrastructure context for where pipeline stages store data and artifacts. | object-storage | aws / s3; terraform:aws_s3_bucket | sem-data-zones: `repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/s3.tf#L1-L57`<br>res-data-zone-bucket: `repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/s3_bucket/main.tf#L1-L15` |

# Limitations

This proposal describes source intent only; it does not establish that the Terraform was applied or that any AWS resources currently exist. The README's Python 3.8 badge conflicts with the shared Lambda module's `python3.7` runtime setting.[^doc-python-version][^config-python-runtime]

[^sem-system-readme]: [`README.md` lines 11-34](repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/README.md#L11-L34)
[^sem-system-orchestration]: [`step_fn.tf` lines 9-230](repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/step_fn.tf#L9-L230)
[^doc-python-version]: [`README.md` lines 6-9](repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/README.md#L6-L9)
[^config-python-runtime]: [`python_lambda/main.tf` lines 7-12](repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/python_lambda/main.tf#L7-L12)

<!-- agentbase:observed-values:start -->
## Observed values

| Property | Observed value | Role | Source | Observed at |
|---|---:|---|---|---|
| `runtime.python_version` | `"3.8"` | documentation | `README.md#L6-L9` | 1483d3869ecc148195bce092900d8556332db609, 2026-08-24T15:21:16.293Z |
| `runtime.python_version` | `"python3.7"` | configuration | `python_lambda/main.tf#L7-L12` | 1483d3869ecc148195bce092900d8556332db609, 2026-08-24T15:21:16.293Z |
<!-- agentbase:observed-values:end -->