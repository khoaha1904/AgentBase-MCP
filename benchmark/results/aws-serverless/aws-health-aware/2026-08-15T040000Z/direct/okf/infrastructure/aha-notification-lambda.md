---
title: AHA Notification Lambda
type: aws-lambda-function
status: draft
description: Lambda function that polls AWS Health events, persists event state, and sends configured notifications.
benchmark_key: aha-notification-lambda
sources:
  - repository://repository-aws-health-aware-779eb7e1bc7a/CFN_DEPLOY_AHA.yml#L643-L685
  - repository://repository-aws-health-aware-779eb7e1bc7a/handler.py#L94-L183
  - repository://repository-aws-health-aware-779eb7e1bc7a/handler.py#L1042-L1060
relationships:
  - kind: uses
    target: aha-event-state-store
  - kind: uses
    target: aha-lambda-execution-role
  - kind: uses
    target: aha-microsoft-teams-webhook-secret
  - kind: uses
    target: aha-slack-webhook-secret
  - kind: uses
    target: aha-eventbridge-bus-name-secret
  - kind: uses
    target: aha-chime-webhook-secret
  - kind: uses
    target: aha-management-role-secret
---
# AHA Notification Lambda

The function runs `handler.main`, selects organization or non-organization AWS Health polling, and delivers configured notifications. It uses the [AHA Event State Store](aha-event-state-store.md), [AHA Lambda Execution Role](aha-lambda-execution-role.md), [AHA Microsoft Teams Webhook Secret](aha-microsoft-teams-webhook-secret.md), [AHA Slack Webhook Secret](aha-slack-webhook-secret.md), [AHA EventBridge Bus Name Secret](aha-eventbridge-bus-name-secret.md), [AHA Chime Webhook Secret](aha-chime-webhook-secret.md), and [AHA Management Role Secret](aha-management-role-secret.md).

Webhook, EventBridge, and cross-account-role configuration is conditional; the source does not establish any concrete external endpoint or target event bus.
