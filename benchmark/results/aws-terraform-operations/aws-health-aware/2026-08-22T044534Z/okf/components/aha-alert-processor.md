---
type: Function
title: AHA alert processor
description: Scheduled Lambda workload that polls AWS Health, deduplicates event updates, and sends configured notifications
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-22T04:47:22.521Z
sources:
  - id: lambda_primary
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L656-L703
  - id: lambda_secondary
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L705-L753
  - id: lambda_entrypoint
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L1042-L1060
  - id: processing_behavior
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L750-L823
  - id: system_resources
    resource: repository://repository-aws-health-aware-ef3e83846625/README.md#L59-L71
  - id: event_publisher
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L962-L985
  - id: exclude_bucket_primary
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L194-L200
  - id: exclude_bucket_secondary
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L208-L215
  - id: state_table_single
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L246-L274
  - id: state_table_global
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L276-L306
  - id: channel_secrets
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L324-L438
  - id: lambda_execution_role
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L439-L465
  - id: lambda_schedule_primary
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L756-L765
  - id: lambda_schedule_secondary
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L766-L777
  - id: runtime_state_behavior
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L589-L699
relationships:
  - kind: part-of
    target: systems/aws-health-aware
    evidence:
      - lambda_primary
  - kind: implemented-in
    target: repositories/aws-health-aware
    evidence:
      - lambda_entrypoint
  - kind: provides
    target: interfaces/aha-eventbridge-event
    evidence:
      - event_publisher
agentbase:
  technology:
    kind: runtime-function
    provider: aws
    product: lambda
    sourceTool: terraform
    resourceType: aws_lambda_function
---

# Responsibility

This Lambda workload is the independently deployed and scheduled processor for AWS Health Aware. On each invocation it chooses either single-account or AWS Organizations collection, filters events by the configured lookback, category, and regions, retrieves affected accounts and entities, then persists material changes before notifying endpoints.

It is part of [AWS Health Aware](../systems/aws-health-aware.md) and implemented in [aws-health-aware](../repositories/aws-health-aware.md).

# Runtime

Terraform defines a primary Lambda and an optional secondary-region Lambda from the same handler package. These are deployment variants of one function identity, not separate logical workloads. The desired runtime configuration selects organization mode, event categories, search window, regions, endpoint types, and the state-table name; no current values are asserted here.

# Triggers

Primary and optional secondary EventBridge schedule rules are defined to invoke the workload every minute. The schedule and its invocation permissions are embedded deployment details rather than a separate interface or flow.

# Embedded Resources

The processor uses a single-region DynamoDB table or a multi-region global table to recognize new and changed events and to retain cleanup TTL data. Terraform also defines its execution role, optional Secrets Manager records for webhook and EventBridge configuration, and optional regional S3 buckets for account-exclusion input. These resources share the function's lifecycle and are not promoted independently.

# Outputs

The processor formats notifications for configured webhook or email endpoints. If EventBridge output is enabled, it provides the [AHA EventBridge event](../interfaces/aha-eventbridge-event.md) contract and submits entries to the configured bus.

# Failure Behavior

Failed AWS Health detail lookups are skipped for that event. DynamoDB client errors are logged, and unchanged records produce no repeated alert. The repository's troubleshooting guidance points operators to the Lambda log group for malformed or missing events.

# Limitations

Terraform proves desired primary and optional secondary instances, not deployment or availability. Endpoint delivery implementations and downstream consumers are external to this repository.
