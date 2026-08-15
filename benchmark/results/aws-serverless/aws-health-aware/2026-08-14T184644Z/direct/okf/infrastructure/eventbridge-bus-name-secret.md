---
title: EventBridge Bus Name Secret
type: aws-secrets-manager-secret
status: draft
benchmark_key: eventbridge-bus-name-secret
sources:
  - repository://repository-aws-health-aware-779eb7e1bc7a/CFN_DEPLOY_AHA.yml#L595-L610
relationships: []
---

# EventBridge Bus Name Secret

`EventBusNameSecret` conditionally stores the deployment-supplied EventBridge bus name as `EventBusName`.

Limitation: the destination event bus is referenced by name and is not created by this template.
