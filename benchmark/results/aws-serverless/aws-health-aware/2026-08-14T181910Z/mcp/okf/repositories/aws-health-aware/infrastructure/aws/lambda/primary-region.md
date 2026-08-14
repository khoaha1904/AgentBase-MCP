---
title: AHA primary-region Lambda
description: Primary AWS Lambda that runs AWS Health Aware on the configured EventBridge schedule.
type: AWS Lambda
status: draft
generated:
  by: agentbase/3.0.0
  at: 2026-08-15T00:00:00Z
benchmark_key: aha-primary-region-lambda
business_purpose: Query AWS Health events and produce AHA alert processing.
resource_name: aws_lambda_function.AHA-LambdaFunction-PrimaryRegion
runtime: python3.11
handler: handler.main
relationships:
  - kind: declared-by
    target: aha-deploy-terraform-module
  - kind: triggered-by
    target: aha-one-minute-schedule
sources:
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L656-L702
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L756-L795
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/handler.py#L1042-L1060
---

# Function

The [Terraform deployment module](../../terraform/deploy-aha.md) declares this resource. It configures Python 3.11 with `handler.main`. That handler obtains an AWS Health client and dispatches to account or organization event discovery according to `ORG_STATUS`.

# Triggers

The [one-minute EventBridge schedule](../../../../../events/aha-one-minute-schedule.md) targets this function and has permission to invoke it.

# Permissions

The Terraform resource assigns the AHA Lambda execution role; the policy’s exact effective permissions are not represented here.

# Limitations

Runtime configuration sets 128 MiB memory and a 600-second timeout. The concept does not assert deployed instances or endpoint configuration values.
