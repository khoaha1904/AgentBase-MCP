---
type: Repository
title: aws-health-aware
description: Source repository aws-health-aware
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T15:43:09.299Z
sources:
  - id: sem_system_intro
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

This repository supplies the AWS Health Aware implementation and deployment templates. It defines a scheduled Lambda workload that evaluates AWS Health events, keeps event state, and sends alerts to configured destinations.

Primary Domain: [Health Operations](../domains/health-operations.md).

# Canonical Knowledge

* [AWS Health Aware](../systems/aws-health-aware.md) - System
* [AHA scheduled alert processor](../components/aha-scheduled-alert-processor.md) - Function
* [Scheduled AWS Health alert delivery](../flows/scheduled-aws-health-alert-delivery.md) - Flow

# Limitations

Deployment templates express desired configuration only. They do not establish a deployed account, region, ARN, endpoint value, or current runtime state.
