---
type: Function
title: AHA alert processor
description: Scheduled Lambda workload that collects AWS Health events, tracks changes, and dispatches alerts.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-22T04:53:00.118Z
sources:
  - id: lambda_primary
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L655-L702
  - id: lambda_secondary
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L704-L753
  - id: schedule_primary
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L755-L765
  - id: schedule_target_primary
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L779-L782
  - id: handler_main
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L1042-L1060
  - id: alert_dispatch
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L94-L180
  - id: system_resource_summary
    resource: repository://repository-aws-health-aware-ef3e83846625/README.md#L59-L71
  - id: dynamodb_single
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L245-L273
  - id: dynamodb_global
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L275-L306
  - id: dynamodb_usage
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L473-L564
  - id: endpoint_secrets
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L324-L437
  - id: secret_lookup
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L702-L734
  - id: runtime_permissions
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L439-L654
  - id: schedule_resources
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L755-L803
  - id: eventbridge_publish
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L974-L985
  - id: exclusion_buckets
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L193-L243
  - id: exclusion_file_usage
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L988-L999
  - id: lambda_package
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L28-L43
relationships:
  - kind: part-of
    target: systems/aws-health-aware
    evidence:
      - system_resource_summary
  - kind: implemented-in
    target: repositories/aws-health-aware
    evidence:
      - lambda_primary
agentbase:
  technology:
    kind: runtime-function
    provider: aws
    product: lambda
    sourceTool: terraform
    resourceType: aws_lambda_function
---

# Responsibility

The AHA alert processor is the independently deployed Lambda workload for the
[AWS Health Aware system](../systems/aws-health-aware.md), implemented in the
[aws-health-aware repository](../repositories/aws-health-aware.md). On
invocation it obtains an AWS Health client and chooses the
single-account or organization-wide collection path from configuration. It then
tracks event changes and sends newly created, updated, or resolved alerts to the
configured destinations.

# Runtime and Triggers

Terraform packages `handler.py` and `messagegenerator.py` as one Python Lambda
artifact. It declares a primary-region function and, when configured, a
secondary-region replica. EventBridge schedule rules target the functions at a
one-minute desired-state interval and Lambda permissions authorize those
invocations.

# Embedded Resources

The function's DynamoDB table stores records keyed by event ARN, including last
update, status, affected accounts, and TTL. Terraform selects a single-region
table or a global-table form for a secondary-region configuration. This state is
internal to change detection and notification behavior.

Optional Secrets Manager values hold Slack, Teams, Chime, EventBridge, and
management-role configuration. The handler resolves only the values enabled by
its environment. The execution role and policy grant desired access to logging,
AWS Health and Organizations, DynamoDB, SES, Secrets Manager, EventBridge, STS,
and optional S3 input.

When account exclusions are configured, optional regional S3 buckets and
objects hold a CSV that the function reads. Message formatting remains an
internal module in the same Lambda deployment artifact.

# Interactions

The handler conditionally delivers formatted notifications to EventBridge,
Slack, Microsoft Teams, email, and Amazon Chime. These endpoint-specific paths
remain embedded because the repository does not define one independently owned
provider-neutral interface contract.

# Failure Behavior

Endpoint calls handle HTTP and connection failures independently and continue
through the configured delivery paths. DynamoDB access errors are logged by the
runtime. The evidence does not define an external retry, dead-letter, or
service-level objective contract.

# Limitations

Terraform and source code describe intended behavior, not deployed state,
current environment values, account, region, endpoint reachability, or runtime
health. The optional secondary-region definitions do not prove that replication
is enabled.
