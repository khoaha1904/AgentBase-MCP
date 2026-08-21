---
type: Repository
title: aws-health-aware
description: Source repository aws-health-aware
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T13:31:07.473Z
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

Source repository for AWS Health Aware, an automated AWS Health alert-notification capability.

Primary Domain: [Health Operations](../domains/health-operations.md).

# Canonical Knowledge

* [Aws-health-aware](../systems/aws-health-aware.md) - System
* [Health Alert Processor](../components/health-alert-processor.md) - Function
