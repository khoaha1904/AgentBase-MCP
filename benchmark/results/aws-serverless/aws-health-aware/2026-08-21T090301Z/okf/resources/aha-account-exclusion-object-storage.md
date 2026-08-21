---
type: Object Storage
title: AHA account exclusion object storage
description: Optional storage boundary for a supplied account-exclusion CSV
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T09:04:25.165Z
sources:
  - id: sem_exclusions
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L988-L999
  - id: res_bucket
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L193-L206
  - id: res_object
    resource: repository://repository-aws-health-aware-ef3e83846625/terraform/Terraform_DEPLOY_AHA/Terraform_DEPLOY_AHA.tf#L224-L243
agentbase:
  technology:
    provider: aws
    product: s3
    sourceTool: terraform
    resourceType: aws_s3_bucket
---

# Purpose

When an exclusion CSV is configured, Terraform declares a private primary-region bucket and an object named from the configured CSV value. The processor reads the object to obtain account IDs to exclude from alerting.

# Objects

The bucket and object are conditional on a non-empty exclusion-file setting; the object is sourced from that configured file path.

# Consumers

[AHA scheduled health alert processor](../components/aha-scheduled-health-alert-processor.md) reads the configured bucket/object pair when the configured file has a CSV extension.

# Limitations

The bucket name is generated and deployment is conditional. No deployed bucket, object, account, region, or object contents are evidenced.
