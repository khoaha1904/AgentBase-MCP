---
title: AHA Lambda function
description: Lambda that retrieves AWS Health events, persists event state, and sends configured alerts.
type: AWS Lambda
benchmark_key: aha-lambda-function
status: draft
generated:
  by: agentbase/3.0.0
  at: 2026-08-15T00:00:00Z
business_purpose: Retrieve AWS Health events, persist their state, and send configured alerts.
resource_name: AHA-LambdaFunction-${random_string.resource_code.result}
runtime: python3.11
handler: handler.main
relationships:
  - kind: declared-by
    target: aha-deployment-terraform-module
  - kind: triggered-by
    target: aha-lambda-schedule
  - kind: accesses
    target: aha-dynamodb-table
sources:
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L656-L702
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L755-L803
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/handler.py#L1042-L1060
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/handler.py#L750-L825
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/README.md#L61-L69
---
# Function

The primary-region resource configures Python 3.11 with `handler.main`. The handler retrieves AWS Health events directly or through AWS Organizations mode.

# Triggers

The [AHA Lambda schedule](../../../../../events/aha-lambda-schedule.md) targets and has permission to invoke this function.

# Dependencies

The function binds `DYNAMODB_TABLE` and reads and writes the [AHA DynamoDB table](../../../data/tables/aha-dynamodb-table.md) while processing Health events.

# Permissions

The shown deployment resource is assigned the AHA Lambda execution role.

# Limitations

This source describes a primary-region resource and an optional secondary-region counterpart; it does not provide a concrete deployed ARN.
