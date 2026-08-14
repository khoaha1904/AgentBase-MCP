---
title: AWS Health Aware event state table
type: aws-dynamodb-table
status: draft
benchmark_key: aws-health-aware-event-state
repository_id: repository-aws-health-aware-779eb7e1bc7a
partition_key: arn
ttl_attribute: ttl
multi_region_option: AWS::DynamoDB::GlobalTable
sources:
  - repository://repository-aws-health-aware-779eb7e1bc7a/CFN_DEPLOY_AHA.yml#L211-L257
  - repository://repository-aws-health-aware-779eb7e1bc7a/handler.py#L588-L697
relationships: []
---

# AWS Health Aware event state table

The table is keyed by the AWS Health event ARN and has TTL enabled. The poller records an event’s last update, status, affected accounts, and latest description; it emits notifications only for new or changed state.

The deployment selects either a regional DynamoDB table or a two-replica global table, so no concrete physical table name or region is available.
