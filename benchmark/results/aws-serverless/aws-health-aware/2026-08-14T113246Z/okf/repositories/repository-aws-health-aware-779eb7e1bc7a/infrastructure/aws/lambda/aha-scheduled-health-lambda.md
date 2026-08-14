---
title: AHA scheduled health Lambda
description: Python Lambda that polls AWS Health, records state, and sends configured alerts.
type: AWS Lambda
status: draft
generated:
  by: agentbase/3.0.0
  at: 2026-08-14T00:00:00Z
benchmark_key: aha-scheduled-health-lambda
business_purpose: Poll AWS Health and deliver formatted alerts for new or changed health events.
resource_name: aws_lambda_function.AHA-LambdaFunction-PrimaryRegion
runtime: python3.11
handler: handler.main
sources:
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L655-L702
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/handler.py#L1042-L1060
relationships:
  - kind: declared-by
    target: aha-terraform-deployment
  - kind: triggered-by
    target: aha-minute-schedule
  - kind: accesses
    target: aha-health-event-state-table
---

# Function

The `handler.main` entry point obtains an AWS Health client and selects organization-aware or single-account event discovery. [AHA Terraform deployment configuration](../../terraform/deploy-aha.md) declares the function.

# Triggers

[AHA minute schedule](../../../events/aha-minute-schedule.md) targets the primary Lambda and is permitted to invoke it.

# Permissions

The cited Lambda configuration supplies the DynamoDB table name in `DYNAMODB_TABLE`; the handler reads and writes [AHA health event state table](../../../data/tables/aha-health-event-state-table.md) via its update functions.

# Limitations

The runtime has optional Slack, Teams, Chime, EventBridge, and email settings. This bundle does not create external endpoint concepts because concrete endpoint identities are deployment inputs rather than repository-owned resources.

## Sources

- `repository://repository-aws-health-aware-779eb7e1bc7a/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L655-L702`
- `repository://repository-aws-health-aware-779eb7e1bc7a/handler.py#L1042-L1060`
- `repository://repository-aws-health-aware-779eb7e1bc7a/handler.py#L589-L635`
