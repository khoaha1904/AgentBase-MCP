---
type: System
title: Aws-health-aware
description: A distinct health-operations notification capability with external alert delivery.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T17:53:07.926Z
sources:
  - id: obs_system
    resource: repository://repository-aws-health-aware-ef3e83846625/README.md#L43-L45
  - id: obs_architecture
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
      - obs_system
---

# Purpose

AWS Health Aware (AHA) is an automated notification capability that formats AWS Health alerts for configured collaboration, email, or EventBridge-compatible endpoints [source](repository://repository-aws-health-aware-ef3e83846625/README.md#L43-L45).

Primary Domain: [Health Operations](../domains/health-operations.md).

# Architecture

The system is implemented in [aws-health-aware](../repositories/aws-health-aware.md). Its scheduled Lambda function reads the AWS Health API, writes event state to DynamoDB, and sends alerts to configured endpoints [source](repository://repository-aws-health-aware-ef3e83846625/README.md#L63-L68).

* [Aha-health-alert-processor](../components/aha-health-alert-processor.md) - Function

# Limitations

Terraform is desired-state evidence only; this ingest does not establish any deployed account, region, ARN, runtime configuration, or enabled endpoint. The System classification is an evidence-bound proposal requiring review.
