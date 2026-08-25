---
type: Function
title: Athena_query_execution
description: Find the deployed function that executes the reporting SQL queries in Athena.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-25T16:25:31.319Z
sources:
  - id: sem-athena-handler
    resource: repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/lambdas/athena_query_execution/src/main.py#L46-L66
    observed_revision: 1483d3869ecc148195bce092900d8556332db609
  - id: tf-athena-lambda
    resource: repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/python_lambda/main.tf#L1-L16
    observed_revision: 1483d3869ecc148195bce092900d8556332db609
relationships:
  - kind: implemented-in
    target: repositories/serverless-data-pipelines-demo
    evidence:
      - sem-athena-handler
agentbase:
  technology:
    kind: runtime-function
    provider: aws
    product: lambda
    sourceTool: terraform
    resourceType: aws_lambda_function
---

# Responsibility

`Athena_query_execution` loads each configured SQL file, submits it to Athena in the selected database and workgroup, waits for completion, and returns the execution IDs.[^sem-athena-handler]

Implemented in [serverless-data-pipelines-demo](../repositories/serverless-data-pipelines-demo.md).

# Runtime

Terraform declares the handler as an independently packaged AWS Lambda using the shared Python Lambda module.[^tf-athena-lambda]

# Triggers

[ApiStateMachine](../flows/apistatemachine.md) invokes the function in the reporting branch after the trusted catalog refresh.

# Failure Behavior

A missing query file is logged as an attribute error and omitted from the returned IDs; query-state failures are handled by the helper and the orchestration retry policy.

# Limitations

Terraform source proves a deployable Lambda declaration, not a currently deployed instance. Query contents and generated Athena views remain repository-level implementation detail.

[^sem-athena-handler]: `repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/lambdas/athena_query_execution/src/main.py#L46-L66`
[^tf-athena-lambda]: `repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/python_lambda/main.tf#L1-L16`
