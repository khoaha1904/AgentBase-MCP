---
type: Repository
title: aws-health-aware
description: Source repository aws-health-aware
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T11:35:09.021Z
sources:
  - id: sem_system_docs
    resource: repository://repository-aws-health-aware-ef3e83846625/README.md#L44-L45
  - id: sem_system_runtime
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L756-L795
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

This repository contains the AWS Health Aware alerting implementation and its Terraform desired-state configuration. It is associated with the owner-confirmed [Health Operations](../domains/health-operations.md) Domain.

Primary Domain: [Health Operations](../domains/health-operations.md).

# Canonical Knowledge

* [Aha-alert-processor](../components/aha-alert-processor.md) - Function
* [Aha-event-state](../resources/aha-event-state.md) - Database Table
* [Aha-account-exclusions](../resources/aha-account-exclusions.md) - Object Storage

# Limitations

Terraform declarations describe desired infrastructure only. They do not establish deployed accounts, regions, ARNs, or current runtime values. The source describes configurable external notification endpoints, but does not establish them as owned concepts.
