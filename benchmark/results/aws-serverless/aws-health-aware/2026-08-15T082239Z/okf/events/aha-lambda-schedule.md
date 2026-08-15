---
title: AHA Lambda schedule
description: EventBridge schedule that invokes the primary-region AHA Lambda every minute.
status: draft
generated:
  by: agentbase/3.0.0
  at: 2026-08-15T00:00:00Z
sources:
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L756-L782
type: Event
benchmark_key: aha-lambda-schedule
trigger: rate(1 minute)
relationships:
  - kind: triggers
    target: aha-primary-region-lambda
---

# AHA Lambda schedule

## Meaning

The enabled primary-region EventBridge rule uses `rate(1 minute)` and targets the primary AHA Lambda.

## Consumers

- Triggers [AHA primary-region Lambda](../infrastructure/aws/lambda/aha-primary-region.md).

## Limitations

No event payload shape is configured in the target binding.
