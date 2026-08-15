---
title: Cart POST endpoint
description: Adds a product quantity to a shopping cart.
status: draft
generated:
  by: agentbase/3.1.0
  at: "2026-08-15T00:00:00Z"
benchmark_key: cart-post-endpoint
type: API Endpoint
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L202-L223
method: POST
route: /cart
handler: add_to_cart.lambda_handler
relationships:
  - kind: handled-by
    target: add-to-cart-lambda
---
# Cart POST endpoint

Handled by [Add to cart Lambda](../infrastructure/aws/lambda/add-to-cart.md).
