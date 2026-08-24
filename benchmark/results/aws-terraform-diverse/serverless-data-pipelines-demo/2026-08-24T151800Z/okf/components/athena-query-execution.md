---
type: Function
title: Athena Query Execution
description: Supports independent questions about analytical query execution and its operational boundary.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-24T15:21:16.293Z
sources:
  - id: sem-athena-handler
    resource: repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/lambdas/athena_query_execution/src/main.py#L46-L66
  - id: sem-athena-module
    resource: repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/lambda_view.tf#L11-L21
  - id: res-athena-lambda
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
      - sem-athena-module
  - kind: implemented-in
    target: repositories/serverless-data-pipelines-demo
    evidence:
      - sem-athena-handler
---

# Responsibility

This independently deployed AWS Lambda function reads bundled SQL files, starts Athena executions in a configured database and workgroup, waits for each query, and returns the resulting execution IDs.[^sem-athena-handler][^sem-athena-module][^res-athena-lambda]

Part of the [Serverless Data Pipeline](../systems/serverless-data-pipeline.md) and implemented in [serverless-data-pipelines-demo](../repositories/serverless-data-pipelines-demo.md).

# Trigger and result

The Step Functions pipeline invokes this function after trusted-zone cataloging to create the configured analytical views.

# Failure behavior

Missing query-file attributes are logged by the handler. Query service and timeout retries are configured in the surrounding state machine rather than inside the handler.

# Limitations

The Athena workgroup remains embedded System knowledge because the repository does not establish a separate ownership or cross-boundary lifecycle. Source configuration does not prove a live function or workgroup.

[^sem-athena-handler]: [`lambdas/athena_query_execution/src/main.py` lines 46-66](repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/lambdas/athena_query_execution/src/main.py#L46-L66)
[^sem-athena-module]: [`lambda_view.tf` lines 11-21](repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/lambda_view.tf#L11-L21)
[^res-athena-lambda]: [`python_lambda/main.tf` lines 1-16](repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/python_lambda/main.tf#L1-L16)
