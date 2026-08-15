---
title: Cart Quantity Aggregation
description: Maintains product totals across carts from DynamoDB change records.
type: Business Flow
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-16T00:00:00Z
business_purpose: Provide an aggregate product quantity without scanning all cart items.
trigger: Cart table INSERT, MODIFY, or delete stream record.
outcome: Aggregate quantity records are incremented by observed item deltas.
sources:
  - id: aggregation-docs
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L40-L51
  - id: aggregation-definition
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L347-L391
  - id: aggregation-handler
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/db_stream_handler.py#L25-L71
flow_steps:
  - order: 1
    source: resources/cart-table
    action: delivers
    target: components/cart-quantity-aggregator
    mode: asynchronous
    evidence: [aggregation-definition]
  - order: 2
    source: components/cart-quantity-aggregator
    action: writes
    target: resources/cart-table
    mode: synchronous
    evidence: [aggregation-handler]
relationships:
  - kind: part-of
    target: systems/serverless-shopping-cart
    evidence: [aggregation-docs]
---

# Cart Quantity Aggregation

## Purpose

Maintains running product totals rather than scanning the whole cart table.

## Trigger

Cart-table stream changes are delivered to the aggregation Lambda.

## Outcome

The Lambda computes per-product quantity deltas and updates aggregate records in the same table.

## Flow

The table publishes change records asynchronously; Lambda receives the batch and synchronously updates totals.

## Failure and Recovery

The template specifies batching, but no explicit failure destination or partial-batch recovery is present.

## Limitations

The repository does not define administrative access control for the documented aggregate endpoint.

## Relationship Links

- [Serverless Shopping Cart](../systems/serverless-shopping-cart.md)
- [Cart DynamoDB Table](../resources/cart-table.md)
- [Cart Quantity Aggregator](../components/cart-quantity-aggregator.md)
