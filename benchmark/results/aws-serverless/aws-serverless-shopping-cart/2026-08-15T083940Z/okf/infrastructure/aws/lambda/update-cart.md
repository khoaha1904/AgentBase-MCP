---
title: Update cart Lambda
description: Replaces a cart product quantity.
status: draft
generated:
  by: agentbase/3.1.0
  at: "2026-08-15T00:00:00Z"
benchmark_key: update-cart-lambda
type: AWS Lambda
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L224-L245
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/update_cart.py#L28-L107
business_purpose: Set the quantity of a product in a shopping cart.
resource_name: UpdateCartFunction
runtime: python3.8
handler: update_cart.lambda_handler
relationships:
  - kind: triggered-by
    target: cart-product-put-endpoint
  - kind: accesses
    target: shopping-cart-dynamodb-table
---
# Update cart Lambda

Triggered by [Cart product PUT endpoint](../../../api/cart-product-put.md) and accesses the [Shopping cart DynamoDB table](../../../data/tables/shopping-cart.md). It calls the product service URL configured through an SSM parameter, but that dependency is not represented because the selected schemas provide no matching concrete target type.
