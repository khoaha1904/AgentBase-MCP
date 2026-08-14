---
title: AWS Health alerting Lambda
type: service
status: draft
benchmark_key: aws-health-alerting-lambda
sources:
  - repository://repository-aws-health-aware-779eb7e1bc7a/CFN_DEPLOY_AHA.yml#L643-L685
  - repository://repository-aws-health-aware-779eb7e1bc7a/handler.py#L1042-L1060
relationships:
  - kind: stores-to
    target: aws-health-event-state-store
  - kind: implements
    target: aws-health-alert-delivery
---

# AWS Health alerting Lambda

The Lambda is configured with `handler.main`. Its entry point selects the account or organization AWS Health query path based on `ORG_STATUS`. It persists deduplication state in the [AWS Health event state store](aws-health-event-state-store.md) and implements [AWS Health alert delivery](aws-health-alert-delivery.md).

