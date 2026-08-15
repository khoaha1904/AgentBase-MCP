---
title: AHA scheduled alert processor
description: Python Lambda that retrieves AWS Health events, persists event state, and alerts configured endpoints.
type: AWS Lambda
benchmark_key: aha-scheduled-alert-processor
status: draft
generated:
  by: agentbase/0.2
  at: 2026-08-15T00:00:00Z
sources:
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L656-L702
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L755-L803
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/handler.py#L589-L699
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/handler.py#L1042-L1060
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/README.md#L44-L45
business_purpose: Process AWS Health alerts and send notifications to configured endpoints.
resource_name: aws_lambda_function.AHA-LambdaFunction-PrimaryRegion
runtime: python3.11
handler: handler.main
relationships:
  - kind: accesses
    target: aha-event-state-table
  - kind: declared-by
    target: aha-deployment-terraform-module
---
# Function

The `handler.main` entry point selects organization or non-organization AWS Health event processing. The handler stores event updates by ARN and sends alerts when an event is created or changes.

# Triggers

The primary Lambda is targeted by an enabled EventBridge schedule with `rate(1 minute)` and a permission for `events.amazonaws.com` to invoke it.

# Dependencies

The function accesses the [AHA event state table](../../../data/tables/aha-event-state.md) through the `DYNAMODB_TABLE` environment variable. It is declared by the [AHA deployment Terraform module](../../terraform/aha-deployment.md).

# Limitations

The Terraform also conditionally declares a secondary-region Lambda; this document identifies the primary resource because it directly supplies the cited scheduled target.
