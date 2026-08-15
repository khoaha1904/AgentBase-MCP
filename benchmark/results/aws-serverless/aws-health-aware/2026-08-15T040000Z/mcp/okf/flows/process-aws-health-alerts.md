---
title: Process AWS Health Alerts
description: Scheduled AHA behavior that retrieves AWS Health events and alerts configured endpoints.
type: Business Flow
status: draft
generated:
  by: agentbase/3.0.0
  at: "2026-08-15T00:00:00Z"
benchmark_key: process-aws-health-alerts
business_purpose: Surface AWS Health events through configured alerting endpoints.
trigger: AHA Lambda Schedule
outcome: AWS Health events are processed and alerts are sent to configured endpoints.
relationships:
  - kind: step
    target: aha-lambda-schedule
  - kind: step
    target: aha-lambda-function
sources:
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/README.md#L59-L69
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L755-L795
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/handler.py#L1042-L1060
---

# Trigger

The [AHA Lambda Schedule](../events/aha-lambda-schedule.md) starts the behavior every minute.

# Outcome

The Lambda processes AWS Health information and sends alerts to configured endpoints.

# Flow

1. The [AHA Lambda Schedule](../events/aha-lambda-schedule.md) invokes the [AHA Lambda Function](../infrastructure/aws/lambda/aha-lambda-function.md).
2. The handler creates an AWS Health client and selects standard or organizational event collection based on `ORG_STATUS`.

# Failure and Recovery

The cited sources do not establish retry or recovery behavior for this end-to-end flow.
