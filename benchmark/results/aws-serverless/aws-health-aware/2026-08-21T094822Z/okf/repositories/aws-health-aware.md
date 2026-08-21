---
type: Repository
title: aws-health-aware
description: Source repository aws-health-aware
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T09:49:52.132Z
sources:
  - id: sem_system
    resource: repository://repository-aws-health-aware-ef3e83846625/README.md#L44-L45
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

This repository contains AWS Health Aware, an automated notifier for formatted AWS Health alerts. It is source-owned knowledge for the scheduled alert processor and its state/input storage boundaries. [sem_system]

Primary Domain: [Health Operations](../domains/health-operations.md).

# Boundaries and limitations

The repository declares a scheduled runtime function, an event-state table, and optional object storage for an account-exclusion input. The code and Terraform describe intended configuration only. They do not establish that a deployment exists, which accounts or regions it uses, its generated resource names, or current endpoint configuration.

# Canonical Knowledge

* [Health-alert-processor](../components/health-alert-processor.md) - Function
* [Health-event-state](../resources/health-event-state.md) - Database Table
* [Account-exclusion-input](../resources/account-exclusion-input.md) - Object Storage
