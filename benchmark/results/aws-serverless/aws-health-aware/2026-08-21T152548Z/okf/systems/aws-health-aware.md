---
type: System
title: AWS Health Aware
description: Groups the alerting capability, its deployment, state handling, and delivery boundaries.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T15:27:08.526Z
sources:
  - id: sem_system
    resource: repository://repository-aws-health-aware-ef3e83846625/README.md#L44-L45
  - id: owner-domain
    resource: agentbase://owner-guidance/domains/health-operations
  - id: sem_function
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L1042-L1060
  - id: sem_store
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L474-L539
relationships:
  - kind: part-of
    target: domains/health-operations
    evidence:
      - owner-domain
---

# Purpose

AWS Health Aware is an automated notification capability for well-formatted AWS Health alerts delivered to chat, email, or EventBridge-compatible endpoints. [sem_system]

Primary Domain: [Health Operations](../domains/health-operations.md).

# Architecture

The system comprises the independently scheduled [health alert processor](../components/scheduled-health-alert-processor.md). Its DynamoDB event-state table, scheduled trigger, and delivery endpoint configuration remain embedded in that function because this ingest has no evidence that they are independently managed Hub boundaries.

# Interfaces

The processor reads AWS Health through its runtime client and can deliver alerts to Slack, Microsoft Teams, Amazon Chime, email, and an EventBridge-compatible endpoint. The repository documents these as configurable destinations, rather than an owned external interface contract. [sem_system]

# Critical Flows

1. The scheduled processor invokes `handler.main`. [sem_function]
2. The handler selects organization or non-organization AWS Health event processing. [sem_function]
3. Event state is used to decide whether to send create or resolve alerts. [sem_store]

Suggested type `System` is evidence-bound agent intent and requires proposal review.

# Limitations

Terraform is desired-state evidence only. It does not establish a deployed function, schedule, datastore, account, region, ARN, or configured destination.
