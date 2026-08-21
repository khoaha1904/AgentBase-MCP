---
type: System
title: AWS Health Aware
description: Automates notification of AWS Health alerts through configured delivery channels.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T14:39:33.937Z
sources:
  - id: sem_system_intro
    resource: repository://repository-aws-health-aware-ef3e83846625/README.md#L44-L45
  - id: owner-domain
    resource: agentbase://owner-guidance/domains/health-operations
relationships:
  - kind: part-of
    target: domains/health-operations
    evidence:
      - owner-domain
---

# Purpose

AWS Health Aware is the system boundary for polling AWS Health and sending formatted alerts to configured chat, email, or EventBridge-compatible endpoints.

Primary Domain: [Health Operations](../domains/health-operations.md).

# Architecture

The system comprises the scheduled [health poller](../components/aws-health-aware-health-poller.md), its [event-processing flow](../flows/aws-health-aware-health-alert-processing.md), a [notification-delivery interface](../interfaces/aws-health-aware-notification-delivery.md), and an operational [event-state store](../resources/aws-health-aware-health-event-state.md).

# Limitations

Repository evidence describes the capability and desired deployment configuration, not a particular deployed account, region, or endpoint configuration.
