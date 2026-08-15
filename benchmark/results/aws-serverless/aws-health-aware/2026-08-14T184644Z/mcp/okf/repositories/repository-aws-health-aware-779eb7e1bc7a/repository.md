---
title: AWS Health Aware repository
description: Source repository for the AWS Health Aware automated notification tool.
type: Repository
benchmark_key: aws-health-aware-repository
status: draft
generated:
  by: agentbase/3.0.0
  at: 2026-08-15T00:00:00Z
sources:
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/README.md#L44-L45
---
# Purpose

AWS Health Aware (AHA) is an automated tool that sends formatted AWS Health alerts to configured Chime, Slack, Microsoft Teams, email, or EventBridge-compatible endpoints.

# Structure

The repository contains Python runtime sources and deployment configurations for CloudFormation and Terraform.

# Entry Points

The configured Lambda handler is `handler.main`; the deployment-specific resources are documented separately.

## Limitations

The source documents deployment alternatives but does not establish one deployed environment or endpoint identity.
