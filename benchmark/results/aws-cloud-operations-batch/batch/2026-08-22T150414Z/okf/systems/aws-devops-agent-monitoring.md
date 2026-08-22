---
type: System
title: AWS DevOps Agent Monitoring
description: AI-assisted AWS infrastructure monitoring system
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-22T15:08:53.296Z
sources:
  - id: obs-devops-system-doc
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
      - obs-devops-system-doc
---

# Purpose

AWS DevOps Agent Monitoring is the operational capability described by the
repository for monitoring and managing AWS infrastructure with AI-assisted
insights. It combines an agent space and operator app with account associations
and optional telemetry or work-management services.

Primary Domain: [Cloud Operations](../domains/cloud-operations.md).

Implemented in [sample-aws-devops-agent-terraform](../repositories/sample-aws-devops-agent-terraform.md).

# Architecture

The [AWS DevOps Agent Space](../resources/aws-devops-agent-space.md) is the
central operated resource. A primary monitoring-account association is required
by the desired configuration; source-account and third-party associations are
conditional.

# Interfaces

Documented optional integrations cover Dynatrace, ServiceNow, Splunk, New Relic,
GitLab, and PagerDuty. Datadog is explicitly outside the automated Terraform
path because it requires interactive authorization.

# Critical Flows

Terraform first establishes access roles and the agent space, then associates
the monitoring account. Optional configuration adds a source account and service
registrations associated with the same agent space.

# Limitations

Static configuration does not establish a successful apply, live association
status, valid credentials, current ARN, account, region, or runtime health.
Optional integrations and cross-account monitoring may not be configured.

# Embedded Knowledge

| Name | Role | Kind | Technology | Exact sources |
|---|---|---|---|---|
| echo example service | optional echo Lambda example | runtime-function | aws / lambda; terraform:aws_lambda_function | res-echo-service: `repository://repository-sample-aws-devops-agent-terraform-602f2c2bcf7c/service-account.tf#L81-L98` |
| third-party integrations | Optional service registrations and agent-space associations for six documented providers; Datadog remains manual | configuration | provider-neutral service association | obs-integration-catalog: `repository://repository-sample-aws-devops-agent-terraform-602f2c2bcf7c/README.md#L43-L56` |
| access roles | Monitoring, operator, and optional cross-account IAM access roles | security infrastructure | aws / iam | obs-access-roles: `repository://repository-sample-aws-devops-agent-terraform-602f2c2bcf7c/README.md#L26-L41` |
