---
type: Resource
title: AHA event state table
description: Operational persistence boundary for event update and TTL state.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T17:48:49.794Z
sources:
  - id: tf_dynamodb_single
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L245-L273
  - id: readme_state_table
    resource: repository://repository-aws-health-aware-ef3e83846625/README.md#L61-L64
relationships:
  - kind: part-of
    target: systems/aws-health-aware
    evidence:
      - readme_state_table
  - kind: implemented-in
    target: repositories/aws-health-aware
    evidence:
      - tf_dynamodb_single
agentbase:
  technology:
    kind: database-table
    provider: aws
    product: dynamodb
    sourceTool: terraform
    resourceType: aws_dynamodb_table
---

# Purpose

The DynamoDB table is the persistent event-state boundary for [AWS Health Aware](../systems/aws-health-aware.md), implemented in [aws-health-aware](../repositories/aws-health-aware.md): the documentation assigns it event ARN, update, and TTL storage.

# Kind and Technology

Terraform declares an AWS DynamoDB table keyed by `arn` with TTL enabled on `ttl`. It creates this table when no secondary region is configured; the alternative global-table declaration is embedded in the processor’s deployment variant.

# Users

[AHA scheduled alert processor](../components/aha-scheduled-alert-processor.md) reads and writes event state during Health-event collection.

# Operations

The observed Terraform configuration uses provisioned capacity and disables point-in-time recovery. These are desired-state settings, not live operational status.

# Evidence

The table declaration is in `tf_dynamodb_single`; its stated purpose is in `readme_state_table`.

# Limitations

The exact configured table name is derived from variables and a random suffix, so no stable deployed name, ARN, account, or region is recorded. Multi-region state storage is not separately promoted.
