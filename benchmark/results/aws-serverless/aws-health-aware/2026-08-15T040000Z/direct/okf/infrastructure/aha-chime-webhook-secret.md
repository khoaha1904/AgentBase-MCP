---
title: AHA Chime Webhook Secret
type: aws-secretsmanager-secret
status: draft
description: Optional Secrets Manager secret named ChimeChannelID that stores the Amazon Chime webhook URL.
benchmark_key: aha-chime-webhook-secret
sources:
  - repository://repository-aws-health-aware-779eb7e1bc7a/CFN_DEPLOY_AHA.yml#L611-L626
  - repository://repository-aws-health-aware-779eb7e1bc7a/handler.py#L702-L730
relationships: []
---
# AHA Chime Webhook Secret

The conditional secret stores the Amazon Chime webhook used by the AHA Notification Lambda.
