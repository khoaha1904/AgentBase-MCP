---
type: Function
title: Glue_crawler_initiation
description: Find the deployed function that starts and polls AWS Glue crawlers.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-25T16:25:31.319Z
sources:
  - id: sem-crawler-handler
    resource: repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/lambdas/glue_crawler_initiation/src/main.py#L50-L66
    observed_revision: 1483d3869ecc148195bce092900d8556332db609
  - id: sem-crawler-readme
    resource: repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/lambdas/glue_crawler_initiation/README.md#L1-L3
    observed_revision: 1483d3869ecc148195bce092900d8556332db609
  - id: tf-crawler-lambda
    resource: repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/python_lambda/main.tf#L1-L16
    observed_revision: 1483d3869ecc148195bce092900d8556332db609
relationships:
  - kind: implemented-in
    target: repositories/serverless-data-pipelines-demo
    evidence:
      - sem-crawler-handler
agentbase:
  technology:
    kind: runtime-function
    provider: aws
    product: lambda
    sourceTool: terraform
    resourceType: aws_lambda_function
---

# Responsibility

`Glue_crawler_initiation` starts a named existing AWS Glue crawler and polls it to a terminal state.[^sem-crawler-handler][^sem-crawler-readme]

Implemented in [serverless-data-pipelines-demo](../repositories/serverless-data-pipelines-demo.md).

# Runtime

Terraform declares the handler as an independently packaged AWS Lambda using the shared Python Lambda module.[^tf-crawler-lambda]

# Triggers

[ApiStateMachine](../flows/apistatemachine.md) invokes this function at multiple catalog-refresh points and passes the crawler name.

# Failure Behavior

An already-running crawler is logged and then polled. Other start errors are logged and re-raised; the orchestration provides a bounded timeout retry.[^sem-crawler-handler]

# Embedded Knowledge

| Name | Role | Kind | Technology | Exact sources |
|---|---|---|---|---|
| landing/trusted/analytics Glue crawlers | Understand which embedded crawler resources the trigger function operates. | resource | aws; terraform:aws_glue_crawler | tf-glue-crawler: `repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/s3_bucket/main.tf#L21-L35` |

# Limitations

Terraform source proves a deployable Lambda declaration and crawler resources, not currently deployed instances. The embedded crawler technology is retained provider-neutral because no released provider profile maps it.

[^sem-crawler-handler]: `repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/lambdas/glue_crawler_initiation/src/main.py#L50-L66`
[^sem-crawler-readme]: `repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/lambdas/glue_crawler_initiation/README.md#L1-L3`
[^tf-crawler-lambda]: `repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/python_lambda/main.tf#L1-L16`
