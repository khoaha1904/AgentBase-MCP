---
type: Function
title: Aha-health-alert-processor
description: Independently scheduled and deployed alert-processing function.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T17:53:07.926Z
sources:
  - id: obs_lambda
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L656-L702
  - id: obs_handler
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L1042-L1060
  - id: obs_schedule
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L755-L795
  - id: obs_dynamodb
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L245-L273
  - id: obs_eventbridge_delivery
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L962-L985
relationships:
  - kind: part-of
    target: systems/aws-health-aware
    evidence:
      - obs_lambda
  - kind: implemented-in
    target: repositories/aws-health-aware
    evidence:
      - obs_lambda
agentbase:
  technology:
    kind: runtime-function
    provider: aws
    product: lambda
    sourceTool: terraform
    resourceType: aws_lambda_function
---

# Responsibility

The AHA alert processor is a Python 3.11 Lambda with the `handler.main` entry point [source](repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L656-L702). Its handler obtains an AWS Health client and selects organization-aware or non-organization event processing [source](repository://repository-aws-health-aware-ef3e83846625/handler.py#L1042-L1060).

It is part of [Aws-health-aware](../systems/aws-health-aware.md) and implemented in [aws-health-aware](../repositories/aws-health-aware.md).

# Runtime

The primary deployment defines a 600-second timeout and an environment-configured alert scope and destinations. Those fields are configuration references, not statements of the current runtime configuration [source](repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L656-L702).

# Triggers

Terraform configures an enabled default-bus schedule at `rate(5 minutes)` and targets the primary Lambda. It also grants the EventBridge service principal permission to invoke that function [source](repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L755-L795).

# Embedded Knowledge

| Name | Role | Kind | Technology | Exact sources |
|---|---|---|---|---|
| AHA DynamoDB event state | Desired-state event state table, keyed by event ARN, with TTL enabled. | database-table | aws / dynamodb; terraform:aws_dynamodb_table | [source](repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L245-L273) |
| Five-minute EventBridge schedule | Desired-state scheduled trigger and target binding for the primary Lambda. | schedule | aws / EventBridge; terraform:aws_cloudwatch_event_rule | [source](repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L755-L795) |
| Optional EventBridge delivery | The handler builds AHA Event entries and calls `put_events` against the supplied event bus. | external delivery | aws / EventBridge; Python implementation | [source](repository://repository-aws-health-aware-ef3e83846625/handler.py#L962-L985) |

# Failure Behavior

The source demonstrates Health-event processing and persistence, but does not provide a bounded, source-backed retry or dead-letter contract for this function.

# Limitations

The primary Terraform definition is modeled; the optional secondary-region deployment and CloudFormation alternatives are not separately represented. Desired state does not prove that any function, schedule, table, secret, or outbound endpoint is deployed.
