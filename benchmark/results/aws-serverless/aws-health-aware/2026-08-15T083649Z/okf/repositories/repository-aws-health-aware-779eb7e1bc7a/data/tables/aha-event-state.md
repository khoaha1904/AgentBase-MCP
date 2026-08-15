---
title: AHA event state table
description: DynamoDB table used to persist AWS Health event state keyed by event ARN.
type: Database Table
benchmark_key: aha-event-state-table
status: draft
generated:
  by: agentbase/0.2
  at: 2026-08-15T00:00:00Z
sources:
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L246-L306
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/handler.py#L589-L699
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/README.md#L61-L67
resource_name: aws_dynamodb_table.AHA-DynamoDBTable
keys:
  - arn (String partition key)
relationships:
  - kind: accessed-by
    target: aha-scheduled-alert-processor
---
# Data

The single-region table uses `arn` as its String hash key and enables TTL on `ttl`. Runtime writes include the event ARN, update time, status, affected accounts, description, and a calculated TTL.

# Access

The [AHA scheduled alert processor](../../infrastructure/aws/lambda/aha-scheduled-alert-processor.md) reads and writes this table using the `DYNAMODB_TABLE` environment variable. The [AHA deployment Terraform module](../../infrastructure/terraform/aha-deployment.md) declares it.

# Limitations

The deployment conditionally uses `AHA-GlobalDynamoDBTable` when a secondary region is configured; this document identifies the single-region resource, whose schema is shared by the global-table variant.
