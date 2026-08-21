---
type: Repository
title: aws-health-aware
description: Source repository aws-health-aware
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T15:27:08.526Z
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

This repository contains AWS Health Aware (AHA), an automated notifier for formatted AWS Health alerts to chat, email, and EventBridge-compatible destinations. [sem_system]

Primary Domain: [Health Operations](../domains/health-operations.md).

# Canonical Knowledge

* [AWS Health Aware](../systems/aws-health-aware.md) - System
* [Scheduled health alert processor](../components/scheduled-health-alert-processor.md) - Function

# Limitations

This record describes the source repository, not a deployed installation. Deployment account, region, endpoint values, and runtime configuration are not evidenced here.
