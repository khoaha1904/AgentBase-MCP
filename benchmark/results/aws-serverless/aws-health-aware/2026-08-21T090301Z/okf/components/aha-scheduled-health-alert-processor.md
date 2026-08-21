---
type: Function
title: AHA scheduled health alert processor
description: Independently operated scheduled processor that retrieves health events, persists change state, and sends configured alerts
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T09:04:25.165Z
sources:
  - id: sem_runtime
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L94-L113
  - id: res_lambda
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L655-L702
  - id: res_schedule
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L755-L782
  - id: sem_exclusions
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L988-L999
agentbase:
  technology:
    provider: aws
    product: lambda
    sourceTool: terraform
    resourceType: aws_lambda_function
relationships:
  - kind: implemented-in
    target: repositories/aws-health-aware
    evidence:
      - res_lambda
  - kind: reads-from
    target: resources/aha-account-exclusion-object-storage
    evidence:
      - sem_exclusions
---

# Responsibility

The processor is deployed from `handler.main` and configured with a one-minute EventBridge schedule. Its alert path can publish to an EventBridge bus or invoke configured Slack, Teams, Chime, and email delivery paths.

It is implemented in the [aws-health-aware repository](../repositories/aws-health-aware.md) and conditionally reads [account-exclusion object storage](../resources/aha-account-exclusion-object-storage.md).

# Runtime

Terraform declares a Python 3.11 runtime and supplies configuration through environment fields, including the state-table reference and event search window.

# Triggers

The primary-region schedule is enabled and targets the function. The source also declares an optional secondary-region counterpart; this is desired-state configuration only.

# Limitations

No deployed function name, account, region, schedule status, invocation history, or endpoint configuration is evidenced. The state table is intentionally not a concept in this bounded ingest because its candidate mapped ambiguously in schema guidance.
