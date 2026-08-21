---
type: Flow
title: Scheduled health-alert processing
description: Explains the independently useful trigger-to-collection execution path.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T17:48:49.794Z
sources:
  - id: tf_schedule_invocation
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L755-L794
  - id: handler_main
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L1042-L1061
  - id: handler_event_persistence
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L750-L825
  - id: readme_architecture
    resource: repository://repository-aws-health-aware-ef3e83846625/README.md#L59-L68
relationships:
  - kind: part-of
    target: systems/aws-health-aware
    evidence:
      - readme_architecture
flow_steps:
  - order: 1
    source: components/aha-scheduled-alert-processor
    action: writes
    target: resources/aha-event-state-table
    mode: synchronous
    evidence:
      - handler_event_persistence
agentbase:
  technology:
    provider: aws
    sourceTool: terraform
    resourceType: aws_cloudwatch_event_target
---

# Purpose

Within [AWS Health Aware](../systems/aws-health-aware.md), the enabled EventBridge rule targets the AHA Lambda. On invocation, `handler.main` chooses organization-aware or non-organization Health-event collection.

# Trigger

Terraform configures the enabled default-event-bus rule on `rate(1 minute)` and grants `events.amazonaws.com` permission to invoke the Lambda (`tf_schedule_invocation`). This is desired-state infrastructure, not an observation that a schedule is live.

# Outcome

The processor records discovered event state, including ARN, update time, TTL, and status, in [AHA event state table](../resources/aha-event-state-table.md). It then attempts configured endpoint delivery; those endpoint interactions remain embedded because the configured destination is variable.

# Flow

1. The EventBridge schedule invokes [AHA scheduled alert processor](../components/aha-scheduled-alert-processor.md) (`tf_schedule_invocation`).
2. The processor collects AWS Health events and synchronously writes state to [AHA event state table](../resources/aha-event-state-table.md) (`handler_event_persistence`).

# Failure and Recovery

The observed collection loop logs a no-events condition and continues after a failed event-details response. Endpoint delivery failure handling is not fully captured in this flow.

# Limitations

The EventBridge schedule is embedded rather than modeled as an endpoint identity. Terraform does not prove the cadence is currently active in any deployment.
