---
title: Management Account Role ARN Secret
type: aws-secrets-manager-secret
status: draft
benchmark_key: management-account-role-arn-secret
sources:
  - repository://repository-aws-health-aware-779eb7e1bc7a/CFN_DEPLOY_AHA.yml#L627-L642
relationships: []
---

# Management Account Role ARN Secret

`AssumeRoleSecret` conditionally stores the deployment-supplied management-account role ARN as `AssumeRoleArn` for cross-account Health access.

Limitation: the target management-account role is supplied externally and is not defined in this deployment template.
