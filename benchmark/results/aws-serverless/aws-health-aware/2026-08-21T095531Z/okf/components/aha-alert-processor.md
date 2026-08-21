---
type: Function
title: AHA alert processor
description: Find the runtime contract that is invoked on a schedule to process health alerts.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T09:57:13.867Z
sources:
  - id: res_function_primary
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L656-L703
  - id: runtime_entrypoint
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L1042-L1060
  - id: runtime_event_state
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L589-L699
relationships:
  - kind: implemented-in
    target: repositories/aws-health-aware
    evidence:
      - res_function_primary
  - kind: writes-to
    target: resources/aha-event-state-table
    evidence:
      - runtime_event_state
agentbase:
  technology:
    provider: aws
    product: lambda
    sourceTool: terraform
    resourceType: aws_lambda_function
---

# Responsibility

The primary alert processor is a Python 3.11 function with `handler.main` as its configured handler. Its Terraform definition assigns an execution role and an event-state table name through environment configuration. It is implemented in the [aws-health-aware repository](../repositories/aws-health-aware.md).

# Runtime

The entry point creates an AWS Health client and selects organization-aware or non-organization event processing based on `ORG_STATUS`. During non-organization processing it writes new or changed event state to the [AHA event state table](../resources/aha-event-state-table.md) before sending configured alerts.

# Triggers

The deployment definition binds the primary function to an enabled one-minute schedule. The schedule is not modeled as a separate Event because no independent provider-neutral Event schema was selected for this ingest.

# Failure Behavior

The handler catches DynamoDB client errors while reading state, and notification delivery paths handle HTTP and URL errors. The source does not establish retries or alerting behavior beyond those code paths.

# Limitations

This is a Terraform-defined desired-state function, not evidence of a deployed runtime or its current configuration. The optional secondary-region function is not separately modeled.
