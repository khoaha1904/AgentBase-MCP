---
title: Get cart item total endpoint
description: Returns the total for a cart item identified by product ID.
status: draft
generated:
  by: agentbase/3.0.0
  at: 2026-08-15T00:00:00Z
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L297-L314
type: API Endpoint
benchmark_key: get-cart-product-id-total
method: GET
route: /cart/{product_id}/total
handler: get_cart_total.lambda_handler
relationships: []
---

# Contract

`GET /cart/{product_id}/total` returns an item total.

# Handler

The SAM function handler is `get_cart_total.lambda_handler`.

# Failure Behavior

No route-specific failure behavior is declared in the API resource.
