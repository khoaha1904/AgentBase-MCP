---
type: Function
title: Comprehend_analysis
description: Find the deployed function that queries Athena, extracts entities with Comprehend, and writes analytics output.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-25T16:25:31.319Z
sources:
  - id: sem-comprehend-handler
    resource: repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/lambdas/comprehend_analysis/src/main.py#L107-L133
    observed_revision: 1483d3869ecc148195bce092900d8556332db609
  - id: tf-comprehend-lambda
    resource: repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/python_lambda/main.tf#L1-L16
    observed_revision: 1483d3869ecc148195bce092900d8556332db609
relationships:
  - kind: implemented-in
    target: repositories/serverless-data-pipelines-demo
    evidence:
      - sem-comprehend-handler
agentbase:
  technology:
    kind: runtime-function
    provider: aws
    product: lambda
    sourceTool: terraform
    resourceType: aws_lambda_function
---

# Responsibility

`Comprehend_analysis` runs a configured Athena query, processes successful results with AWS Comprehend, and writes the extracted records to the analytics bucket.[^sem-comprehend-handler]

Implemented in [serverless-data-pipelines-demo](../repositories/serverless-data-pipelines-demo.md).

# Runtime

Terraform declares the handler as an independently packaged AWS Lambda using the shared Python Lambda module.[^tf-comprehend-lambda]

# Triggers

[ApiStateMachine](../flows/apistatemachine.md) invokes the function in the derived analytics branch with the SQL file, table, database, workgroup, and output bucket.

# Failure Behavior

The handler emits an empty data set when the Athena query does not succeed; Athena, Comprehend, file, and upload failures otherwise propagate to the orchestration retry policy.

# Limitations

Terraform source proves a deployable Lambda declaration, not a currently deployed instance. The exact entity-processing internals are only partially summarized here.

[^sem-comprehend-handler]: `repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/lambdas/comprehend_analysis/src/main.py#L107-L133`
[^tf-comprehend-lambda]: `repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/python_lambda/main.tf#L1-L16`
