---
title: Cart Migration and Cleanup
description: Sign-in flow that merges an anonymous cart into a user cart and defers deletion of old records.
type: Business Flow
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-17T00:00:00Z
sources:
  - id: migration-design
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L27-L38
  - id: migrate-route
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L246-L270
  - id: delete-queue-trigger
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L316-L345
flow_steps:
  - order: 1
    source: components/shopping-cart-web-client
    target: interfaces/cart-api
    action: invokes
    mode: synchronous
    evidence: [migration-design]
  - order: 2
    source: interfaces/cart-api
    target: components/shopping-cart-service
    action: invokes
    mode: synchronous
    evidence: [migrate-route]
  - order: 3
    source: components/shopping-cart-service
    target: resources/cart-deletion-queue
    action: publishes
    mode: asynchronous
    evidence: [migration-design]
  - order: 4
    source: resources/cart-deletion-queue
    target: components/shopping-cart-service
    action: delivers
    mode: asynchronous
    evidence: [delete-queue-trigger]
relationships:
  - kind: part-of
    target: systems/serverless-shopping-cart
    evidence: [migration-design]
---

# Purpose

Migration preserves cart quantities while changing anonymous-cart ownership to the signed-in user and moves old-item deletion out of the request path.

# Trigger

The web client calls the cart migration route after login.

# Outcome

Anonymous-cart items are merged into the user's cart; deletion work is queued for asynchronous processing.

# Flow

The ordered steps are recorded in `flow_steps`: client request, Cart API routing, cart-state update, queue publication, then queue-triggered service processing.

# Participants

The flow is part of [Serverless Shopping Cart](../systems/serverless-shopping-cart.md) and connects [Shopping Cart Web Client](../components/shopping-cart-web-client.md), [Cart API](../interfaces/cart-api.md), [Shopping Cart Service](../components/shopping-cart-service.md), and [Cart Deletion SQS Queue](../resources/cart-deletion-queue.md).

# Failure and Recovery

The template configures a dead-letter queue for deletion messages. The source does not describe application-level retry, idempotency, or compensation semantics.

# Limitations

The message contract and exact deletion handler outcome are not documented as a stable external contract.
