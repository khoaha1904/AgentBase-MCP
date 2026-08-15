---
okf_version: "0.2"
---
# AWS Health Aware

* [AHA Health Event Schedule](infrastructure/aha-health-event-schedule.md) - Runs the notification Lambda every minute.
* [AHA Notification Lambda](infrastructure/aha-notification-lambda.md) - Polls AWS Health and sends configured notifications.
* [AHA Event State Store](infrastructure/aha-event-state-store.md) - Stores event state for update deduplication.
* [AHA Lambda Execution Role](infrastructure/aha-lambda-execution-role.md) - Runtime IAM role for the notification Lambda.
* [AHA Microsoft Teams Webhook Secret](infrastructure/aha-microsoft-teams-webhook-secret.md) - Optional Microsoft Teams webhook configuration.
* [AHA Slack Webhook Secret](infrastructure/aha-slack-webhook-secret.md) - Optional Slack webhook configuration.
* [AHA EventBridge Bus Name Secret](infrastructure/aha-eventbridge-bus-name-secret.md) - Optional EventBridge bus-name configuration.
* [AHA Chime Webhook Secret](infrastructure/aha-chime-webhook-secret.md) - Optional Amazon Chime webhook configuration.
* [AHA Management Role Secret](infrastructure/aha-management-role-secret.md) - Optional cross-account role ARN configuration.
