---
type: Database Table
title: AWS Health Aware DynamoDB table
description: Conditional single-region or global DynamoDB storage used by AWS Health Aware.
status: draft
generated: { by: agentbase/0.0.0, at: "2026-08-14T09:16:12.713Z" }
sources:
  - id: table-resources
    resource: repository://repository-aws-health-aware-779eb7e1bc7a/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L245-L306
---

# Data

Terraform declares mutually conditional single-region and global DynamoDB table resources with `arn` as their hash key.[^table-resources]

# Access

The [primary Lambda](../../infrastructure/aws/lambda/primary-aha.md) receives the table name through `DYNAMODB_TABLE` and depends on the table resources.
