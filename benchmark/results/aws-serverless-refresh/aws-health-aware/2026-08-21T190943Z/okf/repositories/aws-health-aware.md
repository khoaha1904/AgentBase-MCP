---
type: Repository
title: aws-health-aware
description: Repository boundary for the AHA source and its Terraform deployment definition.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T17:53:07.926Z
sources:
  - id: obs_repository
    resource: repository://repository-aws-health-aware-ef3e83846625/README.md#L43-L45
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
    observed_source:
      commit: 02df3172d2d4421c1fbf804dba53baa726068f5d
      dirty: false
      dirty_digest: null
      observed_at: 2026-08-21T19:10:21.257Z
---

# Purpose

Repository boundary for the AHA source and its Terraform deployment definition.

Primary Domain: [Health Operations](../domains/health-operations.md).

# Canonical Knowledge

* [Aws-health-aware](../systems/aws-health-aware.md) - System
* [Aha-health-alert-processor](../components/aha-health-alert-processor.md) - Function
