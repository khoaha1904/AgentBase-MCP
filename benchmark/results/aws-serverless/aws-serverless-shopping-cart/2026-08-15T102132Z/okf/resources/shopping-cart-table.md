---
title: Shopping Cart Table
description: DynamoDB table storing cart items and per-product aggregate records.
type: Database Table
status: draft
generated:
  by: agentbase/0.2
  at: "2026-08-15T00:00:00Z"
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L373-L391
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/db_stream_handler.py#L52-L67
relationships:
  - kind: part-of
    target: systems/shopping-cart
  - kind: used-by
    target: components/shopping-cart-service
  - kind: triggers
    target: flows/cart-total-maintenance
---
# Purpose

The table stores cart items keyed by `pk` and `sk`; the aggregate-maintenance handler also writes per-product `totalquantity` records into it.

# Configuration

The SAM definition declares on-demand billing, a DynamoDB stream with new and old images, and TTL using the `expirationTime` attribute.

# Interactions

It supports the [Shopping Cart Service](../components/shopping-cart-service.md), [Cart Migration](../flows/cart-migration.md), and [Cart Total Maintenance](../flows/cart-total-maintenance.md).

# Limitations

The source does not provide retention timing or observed table state for a deployed instance.

# Relationships

[systems/shopping-cart](../systems/shopping-cart.md)
[components/shopping-cart-service](../components/shopping-cart-service.md)
[flows/cart-total-maintenance](../flows/cart-total-maintenance.md)
