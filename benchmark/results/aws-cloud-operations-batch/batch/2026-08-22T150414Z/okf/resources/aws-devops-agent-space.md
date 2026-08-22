---
type: Resource
title: AWS DevOps Agent Space
description: central AWS DevOps Agent Space operational resource
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-22T15:08:53.296Z
sources:
  - id: obs-agent-space-boundary
    resource: repository://repository-sample-aws-devops-agent-terraform-602f2c2bcf7c/README.md#L24-L34
  - id: res-agent-space
    resource: repository://repository-sample-aws-devops-agent-terraform-602f2c2bcf7c/devops-agent.tf#L19-L30
agentbase:
  technology:
    provider: awscc
    sourceTool: terraform
    resourceType: awscc_devopsagent_agent_space
relationships:
  - kind: part-of
    target: systems/aws-devops-agent-monitoring
    evidence:
      - obs-agent-space-boundary
  - kind: implemented-in
    target: repositories/sample-aws-devops-agent-terraform
    evidence:
      - res-agent-space
---

# Purpose

The AWS DevOps Agent Space is the central lifecycle-managed resource for the
monitoring system. Its Terraform declaration binds an operator application role;
separate associations connect monitoring and optional source accounts.

Part of [AWS DevOps Agent Monitoring](../systems/aws-devops-agent-monitoring.md)
and implemented in [sample-aws-devops-agent-terraform](../repositories/sample-aws-devops-agent-terraform.md).

# Kind and Technology

The source declares an `awscc_devopsagent_agent_space` Terraform resource. This
is desired-state evidence for an AWS Cloud Control resource type, not proof of a
deployed resource.

# Users

The operator application and associated AWS accounts cooperate through the
agent space. The bounded evidence does not identify human owners or a current
operator population.

# Operations

Creation waits for newly defined IAM roles to propagate. Primary monitoring and
optional source-account associations are configured as child deployment details.

# Embedded Knowledge

| Name | Role | Exact sources |
|---|---|---|
| AWS account associations | Links the primary monitoring account and, when configured, a secondary source account to the agent space | res-primary-account-association: `repository://repository-sample-aws-devops-agent-terraform-602f2c2bcf7c/devops-agent.tf#L33-L47`<br>res-secondary-account-association: `repository://repository-sample-aws-devops-agent-terraform-602f2c2bcf7c/devops-agent.tf#L50-L64` |

# Evidence

The README describes the resource's central role, and `devops-agent.tf` declares
its configurable name, description, operator role, and creation dependency.

# Limitations

No plan, apply, provider read, resource ID, ARN, account, region, or live status
was observed. The source-account association is conditional and may be absent.
