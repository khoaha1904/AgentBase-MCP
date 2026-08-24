---
type: Component
title: API Glue ETL
description: Supports independent deployment, capacity, logging, input/output, and transformation questions.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-24T15:21:16.293Z
sources:
  - id: sem-glue-code
    resource: repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/glue_scripts/scripts/src/main/scala/scripts/ApiScript.scala#L35-L50
  - id: sem-glue-config
    resource: repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/glue_job.tf#L33-L56
  - id: res-glue-job
    resource: repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/glue_job.tf#L33-L56
agentbase:
  technology:
    provider: aws
    sourceTool: terraform
    resourceType: aws_glue_job
relationships:
  - kind: part-of
    target: systems/serverless-data-pipeline
    evidence:
      - sem-glue-config
  - kind: implemented-in
    target: repositories/serverless-data-pipelines-demo
    evidence:
      - sem-glue-code
---

# Responsibility

This independently deployed Glue workload reads typed JSON from the landing zone, maps it to the target schema, and overwrites gzip-compressed Parquet partitioned by product type in the trusted zone.[^sem-glue-code][^sem-glue-config][^res-glue-job]

Part of the [Serverless Data Pipeline](../systems/serverless-data-pipeline.md) and implemented in [serverless-data-pipelines-demo](../repositories/serverless-data-pipelines-demo.md).

# Runtime and operations

Terraform configures Glue 1.0, Scala execution, capacity, continuous CloudWatch logging, Data Catalog integration, metrics, and explicit landing and trusted paths.[^sem-glue-config]

# Limitations

Suggested type `Component` is evidence-bound agent intent and requires proposal review.

The Terraform includes a local-exec upload step for the shared JAR, but this proposal neither executes nor validates that provider-side packaging path. Source configuration does not prove a currently deployed Glue job.

[^sem-glue-code]: [`glue_scripts/scripts/src/main/scala/scripts/ApiScript.scala` lines 35-50](repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/glue_scripts/scripts/src/main/scala/scripts/ApiScript.scala#L35-L50)
[^sem-glue-config]: [`glue_job.tf` lines 33-56](repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/glue_job.tf#L33-L56)
[^res-glue-job]: [`glue_job.tf` lines 33-56](repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/glue_job.tf#L33-L56)
