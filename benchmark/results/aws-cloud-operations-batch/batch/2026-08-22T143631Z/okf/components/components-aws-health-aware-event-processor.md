---
type: Component
title: AWS Health Aware event processor
description: Scheduled workload that polls AWS Health, tracks event state, and dispatches notifications
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-22T14:38:56.084Z
sources:
  - id: aha-runtime-doc
    resource: repository://repository-aws-health-aware-ef3e83846625/README.md#L61-L69
  - id: aha-main
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L1042-L1060
  - id: aha-query
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L750-L784
  - id: aha-dispatch
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L94-L127
  - id: aha-state-doc
    resource: repository://repository-aws-health-aware-ef3e83846625/README.md#L61-L68
  - id: aha-ddb-single
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L246-L273
  - id: aha-ddb-global
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L276-L306
  - id: aha-schedule-doc
    resource: repository://repository-aws-health-aware-ef3e83846625/README.md#L67-L69
  - id: aha-schedule-primary
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L756-L765
  - id: aha-schedule-secondary
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L766-L777
  - id: aha-endpoints-doc
    resource: repository://repository-aws-health-aware-ef3e83846625/README.md#L64-L74
relationships:
  - kind: part-of
    target: systems/systems-aws-health-aware
    evidence:
      - aha-runtime-doc
  - kind: implemented-in
    target: repositories/aws-health-aware
    evidence:
      - aha-main
---

# Responsibility

This component is the [AWS Health Aware](../systems/systems-aws-health-aware.md) system's scheduled runtime boundary and is implemented in the [aws-health-aware repository](../repositories/aws-health-aware.md). Its entry point chooses account-level or organization-level event processing, polls AWS Health with configured time, category, and region filters, and dispatches formatted notifications.

# Runtime

The source defines one Lambda entry point. In non-organization mode it processes account health events; in organization mode it processes organization events. Terraform defines primary-region and conditional secondary-region scheduling resources, but those declarations describe desired state only.

# Interfaces

The processor consumes the AWS Health API and can deliver to configured Chime, Slack, Teams, email, or EventBridge destinations. These integrations remain embedded because the reviewed evidence does not establish separate repository-owned interface contracts.

# Dependencies

Event state is retained in a DynamoDB table selected by the deployment mode. Webhook and EventBridge destination values are obtained from configuration backed by Secrets Manager resources. IAM roles, permissions, schedules, tables, secrets, and hosts are implementation infrastructure and are not independently promoted.

# Operations

The README documents an EventBridge rule that invokes the Lambda every minute. Runtime filters bound the lookback period, health-event categories, and regions. Event state includes event ARNs, updates, and TTL metadata.

# Limitations

No live AWS state was queried. The source does not prove a deployed account, current region, ARN, endpoint URL, enabled channel, active schedule, or current health event. CloudFormation parity and every formatter path were not exhaustively reviewed.

# Embedded Knowledge

| Name | Role | Kind | Technology | Exact sources |
|---|---|---|---|---|
| AWS Health event state store | DynamoDB event state | database-table | aws / dynamodb; terraform:aws_dynamodb_table | aha-state-doc: `repository://repository-aws-health-aware-ef3e83846625/README.md#L61-L68`<br>aha-ddb-single: `repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L246-L273`<br>aha-ddb-global: `repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L276-L306` |
| AWS Health polling schedule | Invokes the processor on a documented one-minute cadence | infrastructure | aws / eventbridge; terraform:aws_cloudwatch_event_rule | aha-schedule-doc: `repository://repository-aws-health-aware-ef3e83846625/README.md#L67-L69`<br>aha-schedule-primary: `repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L756-L765`<br>aha-schedule-secondary: `repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L766-L777` |
| Notification delivery configuration | Selects enabled webhook, email, and EventBridge destinations | configuration | source-defined | aha-endpoints-doc: `repository://repository-aws-health-aware-ef3e83846625/README.md#L64-L74` |
