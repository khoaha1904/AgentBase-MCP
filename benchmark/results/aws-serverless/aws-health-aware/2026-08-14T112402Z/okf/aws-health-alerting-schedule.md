---
title: One-minute AWS Health alerting schedule
type: infrastructure-resource
status: draft
benchmark_key: aws-health-alerting-schedule
sources:
  - repository://repository-aws-health-aware-779eb7e1bc7a/CFN_DEPLOY_AHA.yml#L547-L562
relationships:
  - kind: triggers
    target: aws-health-alerting-lambda
---

# One-minute AWS Health alerting schedule

The enabled EventBridge rule runs every minute and targets the [AWS Health alerting Lambda](aws-health-alerting-lambda.md).

