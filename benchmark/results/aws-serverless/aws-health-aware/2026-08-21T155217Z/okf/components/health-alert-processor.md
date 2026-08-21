---
type: Function
title: Health-alert-processor
description: Scheduled Lambda function that queries AWS Health and dispatches formatted alerts.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T15:53:44.309Z
sources:
  - id: tf_primary_lambda
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L656-L702
  - id: tf_primary_schedule
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L756-L782
  - id: handler_main
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L1042-L1060
relationships:
  - kind: implemented-in
    target: repositories/aws-health-aware
    evidence:
      - tf_primary_lambda
agentbase:
  technology:
    kind: runtime-function
    provider: aws
    product: lambda
    sourceTool: terraform
    resourceType: aws_lambda_function
---

# Responsibility

The primary-region Lambda runs `handler.main`. Its handler obtains an AWS Health client and selects single-account or organization event processing based on `ORG_STATUS`.

Implemented in [aws-health-aware](../repositories/aws-health-aware.md).

The deployment declares Python 3.11, a 600-second timeout, and environment references for the alert store and delivery configuration. These are Terraform desired-state settings, not evidence of a live deployment.

# Triggers

An enabled EventBridge schedule is configured at a one-minute rate and targets the primary Lambda.

# Embedded Knowledge

| Name | Role | Kind | Technology | Exact sources |
|---|---|---|---|---|
| alert-event-store | State storage is internal to the processing function. | database-table | aws / dynamodb; terraform:aws_dynamodb_table | tf_event_store: `repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L246-L273` |
| secondary-region-function | Optional regional redundancy is deployment detail of the processing function. | runtime-function | aws / lambda; terraform:aws_lambda_function | tf_secondary_lambda: `repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L705-L753` |
| primary-lambda-schedule | Enabled one-minute EventBridge schedule targets the primary Lambda. | schedule | aws / EventBridge; terraform:aws_cloudwatch_event_rule | tf_primary_schedule: `repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L756-L782` |

# Failure Behavior

The available Terraform evidence establishes the invocation permission and target binding, but does not document retry, dead-letter, or alert-delivery failure handling as a deployed operational contract.

# Limitations

The optional secondary-region Lambda and DynamoDB variants remain embedded because the source presents them as deployment details of this processing boundary. No deployed account, region, function ARN, or configured endpoint is asserted.
