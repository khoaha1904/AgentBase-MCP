---
title: Anonymous Cart Migration
description: Transfers an anonymous cart to a user's authenticated cart and asynchronously removes the old items.
type: Business Flow
status: draft
generated:
  by: agentbase/3.0.0
  at: "2026-08-15T00:00:00Z"
benchmark_key: anonymous-cart-migration
business_purpose: Preserve a shopper's anonymous cart when they sign in.
trigger: Authenticated POST /cart/migrate request.
outcome: Cart items are available under the authenticated user and old anonymous items are queued for deletion.
relationships:
  - kind: step
    target: cart-migration-api
  - kind: step
    target: cart-migration-lambda
  - kind: step
    target: cart-deletion-queue
  - kind: step
    target: cart-deletion-lambda
  - kind: step
    target: shopping-cart-table
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L27-L38
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/migrate_cart.py#L65-L111
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/delete_from_cart.py#L21-L26
---
# Trigger

[Cart Migration API](../api/cart-migration.md) receives an authenticated request after a shopper logs in.

# Outcome

The migration handler returns products from the authenticated cart after it has updated the table; old anonymous items are sent for asynchronous deletion.

# Flow

1. [Cart Migration API](../api/cart-migration.md) invokes [Cart Migration Lambda](../infrastructure/aws/lambda/cart-migration.md).
2. The Lambda reads and updates [Shopping Cart Table](../data/tables/shopping-cart.md), then publishes old items to [Cart Deletion Queue](../infrastructure/aws/sqs/cart-deletion.md).
3. [Cart Deletion Lambda](../infrastructure/aws/lambda/cart-deletion.md) consumes the messages and deletes the old table items.

# Failure and Recovery

The handler returns HTTP 400 when authenticated-user claims are missing. Queue redrive is configured after five receives; no dead-letter consumer is evidenced.
