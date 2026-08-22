---
type: Repository
title: aws-health-aware
description: source repository for AWS Health Aware
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-22T15:06:13.087Z
sources:
  - id: obs-aha-repository-doc
    resource: repository://repository-aws-health-aware-ef3e83846625/README.md#L44-L45
  - id: owner-domain
    resource: agentbase://owner-guidance/domains/cloud-operations
relationships:
  - kind: part-of
    target: domains/cloud-operations
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
      commit: 928494c70a904a65b877d426516882397541eafd
      dirty: false
      dirty_digest: null
      observed_at: 2026-08-22T15:06:13.087Z
---

# Purpose

This repository contains the source and deployment definitions for AWS Health
Aware, an automated tool that turns AWS Health events into formatted operational
notifications.

Primary Domain: [Cloud Operations](../domains/cloud-operations.md).

# Source Structure

`handler.py` contains the scheduled processing entry point and delivery logic,
while `messagegenerator.py` builds channel-specific payloads. CloudFormation and
Terraform definitions describe optional single- and multi-region deployments.

# Build and Test

The reviewed source documents CloudFormation and Terraform deployment paths. No
repository-local automated test contract was established by this bounded ingest.

# Canonical Knowledge

* [AWS Health Aware](../systems/aws-health-aware.md) - System
* [AWS Health Alert Delivery](../components/aws-health-alert-delivery.md) - Component

# Limitations

Repository evidence describes intended source behavior and desired infrastructure;
it does not establish that any AWS environment is currently deployed or healthy.
