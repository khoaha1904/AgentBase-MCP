---
title: Slack Webhook Secret
type: aws-secrets-manager-secret
status: draft
benchmark_key: slack-webhook-secret
sources:
  - repository://repository-aws-health-aware-779eb7e1bc7a/CFN_DEPLOY_AHA.yml#L579-L594
relationships: []
---

# Slack Webhook Secret

`SlackChannelSecret` conditionally stores the deployment-supplied Slack webhook URL as `SlackChannelID`.
