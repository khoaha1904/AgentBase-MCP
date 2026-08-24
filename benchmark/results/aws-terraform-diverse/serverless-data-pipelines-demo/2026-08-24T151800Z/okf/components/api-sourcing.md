---
type: Function
title: API Sourcing
description: Supports independent questions about ingestion behavior, deployment, retries, permissions, and failure handling.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-24T15:21:16.293Z
sources:
  - id: sem-api-handler
    resource: repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/lambdas/api_sourcing/src/main.py#L29-L58
  - id: sem-api-module
    resource: repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/lambda_api.tf#L11-L21
  - id: res-api-lambda
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
      - sem-api-module
  - kind: implemented-in
    target: repositories/serverless-data-pipelines-demo
    evidence:
      - sem-api-handler
---

# Responsibility

This independently deployed AWS Lambda function pages the configured public API, converts each non-empty page to newline-delimited JSON, writes it to the landing bucket, and returns updated pagination state.[^sem-api-handler][^sem-api-module][^res-api-lambda]

Part of the [Serverless Data Pipeline](../systems/serverless-data-pipeline.md) and implemented in [serverless-data-pipelines-demo](../repositories/serverless-data-pipelines-demo.md).

# Trigger and result

The Step Functions pipeline invokes the handler repeatedly until `IS_COMPLETE` becomes true. Each successful non-empty page is written beneath the configured table and page key.[^sem-api-handler]

# Failure behavior

The handler itself does not catch API or S3 failures. Retry and timeout behavior is defined by the parent Step Functions state machine, so this concept does not assert behavior for direct invocation.

# Limitations

Source configuration proves a deployable boundary, not a currently deployed Lambda. The shared Terraform module configures Python 3.7 while the repository README advertises Python 3.8; that conflict is governed on the Repository proposal.

[^sem-api-handler]: [`lambdas/api_sourcing/src/main.py` lines 29-58](repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/lambdas/api_sourcing/src/main.py#L29-L58)
[^sem-api-module]: [`lambda_api.tf` lines 11-21](repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/lambda_api.tf#L11-L21)
[^res-api-lambda]: [`python_lambda/main.tf` lines 1-16](repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/python_lambda/main.tf#L1-L16)
