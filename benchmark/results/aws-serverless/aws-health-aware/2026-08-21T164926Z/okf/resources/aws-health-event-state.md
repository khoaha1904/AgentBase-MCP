---
type: Resource
title: Aws-health-event-state
description: Persistent event-state boundary used for duplicate/update detection and TTL cleanup.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T16:50:54.390Z
sources:
  - id: res-ddb
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L245-L273
  - id: sem-ddb
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L597-L635
relationships:
  - kind: part-of
    target: systems/aws-health-aware
    evidence:
      - res-ddb
  - kind: implemented-in
    target: repositories/aws-health-aware
    evidence:
      - res-ddb
agentbase:
  technology:
    kind: database-table
    provider: aws
    product: dynamodb
    sourceTool: terraform
    resourceType: aws_dynamodb_table
---

# Purpose

The Terraform configuration defines a DynamoDB table keyed by event ARN with TTL enabled. The runtime reads and writes event state to recognize new or changed AWS Health events.

Part of [AWS Health Aware](../systems/aws-health-aware.md) and implemented in the [aws-health-aware repository](../repositories/aws-health-aware.md).

# Kind and Technology

Terraform declares an AWS DynamoDB table. In the single-region configuration it uses a provisioned table; a distinct global-table declaration is used when a secondary region is configured.

# Users

* [AWS Health alert poller](../components/aws-health-alert-poller.md) reads and writes event records.

# Operations

Handler records include the event ARN, update time, status, affected accounts, description, and a TTL used for later cleanup.

# Evidence

The resource is promoted because persistent event state is an operational boundary for duplicate and update detection.

# Limitations

# Limitations

Names, capacity, region, and deployment existence remain configuration-derived and are not current runtime facts.
