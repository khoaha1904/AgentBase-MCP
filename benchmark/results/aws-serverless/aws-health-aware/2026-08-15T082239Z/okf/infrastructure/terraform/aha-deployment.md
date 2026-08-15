---
title: AHA deployment Terraform module
description: Terraform root that provisions the AWS Health Aware runtime, schedule, and event-state tables.
status: draft
generated:
  by: agentbase/3.0.0
  at: 2026-08-15T00:00:00Z
sources:
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L246-L306
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L656-L803
type: Terraform Module
benchmark_key: aha-deployment-terraform-module
module_root: terraform/Terraform_DEPLOY_AHA
managed_resources:
  - aws_lambda_function.AHA-LambdaFunction-PrimaryRegion
  - aws_cloudwatch_event_rule.AHA-LambdaSchedule-PrimaryRegion
  - aws_dynamodb_table.AHA-DynamoDBTable
  - aws_dynamodb_table.AHA-GlobalDynamoDBTable
relationships:
  - kind: declares
    target: aha-primary-region-lambda
  - kind: declares
    target: aha-lambda-schedule
  - kind: declares
    target: aha-single-region-dynamodb-table
  - kind: declares
    target: aha-global-dynamodb-table
---

# AHA deployment Terraform module

## Purpose

This Terraform root provisions the primary AHA Lambda, its one-minute schedule, and the single-region or global DynamoDB event-state table.

## Resources

- Declares [AHA primary-region Lambda](../aws/lambda/aha-primary-region.md).
- Declares [AHA Lambda schedule](../../events/aha-lambda-schedule.md).
- Declares [AHA single-region DynamoDB table](../../data/tables/aha-single-region-events.md).
- Declares [AHA global DynamoDB table](../../data/tables/aha-global-events.md).

## Limitations

The secondary-region Lambda and schedule are conditional resources and are not separately documented here.
