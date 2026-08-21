---
type: Function
title: Aha-alert-processor
description: Scheduled health-alert processing runtime
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T11:35:09.021Z
sources:
  - id: res_lambda_primary
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L656-L702
  - id: sem_handler_main
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L1042-L1060
  - id: sem_ddb_access
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L615-L699
  - id: sem_s3_access
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L988-L999
relationships:
  - kind: reads-from
    target: resources/aha-account-exclusions
    evidence:
      - sem_s3_access
  - kind: writes-to
    target: resources/aha-event-state
    evidence:
      - sem_ddb_access
  - kind: implemented-in
    target: repositories/aws-health-aware
    evidence:
      - sem_handler_main
agentbase:
  technology:
    provider: aws
    product: lambda
    sourceTool: terraform
    resourceType: aws_lambda_function
---

# Responsibility

This function runs the [aws-health-aware](../repositories/aws-health-aware.md) repository's health-event processing entry point. Its Terraform declaration binds `handler.main` to an independently scheduled runtime; the Python handler selects organization-aware or single-account processing.

# Runtime

The desired runtime is Python 3.11. Configuration is supplied through environment variables, including the table name and health-event search settings. [Terraform declaration](repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L656-L702)

# Triggers

An enabled scheduled rule invokes the primary runtime every minute. [Trigger binding](repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L756-L795)

# Interactions

The handler writes event state to [Aha-event-state](../resources/aha-event-state.md) and, when a CSV key is configured, reads account exclusions from [Aha-account-exclusions](../resources/aha-account-exclusions.md).

# Limitations

The optional secondary-region function is not modeled separately because it shares this runtime contract and is conditional. Desired-state configuration does not prove that either function is deployed.
