---
type: Component
title: ApiScript
description: Find the deployed ETL workload that transforms landing data into trusted Parquet data.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-25T16:25:31.319Z
sources:
  - id: sem-etl-purpose
    resource: repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/README.md#L23-L28
    observed_revision: 1483d3869ecc148195bce092900d8556332db609
  - id: tf-glue-job
    resource: repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/glue_job.tf#L33-L56
    observed_revision: 1483d3869ecc148195bce092900d8556332db609
relationships:
  - kind: implemented-in
    target: repositories/serverless-data-pipelines-demo
    evidence:
      - tf-glue-job
agentbase:
  technology:
    provider: aws
    sourceTool: terraform
    resourceType: aws_glue_job
---

# Responsibility

`ApiScript` is the independently declared AWS Glue job that runs the repository's Scala ETL workload, reading the landing path and writing the trusted path.[^tf-glue-job][^sem-etl-purpose]

Implemented in [serverless-data-pipelines-demo](../repositories/serverless-data-pipelines-demo.md).

# Runtime

Terraform configures Glue 1.0, Scala job language, a packaged JAR, the `scripts.ApiScript` class, capacity, metrics, continuous logging, and Data Catalog integration.[^tf-glue-job]

# Dependencies

The job consumes its script and JAR from the code-staging bucket and operates between the embedded landing and trusted S3 zones. [ApiStateMachine](../flows/apistatemachine.md) waits synchronously for it before the trusted catalog refresh.

# Operations

The observed Terraform disables job bookmarks and creates a dedicated CloudWatch log group outside the cited workload span.

# Limitations

Suggested type `Component` is evidence-bound agent intent and requires proposal review.

Terraform source proves a deployable Glue job declaration, not a currently deployed job. The Scala implementation was skipped by the managed graph parser profile, so transformation internals remain partial.

[^sem-etl-purpose]: `repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/README.md#L23-L28`
[^tf-glue-job]: `repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/glue_job.tf#L33-L56`
