---
title: Amazon Chime Webhook Secret
type: aws-secrets-manager-secret
status: draft
benchmark_key: amazon-chime-webhook-secret
sources:
  - repository://repository-aws-health-aware-779eb7e1bc7a/CFN_DEPLOY_AHA.yml#L611-L626
relationships: []
---

# Amazon Chime Webhook Secret

`ChimeChannelSecret` conditionally stores the deployment-supplied Amazon Chime webhook URL as `ChimeChannelID`.
