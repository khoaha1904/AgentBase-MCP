---
type: Repository
title: aws-health-aware
description: Source repository aws-health-aware
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T08:35:36.363Z
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

This repository contains AWS Health Aware, an automated tool for formatting and forwarding AWS Health alerts to configured notification endpoints. [sem_readme_purpose]

Primary Domain: [Health Operations](../domains/health-operations.md).

# Canonical Knowledge

* [AHA alert processor](../components/aha-alert-processor.md) - Function
* [AHA event history](../resources/aha-event-history.md) - Database Table
* [Excluded account IDs storage](../resources/excluded-account-ids-storage.md) - Object Storage

# Limitations

This initial ingest intentionally excludes an event concept: the README establishes the product purpose but not a named event contract with an independently evidenced producer or consumer. Terraform files describe desired state, not deployed accounts, regions, ARNs, or current runtime values.
