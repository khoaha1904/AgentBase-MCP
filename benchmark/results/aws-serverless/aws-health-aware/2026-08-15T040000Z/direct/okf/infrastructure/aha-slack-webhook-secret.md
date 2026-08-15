---
title: AHA Slack Webhook Secret
type: aws-secretsmanager-secret
status: draft
description: Optional Secrets Manager secret named SlackChannelID that stores the Slack webhook URL.
benchmark_key: aha-slack-webhook-secret
sources:
  - repository://repository-aws-health-aware-779eb7e1bc7a/CFN_DEPLOY_AHA.yml#L579-L594
  - repository://repository-aws-health-aware-779eb7e1bc7a/handler.py#L702-L730
relationships: []
---
# AHA Slack Webhook Secret

The conditional secret stores the Slack webhook used by the AHA Notification Lambda.
