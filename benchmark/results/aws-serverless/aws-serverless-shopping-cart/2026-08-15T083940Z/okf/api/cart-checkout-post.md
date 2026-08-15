---
title: Cart checkout endpoint
description: Checks out the authenticated user's cart.
status: draft
generated:
  by: agentbase/3.1.0
  at: "2026-08-15T00:00:00Z"
benchmark_key: cart-checkout-post-endpoint
type: API Endpoint
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L272-L296
method: POST
route: /cart/checkout
handler: checkout_cart.lambda_handler
relationships:
  - kind: handled-by
    target: checkout-cart-lambda
---
# Cart checkout endpoint

Handled by [Checkout cart Lambda](../infrastructure/aws/lambda/checkout-cart.md). The SAM event configures the Cognito authorizer; the repository does not expose the full authentication contract here.
