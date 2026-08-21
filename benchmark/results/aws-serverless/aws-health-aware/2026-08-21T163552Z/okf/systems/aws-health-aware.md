---
type: System
title: Aws-health-aware
description: A deployable health-alert notification capability spanning the scheduled runtime and its configured delivery paths.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T16:37:26.989Z
sources:
  - id: sem_system_overview
    resource: repository://repository-aws-health-aware-ef3e83846625/README.md#L44-L45
  - id: owner-domain
    resource: agentbase://owner-guidance/domains/health-operations
relationships:
  - kind: part-of
    target: domains/health-operations
    evidence:
      - owner-domain
---

# Purpose

AWS Health Aware is an automated notification capability for AWS Health alerts ([sem_system_overview](repository://repository-aws-health-aware-ef3e83846625/README.md#L44-L45)).

Primary Domain: [Health Operations](../domains/health-operations.md).

# Architecture

The system is implemented by the [aws-health-aware-alert-processor](../components/aws-health-aware-alert-processor.md) scheduled function. Its Terraform deployment packages `handler.py` and `messagegenerator.py`, configures `handler.main`, and provides the function environment ([tf_lambda_primary](repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L656-L702)).

# Interfaces

Configured outbound delivery is implemented inside the function; the repository documents Slack, Microsoft Teams, Amazon Chime, email, and EventBridge-compatible endpoint options ([sem_system_overview](repository://repository-aws-health-aware-ef3e83846625/README.md#L44-L45)).

# Critical Flows

The function is scheduled and conditionally delivers formatted health alerts to configured endpoints. This initial ingest keeps that runtime sequence embedded in the function because no separately stable interface contract was evidenced.

# Limitations

This is a source-backed design view, not evidence of a deployed AWS account, region, ARN, runtime value, or configured endpoint. Optional secondary-region and cross-account deployment paths remain unmodeled.
