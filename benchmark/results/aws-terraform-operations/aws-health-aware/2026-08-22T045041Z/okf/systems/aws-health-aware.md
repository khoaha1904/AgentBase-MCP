---
type: System
title: AWS Health Aware
description: Automated collection and delivery of formatted AWS Health alerts.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-22T04:53:00.118Z
sources:
  - id: system_purpose
    resource: repository://repository-aws-health-aware-ef3e83846625/README.md#L44-L45
  - id: system_resource_summary
    resource: repository://repository-aws-health-aware-ef3e83846625/README.md#L59-L71
  - id: lambda_primary
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L655-L702
  - id: schedule_primary
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L755-L765
  - id: owner-domain
    resource: agentbase://owner-guidance/domains/health-operations
relationships:
  - kind: part-of
    target: domains/health-operations
    evidence:
      - owner-domain
  - kind: implemented-in
    target: repositories/aws-health-aware
    evidence:
      - lambda_primary
---

# Purpose

AWS Health Aware is an automated notification capability that collects AWS Health
events and sends formatted alerts to configured chat, email, or EventBridge
destinations. Its source defines a cooperating scheduled Lambda workload,
DynamoDB event state, optional endpoint secrets, and an execution role.

Primary Domain: [Health Operations](../domains/health-operations.md).
Implementation source: [aws-health-aware](../repositories/aws-health-aware.md).

# Architecture

The [AHA alert processor](../components/aha-alert-processor.md) is the system's
independently deployed runtime function. Terraform describes a primary-region
function and an optional secondary-region replica, with a scheduled trigger.
The function package contains event collection, message formatting, state
tracking, and endpoint delivery behavior.

# Interfaces

The system reads AWS Health APIs and can deliver notifications to Slack,
Microsoft Teams, Amazon Chime, email through SES, or a configured EventBridge
bus. These are conditional runtime interactions, not separately modeled
Interface concepts in this ingest.

# Embedded Resources

DynamoDB tables, EventBridge schedules, Secrets Manager entries, IAM policies,
and optional S3 exclusion-file storage are internal desired-state resources.
They are documented with the function that uses them rather than promoted as
independent Resources.

# Limitations

The repository expresses desired state and implementation behavior. It does not
prove that the system is deployed, which AWS account or region is active, which
delivery endpoints are configured, or current runtime health.
