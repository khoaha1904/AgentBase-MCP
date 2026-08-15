---
title: AHA Lambda Function
type: aws-lambda-function
status: draft
benchmark_key: aha-lambda-function
sources:
  - repository://repository-aws-health-aware-779eb7e1bc7a/CFN_DEPLOY_AHA.yml#L643-L685
  - repository://repository-aws-health-aware-779eb7e1bc7a/handler.py#L1042-L1060
  - repository://repository-aws-health-aware-779eb7e1bc7a/README.md#L61-L71
relationships:
  - kind: uses
    target: aha-lambda-execution-role
  - kind: uses
    target: aha-health-event-state-store
  - kind: uses
    target: microsoft-teams-webhook-secret
  - kind: uses
    target: slack-webhook-secret
  - kind: uses
    target: eventbridge-bus-name-secret
  - kind: uses
    target: amazon-chime-webhook-secret
  - kind: uses
    target: management-account-role-arn-secret
---

# AHA Lambda Function

`LambdaFunction` runs `handler.main`. It selects account or organization AWS Health polling based on `ORG_STATUS`, records event state, and sends alerts to configured destinations.

It uses the [AHA Lambda Execution Role](aha-lambda-execution-role.md), [AHA Health Event State Store](aha-health-event-state-store.md), [Microsoft Teams Webhook Secret](microsoft-teams-webhook-secret.md), [Slack Webhook Secret](slack-webhook-secret.md), [EventBridge Bus Name Secret](eventbridge-bus-name-secret.md), [Amazon Chime Webhook Secret](amazon-chime-webhook-secret.md), and [Management Account Role ARN Secret](management-account-role-arn-secret.md).

Limitation: destination EventBridge buses and third-party webhook endpoints are supplied as deployment inputs; this repository does not provision them.
