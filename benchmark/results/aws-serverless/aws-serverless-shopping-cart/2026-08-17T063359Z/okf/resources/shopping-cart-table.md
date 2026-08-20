---
title: Shopping Cart DynamoDB Table
description: Desired DynamoDB cart-state table with cart-item keys, TTL, and a stream used for total projection.
type: Database Table
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-17T00:00:00Z
sources:
  - id: cart-table-template
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L373-L391
  - id: cart-stream-template
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L347-L371
relationships:
  - kind: part-of
    target: systems/serverless-shopping-cart
    evidence: [cart-table-template]
  - kind: declared-by
    target: infrastructure/shopping-cart-sam
    evidence: [cart-table-template]
agentbase:
  live_claims:
    - id: AB-CLAIM-CART-TABLE-KEYS
      subject: resources/shopping-cart-table
      property: key_schema
      role: configuration
      source_id: cart-table-template
      target: { kind: database_table, name: DynamoDBShoppingCartTable }
      observed: { commit: 66a863f1b7a2a7f319adddce6a55e090ce9f6734, dirty: false, dirty_digest: null }
    - id: AB-CLAIM-CART-TABLE-STREAM
      subject: resources/shopping-cart-table
      property: stream_configuration
      role: configuration
      source_id: cart-table-template
      target: { kind: database_table, name: DynamoDBShoppingCartTable }
      observed: { commit: 66a863f1b7a2a7f319adddce6a55e090ce9f6734, dirty: false, dirty_digest: null }
---

# Purpose

This desired table stores shopping-cart records and provides a DynamoDB stream for aggregate updates.

# Data

The template defines a composite primary key and an expiration attribute. The cart-total projection handler consumes the table stream and writes aggregate changes back to the table.

# Ownership

The table belongs to [Serverless Shopping Cart](../systems/serverless-shopping-cart.md) and is declared by [Shopping-cart SAM desired state](../infrastructure/shopping-cart-sam.md).

# Access

[Shopping Cart Service](../components/shopping-cart-service.md) reads and writes the table.

# Operations

The source defines desired capacity, TTL, and stream behavior; it does not prove a physical table exists.

# Limitations

Item shape beyond the key and expiration configuration is inferred from implementation and is not modeled as a stable schema contract.
