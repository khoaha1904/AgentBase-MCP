---
type: Function
title: Glue Crawler Initiation
description: Supports independent operational and failure questions about catalog crawler execution.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-24T15:21:16.293Z
sources:
  - id: sem-crawler-handler
    resource: repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/lambdas/glue_crawler_initiation/src/main.py#L50-L66
  - id: sem-crawler-module
    resource: repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/lambda_crawler.tf#L11-L21
  - id: res-crawler-lambda
    resource: repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/python_lambda/main.tf#L1-L16
agentbase:
  technology:
    kind: runtime-function
    provider: aws
    product: lambda
    sourceTool: terraform
    resourceType: aws_lambda_function
relationships:
  - kind: part-of
    target: systems/serverless-data-pipeline
    evidence:
      - sem-crawler-module
  - kind: implemented-in
    target: repositories/serverless-data-pipelines-demo
    evidence:
      - sem-crawler-handler
---

# Responsibility

This independently deployed AWS Lambda function starts a named AWS Glue crawler and waits for its terminal state.[^sem-crawler-handler][^sem-crawler-module][^res-crawler-lambda]

Part of the [Serverless Data Pipeline](../systems/serverless-data-pipeline.md) and implemented in [serverless-data-pipelines-demo](../repositories/serverless-data-pipelines-demo.md).

# Trigger and result

The Step Functions pipeline invokes this function for the landing, trusted, and analytics-zone crawler names. The handler returns the observed crawler state.[^sem-crawler-handler]

# Failure behavior

An already-running crawler is logged and then checked. Other start failures are logged and re-raised; the Step Functions definition supplies retry and timeout policy.

# Limitations

The crawler resources and catalog databases remain embedded System knowledge. Source configuration does not prove that the Lambda or any crawler currently exists in AWS.

[^sem-crawler-handler]: [`lambdas/glue_crawler_initiation/src/main.py` lines 50-66](repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/lambdas/glue_crawler_initiation/src/main.py#L50-L66)
[^sem-crawler-module]: [`lambda_crawler.tf` lines 11-21](repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/lambda_crawler.tf#L11-L21)
[^res-crawler-lambda]: [`python_lambda/main.tf` lines 1-16](repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/python_lambda/main.tf#L1-L16)
