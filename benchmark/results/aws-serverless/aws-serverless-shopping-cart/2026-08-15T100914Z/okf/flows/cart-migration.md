---
title: Cart migration
description: Login-time flow that merges an anonymous cart into an authenticated user's cart and defers old-item deletion.
type: Business Flow
status: draft
generated:
  by: agentbase/4.0.0
  at: 2026-08-15T07:58:00Z
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L27-L38
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/migrate_cart.py#L46-L112
relationships:
  - kind: part-of
    target: systems/serverless-shopping-cart
  - kind: implemented-by
    target: components/shopping-cart-service
  - kind: uses
    target: resources/shopping-cart-table
  - kind: sends-to
    target: resources/cart-deletion-queue
---

# Purpose

After login, the flow replaces anonymous-cart items with items keyed to the signed-in user while preserving quantities from prior authenticated sessions.

It is part of the [Serverless Shopping Cart system](../systems/serverless-shopping-cart.md).

# Steps

The migration handler reads the anonymous cart, updates each item under the authenticated user key, and publishes each old item to the [cart deletion queue](../resources/cart-deletion-queue.md). It waits for update threads, then strongly consistently reads and returns the authenticated cart.

# Interactions

This flow is implemented by the [shopping cart service](../components/shopping-cart-service.md), accesses the [shopping cart table](../resources/shopping-cart-table.md), and is exposed through `POST /cart/migrate` on the [Cart API](../interfaces/cart-api.md).

# Limitations

No message idempotency, retry handling, or observed latency is documented.
