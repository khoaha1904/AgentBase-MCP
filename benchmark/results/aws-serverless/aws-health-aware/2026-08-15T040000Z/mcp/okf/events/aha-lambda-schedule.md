---
title: AHA Lambda Schedule
description: Enabled EventBridge schedule that runs every minute and targets the primary AHA Lambda.
type: Event
status: draft
generated:
  by: agentbase/3.0.0
  at: "2026-08-15T00:00:00Z"
benchmark_key: aha-lambda-schedule
trigger: rate(1 minute)
relationships:
  - kind: triggers
    target: aha-lambda-function
sources:
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L755-L765
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L779-L795
---

# Meaning

The enabled default-bus EventBridge rule is named as an AHA Lambda trigger and has a one-minute schedule expression.

# Producers

The Terraform deployment configuration defines the schedule.

# Consumers

The rule [triggers the AHA Lambda Function](../infrastructure/aws/lambda/aha-lambda-function.md) through its EventBridge target and Lambda invoke permission.
