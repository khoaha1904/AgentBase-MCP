---
type: Function
title: Health-alert-processor
description: Independent scheduled processing contract for discovering and dispatching health alerts.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T07:17:27.851Z
sources:
  - id: res_lambda
    resource: repository://repository-aws-health-aware-ef3e83846625/CFN_DEPLOY_AHA.yml#L643-L685
  - id: sem_schedule
    resource: repository://repository-aws-health-aware-ef3e83846625/CFN_DEPLOY_AHA.yml#L547-L562
  - id: impl_event_handling
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L1042-L1060
  - id: impl_event_state
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L597-L699
relationships:
  - kind: implemented-in
    target: repositories/aws-health-aware
    evidence:
      - res_lambda
agentbase:
  technology:
    provider: aws
    product: lambda
    sourceTool: terraform
    resourceType: aws_lambda_function
---

# Responsibility

The function is the independently deployed AHA processing boundary. Its configured handler starts a Health client and selects account or organization event discovery based on the organization setting.

It is implemented in [aws-health-aware](../repositories/aws-health-aware.md).

# Runtime

The desired-state CloudFormation definition configures the handler.main handler with a Python runtime and environment references for event search, regions, event state, organization behavior, and notification configuration. This is an infrastructure declaration, not evidence of a live deployment.

# Triggers

An enabled schedule rule targets the function at a one-minute rate.

# Interactions

The implementation records Health event state using the table named by DYNAMODB_TABLE; it sends notifications only for a new record or a material update. The table remains an unmodeled source-backed dependency in this partial ingest.

# Limitations

Notification destinations and credentials are conditionally configured and read from secrets; endpoint values are intentionally not captured. The source does not evidence a deployed account, region, ARN, schedule state, or current environment values.
