---
type: Function
title: Aws-health-alert-poller
description: Independently scheduled function that polls AWS Health and sends alerts.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T16:50:54.390Z
sources:
  - id: res-lambda-primary
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L656-L682
  - id: sem-handler
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L656-L682
  - id: handler-event-state
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L597-L635
  - id: handler-endpoints
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L94-L183
relationships:
  - kind: part-of
    target: systems/aws-health-aware
    evidence:
      - sem-handler
  - kind: implemented-in
    target: repositories/aws-health-aware
    evidence:
      - sem-handler
  - kind: depends-on
    target: resources/aws-health-event-state
    evidence:
      - handler-event-state
agentbase:
  technology:
    kind: runtime-function
    provider: aws
    product: lambda
    sourceTool: terraform
    resourceType: aws_lambda_function
---

# Responsibility

The primary-region Lambda deployment invokes `handler.main`; its environment identifies the event-state table and health-query settings.

Part of [AWS Health Aware](../systems/aws-health-aware.md) and implemented in the [aws-health-aware repository](../repositories/aws-health-aware.md). It depends on [AWS Health event state](../resources/aws-health-event-state.md).

# Runtime

Terraform declares the primary Lambda with `handler.main` and packages `handler.py` with `messagegenerator.py`. The scheduled trigger is modeled in the related flow.

# Embedded Resources

The function retrieves optional Slack, Teams, Chime, EventBridge, and management-role settings from Secrets Manager. It sends EventBridge, Slack, Teams, email, or Chime notifications only when each respective configuration is present. These endpoint settings and secrets are embedded because this source does not establish them as shared independently operated identities.

# Failure Behavior

Outbound delivery catches HTTP and URL errors for the supported notification paths. DynamoDB access errors are printed by the handler.

# Limitations

The function’s Terraform declaration is desired state only. Secondary-region Lambda deployment and endpoint-specific secret resources are not separately modeled.
