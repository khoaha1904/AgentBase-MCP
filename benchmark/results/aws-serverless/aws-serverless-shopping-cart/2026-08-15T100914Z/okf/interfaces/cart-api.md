---
title: Cart API
description: HTTP API surface for cart retrieval, mutation, migration, checkout, and aggregate totals.
type: API Surface
status: draft
generated:
  by: agentbase/4.0.0
  at: 2026-08-15T07:58:00Z
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L181-L315
relationships:
  - kind: provided-by
    target: components/shopping-cart-service
  - kind: part-of
    target: systems/serverless-shopping-cart
---

# Purpose

This consumer-facing surface groups related cart operations served through the `CartApi` SAM API.

It is provided by the [shopping cart service](../components/shopping-cart-service.md) and is part of the [Serverless Shopping Cart system](../systems/serverless-shopping-cart.md).

# Consumers

The Vue frontend invokes `GET` and `POST /cart`, `PUT /cart/{product_id}`, `POST /cart/migrate`, and `POST /cart/checkout` with Amplify API calls. It includes credentials and requests an authentication header where appropriate.

# Authentication

The SAM API declares a Cognito authorizer. Only migration and checkout explicitly bind that authorizer in the shown route definitions; handlers for other operations inspect authorization where needed.

# Operations

`GET /cart` retrieves a cart; `POST /cart` adds an item; `PUT /cart/{product_id}` updates an item; `POST /cart/migrate` moves anonymous items after login; `POST /cart/checkout` empties a cart; and `GET /cart/{product_id}/total` returns an aggregate quantity.

# Limitations

The source does not provide a formal versioned API specification or complete response schemas.
