---
title: AHA Lambda Function
description: Primary-region Python Lambda that processes AWS Health events and sends alerts.
type: AWS Lambda
status: draft
generated:
  by: agentbase/3.0.0
  at: "2026-08-15T00:00:00Z"
benchmark_key: aha-lambda-function
business_purpose: Process AWS Health events and send alerts to configured endpoints.
resource_name: aws_lambda_function.AHA-LambdaFunction-PrimaryRegion
runtime: python3.11
handler: handler.main
relationships:
  - kind: triggered-by
    target: aha-lambda-schedule
  - kind: declared-by
    target: aha-terraform-deployment
sources:
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/README.md#L59-L69
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L655-L702
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L779-L795
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/handler.py#L1042-L1060
---

# Function

The primary resource uses Python 3.11 and `handler.main`. It [is triggered by the AHA Lambda Schedule](../../../events/aha-lambda-schedule.md) and [is declared by the AHA Terraform Deployment Module](../../terraform/aha-deployment.md).

# Triggers

The EventBridge schedule has a target for this Lambda and EventBridge is granted `lambda:InvokeFunction` permission.

# Permissions

The cited Terraform binds the Lambda to `AHA-LambdaExecutionRole`; the specific policy actions are outside this concept's cited scope.

# Limitations

The Terraform configuration also conditionally defines a secondary-region Lambda, which is not represented as a separate concept here. No relationship to individual notification endpoints is asserted because their concrete identities depend on deployment inputs.
