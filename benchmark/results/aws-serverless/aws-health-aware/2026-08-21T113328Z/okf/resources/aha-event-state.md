---
type: Database Table
title: Aha-event-state
description: Health event update state
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T11:35:09.021Z
sources:
  - id: res_dynamodb
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L246-L273
  - id: sem_ddb_state
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L615-L699
agentbase:
  technology:
    provider: aws
    product: dynamodb
    sourceTool: terraform
    resourceType: aws_dynamodb_table
---

# Purpose

This table is the desired persistent state boundary for health-event updates. It uses an `arn` hash key and an enabled `ttl` attribute. [Terraform declaration](repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L246-L273)

# Data

The handler gets a record by event ARN and writes the last update, status, affected account IDs, description, and expiry fields to suppress unchanged alerts. [Handler access](repository://repository-aws-health-aware-ef3e83846625/handler.py#L615-L699)

# Operations

The primary table declaration applies only when no secondary region is configured. A separate global-table declaration exists for a secondary-region configuration and is intentionally not represented as a second concept.

# Limitations

The table name is constructed from variables and a generated suffix; no live table identity or deployment state is recorded.
