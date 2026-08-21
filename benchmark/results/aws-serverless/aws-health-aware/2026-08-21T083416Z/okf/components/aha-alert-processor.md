---
type: Function
title: AHA alert processor
description: Operational entry point for periodic health-event processing and notification delivery.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T08:35:36.363Z
sources:
  - id: res_lambda_primary
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L656-L702
  - id: sem_handler_alerts
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L94-L180
  - id: sem_handler_ddb
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L589-L636
  - id: res_schedule_binding
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L756-L795
relationships:
  - kind: implemented-in
    target: repositories/aws-health-aware
    evidence:
      - sem_handler_alerts
  - kind: writes-to
    target: resources/aha-event-history
    evidence:
      - sem_handler_ddb
agentbase:
  technology:
    provider: aws
    product: lambda
    sourceTool: terraform
    resourceType: aws_lambda_function
---

# Responsibility

The processor obtains configured destinations, formats AWS Health alert details, and sends the resulting notifications to configured EventBridge, Slack, Teams, email, or Chime endpoints. [sem_handler_alerts]

It is implemented in the [aws-health-aware repository](../repositories/aws-health-aware.md). [sem_handler_alerts]

# Runtime

Terraform declares the Python `handler.main` entry point, a 600-second timeout, and the event-history table name as a runtime environment variable. These are desired-state declarations rather than evidence of a live deployment. [res_lambda_primary]

# Triggers

The Terraform definition binds the primary function to an enabled one-minute schedule. [res_schedule_binding]

# Failure Behavior

Notification delivery catches HTTP and URL errors and logs them; the visible handler fragment does not establish a retry or dead-letter contract. [sem_handler_alerts]

# Data Interaction

The handler looks up event records by ARN and writes newly observed or changed records, including a TTL field, to [AHA event history](../resources/aha-event-history.md). [sem_handler_ddb]

# Limitations

The function may also be declared for a secondary region, but this ingest models only the primary function because the secondary declaration is conditional. Current schedules, destinations, accounts, and regions are not evidenced.
