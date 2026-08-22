---
type: System
title: AWS Health Aware
description: Operational notification system for collecting AWS Health events and delivering formatted alerts
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-22T14:38:56.084Z
sources:
  - id: aha-overview
    resource: repository://repository-aws-health-aware-ef3e83846625/README.md#L44-L45
  - id: aha-resources
    resource: repository://repository-aws-health-aware-ef3e83846625/README.md#L59-L71
  - id: owner-domain
    resource: agentbase://owner-guidance/domains/cloud-operations
relationships:
  - kind: part-of
    target: domains/cloud-operations
    evidence:
      - owner-domain
  - kind: implemented-in
    target: repositories/aws-health-aware
    evidence:
      - aha-overview
---

# Purpose

AWS Health Aware is an operational notification system that obtains AWS Health events and delivers formatted alerts to configured operator destinations. The documented capability supports Chime, Slack, Microsoft Teams, email, and EventBridge-compatible endpoints.

Primary Domain: [Cloud Operations](../domains/cloud-operations.md).

# Architecture

The [AWS Health Aware event processor](../components/components-aws-health-aware-event-processor.md) is the central workload. It polls AWS Health, records event state, formats notifications, and dispatches them through configured delivery paths. The system is implemented in the [aws-health-aware repository](../repositories/aws-health-aware.md).

# Interfaces

Delivery destinations are configuration-dependent. They are documented as webhook, email, or EventBridge integrations, but are not promoted here as stable standalone interfaces because this bounded ingest did not establish independently owned contracts for them.

# Critical Flows

On its configured schedule, the processor queries recent AWS Health events, applies event-category and region filters, compares or updates retained state, and delivers notifications to the enabled endpoints.

# Limitations

This is a source snapshot, not a deployment inventory. The ingest does not establish which destinations are enabled, whether organization mode is active, or whether a primary or multi-region deployment currently exists.
