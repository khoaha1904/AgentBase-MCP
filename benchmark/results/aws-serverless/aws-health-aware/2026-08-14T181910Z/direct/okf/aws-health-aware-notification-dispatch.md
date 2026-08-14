---
title: AWS Health Aware notification dispatch
type: notification-dispatcher
status: draft
benchmark_key: aws-health-aware-notification-dispatch
repository_id: repository-aws-health-aware-779eb7e1bc7a
sources:
  - repository://repository-aws-health-aware-779eb7e1bc7a/handler.py#L94-L183
  - repository://repository-aws-health-aware-779eb7e1bc7a/handler.py#L186-L277
relationships:
  - kind: delivers-via
    target: aws-health-aware-eventbridge-publication
  - kind: delivers-via
    target: aws-health-aware-slack-webhook-delivery
  - kind: delivers-via
    target: aws-health-aware-teams-webhook-delivery
  - kind: delivers-via
    target: aws-health-aware-ses-email-delivery
  - kind: delivers-via
    target: aws-health-aware-chime-webhook-delivery
---

# AWS Health Aware notification dispatch

The dispatcher reads optional endpoint configuration and independently delivers each alert through [EventBridge event publication](aws-health-aware-eventbridge-publication.md), [Slack webhook delivery](aws-health-aware-slack-webhook-delivery.md), [Microsoft Teams webhook delivery](aws-health-aware-teams-webhook-delivery.md), [Amazon SES email delivery](aws-health-aware-ses-email-delivery.md), and [Amazon Chime webhook delivery](aws-health-aware-chime-webhook-delivery.md).

Configured webhook URLs and the EventBridge bus name are retrieved from Secrets Manager, but actual endpoint values are deployment inputs and are not present in source.
