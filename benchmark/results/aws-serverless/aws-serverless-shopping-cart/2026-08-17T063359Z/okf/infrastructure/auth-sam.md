---
title: Authentication SAM Desired State
description: AWS SAM root template declaring Cognito user-pool resources and SSM parameters consumed by the cart template.
type: Infrastructure Definition
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-17T00:00:00Z
sources:
  - id: auth-sam-root
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/auth.yaml#L1-L55
relationships:
  - kind: part-of
    target: systems/serverless-shopping-cart
    evidence: [auth-sam-root]
  - kind: implemented-in
    target: repositories/aws-serverless-shopping-cart
    evidence: [auth-sam-root]
agentbase:
  live_claims:
    - id: AB-CLAIM-AUTH-USER-POOL
      subject: infrastructure/auth-sam
      property: user_pool_configuration
      role: configuration
      source_id: auth-sam-root
      target: { kind: infrastructure_definition, name: CognitoUserPool }
      observed: { commit: 66a863f1b7a2a7f319adddce6a55e090ce9f6734, dirty: false, dirty_digest: null }
---

# Purpose

This SAM template defines desired authentication resources shared by the sample's components.

# Configuration Root

The configuration root is `backend/auth.yaml`.

# Declared Architecture

It declares a Cognito user pool, user-pool client, and SSM parameters that export pool identifiers for downstream configuration.

# Inputs and Outputs

The output identifiers are configuration values, not evidence of an actual Cognito tenant.

# Related Concepts

This definition is part of [Serverless Shopping Cart](../systems/serverless-shopping-cart.md) and implemented in [aws-serverless-shopping-cart](../repositories/aws-serverless-shopping-cart.md).

# Limitations

No deployed user pool, client, user, or real authentication transaction was observed.
