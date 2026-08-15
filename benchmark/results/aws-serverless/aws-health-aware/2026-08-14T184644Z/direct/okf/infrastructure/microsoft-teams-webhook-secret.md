---
title: Microsoft Teams Webhook Secret
type: aws-secrets-manager-secret
status: draft
benchmark_key: microsoft-teams-webhook-secret
sources:
  - repository://repository-aws-health-aware-779eb7e1bc7a/CFN_DEPLOY_AHA.yml#L563-L578
relationships: []
---

# Microsoft Teams Webhook Secret

`MicrosoftChannelSecret` conditionally stores the deployment-supplied Microsoft Teams webhook URL as `MicrosoftChannelID`.
