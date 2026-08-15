---
title: Cart Migration
description: Moves anonymous cart quantities into the authenticated user's cart after sign-in.
type: Business Flow
status: draft
generated:
  by: agentbase/0.2
  at: "2026-08-15T00:00:00Z"
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L27-L38
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L246-L270
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/migrate_cart.py#L46-L112
relationships:
  - kind: part-of
    target: systems/shopping-cart
  - kind: triggered-by
    target: interfaces/cart-api
  - kind: implemented-by
    target: components/shopping-cart-service
  - kind: reads-from
    target: resources/shopping-cart-table
  - kind: writes-to
    target: resources/shopping-cart-table
  - kind: sends-to
    target: resources/cart-deletion-queue
---
# Purpose

After login, merge an anonymous cart into the user's existing cart without requiring anonymous-item deletion to complete synchronously.

# Trigger and Outcome

`POST /cart/migrate` is Cognito-authorized. The handler obtains the anonymous cart identifier from the request, obtains the authenticated subject from API Gateway claims, adds each anonymous item quantity into the user's cart, and returns the resulting user cart.

# Asynchronous Step

For every migrated anonymous item, the handler sends an SQS message. The service's SQS-bound deletion worker removes those old cart items; its queue and dead-letter queue settings are defined by the [Shopping Cart SAM Definition](../infrastructure/shopping-cart-sam.md).

# Interactions

The flow uses the [Cart API](../interfaces/cart-api.md), [Shopping Cart Service](../components/shopping-cart-service.md), [Shopping Cart Table](../resources/shopping-cart-table.md), and [Cart Deletion Queue](../resources/cart-deletion-queue.md).

# Limitations

The source does not describe replay, idempotency, or a user-visible outcome when asynchronous deletion is delayed or fails.

# Relationships

[systems/shopping-cart](../systems/shopping-cart.md)
[interfaces/cart-api](../interfaces/cart-api.md)
[components/shopping-cart-service](../components/shopping-cart-service.md)
[resources/shopping-cart-table](../resources/shopping-cart-table.md)
[resources/cart-deletion-queue](../resources/cart-deletion-queue.md)
