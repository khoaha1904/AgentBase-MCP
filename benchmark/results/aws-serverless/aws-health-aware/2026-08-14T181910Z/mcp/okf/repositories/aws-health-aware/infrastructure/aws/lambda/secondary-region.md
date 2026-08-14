---
title: AHA secondary-region Lambda
description: Optional secondary-region AWS Lambda that runs AWS Health Aware on the configured EventBridge schedule.
type: AWS Lambda
status: draft
generated:
  by: agentbase/3.0.0
  at: 2026-08-15T00:00:00Z
benchmark_key: aha-secondary-region-lambda
business_purpose: Query AWS Health events and produce AHA alert processing in the configured secondary region.
resource_name: aws_lambda_function.AHA-LambdaFunction-SecondaryRegion
runtime: python3.11
handler: handler.main
relationships:
  - kind: declared-by
    target: aha-deploy-terraform-module
  - kind: triggered-by
    target: aha-one-minute-schedule
sources:
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L705-L753
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L766-L803
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/handler.py#L1042-L1060
---

# Function

The [Terraform deployment module](../../terraform/deploy-aha.md) declares this resource. It configures Python 3.11 with the same `handler.main` source entry point as the primary function.

# Triggers

The [one-minute EventBridge schedule](../../../../../events/aha-one-minute-schedule.md) conditionally targets this function when a secondary region is configured.

# Permissions

Terraform grants EventBridge permission to invoke this resource.

# Limitations

The resource count is zero unless `aha_secondary_region` is set, so configuration alone does not prove that a secondary Lambda exists in a deployment.
