---
title: AHA one-minute EventBridge schedule
description: EventBridge schedules that invoke the AHA Lambda functions every minute.
type: Event
status: draft
generated:
  by: agentbase/3.0.0
  at: 2026-08-15T00:00:00Z
benchmark_key: aha-one-minute-schedule
trigger: rate(1 minute)
relationships:
  - kind: triggers
    target: aha-primary-region-lambda
  - kind: triggers
    target: aha-secondary-region-lambda
sources:
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L756-L788
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L790-L803
---

# Meaning

The primary schedule is enabled on the default event bus with `rate(1 minute)`. A secondary schedule with the same cadence is conditional on secondary-region configuration.

# Consumers

The primary target invokes [the primary Lambda](../repositories/aws-health-aware/infrastructure/aws/lambda/primary-region.md); the conditional secondary target invokes [the secondary Lambda](../repositories/aws-health-aware/infrastructure/aws/lambda/secondary-region.md).

# Limitations

This concept represents infrastructure schedule declarations, not evidence that either schedule is currently deployed.
