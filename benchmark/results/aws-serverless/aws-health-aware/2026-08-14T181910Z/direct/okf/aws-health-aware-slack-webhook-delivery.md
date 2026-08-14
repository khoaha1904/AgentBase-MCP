---
title: AWS Health Aware Slack webhook delivery
type: webhook-notification-channel
status: draft
benchmark_key: aws-health-aware-slack-webhook-delivery
repository_id: repository-aws-health-aware-779eb7e1bc7a
provider: Slack
supported_webhook_paths:
  - services
  - triggers
  - workflows
sources:
  - repository://repository-aws-health-aware-779eb7e1bc7a/handler.py#L121-L145
  - repository://repository-aws-health-aware-779eb7e1bc7a/handler.py#L280-L294
relationships: []
---

# AWS Health Aware Slack webhook delivery

Alerts are posted as JSON to configured Slack webhook URLs whose path is `services`, `triggers`, or `workflows`.
