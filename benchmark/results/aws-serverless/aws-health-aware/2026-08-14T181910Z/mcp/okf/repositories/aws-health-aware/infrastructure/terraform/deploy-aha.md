---
title: AHA deployment Terraform module
description: Terraform root that provisions the AHA Lambda functions and their one-minute EventBridge schedules.
type: Terraform Module
status: draft
generated:
  by: agentbase/3.0.0
  at: 2026-08-15T00:00:00Z
benchmark_key: aha-deploy-terraform-module
module_root: terraform/Terraform_DEPLOY_AHA
managed_resources:
  - aws_lambda_function.AHA-LambdaFunction-PrimaryRegion
  - aws_lambda_function.AHA-LambdaFunction-SecondaryRegion
  - aws_cloudwatch_event_rule.AHA-LambdaSchedule-PrimaryRegion
  - aws_cloudwatch_event_rule.AHA-LambdaSchedule-SecondaryRegion
relationships:
  - kind: declares
    target: aha-primary-region-lambda
  - kind: declares
    target: aha-secondary-region-lambda
  - kind: declares
    target: aha-one-minute-schedule
sources:
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L656-L803
---

# Purpose

This Terraform root deploys AHA runtime resources, including a primary Lambda, an optional secondary-region Lambda, and scheduled EventBridge invocation bindings.

# Inputs

The secondary-region Lambda is conditional on `aha_secondary_region`; the primary and secondary deployment-region variables are defined in the module.

# Resources

It declares [the primary Lambda](../../aws/lambda/primary-region.md), [the secondary Lambda](../../aws/lambda/secondary-region.md), and [the one-minute schedule](../../../../../events/aha-one-minute-schedule.md).
