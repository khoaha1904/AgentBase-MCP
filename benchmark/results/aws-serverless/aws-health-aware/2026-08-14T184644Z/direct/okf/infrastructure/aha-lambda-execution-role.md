---
title: AHA Lambda Execution Role
type: aws-iam-role
status: draft
benchmark_key: aha-lambda-execution-role
sources:
  - repository://repository-aws-health-aware-779eb7e1bc7a/CFN_DEPLOY_AHA.yml#L419-L545
relationships: []
---

# AHA Lambda Execution Role

`LambdaExecutionRole` trusts Lambda and grants the deployed function permissions to read configured secrets, query AWS Health, access the state table, send email, publish to a configured EventBridge bus, and optionally read account exclusions or assume a management-account role.

Limitation: its association with the function is captured by the function’s relationship because the role resource does not itself name the function.
