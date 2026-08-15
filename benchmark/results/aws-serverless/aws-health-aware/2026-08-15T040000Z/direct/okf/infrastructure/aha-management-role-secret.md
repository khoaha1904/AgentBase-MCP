---
title: AHA Management Role Secret
type: aws-secretsmanager-secret
status: draft
description: Optional Secrets Manager secret named AssumeRoleArn that stores the management-account role ARN for cross-account AWS API access.
benchmark_key: aha-management-role-secret
sources:
  - repository://repository-aws-health-aware-779eb7e1bc7a/CFN_DEPLOY_AHA.yml#L627-L642
  - repository://repository-aws-health-aware-779eb7e1bc7a/handler.py#L1002-L1039
relationships: []
---
# AHA Management Role Secret

When configured, this secret provides the role ARN the AHA Notification Lambda assumes for AWS API access.

The external management-account role itself is only supplied by ARN and is not defined in this repository.
