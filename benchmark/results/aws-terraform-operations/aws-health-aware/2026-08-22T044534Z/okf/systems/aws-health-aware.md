---
type: System
title: AWS Health Aware
description: Collects AWS Health events, tracks changes, and routes formatted alerts to configured endpoints
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-22T04:47:22.521Z
sources:
  - id: system_purpose
    resource: repository://repository-aws-health-aware-ef3e83846625/README.md#L44-L45
  - id: system_resources
    resource: repository://repository-aws-health-aware-ef3e83846625/README.md#L59-L71
  - id: owner-domain
    resource: agentbase://owner-guidance/domains/health-operations
  - id: management_role
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_MGMT_ROLE/Terraform_MGMT_ROLE.tf#L43-L89
  - id: member_account_deployment
    resource: repository://repository-aws-health-aware-ef3e83846625/README.md#L384-L410
relationships:
  - kind: part-of
    target: domains/health-operations
    evidence:
      - owner-domain
  - kind: implemented-in
    target: repositories/aws-health-aware
    evidence:
      - system_purpose
---

# Purpose

AWS Health Aware is an automated health-notification capability. Its scheduled workload reads AWS Health events, records event identity and updates, and sends formatted notifications to any configured Chime, Slack, Microsoft Teams, email, or EventBridge endpoint.

Primary Domain: [Health Operations](../domains/health-operations.md).

Implementation source: [aws-health-aware](../repositories/aws-health-aware.md).

# Architecture

The [AHA alert processor](../components/aha-alert-processor.md) is the system's runtime boundary. Terraform can create one primary and an optional secondary regional instance of that workload. The system keeps ordinary deployment infrastructure embedded: DynamoDB event state, Secrets Manager entries for endpoint configuration, optional S3 objects for account exclusions, the Lambda execution role, and EventBridge schedule rules.

Organization mode can run in a management or delegated-administrator account. An alternative member-account deployment uses an independently applied Terraform module to create a management-account IAM role, then supplies that role reference to the AHA deployment. The role remains embedded here because it is supporting infrastructure rather than an independently owned software capability.

# Interfaces

When EventBridge delivery is configured, the processor publishes the documented [AHA EventBridge event](../interfaces/aha-eventbridge-event.md). Webhook and email destinations are external configuration choices whose implementations are outside this repository.

# Operations

The repository identifies the Lambda log group as the first place to investigate malformed or missing events. Terraform definitions express desired deployment variants only; this knowledge does not claim that either region, organization mode, or any endpoint is currently active.

# Limitations

No deployed account, region, resource identifier, endpoint configuration, or operational status is evidenced. CloudFormation is present but was not exhaustively modeled in this Terraform-first ingest.
