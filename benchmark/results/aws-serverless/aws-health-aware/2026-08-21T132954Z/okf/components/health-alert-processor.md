---
type: Function
title: Health Alert Processor
description: Scheduled Lambda handler that processes and delivers AWS Health alerts.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T13:31:07.473Z
sources:
  - id: sem_function
    resource: repository://repository-aws-health-aware-ef3e83846625/CFN_DEPLOY_AHA.yml#L643-L654
  - id: res_schedule
    resource: repository://repository-aws-health-aware-ef3e83846625/CFN_DEPLOY_AHA.yml#L547-L555
  - id: implementation-main
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L1042-L1045
  - id: event-state
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L473-L519
  - id: delivery
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L94-L178
relationships:
  - kind: part-of
    target: systems/aws-health-aware
    evidence:
      - sem_function
agentbase:
  technology:
    provider: aws
    sourceTool: terraform
    resourceType: aws_events_rule
---

# Responsibility

The Lambda deployment invokes `handler.main` for [AWS Health Aware](../systems/aws-health-aware.md); that entry point clears cached clients and creates the AWS Health client for each invocation.

# Runtime

The deployment configuration specifies an EventBridge schedule at `rate(1 minute)` targeting the Lambda function. This is desired-state configuration, not evidence that the schedule is currently deployed or enabled in a particular environment.

# Embedded Resources

The function uses the `DYNAMODB_TABLE` configuration field to read and write per-event state, including last-update data and a TTL. This table remains embedded because the source shows it as implementation-local state for the processor.

Configured Slack, Teams, Chime, email, and EventBridge destinations are embedded delivery integrations. Their URLs, names, and secret values are not recorded.

# Failure Behavior

Outbound delivery catches HTTP and URL errors for individual destinations, allowing the function to continue attempting other configured channels.

# Limitations

Only the scheduled Lambda execution boundary is modeled. AWS account scope, deployed regions, ARNs, and live configuration are not established by this source.
