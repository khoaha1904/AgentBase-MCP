---
title: Checkout cart Lambda
description: Returns and deletes the authenticated user's cart items.
status: draft
generated:
  by: agentbase/3.1.0
  at: "2026-08-15T00:00:00Z"
benchmark_key: checkout-cart-lambda
type: AWS Lambda
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L272-L296
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/checkout_cart.py#L23-L64
business_purpose: Check out an authenticated user's shopping cart.
resource_name: CheckoutCartFunction
runtime: python3.8
handler: checkout_cart.lambda_handler
relationships:
  - kind: triggered-by
    target: cart-checkout-post-endpoint
  - kind: accesses
    target: shopping-cart-dynamodb-table
---
# Checkout cart Lambda

Triggered by [Cart checkout endpoint](../../../api/cart-checkout-post.md) and accesses the [Shopping cart DynamoDB table](../../../data/tables/shopping-cart.md).
