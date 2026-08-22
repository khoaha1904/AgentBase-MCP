---
type: Repository
title: sample-aws-devops-agent-terraform
description: Terraform repository for AWS DevOps Agent resources
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-22T15:08:53.296Z
sources:
  - id: obs-devops-repository-doc
    resource: repository://repository-sample-aws-devops-agent-terraform-602f2c2bcf7c/README.md#L1-L7
  - id: owner-domain
    resource: agentbase://owner-guidance/domains/cloud-operations
relationships:
  - kind: part-of
    target: domains/cloud-operations
    evidence:
      - owner-domain
agentbase:
  repository:
    id: repository-sample-aws-devops-agent-terraform-602f2c2bcf7c
    display_name: sample-aws-devops-agent-terraform
    aliases:
      remotes:
        - https://github.com/aws-samples/sample-aws-devops-agent-terraform
      root_commits:
        - 5e3914988783616a11aa9c622b5d9e173c7e33df
    observed_source:
      commit: 5ba5f4a2561e37d392ffdffc81fd999961956472
      dirty: false
      dirty_digest: null
      observed_at: 2026-08-22T15:08:53.296Z
---

# Purpose

This repository defines Terraform desired state for an AWS DevOps Agent
monitoring setup, including a central agent space, account associations, access
roles, and optional external-service integrations.

Primary Domain: [Cloud Operations](../domains/cloud-operations.md).

# Source Structure

`devops-agent.tf` defines the central agent space and AWS account associations;
`iam.tf` and `service-account.tf` define access paths; `integrations.tf` and
`secrets-manager.tf` define optional external-service registration patterns.

# Build and Test

The documented workflow uses Terraform initialization, planning, and apply. This
ingest did not execute Terraform or any provider command, and it found no
repository-local automated test suite in the indexed source.

# Canonical Knowledge

* [AWS DevOps Agent Monitoring](../systems/aws-devops-agent-monitoring.md) - System
* [AWS DevOps Agent Space](../resources/aws-devops-agent-space.md) - Resource

# Limitations

The repository records configurable desired state. It does not prove that an
agent space, association, role, Lambda, integration, account, or region currently
exists.
