---
title: AWS Health Aware repository
description: Source repository for the AWS Health Aware automated AWS Health notification tool.
type: Repository
status: draft
generated:
  by: agentbase/3.0.0
  at: 2026-08-15T00:00:00Z
benchmark_key: aws-health-aware-repository
sources:
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/README.md#L44-L45
---

# Purpose

AWS Health Aware (AHA) is an automated notification tool for AWS Health alerts, with documented Chime, Slack, Microsoft Teams, email, and EventBridge-compatible delivery options.

# Structure

The deployable infrastructure is represented by the [Terraform deployment module](infrastructure/terraform/deploy-aha.md).

# Entry Points

The deployment module declares scheduled Lambda functions whose configured source handler is `handler.main`.
