---
title: Add to cart Lambda
description: Adds a product quantity to a cart after retrieving product details.
status: draft
generated:
  by: agentbase/3.1.0
  at: "2026-08-15T00:00:00Z"
benchmark_key: add-to-cart-lambda
type: AWS Lambda
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L202-L223
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/add_to_cart.py#L28-L114
business_purpose: Add product quantities to a shopping cart.
resource_name: AddToCartFunction
runtime: python3.8
handler: add_to_cart.lambda_handler
relationships:
  - kind: triggered-by
    target: cart-post-endpoint
  - kind: accesses
    target: shopping-cart-dynamodb-table
---
# Add to cart Lambda

Triggered by [Cart POST endpoint](../../../api/cart-post.md) and accesses the [Shopping cart DynamoDB table](../../../data/tables/shopping-cart.md). It calls the product service URL configured through an SSM parameter, but that dependency is not represented because the selected schemas provide no matching concrete target type.
