---
title: Authentication SAM Definition
description: AWS SAM/CloudFormation root definition for the Cognito user pool and exported identifiers.
type: Infrastructure Definition
generated:
  by: agentbase/4.0.0
  at: 2026-08-15T00:00:00Z
status: draft
configuration_root: backend/auth.yaml
declared_resources:
  - CognitoUserPool
  - UserPoolClient
  - UserPoolSSM
  - UserPoolARNSSM
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L6-L8
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/auth.yaml#L1-L56
relationships:
  - kind: configures
    target: interfaces/cart-api
  - kind: part-of
    target: systems/serverless-shopping-cart
---
# Authentication SAM Definition

## Purpose

`backend/auth.yaml` declares a Cognito user pool, user-pool client, and SSM parameters exposing their identifiers for the other templates.

## Configuration Root

The user pool auto-verifies email addresses. The user-pool client is configured without a generated secret and permits `ADMIN_NO_SRP_AUTH`.

## Declared Architecture

The [Cart API](../interfaces/cart-api.md) references the exported user-pool ARN to define its Cognito authorizer. This template is separate because the README identifies authentication as likely shared between components.

## Limitations

The source does not evidence actual users, a deployed pool, or an authorization policy beyond the configured API authorizer.

This definition is part of the [Shopping Cart System](../systems/serverless-shopping-cart.md).
