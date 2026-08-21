---
type: Function
title: Health-alert-processor
description: Independent scheduled runtime contract for querying health events, recording updates, and dispatching alerts.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T09:49:52.132Z
sources:
  - id: res_function
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L656-L702
  - id: sem_function
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L1042-L1063
  - id: sem_event_state_access
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L473-L585
relationships:
  - kind: writes-to
    target: resources/health-event-state
    evidence:
      - sem_event_state_access
  - kind: reads-from
    target: resources/health-event-state
    evidence:
      - sem_event_state_access
  - kind: implemented-in
    target: repositories/aws-health-aware
    evidence:
      - sem_function
agentbase:
  technology:
    provider: aws
    product: lambda
    sourceTool: terraform
    resourceType: aws_lambda_function
---

# Responsibility

This function is the runtime boundary for processing AWS Health events. Terraform binds it to `handler.main`; the handler is the executable entry point. It is implemented in [aws-health-aware](../repositories/aws-health-aware.md). [res_function] [sem_function]

# Runtime

Its declared runtime is Python 3.11. Configuration fields such as `DYNAMODB_TABLE`, `EVENT_SEARCH_BACK`, and delivery-channel flags are deployment inputs; their values are not recorded here because they may vary by deployment. [res_function]

# Triggers

The same Terraform configuration defines an enabled one-minute schedule and makes the function its target. This records desired scheduling, not evidence of an active schedule. [res_function]

# State interaction

The handler opens [Health-event-state](../resources/health-event-state.md) named by `DYNAMODB_TABLE`, reads an item by event ARN, and writes event/update records. [sem_event_state_access]

# Limitations

Endpoint delivery behavior and configured webhook/email values are not modeled: they are optional deployment configuration, and no live configuration was inspected.
