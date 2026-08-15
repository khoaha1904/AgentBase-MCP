---
title: Shopping Cart API
type: API Surface
description: REST surface for anonymous and authenticated shopping-cart operations.
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-15T00:00:00Z
sources:
  - id: cart-api-design
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L54-L80
  - id: cart-api-definition
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L57-L75
---

# Shopping Cart API

The cart REST surface retrieves, adds, and updates cart items; it also migrates an anonymous cart after login, checks out by emptying the cart, and exposes per-product totals across carts.

## Operations

`GET /cart`, `POST /cart`, and `PUT /cart/{product-id}` manage a cart. `POST /cart/migrate` and `POST /cart/checkout` are authenticated in the SAM definition. `GET /cart/{product-id}/total` is described as an unauthenticated demonstration endpoint and is not used by the frontend.

# Limitations

The source specifies logical paths and a `Prod` API stage but no deployed hostname or endpoint.
