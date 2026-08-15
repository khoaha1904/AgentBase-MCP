---
title: AHA Microsoft Teams Webhook Secret
type: aws-secretsmanager-secret
status: draft
description: Optional Secrets Manager secret named MicrosoftChannelID that stores the Microsoft Teams webhook URL.
benchmark_key: aha-microsoft-teams-webhook-secret
sources:
  - repository://repository-aws-health-aware-779eb7e1bc7a/CFN_DEPLOY_AHA.yml#L563-L578
  - repository://repository-aws-health-aware-779eb7e1bc7a/handler.py#L702-L730
relationships: []
---
# AHA Microsoft Teams Webhook Secret

The conditional secret stores the Teams webhook used by the AHA Notification Lambda.
