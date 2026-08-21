---
type: Repository
title: aws-health-aware
description: Source for the AWS Health Aware scheduled health-alert notification capability.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T15:53:44.309Z
sources:
  - id: sem_system_purpose
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

This repository supplies the Terraform configuration and Python handler for AWS Health Aware, which formats AWS Health alerts for configured notification endpoints.

The retained knowledge is intentionally bounded to the Terraform-defined Lambda processing boundary. Deployment configuration is desired state only.

Primary Domain: [Health Operations](../domains/health-operations.md).

# Canonical Knowledge

* [Health-alert-processor](../components/health-alert-processor.md) - Function
