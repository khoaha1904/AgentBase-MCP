---
title: Shopping Cart Table
description: DynamoDB table that stores cart entries and per-product aggregate quantity records.
type: Database Table
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-16T00:00:00Z
resource_name: DynamoDBShoppingCartTable
sources:
  - id: table-declaration
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L373-L391
  - id: table-aggregation
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/db_stream_handler.py#L25-L71
relationships:
  - kind: part-of
    target: systems/serverless-shopping-cart
    evidence: [table-declaration]
  - kind: declared-by
    target: infrastructure/shopping-cart-sam-stack
    evidence: [table-declaration]
---

# Purpose

The table holds cart records keyed by identity and product, and aggregate records keyed by product with `totalquantity` as the sort key.

# Data

The declared schema uses string `pk` and `sk` keys and on-demand billing. Cart records carry quantity, product detail, and `expirationTime`; the stream handler updates per-product aggregate quantities.

# Access

Shopping-cart handlers query, put, update, and delete cart records. A DynamoDB stream with old and new images triggers the aggregate handler.

# Limitations

This describes a declared table, not an identified deployed DynamoDB resource. No backup, point-in-time recovery, encryption, or access-pattern documentation is evidenced.

## Relationships

The table is part of the [Serverless Shopping Cart](../systems/serverless-shopping-cart.md) and is declared by the [Shopping Cart SAM Stack](../infrastructure/shopping-cart-sam-stack.md).
