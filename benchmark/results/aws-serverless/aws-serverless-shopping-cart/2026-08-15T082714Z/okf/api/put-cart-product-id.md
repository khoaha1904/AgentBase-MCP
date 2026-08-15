---
title: Update cart item endpoint
description: Updates a cart item identified by product ID.
status: draft
generated:
  by: agentbase/3.0.0
  at: 2026-08-15T00:00:00Z
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L224-L244
type: API Endpoint
benchmark_key: put-cart-product-id
method: PUT
route: /cart/{product_id}
handler: update_cart.lambda_handler
relationships: []
---

# Contract

`PUT /cart/{product_id}` updates a cart item.

# Handler

The SAM function handler is `update_cart.lambda_handler`.

# Failure Behavior

No route-specific failure behavior is declared in the API resource.
