---
type: System
title: Aws-health-aware
description: Health alerting capability and its operating boundaries.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T16:50:54.390Z
sources:
  - id: sem-system
    resource: repository://repository-aws-health-aware-ef3e83846625/README.md#L45-L45
  - id: owner-domain
    resource: agentbase://owner-guidance/domains/health-operations
relationships:
  - kind: part-of
    target: domains/health-operations
    evidence:
      - owner-domain
  - kind: implemented-in
    target: repositories/aws-health-aware
    evidence:
      - sem-system
---

# Purpose

AWS Health Aware (AHA) is an automated notification capability for AWS Health alerts. It is represented separately from its source repository and owner-confirmed Domain.

Primary Domain: [Health Operations](../domains/health-operations.md).

# Architecture

The Terraform deployment packages a scheduled Lambda handler. The function polls AWS Health, uses a DynamoDB table to retain event state, and conditionally sends alerts to configured EventBridge, webhook, or email endpoints.

Implemented in [aws-health-aware repository](../repositories/aws-health-aware.md).

* [AWS Health alert poller](../components/aws-health-alert-poller.md) - independently deployed runtime function
* [AWS Health event state](../resources/aws-health-event-state.md) - persistent event-state resource
* [AWS Health alerting flow](../flows/aws-health-alerting-flow.md) - scheduled operational behavior

# Limitations

The sources describe desired Terraform configuration and application behavior, not a deployed environment, account, region, ARN, or live endpoint configuration.
