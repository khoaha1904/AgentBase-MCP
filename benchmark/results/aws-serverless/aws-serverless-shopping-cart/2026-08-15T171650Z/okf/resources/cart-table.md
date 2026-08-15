---
title: Cart DynamoDB Table
description: Desired-state DynamoDB table for cart items and per-product aggregate records.
type: Database Table
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-16T00:00:00Z
sources:
  - id: cart-table-definition
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L373-L391
  - id: aggregation-handler
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/db_stream_handler.py#L25-L71
relationships:
  - kind: part-of
    target: systems/serverless-shopping-cart
    evidence: [cart-table-definition]
  - kind: declared-by
    target: infrastructure/cart-sam-template
    evidence: [cart-table-definition]
---

# Cart DynamoDB Table

## Purpose

Stores cart items keyed by `pk` and `sk`, including aggregate quantity records maintained by the stream handler.

## Data Model

The definition specifies string `pk` (hash) and `sk` (range) keys, on-demand billing, and TTL using `expirationTime`.

## Change Stream

The table emits `NEW_AND_OLD_IMAGES`, consumed by the cart quantity aggregation Lambda.

## Limitations

This describes an `AWS::DynamoDB::Table` definition, not a discovered table instance or its data.

## Relationship Links

- [Serverless Shopping Cart](../systems/serverless-shopping-cart.md)
- [Cart SAM Template](../infrastructure/cart-sam-template.md)
