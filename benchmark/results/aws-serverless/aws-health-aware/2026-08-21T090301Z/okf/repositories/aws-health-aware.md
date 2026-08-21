---
type: Repository
title: aws-health-aware
description: Source repository aws-health-aware
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T09:04:25.165Z
sources:
  - id: sem_runtime
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L94-L113
  - id: res_lambda
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L655-L702
  - id: res_schedule
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L755-L782
  - id: res_bucket
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L193-L206
  - id: owner-domain
    resource: agentbase://owner-guidance/domains/health-operations
relationships:
  - kind: part-of
    target: domains/health-operations
    evidence:
      - owner-domain
agentbase:
  repository:
    id: repository-aws-health-aware-ef3e83846625
    display_name: aws-health-aware
    aliases:
      remotes:
        - https://github.com/aws-samples/aws-health-aware
      root_commits:
        - 928494c70a904a65b877d426516882397541eafd
---

# Purpose

This repository contains source and desired-state deployment definitions for a scheduled health-alert processor. The processor retrieves health events, records prior event state, and routes alerts to configured endpoints.

Primary Domain: [Health Operations](../domains/health-operations.md).

Terraform supports optional object storage for a CSV of account IDs excluded from alerting. These declarations do not prove deployed resources, a current account or region, endpoint values, or runtime status.

# Canonical Knowledge

* [AHA scheduled health alert processor](../components/aha-scheduled-health-alert-processor.md) - Function
* [AHA account exclusion object storage](../resources/aha-account-exclusion-object-storage.md) - Object Storage
