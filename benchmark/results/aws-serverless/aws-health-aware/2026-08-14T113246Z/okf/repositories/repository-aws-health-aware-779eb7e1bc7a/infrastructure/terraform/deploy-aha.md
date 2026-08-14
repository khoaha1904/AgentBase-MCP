---
title: AHA Terraform deployment configuration
description: Terraform root that packages the Python handler and declares AHA runtime infrastructure.
type: Terraform Module
status: draft
generated:
  by: agentbase/3.0.0
  at: 2026-08-14T00:00:00Z
benchmark_key: aha-terraform-deployment
module_root: terraform/Terraform_DEPLOY_AHA
managed_resources:
  - aws_lambda_function.AHA-LambdaFunction-PrimaryRegion
  - aws_dynamodb_table.AHA-DynamoDBTable
  - aws_cloudwatch_event_rule.AHA-LambdaSchedule-PrimaryRegion
sources:
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L28-L42
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L655-L702
relationships:
  - kind: declares
    target: aha-scheduled-health-lambda
  - kind: declares
    target: aha-health-event-state-table
  - kind: declares
    target: aha-minute-schedule
---

# Purpose

This Terraform root packages `handler.py` and `messagegenerator.py`, then declares the AHA Lambda and its supporting resources.

# Inputs

The deployment accepts settings for regions, AWS Health event types, communication channels, and the DynamoDB table name.

# Resources

- [AHA scheduled health Lambda](../aws/lambda/aha-scheduled-health-lambda.md)
- [AHA health event state table](../../data/tables/aha-health-event-state-table.md)
- [AHA minute schedule](../../events/aha-minute-schedule.md)

# Outputs

No Terraform output blocks are evidenced in the cited configuration.

## Sources

- `repository://repository-aws-health-aware-779eb7e1bc7a/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L28-L42`
- `repository://repository-aws-health-aware-779eb7e1bc7a/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L655-L702`
- `repository://repository-aws-health-aware-779eb7e1bc7a/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L755-L802`
