---
title: AHA primary-region Lambda
description: Scheduled Python Lambda that polls AWS Health, records changed events, and sends configured notifications.
status: draft
generated:
  by: agentbase/3.0.0
  at: 2026-08-15T00:00:00Z
sources:
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L656-L702
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L756-L795
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/handler.py#L589-L699
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/handler.py#L1042-L1060
type: AWS Lambda
benchmark_key: aha-primary-region-lambda
business_purpose: Poll AWS Health, persist new or changed health events, and dispatch configured alerts.
resource_name: aws_lambda_function.AHA-LambdaFunction-PrimaryRegion
runtime: python3.11
handler: handler.main
relationships:
  - kind: triggered-by
    target: aha-lambda-schedule
  - kind: accesses
    target: aha-single-region-dynamodb-table
  - kind: accesses
    target: aha-global-dynamodb-table
  - kind: declared-by
    target: aha-deployment-terraform-module
---

# AHA primary-region Lambda

## Function

The handler selects account or organization AWS Health polling from `ORG_STATUS`. Event updates are persisted before configured alert delivery.

## Triggers

- Triggered by [AHA Lambda schedule](../../../events/aha-lambda-schedule.md).

## Dependencies

- Accesses [AHA single-region DynamoDB table](../../../data/tables/aha-single-region-events.md) when no secondary region is configured.
- Accesses [AHA global DynamoDB table](../../../data/tables/aha-global-events.md) when a secondary region is configured.
- Declared by [AHA deployment Terraform module](../../terraform/aha-deployment.md).

## Limitations

The runtime sends to several optional destinations, but this bundle does not model external webhook, SES, or EventBridge destination resources because their concrete endpoints are deployment inputs or secrets rather than repository-owned resources.
