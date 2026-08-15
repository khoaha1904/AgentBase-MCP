---
title: AHA DynamoDB table
description: DynamoDB state table for AWS Health event records and expiration.
type: Database Table
benchmark_key: aha-dynamodb-table
status: draft
generated:
  by: agentbase/3.0.0
  at: 2026-08-15T00:00:00Z
resource_name: ${var.dynamodbtable}-${random_string.resource_code.result}
keys:
  - arn (HASH)
relationships:
  - kind: accessed-by
    target: aha-lambda-function
sources:
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L246-L306
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/handler.py#L589-L699
---
# Data

The deployment creates either a single-region provisioned table or a multi-region global table. Both use `arn` as the hash key and enable TTL on `ttl`.

# Access

The [AHA Lambda function](../../infrastructure/aws/lambda/aha-lambda-function.md) obtains the table name from `DYNAMODB_TABLE`, gets an item by ARN, and writes event state including `ttl`.

# Limitations

The concrete table name is composed from an input and generated suffix; it is not fixed in source.
