---
title: AWS Health Aware one-minute schedule
type: aws-eventbridge-rule
status: draft
benchmark_key: aws-health-aware-schedule
repository_id: repository-aws-health-aware-779eb7e1bc7a
schedule_expression: rate(1 minute)
state: ENABLED
sources:
  - repository://repository-aws-health-aware-779eb7e1bc7a/CFN_DEPLOY_AHA.yml#L547-L562
relationships:
  - kind: invokes
    target: aws-health-aware-poller
---

# AWS Health Aware one-minute schedule

The enabled EventBridge rule invokes the [AWS Health Aware poller](aws-health-aware-poller.md) every minute.
