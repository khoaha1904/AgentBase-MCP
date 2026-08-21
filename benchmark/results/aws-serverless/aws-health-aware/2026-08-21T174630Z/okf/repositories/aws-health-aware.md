---
type: Repository
title: aws-health-aware
description: Source repository aws-health-aware
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T17:48:49.794Z
sources:
  - id: readme_introduction
    resource: repository://repository-aws-health-aware-ef3e83846625/README.md#L44-L45
  - id: readme_architecture
    resource: repository://repository-aws-health-aware-ef3e83846625/README.md#L59-L68
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

This repository implements the AWS Health Aware alerting system and its Terraform deployment definitions.

Primary Domain: [Health Operations](../domains/health-operations.md).

# Canonical Knowledge

* [AWS Health Aware](../systems/aws-health-aware.md) - System
* [AHA scheduled alert processor](../components/aha-scheduled-alert-processor.md) - Function
* [AHA event state table](../resources/aha-event-state-table.md) - Resource
* [Scheduled health-alert processing](../flows/scheduled-health-alert-processing.md) - Flow

# Limitations

This initial ingest is intentionally Terraform-focused. Source evidence does not establish deployed cloud accounts, regions, ARNs, schedules, or endpoint selections.
