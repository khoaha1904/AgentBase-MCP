---
title: Authentication SAM Definition
type: Infrastructure Definition
description: AWS SAM desired-state definition for Cognito user-pool authentication resources.
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-15T00:00:00Z
configuration_root: backend/auth.yaml
declared_resources:
  - CognitoUserPool
  - UserPoolClient
  - UserPoolSSM
  - UserPoolARNSSM
  - UserPoolAppClientSSM
sources:
  - id: auth-sam
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/auth.yaml#L1-L57
relationships:
  - kind: part-of
    target: system:shopping-cart-application
    evidence: [auth-sam]
    link: "[Shopping Cart Application](../systems/shopping-cart-application.md)"
  - kind: implemented-in
    target: repository:aws-serverless-shopping-cart
    evidence: [auth-sam]
    link: "[aws-serverless-shopping-cart Repository](../repositories/aws-serverless-shopping-cart.md)"
---

# Authentication SAM Definition

This SAM template declares a Cognito user pool, a client without a generated secret, and SSM parameters that expose the pool ID, ARN, and client ID to the other templates.

Related: [Shopping Cart Application](../systems/shopping-cart-application.md) and [Repository](../repositories/aws-serverless-shopping-cart.md).

# Limitations

No user-pool ID, client ID, account, region, or deployed user pool is evidenced.
