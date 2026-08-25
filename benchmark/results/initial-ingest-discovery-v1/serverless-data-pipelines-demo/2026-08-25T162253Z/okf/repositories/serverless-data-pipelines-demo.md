---
type: Repository
title: serverless-data-pipelines-demo
description: Find the source repository that deploys the serverless AWS data pipeline.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-25T16:25:31.319Z
sources:
  - id: sem-repo-purpose
    resource: repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/README.md#L11-L13
    observed_revision: 1483d3869ecc148195bce092900d8556332db609
  - id: sem-ci
    resource: repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/.github/workflows/terraform.yml#L8-L44
    observed_revision: 1483d3869ecc148195bce092900d8556332db609
  - id: owner-domain
    resource: agentbase://owner-guidance/domains/crawler
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
      observed_at: 2026-08-25T16:25:31.319Z
---

# Purpose

This repository defines a modular serverless AWS data-lake pipeline and its ETL application code.[^sem-repo-purpose]

Primary Domain: [Crawler](../domains/crawler.md).

# Source Structure

* `lambdas/` contains independently packaged Python handlers for API sourcing, crawler initiation, Athena queries, and Comprehend analysis.
* `glue_scripts/` contains the Scala ETL workload.
* Root Terraform files and reusable modules declare the orchestration, functions, Glue job, storage, catalog, security, and operational resources.

# Build and Test

The repository workflow assembles the Scala project, checks Terraform formatting, initializes Terraform, validates it, and creates a plan.[^sem-ci]

# Canonical Knowledge

* [ApiStateMachine](../flows/apistatemachine.md) - Flow
* [Api_Sourcing](../components/api-sourcing.md) - Function
* [Glue_crawler_initiation](../components/glue-crawler-initiation.md) - Function
* [Comprehend_analysis](../components/comprehend-analysis.md) - Function
* [Athena_query_execution](../components/athena-query-execution.md) - Function
* [ApiScript](../components/apiscript.md) - Component

# Limitations

Suggested type `Repository` is evidence-bound agent intent and requires proposal review. The workflow proves automated assembly and Terraform validation/planning, but not production deployment ownership. Scala implementation coverage is partial because the managed code graph skipped unsupported files.

[^sem-repo-purpose]: `repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/README.md#L11-L13`
[^sem-ci]: `repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/.github/workflows/terraform.yml#L8-L44`
