---
type: Business Flow
title: Cart Migration
description: Authenticated flow that merges anonymous cart items into a user's cart and defers old-item deletion.
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-15T00:00:00Z
business_purpose: Preserve an anonymous cart when a user signs in.
trigger: Authenticated POST /cart/migrate.
outcome: User cart contains merged items and old anonymous items are queued for deletion.
sources:
  - id: migration-design
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L27-L38
  - id: migration-handler
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/migrate_cart.py#L46-L112
flow_steps:
  - order: 1
    source: interfaces/cart-api
    target: components/cart-migration-function
    action: invokes
    mode: synchronous
    evidence: [migration-handler]
  - order: 2
    source: components/cart-migration-function
    target: resources/shopping-cart-table
    action: reads
    mode: synchronous
    evidence: [migration-handler]
  - order: 3
    source: components/cart-migration-function
    target: resources/shopping-cart-table
    action: writes
    mode: synchronous
    evidence: [migration-handler]
  - order: 4
    source: components/cart-migration-function
    target: resources/cart-deletion-queue
    action: publishes
    mode: asynchronous
    evidence: [migration-handler]
  - order: 5
    source: resources/cart-deletion-queue
    target: components/cart-deletion-worker
    action: delivers
    mode: asynchronous
    evidence: [migration-design]
relationships:
  - kind: part-of
    target: systems/serverless-shopping-cart
    evidence: [migration-design]
    link: "[Serverless Shopping Cart](../systems/serverless-shopping-cart.md)"
---

# Purpose

Moves items associated with the browser's anonymous cart identifier into the authenticated user's cart while avoiding synchronous deletion of the old entries.

# Trigger

The frontend calls `POST /cart/migrate` after sign-in. API Gateway requires Cognito authorization for the operation.

# Outcome

The migration returns the user's cart after quantities are merged; an SQS worker later deletes the old anonymous-cart entries.

# Flow

The ordered steps are encoded in `flow_steps`: route invocation, anonymous-cart read, user-cart update, asynchronous queue publish, then asynchronous worker delivery.

Participants: [Cart API](../interfaces/cart-api.md), [Cart Migration Function](../components/cart-migration-function.md), [Shopping Cart Table](../resources/shopping-cart-table.md), [Cart Deletion Queue](../resources/cart-deletion-queue.md), and [Cart Deletion Worker](../components/cart-deletion-worker.md).

# Failure and Recovery

Invalid claims return 400. The queue's redrive policy provides message-level recovery after delivery failures, but the source does not document compensating behavior if a table update or send fails mid-migration.

# Limitations

The exact client event that invokes migration after sign-in is not shown in the inspected UI code; the repository documentation and exported client function establish the intended behavior.

Related: [Serverless Shopping Cart](../systems/serverless-shopping-cart.md).
