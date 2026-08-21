---
type: Database Table
title: Health event state
description: identifies persisted state used by the processor
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T08:42:17.519Z
sources:
  - id: res_ddb_table
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L246-L273
  - id: res_lambda_primary
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L656-L702
agentbase:
  technology:
    provider: aws
    product: dynamodb
    sourceTool: terraform
    resourceType: aws_dynamodb_table
---

# Purpose

This table is declared as durable state for processed health events. Its Terraform definition uses `arn` as the hash key and enables a `ttl` attribute, providing independent value for operational and lifecycle navigation.

# Data

The declared table schema exposes an `arn` string key. The declared TTL attribute is `ttl`; no current records, table name, account, or deployed region are evidenced.

# Access

The repository's processing runtime is configured with a `DYNAMODB_TABLE` environment variable, but this partial ingest does not claim a live binding or deployment.

# Operations

The source declares either a single-region provisioned table or a multi-region global-table variant depending on configuration. These are desired-state alternatives, not deployed-state assertions.

# Limitations

This concept intentionally captures the table boundary only. No independent database, deployment, owner, or runtime contract is evidenced sufficiently to link here.
