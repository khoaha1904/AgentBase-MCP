---
title: AHA Health Event Schedule
type: aws-eventbridge-rule
status: draft
description: Enabled EventBridge rule that invokes the AHA notification Lambda every minute.
benchmark_key: aha-health-event-schedule
sources:
  - repository://repository-aws-health-aware-779eb7e1bc7a/CFN_DEPLOY_AHA.yml#L547-L555
relationships:
  - kind: triggers
    target: aha-notification-lambda
---
# AHA Health Event Schedule

This enabled rule runs at `rate(1 minute)` and targets the [AHA Notification Lambda](aha-notification-lambda.md).
