---
title: AHA health event state table
description: DynamoDB table that stores AWS Health event ARNs, update state, and TTL values.
type: Database Table
status: draft
generated:
  by: agentbase/3.0.0
  at: 2026-08-14T00:00:00Z
benchmark_key: aha-health-event-state-table
resource_name: aws_dynamodb_table.AHA-DynamoDBTable
keys:
  - arn
sources:
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L245-L273
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/handler.py#L589-L635
relationships:
  - kind: accessed-by
    target: aha-scheduled-health-lambda
---

# Data

The single-region DynamoDB resource uses `arn` as its hash key and enables TTL using the `ttl` attribute. The handler stores an event ARN, last-update time, status, affected accounts, description, and TTL for new records.

# Ownership

[AHA Terraform deployment configuration](../../infrastructure/terraform/deploy-aha.md) declares this table resource.

# Access

[AHA scheduled health Lambda](../../infrastructure/aws/lambda/aha-scheduled-health-lambda.md) obtains the table name from `DYNAMODB_TABLE`, reads an event item by ARN, and writes state records.

## Sources

- `repository://repository-aws-health-aware-779eb7e1bc7a/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L245-L273`
- `repository://repository-aws-health-aware-779eb7e1bc7a/handler.py#L589-L635`
