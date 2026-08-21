---
type: Database Table
title: AHA event state table
description: Find the persistent event state used to suppress duplicate alert delivery.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T09:57:13.867Z
sources:
  - id: res_table_primary
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L246-L273
  - id: runtime_event_state
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L589-L699
agentbase:
  technology:
    provider: aws
    product: dynamodb
    sourceTool: terraform
    resourceType: aws_dynamodb_table
---

# Purpose

The primary event-state table stores Health event records keyed by `arn`. The alert processor reads state before writing new or materially changed event information, avoiding repeat delivery when no change is found.

# Data

The Terraform declaration uses `arn` as the hash key and enables TTL using the `ttl` attribute. The runtime writes update time, status, affected-account identifiers, and the latest event description alongside that lifecycle value.

# Ownership

The table is defined by this repository's primary Terraform deployment configuration and used by the AHA alert processor.

# Access

The handler obtains the table name from `DYNAMODB_TABLE`, calls `get_item` by event ARN, and writes records with `put_item`.

# Operations

This declaration is conditional on the secondary-region setting and specifies provisioned capacity. It is desired-state evidence only; it does not establish a live table, its name, capacity, region, or contents.
