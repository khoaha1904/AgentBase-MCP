---
title: AHA global DynamoDB table
description: DynamoDB global table that stores AHA event state when a secondary region is configured.
status: draft
generated:
  by: agentbase/3.0.0
  at: 2026-08-15T00:00:00Z
sources:
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L276-L306
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/handler.py#L589-L699
type: Database Table
benchmark_key: aha-global-dynamodb-table
resource_name: aws_dynamodb_table.AHA-GlobalDynamoDBTable
keys:
  - arn
relationships:
  - kind: accessed-by
    target: aha-primary-region-lambda
---

# AHA global DynamoDB table

## Data

The table has `arn` as its string hash key, enables TTL on `ttl`, and configures a replica in the secondary region.

## Access

- Accessed by [AHA primary-region Lambda](../../infrastructure/aws/lambda/aha-primary-region.md) through the `DYNAMODB_TABLE` environment binding.

## Limitations

The resource is created only when a secondary region is configured; the table name is derived at deployment time.
