---
title: Authentication SAM Stack
description: AWS SAM desired-state definition for Cognito user-pool resources and SSM parameter publication.
type: Infrastructure Definition
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-16T00:00:00Z
configuration_root: backend/auth.yaml
declared_resources:
  - CognitoUserPool
  - UserPoolClient
  - UserPoolSSM
  - UserPoolARNSSM
  - UserPoolAppClientSSM
sources:
  - id: auth-stack-definition
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/auth.yaml#L1-L57
relationships:
  - kind: part-of
    target: systems/serverless-shopping-cart
    evidence: [auth-stack-definition]
  - kind: implemented-in
    target: repositories/repository-aws-serverless-shopping-cart-708d65caf454
    evidence: [auth-stack-definition]
---

# Purpose

This SAM template defines Cognito authentication resources consumed by the shopping-cart stack.

# Configuration Root

`backend/auth.yaml` is an AWS SAM template defining a user pool and application client.

# Declared Architecture

The user pool auto-verifies email. The user-pool ID, ARN, and client ID are published to named SSM parameters.

# Inputs and Outputs

The template exposes user-pool and client IDs as outputs; it has no declared parameters.

# Limitations

The configuration does not prove a created Cognito pool, user population, or deployed client.

## Relationships

The definition belongs to the [Serverless Shopping Cart](../systems/serverless-shopping-cart.md) and is implemented in the [repository](../repositories/repository-aws-serverless-shopping-cart-708d65caf454.md).
