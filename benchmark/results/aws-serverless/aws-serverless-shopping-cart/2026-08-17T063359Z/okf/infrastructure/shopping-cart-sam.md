---
title: Shopping-cart SAM Desired State
description: AWS SAM root template declaring the cart API, Lambda handlers, DynamoDB table, queues, roles, and parameters.
type: Infrastructure Definition
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-17T00:00:00Z
sources:
  - id: cart-sam-root
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L1-L430
relationships:
  - kind: part-of
    target: systems/serverless-shopping-cart
    evidence: [cart-sam-root]
  - kind: implemented-in
    target: repositories/aws-serverless-shopping-cart
    evidence: [cart-sam-root]
agentbase:
  live_claims:
    - id: AB-CLAIM-CART-SAM-API-STAGE
      subject: infrastructure/shopping-cart-sam
      property: api_stage
      role: configuration
      source_id: cart-sam-root
      target: { kind: infrastructure_definition, name: CartApi }
      observed: { commit: 66a863f1b7a2a7f319adddce6a55e090ce9f6734, dirty: false, dirty_digest: null }
---

# Purpose

This SAM template is desired state for the cart API, cart handlers, storage, queueing, IAM, and parameter outputs.

# Configuration Root

The configuration root is `backend/shoppingcart-service.yaml`.

# Declared Architecture

It declares API-triggered cart handlers, an SQS-triggered deletion handler, a DynamoDB-stream handler, the cart table, main and dead-letter queues, a shared layer, and supporting IAM/API resources.

# Inputs and Outputs

It takes references to authentication and product-service configuration through SSM parameters and publishes a cart API URL through an SSM parameter/output.

# Related Concepts

This definition is part of [Serverless Shopping Cart](../systems/serverless-shopping-cart.md) and implemented in [aws-serverless-shopping-cart](../repositories/aws-serverless-shopping-cart.md).

# Limitations

This is desired state. Parameter paths and intrinsic values do not prove that any stack has been deployed.
