---
type: Function
title: AWS Health Poller
description: Scheduled Lambda function that runs the AWS Health Aware workload.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T14:39:33.937Z
sources:
  - id: res_lambda_primary
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L656-L702
  - id: schedule_binding
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L755-L795
  - id: delivery_implementation
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L94-L183
relationships:
  - kind: part-of
    target: systems/aws-health-aware
    evidence:
      - res_lambda_primary
  - kind: provides
    target: interfaces/aws-health-aware-notification-delivery
    evidence:
      - delivery_implementation
  - kind: depends-on
    target: resources/aws-health-aware-health-event-state
    evidence:
      - res_lambda_primary
  - kind: implemented-in
    target: repositories/aws-health-aware
    evidence:
      - res_lambda_primary
agentbase:
  technology:
    kind: runtime-function
    provider: aws
    product: lambda
    sourceTool: terraform
    resourceType: aws_lambda_function
---

# Responsibility

The Lambda runs the `handler.main` entry point for AWS Health Aware.

It is part of [AWS Health Aware](../systems/aws-health-aware.md), provides [AWS Health Alert Delivery](../interfaces/aws-health-aware-notification-delivery.md), and is implemented in the [aws-health-aware repository](../repositories/aws-health-aware.md).

# Runtime

Terraform defines Python 3.11 runtime, a 600-second timeout, and environment references for the DynamoDB table and configured delivery options.

# Triggers

An enabled EventBridge schedule is configured at a one-minute rate and targets the Lambda. This is desired-state configuration only.

# Embedded Resources

The EventBridge schedule, Lambda permission, Secrets Manager lookups, and runtime configuration are embedded operational details. The function uses the separately represented [event-state store](../resources/aws-health-aware-health-event-state.md).

# Limitations

No deployed Lambda identity, region, account, schedule status, or configuration values are asserted.
