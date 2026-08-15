Created the OKF bundle in [okf](<OUTPUT_ROOT>/okf).

Concept keys:

- `aha-lambda-function`
- `aha-health-event-state-store`
- `aha-lambda-schedule`
- `aha-lambda-execution-role`
- `microsoft-teams-webhook-secret`
- `slack-webhook-secret`
- `eventbridge-bus-name-secret`
- `amazon-chime-webhook-secret`
- `management-account-role-arn-secret`

Unresolved limitations: physical table names are CloudFormation-generated; EventBridge destinations, third-party webhooks, and the cross-account management role are external deployment inputs, not provisioned by this repository.