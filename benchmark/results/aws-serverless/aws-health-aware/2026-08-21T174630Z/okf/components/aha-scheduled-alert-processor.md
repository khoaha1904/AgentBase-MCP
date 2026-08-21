---
type: Function
title: AHA scheduled alert processor
description: Independently deployed, scheduled runtime that collects AWS Health events and generates alert delivery.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T17:48:49.794Z
sources:
  - id: tf_lambda_primary
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L655-L702
  - id: handler_main
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L1042-L1061
  - id: handler_event_persistence
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L750-L825
  - id: readme_architecture
    resource: repository://repository-aws-health-aware-ef3e83846625/README.md#L59-L68
relationships:
  - kind: part-of
    target: systems/aws-health-aware
    evidence:
      - readme_architecture
  - kind: implemented-in
    target: repositories/aws-health-aware
    evidence:
      - tf_lambda_primary
  - kind: depends-on
    target: resources/aha-event-state-table
    evidence:
      - tf_lambda_primary
agentbase:
  technology:
    kind: runtime-function
    provider: aws
    product: lambda
    sourceTool: terraform
    resourceType: aws_lambda_function
---

# Responsibility

The Terraform-defined Lambda runs `handler.main` for [AWS Health Aware](../systems/aws-health-aware.md), implemented in [aws-health-aware](../repositories/aws-health-aware.md). It creates an AWS Health client and selects organization or non-organization event collection based on `ORG_STATUS`.

# Runtime

Terraform declares Python 3.11, a 600-second timeout, and the `handler.main` entry point. It configures the DynamoDB table name and optional endpoint flags. These are desired-state declarations, not evidence of a deployed function or current configuration.

# Triggers

The processor is the target of the enabled EventBridge schedule described by [Scheduled health-alert processing](../flows/scheduled-health-alert-processing.md).

# Embedded Resources

The processor depends on [AHA event state table](../resources/aha-event-state-table.md). The optional endpoint secrets and optional secondary regional Lambda below remain embedded because they are configuration/deployment variants of this runtime boundary.

# Embedded Knowledge

| Name | Role | Kind | Technology | Exact sources |
|---|---|---|---|---|
| Optional notification endpoint secrets | Configuration-bound secrets support notification endpoints but do not require separate navigation. | runtime-function | aws / lambda; terraform:aws_lambda_function | tf_notification_config: `repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L670-L687`<br>handler_secrets: `repository://repository-aws-health-aware-ef3e83846625/handler.py#L704-L734` |
| Optional secondary regional Lambda | Deployment variant of the same processor identity. | runtime-function | aws / lambda; terraform:aws_lambda_function | tf_lambda_secondary: `repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L704-L753` |

# Failure Behavior

The observed event-collection path logs when no events are found and continues on a failed event-details response. Error handling for individual external endpoint deliveries is not comprehensively modeled here.

# Limitations

This document represents the primary Lambda identity. The secondary-region resource is conditional and embedded; runtime deployments, account and region values are not known from Terraform.
