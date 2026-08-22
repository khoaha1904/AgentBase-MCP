---
type: Repository
title: aws-health-aware
description: Source repository for the AWS Health Aware operational notification system
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-22T14:38:56.084Z
sources:
  - id: aha-overview
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
      observed_at: 2026-08-22T14:38:56.084Z
---

# Purpose

This repository contains the AWS Health Aware implementation and its infrastructure definitions. It owns the Python event-processing runtime, message formatting, and CloudFormation and Terraform deployment material for the operational notification system.

Primary Domain: [Cloud Operations](../domains/cloud-operations.md).

# Source Structure

`handler.py` contains the Lambda entry point, AWS Health polling, retained-state updates, and destination dispatch. `messagegenerator.py` formats destination-specific messages. The repository also contains CloudFormation templates and Terraform configurations for the primary and optional secondary-region deployment variants.

# Build and Test

The README documents packaging and deployment through CloudFormation or Terraform. This bounded ingest did not identify or verify an automated test suite, so no test command is asserted.

# Canonical Knowledge

* [AWS Health Aware](../systems/systems-aws-health-aware.md) - Operational health-event notification system.
* [AWS Health Aware event processor](../components/components-aws-health-aware-event-processor.md) - Scheduled event-processing workload.

# Limitations

The repository record describes committed source at the captured commit. It does not assert that any Terraform or CloudFormation resource is deployed.
