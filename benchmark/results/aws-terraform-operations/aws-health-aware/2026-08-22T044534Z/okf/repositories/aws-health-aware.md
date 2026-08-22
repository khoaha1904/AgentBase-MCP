---
type: Repository
title: aws-health-aware
description: Source for the AWS Health Aware notification system, its Lambda workload, infrastructure definitions, and outbound event contract
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-22T04:47:22.521Z
sources:
  - id: system_purpose
    resource: repository://repository-aws-health-aware-ef3e83846625/README.md#L44-L45
  - id: system_resources
    resource: repository://repository-aws-health-aware-ef3e83846625/README.md#L59-L71
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
      commit: 928494c70a904a65b877d426516882397541eafd
      dirty: false
      dirty_digest: null
      observed_at: 2026-08-22T04:47:22.521Z
---

# Purpose

This repository implements and documents AWS Health Aware, an automated notification tool that converts AWS Health events into formatted alerts for Amazon Chime, Slack, Microsoft Teams, email, or an EventBridge-compatible endpoint.

Primary Domain: [Health Operations](../domains/health-operations.md).

# Scope

The repository contains the Python alert-processing workload, message formatting, Terraform and CloudFormation deployment definitions, and the documented AHA EventBridge event envelope. Terraform describes single- or optional multi-region operation and the supporting state, secrets, permissions, object storage, and schedule; it is desired state rather than proof of a live deployment.

# Canonical Knowledge

* [AWS Health Aware](../systems/aws-health-aware.md) - System
* [AHA alert processor](../components/aha-alert-processor.md) - Function
* [AHA EventBridge event](../interfaces/aha-eventbridge-event.md) - Interface

# Limitations

This ingest models the Terraform-defined runtime boundary and selected implementation behavior. It does not assert a deployed account, region, ARN, current configuration value, or third-party endpoint ownership, and it does not exhaustively duplicate the CloudFormation definitions.
