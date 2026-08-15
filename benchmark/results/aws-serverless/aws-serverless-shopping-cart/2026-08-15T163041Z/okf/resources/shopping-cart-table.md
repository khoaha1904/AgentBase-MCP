---
type: Database Table
title: Shopping Cart Table
description: Desired DynamoDB table for cart entries and materialized per-product totals.
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-15T00:00:00Z
resource_name: DynamoDBShoppingCartTable
keys: "pk (HASH), sk (RANGE)"
sources:
  - id: table-definition
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L373-L391
  - id: cart-write-code
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/add_to_cart.py#L73-L105
  - id: total-projector-code
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/db_stream_handler.py#L32-L67
relationships:
  - kind: part-of
    target: systems/serverless-shopping-cart
    evidence: [table-definition]
    link: "[Serverless Shopping Cart](../systems/serverless-shopping-cart.md)"
  - kind: declared-by
    target: infrastructure/shopping-cart-sam-stack
    evidence: [table-definition]
    link: "[Shopping Cart SAM Stack](../infrastructure/shopping-cart-sam-stack.md)"
---

# Purpose

Stores cart product entries and the per-product `totalquantity` entries maintained from stream events.

# Data

The desired table has string partition key `pk` and sort key `sk`, on-demand billing, `NEW_AND_OLD_IMAGES` stream records, and TTL enabled on `expirationTime`. Cart items use identities such as `cart#{cart_id}` or `user#{user_id}` with `product#{product_id}` sort keys.

# Ownership

The [Shopping Cart Service](../components/shopping-cart-service.md) declares and uses this table.

# Access

Cart handlers update product entries. The [Cart Total Projector](../components/cart-total-projector.md) consumes stream records and updates the `totalquantity` record for each product.

# Operations

TTL behavior is documented as one day for anonymous carts and seven days for logged-in carts, but migration code sets migrated user items to 30 days. This is an implementation/documentation disagreement.

# Limitations

The template is desired state only; no table name, ARN, contents, capacity usage, backup configuration, or deployed instance is evidenced.

Related: [Serverless Shopping Cart](../systems/serverless-shopping-cart.md) and [Shopping Cart SAM Stack](../infrastructure/shopping-cart-sam-stack.md).
