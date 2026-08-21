---
type: Database Table
title: AHA event history
description: Persistent boundary used to retain event ARNs and updates.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T08:35:36.363Z
sources:
  - id: res_dynamodb
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L246-L273
  - id: sem_handler_ddb
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L589-L636
agentbase:
  technology:
    provider: aws
    product: dynamodb
    sourceTool: terraform
    resourceType: aws_dynamodb_table
---

# Purpose

The table is declared with `arn` as its hash key and TTL enabled through the `ttl` attribute. [res_dynamodb]

# Data

The alert processor looks up records by ARN and writes alert status, update time, affected accounts, description, and a calculated TTL. [sem_handler_ddb]

# Ownership

[AHA alert processor](../components/aha-alert-processor.md) is the documented runtime writer in this initial ingest. [sem_handler_ddb]

# Operations

Terraform declares provisioned capacity for the single-region table and an alternate global-table form when a secondary region is configured. This does not evidence that either form is deployed. [res_dynamodb]
