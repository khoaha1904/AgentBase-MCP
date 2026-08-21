---
type: Interface
title: AWS Health Alert Delivery
description: Outbound delivery of formatted AWS Health alerts to configured endpoints.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T14:39:33.937Z
sources:
  - id: sem_interface_delivery
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L94-L183
  - id: system_description
    resource: repository://repository-aws-health-aware-ef3e83846625/README.md#L44-L45
relationships:
  - kind: part-of
    target: systems/aws-health-aware
    evidence:
      - system_description
  - kind: implemented-in
    target: repositories/aws-health-aware
    evidence:
      - sem_interface_delivery
---

# Purpose

This interface represents the outbound delivery boundary for formatted AWS Health alerts.

It is part of [AWS Health Aware](../systems/aws-health-aware.md) and is implemented in the [aws-health-aware repository](../repositories/aws-health-aware.md).

# Contract

The implementation conditionally sends alerts to an EventBridge event bus, Slack, Microsoft Teams, email, or Amazon Chime using configuration and secrets. The repository does not define a single shared payload schema across these endpoint types.

# Producers

The [AWS Health Poller](../components/aws-health-aware-health-poller.md) produces delivery requests after processing a health event.

# Consumers

Configured external endpoint consumers are outside this repository and are intentionally not represented as identities.

# Failure Behavior

HTTP and URL errors from endpoint delivery are caught and printed; delivery processing then continues to other configured channels.

# Limitations

Endpoint URLs, recipient addresses, event-bus identities, and actual consumers are deployment configuration or secrets and are not asserted.

# Limitations

Suggested type `Interface` is evidence-bound agent intent and requires proposal review.
