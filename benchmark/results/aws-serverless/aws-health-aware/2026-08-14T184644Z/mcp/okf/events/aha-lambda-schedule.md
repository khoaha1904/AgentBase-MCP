---
title: AHA Lambda schedule
description: Enabled EventBridge schedule that invokes the AHA Lambda every minute.
type: Event
benchmark_key: aha-lambda-schedule
status: draft
generated:
  by: agentbase/3.0.0
  at: 2026-08-15T00:00:00Z
trigger: rate(1 minute)
relationships:
  - kind: triggers
    target: aha-lambda-function
sources:
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L755-L803
---
# Meaning

The `AHA-LambdaSchedule` EventBridge rules run on `rate(1 minute)` and target the AHA Lambda in the primary region and, when configured, the secondary region.

# Consumers

The schedule triggers the [AHA Lambda function](../repositories/repository-aws-health-aware-779eb7e1bc7a/infrastructure/aws/lambda/aha-lambda-function.md).

# Limitations

The source defines no event payload contract for this scheduled invocation.
