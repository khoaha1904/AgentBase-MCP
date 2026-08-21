---
type: Repository
title: aws-health-aware
description: Source repository for the AWS Health Aware notification solution.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T14:39:33.937Z
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

This repository contains the AWS Health Aware implementation and its Terraform and CloudFormation deployment definitions.

Primary Domain: [Health Operations](../domains/health-operations.md).

# Canonical Knowledge

* [Aws-health-aware](../systems/aws-health-aware.md) - System
* [Aws-health-aware-health-poller](../components/aws-health-aware-health-poller.md) - Function
* [Aws-health-aware-health-alert-processing](../flows/aws-health-aware-health-alert-processing.md) - Flow
* [Aws-health-aware-notification-delivery](../interfaces/aws-health-aware-notification-delivery.md) - Interface
* [Aws-health-aware-health-event-state](../resources/aws-health-aware-health-event-state.md) - Resource

# Limitations

This initial ingest represents the primary scheduled Lambda workflow only. Infrastructure declarations describe desired state and do not establish deployed values.
