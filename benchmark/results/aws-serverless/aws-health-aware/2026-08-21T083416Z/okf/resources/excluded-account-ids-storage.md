---
type: Object Storage
title: Excluded account IDs storage
description: Optional configuration-data storage boundary for excluded accounts.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T08:35:36.363Z
sources:
  - id: res_s3_bucket
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L194-L200
  - id: res_s3_object
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L224-L232
agentbase:
  technology:
    provider: aws
    product: s3
    sourceTool: terraform
    resourceType: aws_s3_bucket
---

# Purpose

Terraform conditionally declares a private bucket when an excluded-account file is configured, and declares an object whose key and source are that configured file. [res_s3_bucket] [res_s3_object]

# Objects

The object represents the configured excluded-account IDs file rather than a stable, deployed object name. [res_s3_object]

# Lifecycle

Both the bucket and object are conditional on the exclusion-file setting. The configuration does not establish a deployed bucket, region, or object value. [res_s3_bucket] [res_s3_object]

# Limitations

The source does not provide enough runtime evidence to assert which component consumes the object, so no canonical consumer relationship is recorded.
