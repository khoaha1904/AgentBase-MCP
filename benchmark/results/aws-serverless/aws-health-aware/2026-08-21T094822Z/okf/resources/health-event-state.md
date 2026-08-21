---
type: Database Table
title: Health-event-state
description: Persistent state boundary for deduplicating and tracking health-event updates.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T09:49:52.132Z
sources:
  - id: res_table
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L246-L273
  - id: sem_table
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L473-L585
agentbase:
  technology:
    provider: aws
    product: dynamodb
    sourceTool: terraform
    resourceType: aws_dynamodb_table
---

# Purpose

This table is the persistent state boundary for health-event records keyed by ARN. Terraform declares the `arn` key and a `ttl` attribute; the handler uses the table selected by `DYNAMODB_TABLE` to identify existing events and write update state. [res_table] [sem_table]

# Data and operations

The implementation reads an item by `arn` and writes event status, update time, affected accounts, description, and a calculated TTL. This describes application behavior, not a complete externally enforced schema. [sem_table]

# Ownership

The table is declared alongside the scheduled alert-processing runtime in this repository. It may be created as either a single-region table or a multi-region global-table variant depending on Terraform inputs; this concept intentionally does not claim a deployed variant. [res_table]

# Limitations

No deployed table name, account, region, table contents, or retention outcome is evidenced.
