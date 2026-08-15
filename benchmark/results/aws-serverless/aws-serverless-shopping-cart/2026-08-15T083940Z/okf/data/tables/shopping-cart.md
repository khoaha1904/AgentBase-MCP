---
title: Shopping cart DynamoDB table
description: Stores cart items and per-product quantity aggregates.
status: draft
generated:
  by: agentbase/3.1.0
  at: "2026-08-15T00:00:00Z"
benchmark_key: shopping-cart-dynamodb-table
type: Database Table
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L373-L391
resource_name: DynamoDBShoppingCartTable
keys: pk (HASH), sk (RANGE)
relationships:
  - kind: accessed-by
    target: list-cart-lambda
  - kind: accessed-by
    target: add-to-cart-lambda
  - kind: accessed-by
    target: update-cart-lambda
  - kind: accessed-by
    target: migrate-cart-lambda
  - kind: accessed-by
    target: checkout-cart-lambda
  - kind: accessed-by
    target: get-cart-total-lambda
  - kind: accessed-by
    target: delete-from-cart-lambda
  - kind: accessed-by
    target: cart-db-stream-lambda
---
# Shopping cart DynamoDB table

The table has `pk` and `sk` keys, on-demand billing, a `NEW_AND_OLD_IMAGES` stream, and TTL attribute `expirationTime`.

Accessed by [List cart Lambda](../../infrastructure/aws/lambda/list-cart.md), [Add to cart Lambda](../../infrastructure/aws/lambda/add-to-cart.md), [Update cart Lambda](../../infrastructure/aws/lambda/update-cart.md), [Migrate cart Lambda](../../infrastructure/aws/lambda/migrate-cart.md), [Checkout cart Lambda](../../infrastructure/aws/lambda/checkout-cart.md), [Get cart total Lambda](../../infrastructure/aws/lambda/get-cart-total.md), [Delete from cart Lambda](../../infrastructure/aws/lambda/delete-from-cart.md), and [Cart database stream Lambda](../../infrastructure/aws/lambda/cart-db-stream.md).
