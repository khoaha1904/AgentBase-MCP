---
title: Checkout cart endpoint
description: Checks out the caller's cart.
status: draft
generated:
  by: agentbase/3.0.0
  at: 2026-08-15T00:00:00Z
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L272-L295
type: API Endpoint
benchmark_key: post-cart-checkout
method: POST
route: /cart/checkout
handler: checkout_cart.lambda_handler
relationships: []
---

# Contract

`POST /cart/checkout` checks out a cart.

# Handler

The SAM function handler is `checkout_cart.lambda_handler` and the route uses the Cognito authorizer.

# Failure Behavior

No route-specific failure behavior is declared in the API resource.
