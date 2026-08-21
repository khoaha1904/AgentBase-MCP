---
type: Flow
title: AWS Health Alert Processing
description: Processes recent AWS Health events, records state, and delivers changed alerts.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T14:39:33.937Z
sources:
  - id: sem_flow_processing
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L750-L825
  - id: state_update
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L589-L699
  - id: delivery_implementation
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L94-L183
relationships:
  - kind: part-of
    target: systems/aws-health-aware
    evidence:
      - sem_flow_processing
flow_steps:
  - order: 1
    source: components/aws-health-aware-health-poller
    action: writes
    target: resources/aws-health-aware-health-event-state
    mode: synchronous
    evidence:
      - state_update
  - order: 2
    source: resources/aws-health-aware-health-event-state
    action: reads
    target: components/aws-health-aware-health-poller
    mode: synchronous
    evidence:
      - state_update
  - order: 3
    source: components/aws-health-aware-health-poller
    action: delivers
    target: interfaces/aws-health-aware-notification-delivery
    mode: synchronous
    evidence:
      - delivery_implementation
---

# Purpose

The flow processes recent AWS Health events, avoids duplicate notifications through stored state, and delivers alerts when events are new, updated, or resolved.

It is part of [AWS Health Aware](../systems/aws-health-aware.md).

# Trigger

The [AWS Health Poller](../components/aws-health-aware-health-poller.md) is scheduled once per minute by embedded EventBridge configuration.

# Outcome

The workflow records event state and attempts delivery through the [AWS Health Alert Delivery](../interfaces/aws-health-aware-notification-delivery.md) boundary when a new or changed event is detected.

# Flow

The poller queries AWS Health, obtains affected accounts and entities, reads or writes the [event-state store](../resources/aws-health-aware-health-event-state.md), and invokes alert delivery for eligible events.

# Failure and Recovery

If event details have no successful result, processing skips that event. Endpoint delivery errors are handled by the delivery implementation; no retry policy is evidenced here.

# Limitations

The external AWS Health API and endpoint consumers are outside the represented concept set; flow steps cover only repository-owned concepts.
