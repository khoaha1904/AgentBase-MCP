---
title: Cart Table
description: DynamoDB table holding cart items and per-product aggregate records.
type: Database Table
generated:
  by: agentbase/4.0.0
  at: 2026-08-15T00:00:00Z
status: draft
resource_name: DynamoDBShoppingCartTable
keys:
  - pk
  - sk
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L373-L391
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/db_stream_handler.py#L27-L67
relationships:
  - kind: accessed-by
    target: components/shopping-cart-service
  - kind: updated-by
    target: components/cart-aggregate-lambda
---
# Cart Table

## Purpose

`DynamoDBShoppingCartTable` is the durable cart data resource. It has composite `pk` and `sk` keys, on-demand billing, and a DynamoDB Stream carrying new and old images.

## Data

The source stores cart item records under keys that include `product#`. The stream processor writes per-product aggregate records with `sk` equal to `totalquantity`.

## Operations

TTL is enabled on `expirationTime`. The [Cart Aggregate Lambda](../components/cart-aggregate-lambda.md) computes quantity deltas from stream records and adds them to the aggregate record.

## Limitations

The table definition does not prove retention timing in a deployed account or describe backup, encryption, or recovery configuration.

The [Shopping Cart Service](../components/shopping-cart-service.md) accesses this table.
