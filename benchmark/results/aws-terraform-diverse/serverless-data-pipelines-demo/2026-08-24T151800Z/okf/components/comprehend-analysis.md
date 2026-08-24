---
type: Function
title: Comprehend Analysis
description: Supports independent questions about entity analysis, query dependencies, outputs, and failure behavior.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-24T15:21:16.293Z
sources:
  - id: sem-comprehend-handler
    resource: repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/lambdas/comprehend_analysis/src/main.py#L107-L133
  - id: sem-comprehend-module
    resource: repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/lambda_comprehend.tf#L11-L21
  - id: res-comprehend-lambda
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
      - sem-comprehend-module
  - kind: implemented-in
    target: repositories/serverless-data-pipelines-demo
    evidence:
      - sem-comprehend-handler
---

# Responsibility

This independently deployed AWS Lambda function runs a configured Athena query, sends successful query results through Comprehend processing, and writes the derived data as analytics JSON.[^sem-comprehend-handler][^sem-comprehend-module][^res-comprehend-lambda]

Part of the [Serverless Data Pipeline](../systems/serverless-data-pipeline.md) and implemented in [serverless-data-pipelines-demo](../repositories/serverless-data-pipelines-demo.md).

# Trigger and result

The Step Functions pipeline invokes this function after trusted-zone cataloging and then starts the analytics-zone crawler.

# Failure behavior

The handler emits an empty result when the Athena query does not succeed, but Athena, Comprehend, or S3 exceptions are not caught locally. The state machine defines service and timeout retries.

# Limitations

The evidence does not identify a separately governed analytics contract or prove a current AWS deployment.

[^sem-comprehend-handler]: [`lambdas/comprehend_analysis/src/main.py` lines 107-133](repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/lambdas/comprehend_analysis/src/main.py#L107-L133)
[^sem-comprehend-module]: [`lambda_comprehend.tf` lines 11-21](repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/lambda_comprehend.tf#L11-L21)
[^res-comprehend-lambda]: [`python_lambda/main.tf` lines 1-16](repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/python_lambda/main.tf#L1-L16)
