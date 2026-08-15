---
title: List cart endpoint
description: Returns the caller's shopping-cart items.
status: draft
generated:
  by: agentbase/3.0.0
  at: 2026-08-15T00:00:00Z
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L181-L201
type: API Endpoint
benchmark_key: get-cart
method: GET
route: /cart
handler: list_cart.lambda_handler
relationships: []
---

# Contract

`GET /cart` returns cart items.

# Handler

The SAM function handler is `list_cart.lambda_handler`.

# Failure Behavior

No route-specific failure behavior is declared in the API resource.
