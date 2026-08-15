---
title: AHA EventBridge Bus Name Secret
type: aws-secretsmanager-secret
status: draft
description: Optional Secrets Manager secret named EventBusName that stores the configured target EventBridge bus name.
benchmark_key: aha-eventbridge-bus-name-secret
sources:
  - repository://repository-aws-health-aware-779eb7e1bc7a/CFN_DEPLOY_AHA.yml#L595-L610
  - repository://repository-aws-health-aware-779eb7e1bc7a/handler.py#L702-L730
relationships: []
---
# AHA EventBridge Bus Name Secret

The conditional secret stores the target event-bus name used by the AHA Notification Lambda.

The target event bus is supplied as a deployment parameter and is not created by this repository.
