---
type: Repository
title: aws-health-aware
description: Source repository for the AWS Health Aware alerting system.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-22T04:53:00.118Z
sources:
  - id: system_purpose
    resource: repository://repository-aws-health-aware-ef3e83846625/README.md#L44-L45
  - id: system_resource_summary
    resource: repository://repository-aws-health-aware-ef3e83846625/README.md#L59-L71
  - id: lambda_primary
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L655-L702
  - id: schedule_primary
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L755-L765
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
      observed_at: 2026-08-22T04:53:00.118Z
---

# Purpose

This repository contains the Python runtime and infrastructure-as-code templates
for AWS Health Aware, an automated AWS Health notification system. The Terraform
deployment packages `handler.py` and `messagegenerator.py` into a scheduled
Lambda function and declares its supporting state, configuration, and permission
resources.

Primary Domain: [Health Operations](../domains/health-operations.md).

# Canonical Knowledge

* [AWS Health Aware](../systems/aws-health-aware.md) - the health-alerting system boundary.
* [AHA alert processor](../components/aha-alert-processor.md) - the independently scheduled runtime function.

# Repository Boundaries

The repository supplies both CloudFormation and Terraform deployment options.
This ingest gives priority to the Terraform deployment and uses Python evidence
to explain runtime behavior; provider resources remain technology metadata or
embedded implementation knowledge.

# Limitations

The separate management-account IAM-role Terraform was reviewed but was not
included in the bounded schema-guidance observations, so it remains an
unmodeled deployment detail. Desired-state and source evidence do not establish
actual deployment or live configuration.
