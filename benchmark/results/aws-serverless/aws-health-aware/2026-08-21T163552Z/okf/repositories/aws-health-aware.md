---
type: Repository
title: aws-health-aware
description: Source repository aws-health-aware
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T16:37:26.989Z
sources:
  - id: sem_system_overview
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

This repository contains the AWS Health Aware notification implementation and Terraform deployment definition. The README describes it as an automated tool for sending formatted AWS Health alerts to configured delivery endpoints ([sem_system_overview](repository://repository-aws-health-aware-ef3e83846625/README.md#L44-L45)).

Primary Domain: [Health Operations](../domains/health-operations.md).

# Canonical Knowledge

* [Aws-health-aware](../systems/aws-health-aware.md) - System
* [Aws-health-aware-alert-processor](../components/aws-health-aware-alert-processor.md) - Function

# Limitations

This repository record reflects the captured source revision only. It does not identify deployed infrastructure or customer endpoint configuration.
