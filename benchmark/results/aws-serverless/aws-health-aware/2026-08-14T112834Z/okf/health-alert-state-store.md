---
title: AWS Health alert state store
type: data-store
status: draft
benchmark_key: health-alert-state-store
summary: DynamoDB storage for AWS Health alert records, keyed by event ARN and expired with a ttl attribute.
source:
  - repository://repository-aws-health-aware-779eb7e1bc7a/CFN_DEPLOY_AHA.yml#L210-L257
relationships:
  - kind: depended_on_by
    target: scheduled-health-alert-worker
---

# AWS Health alert state store

The deployment chooses a regional DynamoDB table or a multi-region global table. Both model records by `arn`; TTL uses the `ttl` attribute.

This store is used by the [scheduled AWS Health alert worker](scheduled-health-alert-worker.md).
