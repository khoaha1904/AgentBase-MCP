---
title: Cart product total endpoint
description: Retrieves the aggregate quantity for a product.
status: draft
generated:
  by: agentbase/3.1.0
  at: "2026-08-15T00:00:00Z"
benchmark_key: cart-product-total-get-endpoint
type: API Endpoint
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L297-L315
method: GET
route: /cart/{product_id}/total
handler: get_cart_total.lambda_handler
relationships:
  - kind: handled-by
    target: get-cart-total-lambda
---
# Cart product total endpoint

Handled by [Get cart total Lambda](../infrastructure/aws/lambda/get-cart-total.md).
