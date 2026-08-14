---
type: Terraform Module
title: AWS Health Aware Terraform deployment
description: Root Terraform configuration that provisions AWS Health Aware infrastructure.
status: draft
generated: { by: agentbase/0.0.0, at: "2026-08-14T09:16:12.713Z" }
sources:
  - id: terraform-root
    resource: repository://repository-aws-health-aware-779eb7e1bc7a/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L656-L702
---

# Purpose

This root configuration declares the primary AHA Lambda and its infrastructure dependencies.[^terraform-root]

# Resources

It contains the [primary Lambda](../aws/lambda/primary-aha.md), [DynamoDB table](../../data/tables/aha.md), and [schedule](../../events/aha-primary-schedule.md).
