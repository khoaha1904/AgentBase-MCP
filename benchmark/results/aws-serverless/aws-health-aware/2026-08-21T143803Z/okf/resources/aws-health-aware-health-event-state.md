---
type: Resource
title: AWS Health Event State
description: DynamoDB-backed state store for processed AWS Health event records.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T14:39:33.937Z
sources:
  - id: res_dynamodb_state
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L246-L273
  - id: state_usage
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L589-L699
relationships:
  - kind: part-of
    target: systems/aws-health-aware
    evidence:
      - res_dynamodb_state
  - kind: implemented-in
    target: repositories/aws-health-aware
    evidence:
      - res_dynamodb_state
agentbase:
  technology:
    kind: database-table
    provider: aws
    product: dynamodb
    sourceTool: terraform
    resourceType: aws_dynamodb_table
---

# Purpose

This DynamoDB table records AWS Health event ARNs, update metadata, status, affected account IDs, and a TTL so the poller can detect new or changed events.

It is part of [AWS Health Aware](../systems/aws-health-aware.md) and is managed by the [aws-health-aware repository](../repositories/aws-health-aware.md).

# Kind and Technology

Terraform declares a DynamoDB table keyed by `arn` with TTL on `ttl`. It conditionally selects a single-region table or a multi-region global-table configuration.

# Users

The [AWS Health Poller](../components/aws-health-aware-health-poller.md) reads and writes records before deciding whether to send an alert.

# Operations

TTL is enabled by desired-state configuration. The implementation calculates expiry using the event-search window plus one day.

# Limitations

Names, regions, and table mode depend on Terraform variables and deployment mode; this repository does not prove a running table.

# Limitations

Suggested type `Resource` is evidence-bound agent intent and requires proposal review.
