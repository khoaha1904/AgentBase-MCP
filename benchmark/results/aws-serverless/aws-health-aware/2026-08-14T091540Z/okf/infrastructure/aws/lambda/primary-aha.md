---
type: AWS Lambda
title: Primary AWS Health Aware Lambda
description: Python 3.11 Lambda provisioned in the primary region by Terraform.
status: draft
generated: { by: agentbase/0.0.0, at: "2026-08-14T09:16:12.713Z" }
sources:
  - id: lambda-resource
    resource: repository://repository-aws-health-aware-779eb7e1bc7a/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L656-L702
  - id: python-handler
    resource: repository://repository-aws-health-aware-779eb7e1bc7a/handler.py#L1042-L1060
---

# Function

Terraform configures a Python 3.11 function whose handler is `handler.main`; that function exists in `handler.py`.[^lambda-resource][^python-handler]

# Triggers

The [primary schedule](../../../events/aha-primary-schedule.md) invokes this function.

# Dependencies

The environment names the [AHA DynamoDB table](../../../data/tables/aha.md), and the resource explicitly depends on both single-region and global table alternatives.[^lambda-resource]

# Limitations

The normalized observation failed, so these relationships required direct Terraform and Python inspection.
