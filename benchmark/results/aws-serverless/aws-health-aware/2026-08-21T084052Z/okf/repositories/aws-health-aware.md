---
type: Repository
title: aws-health-aware
description: Source repository aws-health-aware
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T08:42:17.519Z
sources:
  - id: sem_readme_intro
    resource: repository://repository-aws-health-aware-ef3e83846625/README.md#L44-L45
  - id: res_lambda_primary
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L656-L702
  - id: res_schedule
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L755-L782
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

This repository contains AWS Health Aware (AHA), documented as an automated notification tool that formats AWS Health alerts for configured chat, email, or EventBridge-compatible destinations.

Primary Domain: [Health Operations](../domains/health-operations.md).

# Boundaries and interactions

The source includes a scheduled processing runtime and infrastructure declarations for durable health-event state. The state table is represented as independently navigable knowledge because its key and retention lifecycle form a durable operational boundary. The runtime itself is not authored: catalog guidance left its provider-neutral role ambiguous between Function and Event.

# Limitations

Terraform describes desired state only. This ingest does not assert that any resource is deployed, nor does it identify a live account, region, ARN, configured destinations, or current runtime values.

# Questions

* Which provider-neutral role should represent the scheduled processing contract: Function or Event?

# Canonical Knowledge

* [Health event state](../resources/health-event-state.md) - Database Table
