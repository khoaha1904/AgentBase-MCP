---
type: Resource
title: AWS DevOps Agent Space
description: Central operated resource for AWS DevOps Agent monitoring and service associations
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-22T14:41:56.965Z
sources:
  - id: agent-space-doc
    resource: repository://repository-sample-aws-devops-agent-terraform-602f2c2bcf7c/README.md#L20-L34
  - id: agent-space-resource
    resource: repository://repository-sample-aws-devops-agent-terraform-602f2c2bcf7c/devops-agent.tf#L19-L30
  - id: accounts-doc
    resource: repository://repository-sample-aws-devops-agent-terraform-602f2c2bcf7c/README.md#L26-L34
  - id: primary-association
    resource: repository://repository-sample-aws-devops-agent-terraform-602f2c2bcf7c/devops-agent.tf#L33-L47
  - id: secondary-association
    resource: repository://repository-sample-aws-devops-agent-terraform-602f2c2bcf7c/devops-agent.tf#L50-L64
  - id: integrations-doc
    resource: repository://repository-sample-aws-devops-agent-terraform-602f2c2bcf7c/README.md#L43-L56
  - id: integrations-config
    resource: repository://repository-sample-aws-devops-agent-terraform-602f2c2bcf7c/integrations.tf#L1-L18
  - id: cross-account-doc
    resource: repository://repository-sample-aws-devops-agent-terraform-602f2c2bcf7c/README.md#L36-L41
  - id: secondary-role
    resource: repository://repository-sample-aws-devops-agent-terraform-602f2c2bcf7c/service-account.tf#L6-L15
  - id: echo-lambda
    resource: repository://repository-sample-aws-devops-agent-terraform-602f2c2bcf7c/service-account.tf#L81-L98
relationships:
  - kind: part-of
    target: systems/systems-aws-devops-agent-monitoring
    evidence:
      - agent-space-doc
  - kind: implemented-in
    target: repositories/sample-aws-devops-agent-terraform
    evidence:
      - agent-space-resource
agentbase:
  technology:
    provider: awscc
    sourceTool: terraform
    resourceType: awscc_devopsagent_agent_space
---

# Purpose

The Agent Space is the central lifecycle resource for the [AWS DevOps Agent monitoring](../systems/systems-aws-devops-agent-monitoring.md) system and is managed by the [sample-aws-devops-agent-terraform repository](../repositories/sample-aws-devops-agent-terraform.md). It contains operator-app configuration and is the target of AWS-account and optional third-party service associations.

# Kind and Technology

Terraform declares the resource as `awscc_devopsagent_agent_space.main` using the AWS Cloud Control provider resource type `awscc_devopsagent_agent_space`. Its name and description are input variables, so this snapshot does not assert concrete deployed values.

# Users

The operator app uses the configured operator role. A primary AWS association links the monitoring account; an optional secondary association links a source account. Optional service associations connect selected observability, incident-management, or development services.

# Operations

Creation waits for newly created IAM roles to propagate. Association ordering makes the primary monitoring account the base attachment before the optional source account. The README identifies IAM propagation and invalid third-party credentials as operational failure modes.

# Evidence

The Terraform declaration proves desired resource shape and dependencies. README evidence describes its intended monitoring role and optional extensions. Neither proves deployed state.

# Limitations

No provider or AWS command was run. Current existence, name, ID, ARN, account, region, operator access, associations, integration status, and monitoring health are unknown. Optional resources are documented possibilities, not asserted deployments.

# Embedded Knowledge

| Name | Role | Kind | Technology | Exact sources |
|---|---|---|---|---|
| cross-account monitoring support | secondary account role echo Lambda | runtime-function | aws / lambda; terraform:aws_lambda_function | cross-account-doc: `repository://repository-sample-aws-devops-agent-terraform-602f2c2bcf7c/README.md#L36-L41`<br>secondary-role: `repository://repository-sample-aws-devops-agent-terraform-602f2c2bcf7c/service-account.tf#L6-L15`<br>echo-lambda: `repository://repository-sample-aws-devops-agent-terraform-602f2c2bcf7c/service-account.tf#L81-L98` |
| AWS account monitoring associations | Defines the primary monitoring account and optional secondary source account | infrastructure | awscc; terraform:awscc_devopsagent_association | accounts-doc: `repository://repository-sample-aws-devops-agent-terraform-602f2c2bcf7c/README.md#L26-L34`<br>primary-association: `repository://repository-sample-aws-devops-agent-terraform-602f2c2bcf7c/devops-agent.tf#L33-L47`<br>secondary-association: `repository://repository-sample-aws-devops-agent-terraform-602f2c2bcf7c/devops-agent.tf#L50-L64` |
| Optional third-party integrations | Registers enabled services and associates them with the Agent Space | configuration | awscc / source-defined | integrations-doc: `repository://repository-sample-aws-devops-agent-terraform-602f2c2bcf7c/README.md#L43-L56`<br>integrations-config: `repository://repository-sample-aws-devops-agent-terraform-602f2c2bcf7c/integrations.tf#L1-L18` |
