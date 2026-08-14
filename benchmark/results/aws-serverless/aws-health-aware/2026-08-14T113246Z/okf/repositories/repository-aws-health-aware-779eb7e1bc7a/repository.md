---
title: AWS Health Aware repository
description: Source repository for the AWS Health Aware notification tool and its deployment templates.
type: Repository
status: draft
generated:
  by: agentbase/3.0.0
  at: 2026-08-14T00:00:00Z
benchmark_key: aws-health-aware-repository
sources:
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/README.md#L44-L45
relationships: []
---

# Purpose

AWS Health Aware is an automated tool for sending formatted AWS Health alerts to configured communication endpoints.

# Structure

The repository contains Python handler code and a Terraform deployment root.

# Entry Points

The deployed Lambda is configured with `handler.main`; the infrastructure declaration identifies that handler.

## Sources

- `repository://repository-aws-health-aware-779eb7e1bc7a/README.md#L44-L45`
- `repository://repository-aws-health-aware-779eb7e1bc7a/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L655-L669`
