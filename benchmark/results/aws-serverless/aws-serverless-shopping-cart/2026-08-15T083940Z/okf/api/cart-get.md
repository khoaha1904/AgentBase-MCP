---
title: Cart GET endpoint
description: Retrieves items in a shopping cart.
status: draft
generated:
  by: agentbase/3.1.0
  at: "2026-08-15T00:00:00Z"
benchmark_key: cart-get-endpoint
type: API Endpoint
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L181-L201
method: GET
route: /cart
handler: list_cart.lambda_handler
relationships:
  - kind: handled-by
    target: list-cart-lambda
---
# Cart GET endpoint

Handled by [List cart Lambda](../infrastructure/aws/lambda/list-cart.md).
