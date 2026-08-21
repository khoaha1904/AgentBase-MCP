---
type: Repository
title: aws-health-aware
description: Source for AWS Health Aware notification automation
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T07:23:55.797Z
sources:
  - id: sem_readme_purpose
    resource: repository://repository-aws-health-aware-ef3e83846625/README.md#L44-L45
  - id: sem_readme_resources
    resource: repository://repository-aws-health-aware-ef3e83846625/README.md#L59-L74
  - id: sem_readme_deployment
    resource: repository://repository-aws-health-aware-ef3e83846625/README.md#L19-L40
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

AWS Health Aware is an automated notification tool for formatted AWS Health
alerts. The documentation identifies chat webhooks, email, and compatible event
endpoints as its intended delivery options.

Primary Domain: [Health Operations](../domains/health-operations.md).

# Boundaries and interactions

The documented deployment options include CloudFormation and Terraform. Its
resource model includes a scheduled processing function and an event-state
table; these details are useful context but are not modeled as separate Hub
concepts in this partial ingest because the available catalog guidance did not
establish provider-neutral mappings for them.

# Limitations

Terraform and CloudFormation files describe intended deployment configuration
only. They do not prove a deployed account, region, ARN, runtime value, or
which optional notification endpoints are configured.
