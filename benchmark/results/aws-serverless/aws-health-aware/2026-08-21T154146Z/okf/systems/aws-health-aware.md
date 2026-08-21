---
type: System
title: AWS Health Aware
description: A named operational capability that gathers AWS Health alerts and routes them to configured endpoints.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T15:43:09.299Z
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

AWS Health Aware is a notification capability for AWS Health alerts. The repository documents delivery to Amazon Chime, Slack, Microsoft Teams, email, or an EventBridge-compatible endpoint.

Primary Domain: [Health Operations](../domains/health-operations.md).

# Architecture

The system is implemented by the [AHA scheduled alert processor](../components/aha-scheduled-alert-processor.md). It is scheduled through embedded EventBridge configuration, queries AWS Health, compares event state in an embedded DynamoDB table, and conditionally sends notifications using embedded Secrets Manager-backed endpoint configuration.

# Critical Flows

* [Scheduled AWS Health alert delivery](../flows/scheduled-aws-health-alert-delivery.md)

# Limitations

The documented endpoints and infrastructure are configuration and desired-state evidence; their live values and deployment status are not established here.
