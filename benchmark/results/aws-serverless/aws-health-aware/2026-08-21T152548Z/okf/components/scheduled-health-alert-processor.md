---
type: Function
title: Scheduled health alert processor
description: Operational entry point that polls AWS Health, persists change state, and delivers alerts.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T15:27:08.526Z
sources:
  - id: res_lambda
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L656-L702
  - id: sem_function
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L1042-L1060
  - id: sem_store
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L474-L539
  - id: res_schedule
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L756-L782
  - id: sem_delivery
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L94-L277
relationships:
  - kind: part-of
    target: systems/aws-health-aware
    evidence:
      - res_lambda
  - kind: implemented-in
    target: repositories/aws-health-aware
    evidence:
      - res_lambda
agentbase:
  technology:
    kind: runtime-function
    provider: aws
    product: lambda
    sourceTool: terraform
    resourceType: aws_lambda_function
---

# Responsibility

This independently deployed Lambda entry point runs `handler.main`, chooses the AWS Organizations-aware or single-account event path, and coordinates alert processing. [res_lambda] [sem_function]

It is part of [AWS Health Aware](../systems/aws-health-aware.md) and is implemented in the [aws-health-aware repository](../repositories/aws-health-aware.md).

# Runtime

Terraform declares a Python 3.11 Lambda handler with a 600-second timeout. These are desired configuration, not observed runtime state. [res_lambda]

# Triggers

Terraform binds a default-event-bus rule with a `rate(1 minute)` schedule to the Lambda. The schedule is embedded because it is this function's trigger configuration. [res_schedule]

# Embedded Resources

The function uses a DynamoDB table keyed by event ARN with a TTL field to persist alert state; it sends create or resolve alerts when stored state changes. The table is embedded because released catalog guidance did not support promoting this candidate as a Resource. [sem_store]

Configured Slack, Teams, Chime, email, and EventBridge destinations are also embedded deployment/runtime configuration, not separately verified interfaces. [sem_delivery]

# Failure Behavior

Webhook delivery helpers catch HTTP and URL errors and log them; this ingest does not establish retry, alerting, or dead-letter behavior. [sem_delivery]

# Limitations

No deployed function, schedule, state table, endpoint, account, region, ARN, or secret value was observed.
