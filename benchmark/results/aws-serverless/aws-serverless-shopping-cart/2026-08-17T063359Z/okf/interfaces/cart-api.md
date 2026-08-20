---
title: Cart API
description: REST API surface for cart retrieval, mutation, migration, checkout, and cart-total lookup.
type: API Surface
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-17T00:00:00Z
sources:
  - id: cart-api-readme
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L54-L80
  - id: cart-api-template
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L181-L314
  - id: client-api
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/frontend/src/backend/api.js#L29-L87
relationships:
  - kind: part-of
    target: systems/serverless-shopping-cart
    evidence: [cart-api-readme]
  - kind: implemented-in
    target: repositories/aws-serverless-shopping-cart
    evidence: [cart-api-template]
agentbase:
  live_claims:
    - id: AB-CLAIM-CART-API-AUTH
      subject: interfaces/cart-api
      property: authentication
      role: configuration
      source_id: cart-api-template
      target: { kind: api_surface, name: Cart API }
      observed: { commit: 66a863f1b7a2a7f319adddce6a55e090ce9f6734, dirty: false, dirty_digest: null }
---

# Purpose

Cart API is the consumer-facing REST boundary for the shopping-cart capability.

# Consumers

[Shopping Cart Web Client](../components/shopping-cart-web-client.md) invokes cart retrieval, additions, updates, migration, and checkout. The total lookup is documented as manually callable rather than used by the frontend.

# Authentication

The client obtains a session token when available; configuration supplies a Cognito authorizer for the migration and checkout operations. The documentation describes the total lookup as unauthenticated.

# Operations

GET `/cart`; POST `/cart`; PUT `/cart/{product_id}`; POST `/cart/migrate`; POST `/cart/checkout`; and GET `/cart/{product_id}/total` are grouped in this surface.

# Failure Behavior

The inspected source does not specify a common API error contract.

# Related Concepts

This API is part of [Serverless Shopping Cart](../systems/serverless-shopping-cart.md) and implemented in [aws-serverless-shopping-cart](../repositories/aws-serverless-shopping-cart.md).

# Limitations

Only the migration and checkout route-level authorizer settings were observed. Endpoint URL and deployed API stage are desired-state outputs, not deployed-instance evidence.
