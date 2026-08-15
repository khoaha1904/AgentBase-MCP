---
title: AHA deployment Terraform module
description: Terraform configuration that declares the AHA Lambda functions, DynamoDB tables, and scheduled invocation resources.
type: Terraform Module
benchmark_key: aha-deployment-terraform-module
status: draft
generated:
  by: agentbase/0.2
  at: 2026-08-15T00:00:00Z
sources:
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L246-L306
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L656-L803
module_root: terraform/Terraform_DEPLOY_AHA
managed_resources:
  - aws_dynamodb_table.AHA-DynamoDBTable
  - aws_dynamodb_table.AHA-GlobalDynamoDBTable
  - aws_lambda_function.AHA-LambdaFunction-PrimaryRegion
  - aws_lambda_function.AHA-LambdaFunction-SecondaryRegion
  - aws_cloudwatch_event_rule.AHA-LambdaSchedule-PrimaryRegion
  - aws_cloudwatch_event_rule.AHA-LambdaSchedule-SecondaryRegion
relationships:
  - kind: declares
    target: aha-scheduled-alert-processor
  - kind: declares
    target: aha-event-state-table
---
# Purpose

This Terraform root declares the Lambda deployment, its one-minute EventBridge schedule and invocation permissions, and the DynamoDB table variants.

# Resources

It declares the [AHA scheduled alert processor](../aws/lambda/aha-scheduled-alert-processor.md) and [AHA event state table](../../data/tables/aha-event-state.md).

# Limitations

Only Terraform resources in this root are described; equivalent CloudFormation deployment resources are not included.
