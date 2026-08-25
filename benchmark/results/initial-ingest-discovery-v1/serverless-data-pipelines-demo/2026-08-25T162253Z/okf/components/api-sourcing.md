---
type: Function
title: Api_Sourcing
description: Find the independently deployed function that sources Best Buy API pages into the landing zone.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-25T16:25:31.319Z
sources:
  - id: sem-api-handler
    resource: repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/lambdas/api_sourcing/src/main.py#L29-L58
    observed_revision: 1483d3869ecc148195bce092900d8556332db609
  - id: tf-api-lambda
    resource: repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/python_lambda/main.tf#L1-L16
    observed_revision: 1483d3869ecc148195bce092900d8556332db609
relationships:
  - kind: implemented-in
    target: repositories/serverless-data-pipelines-demo
    evidence:
      - sem-api-handler
agentbase:
  technology:
    kind: runtime-function
    provider: aws
    product: lambda
    sourceTool: terraform
    resourceType: aws_lambda_function
---

# Responsibility

`Api_Sourcing` requests one configured API page, marshals the returned product records, and writes nonempty pages as newline-delimited JSON into the landing bucket. It advances page state and signals when paging is complete.[^sem-api-handler]

Implemented in [serverless-data-pipelines-demo](../repositories/serverless-data-pipelines-demo.md).

# Runtime

Terraform declares the handler as `src/main.handler` on an AWS Lambda resource with configurable timeout, memory, role, and packaged S3 object.[^tf-api-lambda]

# Triggers

[ApiStateMachine](../flows/apistatemachine.md) supplies the URL, API key, page size, table name, bucket, and paging state to the handler.

# Failure Behavior

Request, marshalling, and upload exceptions are not handled within the observed handler; the orchestration definition owns bounded retries for service and request-related failures.

# Limitations

Terraform source proves a deployable Lambda declaration, not a currently deployed instance. The configured endpoint and credentials are intentionally not stored here.

[^sem-api-handler]: `repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/lambdas/api_sourcing/src/main.py#L29-L58`
[^tf-api-lambda]: `repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/python_lambda/main.tf#L1-L16`
