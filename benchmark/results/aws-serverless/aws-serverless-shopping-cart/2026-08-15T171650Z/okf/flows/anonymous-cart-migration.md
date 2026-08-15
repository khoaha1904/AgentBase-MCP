---
title: Anonymous Cart Migration
description: Moves an anonymous browser cart to an authenticated user's cart and defers cleanup.
type: Business Flow
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-16T00:00:00Z
business_purpose: Preserve anonymous cart contents when a user logs in.
trigger: Authenticated POST /cart/migrate.
outcome: User cart contains merged items and anonymous entries are queued for deletion.
sources:
  - id: migration-docs
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L27-L38
  - id: migration-handler
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/migrate_cart.py#L46-L112
  - id: migration-route
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L246-L270
flow_steps:
  - order: 1
    source: interfaces/cart-api
    action: invokes
    target: components/cart-service
    mode: synchronous
    evidence: [migration-route]
  - order: 2
    source: components/cart-service
    action: writes
    target: resources/cart-table
    mode: synchronous
    evidence: [migration-handler]
  - order: 3
    source: components/cart-service
    action: publishes
    target: resources/cart-cleanup-queue
    mode: asynchronous
    evidence: [migration-handler]
  - order: 4
    source: resources/cart-cleanup-queue
    action: delivers
    target: components/cart-cleanup-worker
    mode: asynchronous
    evidence: [migration-route]
relationships:
  - kind: part-of
    target: systems/serverless-shopping-cart
    evidence: [migration-docs]
---

# Anonymous Cart Migration

## Purpose

Merges an authenticated user's anonymous-cart items into their user cart while avoiding synchronous deletion.

## Trigger

The frontend calls authenticated `POST /cart/migrate` after login.

## Outcome

Items are added to the user-keyed cart, and old anonymous items are queued for cleanup.

## Flow

The ordered steps in frontmatter capture the HTTP request, table read/update, asynchronous message publication, and worker delivery.

## Failure and Recovery

Invalid authorization claims produce a 400 response. The SQS queue retries cleanup and redrives after five receives.

## Limitations

The migration handler waits for local update threads but does not document cross-item transaction semantics.

## Relationship Links

- [Serverless Shopping Cart](../systems/serverless-shopping-cart.md)
- [Cart REST API](../interfaces/cart-api.md)
- [Cart Service](../components/cart-service.md)
- [Cart DynamoDB Table](../resources/cart-table.md)
- [Cart Cleanup SQS Queue](../resources/cart-cleanup-queue.md)
- [Cart Cleanup Worker](../components/cart-cleanup-worker.md)
