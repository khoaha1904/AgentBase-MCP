---
okf_version: "0.2"
---

# AWS Health Aware

* [AHA Lambda Function](infrastructure/aha-lambda-function.md) - Polls AWS Health and delivers configured alerts.
* [AHA Health Event State Store](infrastructure/aha-health-event-state-store.md) - Persists processed Health event state.
* [AHA Lambda Schedule](infrastructure/aha-lambda-schedule.md) - Invokes the alert function every minute.
* [AHA Lambda Execution Role](infrastructure/aha-lambda-execution-role.md) - Grants the alert function its AWS permissions.
* [Microsoft Teams Webhook Secret](infrastructure/microsoft-teams-webhook-secret.md) - Conditionally stores the Teams webhook URL.
* [Slack Webhook Secret](infrastructure/slack-webhook-secret.md) - Conditionally stores the Slack webhook URL.
* [EventBridge Bus Name Secret](infrastructure/eventbridge-bus-name-secret.md) - Conditionally stores the destination EventBridge bus name.
* [Amazon Chime Webhook Secret](infrastructure/amazon-chime-webhook-secret.md) - Conditionally stores the Chime webhook URL.
* [Management Account Role ARN Secret](infrastructure/management-account-role-arn-secret.md) - Conditionally stores the cross-account role ARN.
