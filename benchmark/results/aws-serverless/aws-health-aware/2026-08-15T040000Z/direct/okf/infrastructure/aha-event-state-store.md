---
title: AHA Event State Store
type: aws-dynamodb-table
status: draft
description: DynamoDB-backed event state store keyed by event ARN, with TTL for cleanup.
benchmark_key: aha-event-state-store
sources:
  - repository://repository-aws-health-aware-779eb7e1bc7a/CFN_DEPLOY_AHA.yml#L211-L257
  - repository://repository-aws-health-aware-779eb7e1bc7a/handler.py#L597-L635
relationships: []
---
# AHA Event State Store

The deployment creates either a single-region table or a multi-region global table, both keyed by `arn` with TTL on `ttl`. The Lambda records event updates here to avoid repeat notifications.

The source does not identify a deployed table name, because CloudFormation generates it.
