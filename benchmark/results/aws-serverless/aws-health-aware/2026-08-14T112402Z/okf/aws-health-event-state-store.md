---
title: AWS Health event state store
type: data-store
status: draft
benchmark_key: aws-health-event-state-store
sources:
  - repository://repository-aws-health-aware-779eb7e1bc7a/CFN_DEPLOY_AHA.yml#L242-L257
  - repository://repository-aws-health-aware-779eb7e1bc7a/handler.py#L589-L699
---

# AWS Health event state store

The single-region DynamoDB table keys records by event ARN and enables TTL on `ttl`. The handler reads prior records, writes new or changed event details, and suppresses delivery when no relevant update is found.

