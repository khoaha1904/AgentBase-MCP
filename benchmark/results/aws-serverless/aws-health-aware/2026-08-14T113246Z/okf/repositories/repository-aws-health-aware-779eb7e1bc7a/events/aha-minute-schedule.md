---
title: AHA minute schedule
description: Enabled default-EventBridge schedule that invokes the AHA Lambda every minute.
type: Event
status: draft
generated:
  by: agentbase/3.0.0
  at: 2026-08-14T00:00:00Z
benchmark_key: aha-minute-schedule
trigger: rate(1 minute)
sources:
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L755-L802
relationships:
  - kind: triggers
    target: aha-scheduled-health-lambda
---

# Meaning

The enabled EventBridge rule named `AHA-LambdaSchedule` has a one-minute rate expression.

# Producers

The default EventBridge bus evaluates the schedule rule.

# Consumers

The rule target is [AHA scheduled health Lambda](../infrastructure/aws/lambda/aha-scheduled-health-lambda.md); the Terraform permission grants `events.amazonaws.com` invocation access.

## Sources

- `repository://repository-aws-health-aware-779eb7e1bc7a/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L755-L802`
