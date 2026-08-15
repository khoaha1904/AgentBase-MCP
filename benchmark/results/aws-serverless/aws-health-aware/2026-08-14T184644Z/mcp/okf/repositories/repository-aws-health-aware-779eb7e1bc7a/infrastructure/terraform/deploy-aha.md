---
title: AHA deployment Terraform module
description: Terraform root that packages and deploys AWS Health Aware resources.
type: Terraform Module
benchmark_key: aha-deployment-terraform-module
status: draft
generated:
  by: agentbase/3.0.0
  at: 2026-08-15T00:00:00Z
module_root: terraform/Terraform_DEPLOY_AHA
managed_resources:
  - aws_lambda_function.AHA-LambdaFunction-PrimaryRegion
  - aws_lambda_function.AHA-LambdaFunction-SecondaryRegion
  - aws_cloudwatch_event_rule.AHA-LambdaSchedule-PrimaryRegion
  - aws_cloudwatch_event_rule.AHA-LambdaSchedule-SecondaryRegion
  - aws_dynamodb_table.AHA-DynamoDBTable
  - aws_dynamodb_table.AHA-GlobalDynamoDBTable
relationships:
  - kind: declares
    target: aha-lambda-function
  - kind: declares
    target: aha-lambda-schedule
  - kind: declares
    target: aha-dynamodb-table
sources:
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L1-L43
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L246-L306
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L656-L803
---
# Purpose

This Terraform root packages `handler.py` and `messagegenerator.py` and deploys the AHA solution.

# Inputs

It selects a primary AWS region and can configure a secondary region.

# Resources

It declares the [AHA Lambda function](../aws/lambda/aha-lambda-function.md), the [AHA Lambda schedule](../../../../events/aha-lambda-schedule.md), and the [AHA DynamoDB table](../../data/tables/aha-dynamodb-table.md).

# Limitations

Resource names include a generated suffix, so the final deployed names are not knowable from this source alone.
