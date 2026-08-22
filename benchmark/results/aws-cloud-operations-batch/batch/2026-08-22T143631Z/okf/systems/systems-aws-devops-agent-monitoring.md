---
type: System
title: AWS DevOps Agent monitoring
description: Operational monitoring system centered on an AWS DevOps Agent Space and its account and service associations
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-22T14:41:56.965Z
sources:
  - id: devops-capability
    resource: repository://repository-sample-aws-devops-agent-terraform-602f2c2bcf7c/README.md#L5-L7
  - id: devops-parts
    resource: repository://repository-sample-aws-devops-agent-terraform-602f2c2bcf7c/README.md#L16-L22
  - id: owner-domain
    resource: agentbase://owner-guidance/domains/cloud-operations
relationships:
  - kind: part-of
    target: domains/cloud-operations
    evidence:
      - owner-domain
  - kind: implemented-in
    target: repositories/sample-aws-devops-agent-terraform
    evidence:
      - devops-capability
---

# Purpose

This system provides an AWS DevOps Agent monitoring setup for monitoring and managing AWS infrastructure with AI-powered insights. Its base scope is a monitoring account; the configuration can optionally add a source account and third-party operational services.

Primary Domain: [Cloud Operations](../domains/cloud-operations.md).

# Architecture

The central operated resource is an [AWS DevOps Agent Space](../resources/resources-aws-devops-agent-space.md) with an operator app. AWS account associations establish monitoring scope. Optional service registrations and associations connect Dynatrace, ServiceNow, Splunk, New Relic, GitLab, or PagerDuty. The system is implemented by the [sample-aws-devops-agent-terraform repository](../repositories/sample-aws-devops-agent-terraform.md).

# Interfaces

The reviewed Terraform defines provider resources and configuration objects rather than a repository-owned runtime API. Third-party integrations are optional configuration boundaries and remain embedded because their external contracts and ownership were not established by this bounded ingest.

# Critical Flows

Terraform creates or reuses IAM roles, creates the Agent Space and operator app, and then associates the primary monitoring account. When configured, it adds a secondary source-account association and third-party service associations.

# Limitations

This source snapshot does not establish that Terraform was applied or that monitoring is active. It does not assert account IDs, current regions, ARNs, enabled integrations, credentials, association health, or observed incidents.
