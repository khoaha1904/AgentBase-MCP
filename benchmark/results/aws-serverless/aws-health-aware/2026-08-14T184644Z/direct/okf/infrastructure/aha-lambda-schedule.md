---
title: AHA Lambda Schedule
type: amazon-eventbridge-schedule
status: draft
benchmark_key: aha-lambda-schedule
sources:
  - repository://repository-aws-health-aware-779eb7e1bc7a/CFN_DEPLOY_AHA.yml#L547-L562
relationships:
  - kind: triggers
    target: aha-lambda-function
---

# AHA Lambda Schedule

`LambdaSchedule` is an enabled EventBridge rule with `rate(1 minute)` that targets the [AHA Lambda Function](aha-lambda-function.md).
