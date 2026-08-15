---
title: Shopping cart service
description: SAM-defined serverless service that manages carts, migration, checkout, and cart totals.
type: Service
status: draft
generated:
  by: agentbase/4.0.0
  at: 2026-08-15T07:58:00Z
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L181-L371
relationships:
  - kind: part-of
    target: systems/serverless-shopping-cart
  - kind: provides
    target: interfaces/cart-api
  - kind: accesses
    target: resources/shopping-cart-table
  - kind: produces-to
    target: resources/cart-deletion-queue
  - kind: consumes-from
    target: resources/cart-deletion-queue
---

# Responsibility

This SAM service supplies Lambda handlers for cart retrieval, additions, updates, migration, checkout, totals, deferred deletion, and DynamoDB-stream processing. Its functions share a cart API, utility layer, table configuration, logging, tracing, and metrics defaults.

It is part of the [Serverless Shopping Cart system](../systems/serverless-shopping-cart.md).

# Interfaces

It provides the [Cart API](../interfaces/cart-api.md). The service receives the product-service URL through configuration for add, update, migration, and checkout handlers.

# Dependencies

The service reads and writes the [shopping cart table](../resources/shopping-cart-table.md). Migration sends deletion work to the [cart deletion queue](../resources/cart-deletion-queue.md), whose event source invokes the deletion handler.

# Operations

The [shopping-cart SAM definition](../infrastructure/shopping-cart-sam-definition.md) configures a five-second global function timeout, active tracing, API logging and metrics; migration and checkout override their timeouts.

# Limitations

The template proves configuration, not a deployed service instance or runtime health.
