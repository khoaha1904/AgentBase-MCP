---
type: Object Storage
title: Aha-account-exclusions
description: Optional account-exclusion input storage
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T11:35:09.021Z
sources:
  - id: res_s3_bucket
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L194-L200
  - id: sem_s3_input
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L988-L999
agentbase:
  technology:
    provider: aws
    product: s3
    sourceTool: terraform
    resourceType: aws_s3_bucket
---

# Purpose

This optional private object-storage boundary holds the account-exclusion CSV used by the runtime. The primary bucket is only declared when the exclusion-file variable is non-empty. [Terraform declaration](repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L194-L200)

# Objects

The Terraform configuration uploads the configured exclusion file as an object; when its key has a CSV extension, the handler reads its lines as account IDs. [Handler access](repository://repository-aws-health-aware-ef3e83846625/handler.py#L988-L999)

# Consumers

[Aha-alert-processor](../components/aha-alert-processor.md) reads this storage only for the optional exclusion-account workflow.

# Limitations

The bucket and object are conditional. No actual bucket name, object key, or deployed lifecycle is asserted.
