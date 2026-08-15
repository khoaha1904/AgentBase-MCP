---
title: Get cart total Lambda
description: Returns the aggregate quantity recorded for a product.
status: draft
generated:
  by: agentbase/3.1.0
  at: "2026-08-15T00:00:00Z"
benchmark_key: get-cart-total-lambda
type: AWS Lambda
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L297-L315
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/get_cart_total.py#L18-L33
business_purpose: Retrieve a product's aggregate cart quantity.
resource_name: GetCartTotalFunction
runtime: python3.8
handler: get_cart_total.lambda_handler
relationships:
  - kind: triggered-by
    target: cart-product-total-get-endpoint
  - kind: accesses
    target: shopping-cart-dynamodb-table
---
# Get cart total Lambda

Triggered by [Cart product total endpoint](../../../api/cart-product-total-get.md) and accesses the [Shopping cart DynamoDB table](../../../data/tables/shopping-cart.md).
