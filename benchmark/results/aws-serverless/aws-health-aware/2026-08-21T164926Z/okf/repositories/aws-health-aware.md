---
type: Repository
title: aws-health-aware
description: Source repository aws-health-aware
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T16:50:54.390Z
sources:
  - id: sem-system
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

Source repository for the AWS Health Aware automated alerting capability.

Primary Domain: [Health Operations](../domains/health-operations.md).

# Canonical Knowledge

* [Aws-health-aware](../systems/aws-health-aware.md) - System
* [Aws-health-alert-poller](../components/aws-health-alert-poller.md) - Function
* [Aws-health-event-state](../resources/aws-health-event-state.md) - Resource
* [Aws-health-alerting-flow](../flows/aws-health-alerting-flow.md) - Flow

# Scope and Limitations

This initial ingest models the Terraform-backed primary Lambda, its event-state resource, and the scheduled processing path. Optional notification endpoints, Secrets Manager records, S3 inputs, secondary-region variants, and CloudFormation deployment alternatives are embedded or out of scope rather than standalone concepts.
