---
title: Cart API
description: REST surface for shopping-cart operations.
type: API Surface
generated:
  by: agentbase/4.0.0
  at: 2026-08-15T00:00:00Z
status: draft
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L54-L80
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L57-L74
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L181-L315
relationships:
  - kind: provided-by
    target: components/shopping-cart-service
  - kind: consumed-by
    target: components/vue-shopping-cart-client
  - kind: part-of
    target: systems/serverless-shopping-cart
---
# Cart API

## Purpose

The Cart API is the consumer-facing REST boundary for retrieving and changing a cart, migrating an anonymous cart after login, checking out, and reading a per-product aggregate total.

## Consumers

The [Vue Shopping Cart Client](../components/vue-shopping-cart-client.md) calls the cart routes through Amplify.

## Authentication

The SAM API declares a Cognito authorizer. The migration and checkout route bindings explicitly use it; the client sends an ID-token Authorization header when a current session exists.

## Operations

`GET /cart`, `POST /cart`, `PUT /cart/{product_id}`, `POST /cart/migrate`, `POST /cart/checkout`, and `GET /cart/{product_id}/total` are related cart operations.

## Limitations

The documentation says the aggregate-total API is exposed without authentication; route-level authorization is not otherwise fully evidenced for every operation.

This surface is provided by the [Shopping Cart Service](../components/shopping-cart-service.md) and is part of the [Shopping Cart System](../systems/serverless-shopping-cart.md).
