---
title: Shopping cart table
description: DynamoDB table holding cart items and derived product-quantity totals.
type: Database Table
status: draft
generated:
  by: agentbase/4.0.0
  at: 2026-08-15T07:58:00Z
resource_name: DynamoDBShoppingCartTable
keys: pk, sk
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L373-L391
relationships:
  - kind: accessed-by
    target: components/shopping-cart-service
---

# Purpose

The table persists cart items and supports the cart service's aggregate total records.

# Data

It has a string partition key `pk` and sort key `sk`, uses on-demand billing, streams new and old images, and enables TTL on `expirationTime`. Cart handlers use anonymous-cart or authenticated-user prefixes in the partition key and `product#` product sort keys.

# Access

The [shopping cart service](../components/shopping-cart-service.md) reads and writes the table. Its stream handler processes item changes and updates aggregate product quantities in the same table.

# Operations

The table's stream is configured as the source for the aggregate handler, with batches up to 100 records and a 60-second batching window.

# Limitations

The configuration does not establish an actual table name, deployed data, backups, or retention beyond item TTL.
