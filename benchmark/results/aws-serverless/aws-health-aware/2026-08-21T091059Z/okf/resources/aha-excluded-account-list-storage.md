---
type: Object Storage
title: AHA excluded-account list storage
description: excluded account list storage boundary
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T09:12:25.555Z
sources:
  - id: res_bucket
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L194-L200
agentbase:
  technology:
    provider: aws
    product: s3
    sourceTool: terraform
    resourceType: aws_s3_bucket
---

# Purpose

This optional object-storage boundary is declared when an excluded-account list is configured. The Terraform count condition ties its creation to `ExcludeAccountIDs`, and its generated bucket name includes the primary-region input [in the declaration](repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L194-L200).

# Objects

The deployment definition separately declares an object whose key and source use `ExcludeAccountIDs` [in the object declaration](repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L224-L232).

# Lifecycle

The primary bucket is conditional desired state. An associated ACL declaration requests private access [in Terraform](repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L202-L205).

# Limitations

This is not evidence that a bucket or object has been deployed. The source does not establish a stable deployed bucket name, account, region, or the contents of the configured exclusion list.
