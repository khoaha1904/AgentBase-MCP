---
type: Repository
title: aws-health-aware
description: Source repository aws-health-aware
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T09:12:25.555Z
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

This repository contains AWS Health Aware (AHA), an automated tool for sending formatted AWS Health alerts to configured collaboration, email, or event-ingestion endpoints [as described by the project](repository://repository-aws-health-aware-ef3e83846625/README.md#L44-L45).

The Python entry point selects individual-account or organization-wide AWS Health event discovery based on configuration [in `main`](repository://repository-aws-health-aware-ef3e83846625/handler.py#L1042-L1060). Terraform declares the associated runtime resources; those declarations are desired state only.

Primary Domain: [Health Operations](../domains/health-operations.md).

# Canonical Knowledge

* [AHA excluded-account list storage](../resources/aha-excluded-account-list-storage.md) - Object Storage

# Limitations

Only the root Python implementation and Terraform deployment definition were reviewed. Deployment, account, region, ARNs, runtime values, and configured notification endpoints are not evidenced. The optional scheduled processor and event-state table were not authored because this proposal's available catalog mapping did not establish an unambiguous provider-neutral role.
