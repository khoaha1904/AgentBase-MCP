---
title: DynamoDB shopping cart table
description: DynamoDB table that stores shopping-cart items.
status: draft
generated:
  by: agentbase/3.0.0
  at: 2026-08-15T00:00:00Z
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L373-L391
type: Database Table
benchmark_key: dynamodb-shopping-cart-table
resource_name: DynamoDBShoppingCartTable
keys: pk (HASH), sk (RANGE)
relationships: []
---

# Data

The table uses `pk` and `sk` as its primary key and enables TTL on `expirationTime`.

# Ownership

The shopping-cart SAM stack declares this table.

# Access

The infrastructure binds the table name to functions, but no Lambda concept is included because the selected schema guidance does not define one.
