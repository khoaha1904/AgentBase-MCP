---
type: Repository
title: aws-health-aware
description: Source repository aws-health-aware
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T09:57:13.867Z
sources:
  - id: sem_system_purpose
    resource: repository://repository-aws-health-aware-ef3e83846625/README.md#L45-L45
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

This repository contains AWS Health Aware (AHA), an automated notifier for AWS Health alerts. It formats alerts for configured webhook, email, and event-routing endpoints.

Primary Domain: [Health Operations](../domains/health-operations.md).

# Boundaries

The repository includes Python alert-processing code and Terraform deployment definitions. Canonical knowledge below is deliberately limited to the independently operated primary alert processor and its event-state table.

# Limitations

Terraform records desired configuration; it does not establish that resources are deployed, nor their account, region, ARN, or current runtime values. Alternate multi-region resources and endpoint-specific integrations are not separately modeled.

# Canonical Knowledge

* [AHA alert processor](../components/aha-alert-processor.md) - Function
* [AHA event state table](../resources/aha-event-state-table.md) - Database Table
