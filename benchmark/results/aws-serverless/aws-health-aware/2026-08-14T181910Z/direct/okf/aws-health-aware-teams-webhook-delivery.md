---
title: AWS Health Aware Microsoft Teams webhook delivery
type: webhook-notification-channel
status: draft
benchmark_key: aws-health-aware-teams-webhook-delivery
repository_id: repository-aws-health-aware-779eb7e1bc7a
provider: Microsoft Teams
webhook_url_requirement: contains office.com/webhook
sources:
  - repository://repository-aws-health-aware-779eb7e1bc7a/handler.py#L146-L159
  - repository://repository-aws-health-aware-779eb7e1bc7a/handler.py#L312-L325
relationships: []
---

# AWS Health Aware Microsoft Teams webhook delivery

Alerts are posted as JSON to a configured Microsoft Teams webhook URL containing `office.com/webhook`.
