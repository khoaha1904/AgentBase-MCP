---
type: Repository
title: sample-aws-devops-agent-terraform
description: Terraform source repository for an AWS DevOps Agent monitoring setup
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-22T14:41:56.965Z
sources:
  - id: devops-repo-doc
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
      observed_at: 2026-08-22T14:41:56.965Z
---

# Purpose

This repository contains Terraform configuration for deploying an AWS DevOps Agent monitoring setup, including its central Agent Space, operator app, account associations, optional third-party integrations, and optional cross-account sample resources.

Primary Domain: [Cloud Operations](../domains/cloud-operations.md).

# Source Structure

`devops-agent.tf` defines the Agent Space and AWS account associations. `iam.tf` and `service-account.tf` define access and optional cross-account resources. `integrations.tf` and `secrets-manager.tf` define opt-in third-party registrations and associations. Variables, outputs, provider constraints, and lifecycle scripts support configuration and deployment.

# Build and Test

The README requires Terraform 1.0 or newer and documents `terraform init`, `terraform plan`, and `terraform apply`, with helper scripts for deployment, post-deployment checks, and cleanup. This ingest did not execute Terraform or provider commands and does not claim that the configuration currently plans or applies successfully.

# Canonical Knowledge

* [AWS DevOps Agent monitoring](../systems/systems-aws-devops-agent-monitoring.md) - Operational monitoring system.
* [AWS DevOps Agent Space](../resources/resources-aws-devops-agent-space.md) - Central operated resource.

# Limitations

The record reflects committed desired-state configuration at the captured commit. Helper scripts, every IAM statement, and every optional integration block were not exhaustively assessed.
