---
type: Repository
title: aws-health-aware
description: Source repository for an automated AWS Health alert notification tool.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T07:17:27.851Z
sources:
  - id: sem_readme_purpose
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

This repository contains AWS Health Aware (AHA), an automated tool for sending formatted AWS Health alerts to configured notification endpoints.

Primary Domain: [Health Operations](../domains/health-operations.md).

# Canonical Knowledge

* [Health-alert-processor](../components/health-alert-processor.md) - Function

# Boundaries and limitations

The repository includes application code and CloudFormation/Terraform deployment definitions. Its templates describe intended resources; they do not establish a deployed account, region, ARN, endpoint configuration, or current runtime value.

The initial ingest models only the independently triggered processing Function. Stateful event tracking and secret-backed notification configuration are evidenced in source but are not independently modeled because the schema guidance did not select a provider-neutral table or secret role.
