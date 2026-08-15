---
title: Cart product PUT endpoint
description: Sets a cart product quantity.
status: draft
generated:
  by: agentbase/3.1.0
  at: "2026-08-15T00:00:00Z"
benchmark_key: cart-product-put-endpoint
type: API Endpoint
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L224-L245
method: PUT
route: /cart/{product_id}
handler: update_cart.lambda_handler
relationships:
  - kind: handled-by
    target: update-cart-lambda
---
# Cart product PUT endpoint

Handled by [Update cart Lambda](../infrastructure/aws/lambda/update-cart.md).
