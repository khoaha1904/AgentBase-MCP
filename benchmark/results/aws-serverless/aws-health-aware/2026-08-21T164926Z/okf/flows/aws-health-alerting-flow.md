---
type: Flow
title: Aws-health-alerting-flow
description: Navigation for scheduled health-event polling through state persistence and configured outbound notifications.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T16:50:54.390Z
sources:
  - id: res-schedule
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L756-L762
  - id: sem-alert
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L94-L183
  - id: handler-event-state
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L597-L635
  - id: schedule-target
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L756-L796
relationships:
  - kind: part-of
    target: systems/aws-health-aware
    evidence:
      - res-schedule
flow_steps:
  - order: 1
    source: components/aws-health-alert-poller
    action: writes
    target: resources/aws-health-event-state
    mode: synchronous
    evidence:
      - handler-event-state
agentbase:
  technology:
    provider: aws
    sourceTool: terraform
    resourceType: aws_cloudwatch_event_rule
---

# Purpose

This operational flow captures the independently useful path from scheduled Lambda invocation to event-state persistence. The function’s configured outbound deliveries remain embedded behavior because no endpoint concepts are promoted.

Part of [AWS Health Aware](../systems/aws-health-aware.md).

# Trigger

Terraform declares a CloudWatch event rule and Lambda target for the primary-region function.

# Outcome

The function persists new or changed AWS Health event information and, when configured, attempts notification delivery to supported outbound endpoints.

# Flow

1. [AWS Health alert poller](../components/aws-health-alert-poller.md) records AWS Health event state in [AWS Health event state](../resources/aws-health-event-state.md).

# Failure and Recovery

Delivery failures for HTTP and URL errors are caught and logged; future scheduled invocations can continue processing.

# Limitations

# Limitations

The scheduler is Terraform desired state. The flow does not create identities for optional EventBridge, webhook, or email endpoints.
