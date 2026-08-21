---
type: Object Storage
title: Account-exclusion-input
description: Optional object-storage boundary for account-exclusion input.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T09:49:52.132Z
sources:
  - id: res_bucket
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L194-L200
  - id: res_function
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L656-L702
agentbase:
  technology:
    provider: aws
    product: s3
    sourceTool: terraform
    resourceType: aws_s3_bucket
---

# Purpose

This is an optional private object-storage boundary. The Terraform declaration creates the primary bucket only when the account-exclusion input is configured, so it is not asserted to exist in every deployment. [res_bucket]

# Consumers

The function receives the primary bucket name through `S3_BUCKET`; the repository’s Terraform policy permits object reads when the exclusion input is configured. This supports an input role, but does not evidence any specific uploaded object or current content. [res_function]

# Lifecycle and limitations

Neither source span establishes a deployed bucket name, account, region, object lifecycle policy, or object inventory. Those values remain deployment-specific.
