---
title: List cart Lambda
description: Lists items in an anonymous or authenticated shopping cart.
status: draft
generated:
  by: agentbase/3.1.0
  at: "2026-08-15T00:00:00Z"
benchmark_key: list-cart-lambda
type: AWS Lambda
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L181-L201
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/list_cart.py#L19-L60
business_purpose: List shopping cart items.
resource_name: ListCartFunction
runtime: python3.8
handler: list_cart.lambda_handler
relationships:
  - kind: triggered-by
    target: cart-get-endpoint
  - kind: accesses
    target: shopping-cart-dynamodb-table
---
# List cart Lambda

Triggered by [Cart GET endpoint](../../../api/cart-get.md) and accesses the [Shopping cart DynamoDB table](../../../data/tables/shopping-cart.md). The configured shared function timeout is five seconds.
