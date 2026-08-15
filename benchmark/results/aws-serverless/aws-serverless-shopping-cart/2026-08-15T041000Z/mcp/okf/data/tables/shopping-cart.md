---
title: Shopping Cart Table
description: DynamoDB table storing cart items and aggregate product totals.
type: Database Table
status: draft
generated:
  by: agentbase/3.0.0
  at: "2026-08-15T00:00:00Z"
benchmark_key: shopping-cart-table
resource_name: DynamoDBShoppingCartTable
keys: pk (HASH), sk (RANGE)
relationships:
  - kind: accessed-by
    target: cart-migration-lambda
  - kind: accessed-by
    target: cart-deletion-lambda
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L373-L390
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/migrate_cart.py#L65-L100
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/delete_from_cart.py#L21-L26
---
# Data

The table has string partition key `pk`, string sort key `sk`, and a TTL attribute named `expirationTime`.

# Ownership

The `DynamoDBShoppingCartTable` resource is declared in the shopping-cart SAM template.

# Access

[Cart Migration Lambda](../../infrastructure/aws/lambda/cart-migration.md) queries and updates cart items; [Cart Deletion Lambda](../../infrastructure/aws/lambda/cart-deletion.md) batch-deletes queued items.
