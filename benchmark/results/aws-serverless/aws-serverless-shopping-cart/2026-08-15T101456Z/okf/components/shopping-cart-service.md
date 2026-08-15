---
title: Shopping Cart Service
description: Serverless service implementing cart retrieval, mutation, migration, checkout, and aggregate queries.
type: Service
generated:
  by: agentbase/4.0.0
  at: 2026-08-15T00:00:00Z
status: draft
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L54-L80
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L181-L371
relationships:
  - kind: part-of
    target: systems/serverless-shopping-cart
  - kind: provides
    target: interfaces/cart-api
  - kind: accesses
    target: resources/cart-table
  - kind: includes
    target: components/anonymous-cart-migration-lambda
  - kind: includes
    target: components/cart-deletion-worker-lambda
  - kind: includes
    target: components/cart-aggregate-lambda
---
# Shopping Cart Service

## Responsibility

This service exposes cart retrieval, add, update, migration, checkout, and aggregate-total operations. Its SAM definition maps the API routes and asynchronous triggers to Python handlers.

## Interfaces

It provides the [Cart API](../interfaces/cart-api.md). Product validation calls the [Product Mock Service](product-mock-service.md) through the configured product-service URL.

## Dependencies

Cart state is stored in the [Cart Table](../resources/cart-table.md). The service uses the [Cart Deletion Queue](../resources/cart-deletion-queue.md) to defer removal of anonymous entries during migration.

## Operations

Migration, queued deletion, and DynamoDB Stream aggregation have distinct triggers and operational behavior and are documented as Lambda components.

## Limitations

The source declares logical roles and policies but does not establish runtime traffic, service-level objectives, or deployed configuration values.

This service is part of the [Shopping Cart System](../systems/serverless-shopping-cart.md) and includes the [Anonymous Cart Migration Lambda](anonymous-cart-migration-lambda.md), [Cart Deletion Worker Lambda](cart-deletion-worker-lambda.md), and [Cart Aggregate Lambda](cart-aggregate-lambda.md).
