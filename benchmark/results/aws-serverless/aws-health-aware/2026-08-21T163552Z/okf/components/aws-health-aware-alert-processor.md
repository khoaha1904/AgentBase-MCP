---
type: Function
title: Aws-health-aware-alert-processor
description: The independently deployed scheduled function that processes health events and delivers notifications.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T16:37:26.989Z
sources:
  - id: tf_lambda_primary
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L656-L702
  - id: sem_lambda_main
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L1042-L1114
  - id: tf_dynamodb
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L246-L273
  - id: tf_schedule
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L756-L795
  - id: sem_delivery
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L94-L183
relationships:
  - kind: part-of
    target: systems/aws-health-aware
    evidence:
      - tf_lambda_primary
  - kind: implemented-in
    target: repositories/aws-health-aware
    evidence:
      - sem_lambda_main
agentbase:
  technology:
    kind: runtime-function
    provider: aws
    product: lambda
    sourceTool: terraform
    resourceType: aws_lambda_function
---

# Responsibility

This independently deployed Lambda runs `handler.main` and processes AWS Health event activity before sending configured notifications ([tf_lambda_primary](repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L656-L702); [sem_lambda_main](repository://repository-aws-health-aware-ef3e83846625/handler.py#L1042-L1114)). It is part of [Aws-health-aware](../systems/aws-health-aware.md) and implemented in [aws-health-aware](../repositories/aws-health-aware.md).

# Runtime

Terraform specifies the `python3.11` runtime, a 600-second timeout, and deployment from a locally generated archive. These are desired-state configuration references, not observations of a running function ([tf_lambda_primary](repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L656-L702)).

# Triggers

An enabled EventBridge rule uses `rate(1 minute)`, targets the primary Lambda, and is granted permission to invoke it ([tf_schedule](repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L756-L795)).

# Embedded Resources

The function’s embedded event-state table is a Terraform DynamoDB table keyed by `arn` with TTL enabled on `ttl`; it is used by the handler to compare and store event updates ([tf_dynamodb](repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L246-L273); [sem_lambda_main](repository://repository-aws-health-aware-ef3e83846625/handler.py#L1042-L1114)). The schedule and configured Secrets Manager-backed delivery settings remain embedded because they do not have separately evidenced query value in this bounded ingest.

# Failure Behavior

Delivery code catches HTTP and URL errors for EventBridge, Slack, Teams, email, and Chime attempts; it logs the failures and continues rather than surfacing a separate retry contract ([sem_delivery](repository://repository-aws-health-aware-ef3e83846625/handler.py#L94-L183)).

# Limitations

The source shows optional secondary-region resources but this concept represents the primary Terraform deployment boundary. It does not establish deployed configuration values, endpoint URLs, account identifiers, or live delivery status.
