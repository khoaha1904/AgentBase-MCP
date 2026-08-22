---
type: System
title: AWS Health Aware
description: AWS Health monitoring and notification system
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-22T15:06:13.087Z
sources:
  - id: obs-aha-system-entry
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L1042-L1060
  - id: owner-domain
    resource: agentbase://owner-guidance/domains/cloud-operations
relationships:
  - kind: part-of
    target: domains/cloud-operations
    evidence:
      - owner-domain
  - kind: implemented-in
    target: repositories/aws-health-aware
    evidence:
      - obs-aha-system-entry
---

# Purpose

AWS Health Aware is the operational capability that discovers AWS Health events
for an account or organization and routes them into notification processing.

Primary Domain: [Cloud Operations](../domains/cloud-operations.md).

Implemented in [aws-health-aware](../repositories/aws-health-aware.md).

# Architecture

The `main` entry point selects single-account or AWS Organizations processing.
Terraform describes Lambda runtimes, DynamoDB-backed event state, and minute-based
EventBridge scheduling for primary and optional secondary regions.

# Interfaces

The system reads AWS Health information through the runtime implementation. Its
notification boundary is owned by [AWS Health Alert Delivery](../components/aws-health-alert-delivery.md).

# Critical Flows

On invocation, the entry point clears cached API clients, determines whether
organization processing is enabled, and dispatches to the corresponding event
discovery path. State and scheduling remain internal deployment concerns.

# Limitations

This snapshot is based on static source and Terraform desired state. It does not
prove a deployed account, active region, concrete ARN, configured destination,
or current runtime health. The optional secondary-region resources are conditional.

# Embedded Knowledge

| Name | Role | Kind | Technology | Exact sources |
|---|---|---|---|---|
| event state storage | DynamoDB event state storage | database-table | aws / dynamodb; terraform:aws_dynamodb_table | res-aha-state-table: `repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L246-L273`<br>res-aha-global-state-table: `repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L276-L304` |
| Lambda runtime | AWS Lambda runtime for health-aware processing | runtime-function | aws / lambda; terraform:aws_lambda_function | res-aha-primary-lambda: `repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L656-L702`<br>res-aha-secondary-lambda: `repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L705-L753` |
| scheduled invocation | Minute-based desired invocation schedule for primary and optional secondary Lambda runtimes | infrastructure trigger | aws / eventbridge; terraform:aws_cloudwatch_event_rule | res-aha-primary-schedule: `repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L756-L765`<br>res-aha-secondary-schedule: `repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L766-L777` |
