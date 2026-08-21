---
type: System
title: AWS Health Aware
description: Automated notification capability for AWS Health alerts.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T13:31:07.473Z
sources:
  - id: sem_system
    resource: repository://repository-aws-health-aware-ef3e83846625/README.md#L44-L45
  - id: owner-domain
    resource: agentbase://owner-guidance/domains/health-operations
  - id: documented-resources
    resource: repository://repository-aws-health-aware-ef3e83846625/README.md#L59-L71
relationships:
  - kind: part-of
    target: domains/health-operations
    evidence:
      - owner-domain
---

# Purpose

AWS Health Aware is an automated notification capability that sends formatted AWS Health alerts to configured chat, email, and EventBridge-compatible endpoints.

Primary Domain: [Health Operations](../domains/health-operations.md).

# Architecture

The system is implemented by the scheduled [health alert processor](../components/health-alert-processor.md). The documented deployment includes a Lambda function, an EventBridge schedule, a DynamoDB table for event state, and Secrets Manager entries for configured endpoint values.

# Interactions

The processor obtains AWS Health data, records event/update state, and sends notifications to configured delivery endpoints. Endpoint values are configuration and secrets rather than Hub identities.

# Limitations

This is an initial, source-backed model; deployment templates describe desired state only and do not prove a deployed account, region, ARN, or runtime configuration.
