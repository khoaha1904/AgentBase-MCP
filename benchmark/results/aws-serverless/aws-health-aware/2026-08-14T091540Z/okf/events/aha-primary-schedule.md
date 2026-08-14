---
type: Event
title: Primary AWS Health Aware schedule
description: Enabled one-minute EventBridge schedule that invokes the primary AHA Lambda.
status: draft
generated: { by: agentbase/0.0.0, at: "2026-08-14T09:16:12.713Z" }
sources:
  - id: schedule
    resource: repository://repository-aws-health-aware-779eb7e1bc7a/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L755-L794
---

# Meaning

The enabled default-bus rule runs every minute.[^schedule]

# Consumers

Its event target and Lambda permission identify the [primary AHA Lambda](../infrastructure/aws/lambda/primary-aha.md) as the consumer.[^schedule]
