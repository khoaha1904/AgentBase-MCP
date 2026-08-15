---
title: AHA Terraform Deployment Module
description: Terraform configuration that packages and deploys the AHA Lambda and its EventBridge schedule.
type: Terraform Module
status: draft
generated:
  by: agentbase/3.0.0
  at: "2026-08-15T00:00:00Z"
benchmark_key: aha-terraform-deployment
module_root: terraform/Terraform_DEPLOY_AHA
managed_resources:
  - aws_lambda_function.AHA-LambdaFunction-PrimaryRegion
  - aws_cloudwatch_event_rule.AHA-LambdaSchedule-PrimaryRegion
relationships:
  - kind: declares
    target: aha-lambda-function
  - kind: declares
    target: aha-lambda-schedule
sources:
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L28-L35
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L655-L702
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L755-L802
---

# Purpose

Packages `handler.py` and `messagegenerator.py`, then configures the primary AHA Lambda and its EventBridge schedule. It [declares the AHA Lambda Function](../aws/lambda/aha-lambda-function.md) and [declares the AHA Lambda Schedule](../../events/aha-lambda-schedule.md).

# Inputs

The cited configuration shows providers and package source files; its complete input and output contract is not enumerated here.

# Outputs

No output relationship is asserted because this concept is limited to the resources directly evidenced above.

# Resources

The primary Lambda uses `handler.main`; the schedule targets that Lambda and grants EventBridge invoke permission.
