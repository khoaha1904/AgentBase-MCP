---
type: Function
title: AHA scheduled alert processor
description: Independently deployed and scheduled workload that processes AWS Health alerts.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T15:43:09.299Z
sources:
  - id: sem_function_deployment
    resource: repository://repository-aws-health-aware-ef3e83846625/CFN_DEPLOY_AHA.yml#L643-L657
  - id: sem_function_trigger
    resource: repository://repository-aws-health-aware-ef3e83846625/CFN_DEPLOY_AHA.yml#L547-L569
  - id: sem_embedded_notification
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L702-L734
  - id: sem_resource_use
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L597-L635
  - id: sem_system_intro
    resource: repository://repository-aws-health-aware-ef3e83846625/README.md#L44-L45
relationships:
  - kind: part-of
    target: systems/aws-health-aware
    evidence:
      - sem_system_intro
  - kind: implemented-in
    target: repositories/aws-health-aware
    evidence:
      - sem_function_deployment
---

# Responsibility

The `handler.main` Lambda workload is invoked by an EventBridge rule scheduled at one-minute intervals. It provides the runtime processing for AWS Health Aware.

Part of [AWS Health Aware](../systems/aws-health-aware.md) and implemented in the [aws-health-aware repository](../repositories/aws-health-aware.md).

# Runtime

The declared runtime is Python 3.11. This is desired-state deployment configuration, not evidence of a current deployed runtime.

# Triggers

An embedded EventBridge rule has a `rate(1 minute)` schedule and targets this function.

# Embedded Resources

The processor uses an embedded DynamoDB table named through `DYNAMODB_TABLE` to read and write event state, including a TTL. It also resolves Slack, Teams, Chime, assumed-role, and EventBridge destination values from Secrets Manager under environment-controlled conditions. These resources remain embedded because the catalog did not support their standalone promotion.

# Failure Behavior

Notification delivery catches HTTP and URL errors for configured destinations; the bounded ingest does not establish retry, dead-letter, or alerting behavior beyond the source shown.

# Limitations

The deployment template does not prove the function is deployed or identify its live account, region, ARN, secrets, or destination values.
