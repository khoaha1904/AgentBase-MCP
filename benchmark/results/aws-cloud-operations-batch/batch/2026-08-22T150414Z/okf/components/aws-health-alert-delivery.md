---
type: Component
title: AWS Health Alert Delivery
description: multi-channel AWS Health alert delivery component
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-22T15:06:13.087Z
sources:
  - id: obs-alert-delivery-impl
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L94-L183
  - id: obs-message-formatting-impl
    resource: repository://repository-aws-health-aware-ef3e83846625/messagegenerator.py#L9-L117
relationships:
  - kind: part-of
    target: systems/aws-health-aware
    evidence:
      - obs-alert-delivery-impl
  - kind: implemented-in
    target: repositories/aws-health-aware
    evidence:
      - obs-alert-delivery-impl
---

# Responsibility

This component owns the cross-boundary dispatch of formatted AWS Health alerts
to configured EventBridge, Slack, Microsoft Teams, email, and Amazon Chime
destinations.

Part of [AWS Health Aware](../systems/aws-health-aware.md) and implemented in
[aws-health-aware](../repositories/aws-health-aware.md).

# Runtime

Delivery is invoked with event details, affected accounts and entities, and an
event type. Each configured destination is handled independently, with HTTP
connection failures reported by the implementation.

# Interfaces

Outbound boundaries include an EventBridge event bus, webhook endpoints, and
email. The source proves supported delivery paths, not that a destination is
currently configured or reachable.

# Dependencies

Channel-specific message construction is embedded here because it is an internal
implementation detail rather than an independently operated boundary.

# Embedded Knowledge

| Name | Role | Exact source |
|---|---|---|
| message formatting | Builds new/resolved health-event payloads with account, resource, service, region, status, ARN, and update fields | obs-message-formatting-impl: `repository://repository-aws-health-aware-ef3e83846625/messagegenerator.py#L9-L117` |

# Operations

Operators should treat destination-specific failures and configuration as
runtime concerns; this ingest did not inspect any live endpoint or secret.

# Limitations

Static implementation evidence establishes supported branches but not successful
delivery, active credentials, endpoint ownership, or current service availability.
