---
type: System
title: AWS Health Aware
description: Provides the repository's recognizable health-alerting capability.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T17:48:49.794Z
sources:
  - id: readme_introduction
    resource: repository://repository-aws-health-aware-ef3e83846625/README.md#L44-L45
  - id: readme_architecture
    resource: repository://repository-aws-health-aware-ef3e83846625/README.md#L59-L68
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
      - readme_introduction
---

# Purpose

AWS Health Aware (AHA) formats AWS Health alerts and sends them to configured Chime, Slack, Microsoft Teams, email, or EventBridge-compatible destinations.

Primary Domain: [Health Operations](../domains/health-operations.md).

# Architecture

The system is implemented in [aws-health-aware](../repositories/aws-health-aware.md). Its scheduled processor obtains Health events, records event/update state in the DynamoDB table, and uses configured delivery endpoints. The EventBridge schedule, endpoint secrets, IAM role, and optional secondary-region deployment are infrastructure or configuration details rather than separate concepts in this initial ingest.

* [AHA scheduled alert processor](../components/aha-scheduled-alert-processor.md) - Function
* [AHA event state table](../resources/aha-event-state-table.md) - Resource
* [Scheduled health-alert processing](../flows/scheduled-health-alert-processing.md) - Flow

# Limitations

Terraform captures desired infrastructure only; it does not establish live deployment values or selected endpoints. CloudFormation definitions are outside this Terraform-focused initial coverage.
