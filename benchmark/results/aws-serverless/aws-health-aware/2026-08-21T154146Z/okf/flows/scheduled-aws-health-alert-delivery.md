---
type: Flow
title: Scheduled AWS Health alert delivery
description: Operational sequence from scheduled invocation through AWS Health event processing to configured delivery endpoints.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T15:43:09.299Z
sources:
  - id: sem_function_trigger
    resource: repository://repository-aws-health-aware-ef3e83846625/CFN_DEPLOY_AHA.yml#L547-L569
  - id: sem_flow_query
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L750-L780
  - id: sem_flow_state
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L615-L654
  - id: sem_flow_delivery
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L94-L120
relationships:
  - kind: part-of
    target: systems/aws-health-aware
    evidence:
      - sem_flow_query
flow_steps:
  - order: 1
    source: systems/aws-health-aware
    action: invokes
    target: components/aha-scheduled-alert-processor
    mode: asynchronous
    evidence:
      - sem_function_trigger
  - order: 2
    source: components/aha-scheduled-alert-processor
    action: delivers
    target: systems/aws-health-aware
    mode: asynchronous
    evidence:
      - sem_flow_delivery
---

# Purpose

This flow represents scheduled AWS Health alert processing and delivery for [AWS Health Aware](../systems/aws-health-aware.md).

# Trigger

An embedded EventBridge rule schedules the processor every minute.

# Outcome

For a new or changed event-state record, the processor sends the event to configured delivery endpoints when enabled.

# Flow

1. [AWS Health Aware](../systems/aws-health-aware.md)’s embedded EventBridge schedule invokes the [AHA scheduled alert processor](../components/aha-scheduled-alert-processor.md).
2. The [AHA scheduled alert processor](../components/aha-scheduled-alert-processor.md) filters and paginates AWS Health events, reads or writes embedded event state, then conditionally delivers alerts through [AWS Health Aware](../systems/aws-health-aware.md)’s configured endpoint mechanisms.

# Failure and Recovery

The bounded implementation catches HTTP and URL errors during delivery. No broader retry or recovery contract is asserted.

# Limitations

The concrete endpoint identities and live delivery outcomes are configuration-dependent and not captured as standalone concepts.
