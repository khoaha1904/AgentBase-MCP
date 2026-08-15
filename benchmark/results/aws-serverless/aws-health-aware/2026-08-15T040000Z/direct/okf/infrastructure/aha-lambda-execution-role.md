---
title: AHA Lambda Execution Role
type: aws-iam-role
status: draft
description: IAM role assumed by the AHA notification Lambda for AWS Health, DynamoDB, Secrets Manager, SES, and EventBridge operations.
benchmark_key: aha-lambda-execution-role
sources:
  - repository://repository-aws-health-aware-779eb7e1bc7a/CFN_DEPLOY_AHA.yml#L419-L545
  - repository://repository-aws-health-aware-779eb7e1bc7a/CFN_DEPLOY_AHA.yml#L643-L657
relationships: []
---
# AHA Lambda Execution Role

This role is assigned to the AHA Notification Lambda and grants the AWS service actions defined in the template.
