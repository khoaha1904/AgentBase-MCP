---
title: AWS Health Aware Amazon Chime webhook delivery
type: webhook-notification-channel
status: draft
benchmark_key: aws-health-aware-chime-webhook-delivery
repository_id: repository-aws-health-aware-779eb7e1bc7a
provider: Amazon Chime
webhook_url_requirement: contains hooks.chime.aws/incomingwebhooks
sources:
  - repository://repository-aws-health-aware-779eb7e1bc7a/handler.py#L170-L183
  - repository://repository-aws-health-aware-779eb7e1bc7a/handler.py#L296-L309
relationships: []
---

# AWS Health Aware Amazon Chime webhook delivery

Alerts are wrapped as `Content` JSON and posted to a configured Amazon Chime incoming-webhook URL.
